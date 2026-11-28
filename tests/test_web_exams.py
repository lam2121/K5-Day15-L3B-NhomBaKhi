"""End-to-end tests for the web exam API (feature 003, T009) against the OpenAPI contract.

Needs the backend dependencies (backend/requirements.txt). Without FastAPI the
whole module is skipped, so the stdlib-only CI job keeps passing; the `web`
CI job installs them and runs these tests for real.
"""

import base64
import contextlib
import importlib.util
import json
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTRACT = json.loads((ROOT / "specs" / "003-cramai-exams" / "contracts" / "openapi.json").read_text(encoding="utf-8"))


def _web_stack_available() -> bool:
    """True when FastAPI, its TestClient (httpx or httpx2) and multipart parsing all import."""
    try:
        import fastapi.testclient  # noqa: F401
        import multipart  # noqa: F401
    except (ImportError, RuntimeError):  # Starlette raises RuntimeError when its HTTP client is missing
        return False
    return True


HAS_WEB = _web_stack_available()
HAS_PDF = importlib.util.find_spec("pymupdf") is not None

if HAS_WEB:
    sys.path.insert(0, str(ROOT / "backend"))
    from fastapi.testclient import TestClient

    from app import create_app

USER, PASSWORD = "admin", "test-only-password"
AUTH = {"Authorization": "Basic " + base64.b64encode(f"{USER}:{PASSWORD}".encode()).decode()}


# ---------------------------------------------------------------- contract helpers


def _resolve(schema: dict) -> dict:
    ref = schema.get("$ref")
    if ref:
        return _resolve(CONTRACT["components"]["schemas"][ref.rsplit("/", 1)[-1]])
    return schema


def check_schema(value, schema: dict, where: str = "$") -> list[str]:
    """Minimal JSON Schema check for the shapes used in the contract (type, required, additionalProperties, items, enum, oneOf)."""
    schema = _resolve(schema)
    if "oneOf" in schema or "anyOf" in schema:
        options = schema.get("oneOf") or schema.get("anyOf")
        if any(not check_schema(value, option, where) for option in options):
            return []
        return [f"{where}: matches none of oneOf/anyOf"]
    problems: list[str] = []
    kind = schema.get("type")
    kinds = kind if isinstance(kind, list) else [kind] if kind else []
    py = {"object": dict, "array": list, "string": str, "integer": int, "number": (int, float), "boolean": bool, "null": type(None)}
    if kinds and not any(isinstance(value, py[k]) and not (k in ("integer", "number") and isinstance(value, bool)) for k in kinds):
        return [f"{where}: expected {kinds}, got {type(value).__name__}"]
    if "enum" in schema and value not in schema["enum"]:
        problems.append(f"{where}: {value!r} not in enum")
    if isinstance(value, dict):
        props = schema.get("properties", {})
        for key in schema.get("required", []):
            if key not in value:
                problems.append(f"{where}: missing {key}")
        if schema.get("additionalProperties") is False:
            for key in value:
                if key not in props:
                    problems.append(f"{where}: unexpected {key}")
        for key, sub in props.items():
            if key in value:
                problems += check_schema(value[key], sub, f"{where}.{key}")
    if isinstance(value, list) and "items" in schema:
        for i, item in enumerate(value):
            problems += check_schema(item, schema["items"], f"{where}[{i}]")
        if "minItems" in schema and len(value) < schema["minItems"]:
            problems.append(f"{where}: fewer than {schema['minItems']} items")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            problems.append(f"{where}: more than {schema['maxItems']} items")
    return problems


def response_schema(path: str, method: str, status: int) -> dict:
    content = CONTRACT["paths"][path][method]["responses"][str(status)]["content"]
    return content["application/json"]["schema"]


# --------------------------------------------------------------------------- tests


@unittest.skipUnless(HAS_WEB, "backend dependencies not installed (pip install -r backend/requirements.txt)")
class WebExamsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / "web.db"
        self.client = self._client()

    def tearDown(self) -> None:
        self.client.__exit__(None, None, None)
        self.tmp.cleanup()

    def _client(self, **kwargs):
        client = TestClient(create_app(db_path=self.db, mode="fake", admin_user=USER, admin_password=PASSWORD, **kwargs))
        client.__enter__()  # runs init_db, which publishes the 14 decks from data/passages.jsonl
        return client

    def _sql(self, statement: str, params: tuple = ()) -> None:
        with contextlib.closing(sqlite3.connect(self.db)) as conn, conn:
            conn.execute(statement, params)

    def _attempt(self, exam_id: str):
        return self.client.post("/api/v1/attempts", json={"exam_id": exam_id})

    def _assert_contract(self, res, path: str, method: str) -> dict:
        body = res.json()
        problems = check_schema(body, response_schema(path, method, res.status_code))
        self.assertEqual(problems, [], f"{method.upper()} {path} {res.status_code}")
        return body

    # ------------------------------------------------------------ contract

    def test_routes_match_the_contract(self) -> None:
        served = {
            (route.path.removeprefix("/api/v1"), method.lower())
            for route in self.client.app.routes
            if getattr(route, "path", "").startswith("/api/v1/")
            for method in getattr(route, "methods", set()) - {"HEAD", "OPTIONS"}
        }
        declared = {(path, method) for path, ops in CONTRACT["paths"].items() for method in ops if method in {"get", "post", "put", "delete", "patch"}}
        self.assertEqual(served, declared)

    def test_catalog_has_15_items_and_matches_contract(self) -> None:
        res = self.client.get("/api/v1/catalog")
        body = self._assert_contract(res, "/catalog", "get")
        exams = body["exams"]
        self.assertEqual(len(exams), 15)
        self.assertEqual([e["exam_id"] for e in exams], [f"slide-{n:02d}" for n in range(1, 15)] + ["midterm"])
        self.assertTrue(all(e["available"] for e in exams))

    def test_midterm_opens_only_with_all_14_decks(self) -> None:
        self._sql("UPDATE slide_slots SET published_revision_id = NULL WHERE slide_number = 7")
        exams = self.client.get("/api/v1/catalog").json()["exams"]
        self.assertFalse(exams[6]["available"])
        self.assertFalse(exams[14]["available"])
        self.assertTrue(exams[14]["reason"])
        res = self._attempt("midterm")
        self.assertEqual((res.status_code, res.json()["error"]["code"]), (409, "exam_unavailable"))
        self.assertEqual(self._attempt("slide-07").status_code, 409)

    # --------------------------------------------------------- generation

    def test_slide_exam_has_5_questions_from_that_deck_and_hides_the_key(self) -> None:
        res = self._attempt("slide-03")
        self.assertEqual(res.status_code, 201, res.text)
        body = self._assert_contract(res, "/attempts", "post")
        self.assertEqual(len(body["questions"]), 5)
        for q in body["questions"]:
            self.assertEqual(set(q), {"question_id", "prompt", "options"})
            self.assertEqual(len({o["option_id"] for o in q["options"]}), 4)
            self.assertEqual(len({o["text"] for o in q["options"]}), 4)
        raw = res.text
        for leaked in ("correct_option_id", "citations", "source_id"):
            self.assertNotIn(leaked, raw)
        result = self._submit(body, "a").json()
        self.assertEqual({c["slide_number"] for item in result["items"] for c in item["citations"]}, {3})

    def test_midterm_has_one_question_per_deck(self) -> None:
        body = self._attempt("midterm").json()
        self.assertEqual(len(body["questions"]), 14)
        result = self._submit(body, "a").json()
        decks = [item["citations"][0]["slide_number"] for item in result["items"]]
        self.assertEqual(sorted(decks), list(range(1, 15)))

    def test_model_failure_returns_upstream_error_and_stores_nothing(self) -> None:
        def broken(_exam_id, _passages):
            raise TimeoutError("model timed out")

        client = self._client(generator=broken)
        try:
            res = client.post("/api/v1/attempts", json={"exam_id": "slide-01"})
        finally:
            client.__exit__(None, None, None)
        self.assertEqual((res.status_code, res.json()["error"]["code"]), (502, "upstream_error"))
        self.assertEqual(check_schema(res.json(), _resolve({"$ref": "#/components/schemas/ErrorResponse"})), [])
        with contextlib.closing(sqlite3.connect(self.db)) as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM attempts").fetchone()[0], 0)

    def test_invalid_exam_id_is_400(self) -> None:
        res = self._attempt("slide-15")
        self.assertEqual((res.status_code, res.json()["error"]["code"]), (400, "invalid_input"))

    # ---------------------------------------------------------- submission

    def _submit(self, attempt: dict, option: str):
        answers = [{"question_id": q["question_id"], "option_id": option} for q in attempt["questions"]]
        return self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": answers})

    def test_duplicate_submission_is_idempotent_and_changes_are_refused(self) -> None:
        attempt = self._attempt("slide-02").json()
        first = self._submit(attempt, "a")
        self.assertEqual(first.status_code, 200)
        self._assert_contract(first, "/submissions", "post")
        again = self._submit(attempt, "a")
        self.assertEqual(again.json()["items"], first.json()["items"])
        changed = self._submit(attempt, "b")
        self.assertEqual((changed.status_code, changed.json()["error"]["code"]), (409, "already_submitted"))

    def test_missing_answer_is_422(self) -> None:
        attempt = self._attempt("slide-02").json()
        answers = [{"question_id": q["question_id"], "option_id": "a"} for q in attempt["questions"][:-1]]
        res = self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": answers})
        self.assertEqual((res.status_code, res.json()["error"]["code"]), (422, "invalid_answers"))

    def test_expired_attempt_is_404(self) -> None:
        attempt = self._attempt("slide-04").json()
        self._sql("UPDATE attempts SET expires_at = ? WHERE attempt_id = ?", ("2000-01-01T00:00:00+00:00", attempt["attempt_id"]))
        res = self._submit(attempt, "a")
        self.assertEqual((res.status_code, res.json()["error"]["code"]), (404, "quiz_unavailable"))

    # --------------------------------------------------------------- admin

    def test_admin_requires_credentials_and_matches_contract(self) -> None:
        self.assertEqual(self.client.get("/api/v1/admin/slides").status_code, 401)
        self.assertEqual(self.client.get("/admin/").status_code, 401)
        res = self.client.get("/api/v1/admin/slides", headers=AUTH)
        self._assert_contract(res, "/admin/slides", "get")
        detail = self.client.get("/api/v1/admin/slides/5", headers=AUTH)
        self._assert_contract(detail, "/admin/slides/{slide_number}", "get")

    @unittest.skipUnless(HAS_PDF, "pymupdf not installed")
    def test_slide_update_keeps_open_attempts_on_their_snapshot(self) -> None:
        import pymupdf

        attempt = self._attempt("slide-09").json()
        doc = pymupdf.open()
        doc.new_page().insert_text((72, 72), "Noi dung moi sau khi cap nhat")
        upload = self.client.put(
            "/api/v1/admin/slides/9/draft",
            files=[("files", ("cap-nhat.pdf", doc.tobytes(), "application/pdf"))],
            headers=AUTH,
        )
        self.assertEqual(upload.status_code, 200, upload.text)
        self._assert_contract(upload, "/admin/slides/{slide_number}/draft", "put")
        revision = upload.json()["slot"]["draft"]["revision_id"]
        published = self.client.post("/api/v1/admin/slides/9/publish", json={"revision_id": revision}, headers=AUTH)
        self._assert_contract(published, "/admin/slides/{slide_number}/publish", "post")

        old = self._submit(attempt, "a").json()
        self.assertNotIn("cap-nhat.pdf", {c["file_name"] for item in old["items"] for c in item["citations"]})
        new = self._submit(self._attempt("slide-09").json(), "a").json()
        self.assertEqual({c["file_name"] for item in new["items"] for c in item["citations"]}, {"cap-nhat.pdf"})

    @unittest.skipUnless(HAS_PDF, "pymupdf not installed")
    def test_answer_check_and_optional_explanation_keep_private_full_page(self) -> None:
        import pymupdf

        source_text = "A network uses protocols to define how clients and servers exchange messages. " * 45
        doc = pymupdf.open()
        doc.new_page().insert_textbox(pymupdf.Rect(36, 36, 560, 800), source_text, fontsize=8)
        upload = self.client.put(
            "/api/v1/admin/slides/3/draft",
            files=[("files", ("network.pdf", doc.tobytes(), "application/pdf"))],
            headers=AUTH,
        )
        doc.close()
        self.assertEqual(upload.status_code, 200, upload.text)
        revision_id = upload.json()["slot"]["draft"]["revision_id"]
        published = self.client.post(
            "/api/v1/admin/slides/3/publish",
            json={"revision_id": revision_id},
            headers=AUTH,
        )
        self.assertEqual(published.status_code, 200, published.text)

        attempt = self._attempt("slide-03").json()
        question = attempt["questions"][0]
        check = self.client.post(
            f"/api/v1/attempts/{attempt['attempt_id']}/questions/{question['question_id']}/check",
            json={"selected_option_id": "a"},
        )
        self.assertEqual(check.status_code, 200, check.text)
        self.assertTrue(check.json()["is_correct"])
        self.assertEqual(check.json()["correct_option_id"], "a")
        self.assertNotIn("citations", check.json())
        self.assertNotIn("explanation", check.json())

        explanation = self.client.post(
            f"/api/v1/attempts/{attempt['attempt_id']}/questions/{question['question_id']}/explanation",
            json={"selected_option_id": "a"},
        )
        self.assertEqual(explanation.status_code, 200, explanation.text)
        source = explanation.json()["source_pages"][0]
        self.assertTrue(source["text_is_complete"])
        self.assertGreater(len(source["text"]), 1200)
        self.assertTrue(source["image_url"])

        image = self.client.get(source["image_url"])
        self.assertEqual((image.status_code, image.headers.get("content-type")), (200, "image/png"))
        self.assertEqual(image.headers.get("cache-control"), "private, no-store")


if __name__ == "__main__":
    unittest.main()
