"""Tests for the admin API (feature 003, T005): auth, upload, preview and atomic publish."""

import base64
import re
import sys
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app  # noqa: E402
from db import SLOT_TITLES  # noqa: E402

USER, PASSWORD = "admin", "s3cret-test"
SOURCE_ID = re.compile(r"^day(0[1-9]|1[0-4])-d0[1-5]-p\d{3}-s\d{2}$")


def _auth(user: str = USER, password: str = PASSWORD) -> dict:
    token = base64.b64encode(f"{user}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


def _pdf(*pages: str) -> bytes:
    """A small PDF with one text page per argument; an empty string makes an image-only style blank page."""
    import pymupdf

    doc = pymupdf.open()
    for text in pages:
        page = doc.new_page()
        if text:
            page.insert_text((72, 72), text)
    data = doc.tobytes()
    doc.close()
    return data


class AdminApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / "admin.db"
        self.app = create_app(db_path=self.db, mode="fake", admin_user=USER, admin_password=PASSWORD)
        self.client = TestClient(self.app)
        self.client.__enter__()

    def tearDown(self) -> None:
        self.client.__exit__(None, None, None)
        self.tmp.cleanup()

    def _upload(self, slide: int, files: list[tuple[str, bytes]], headers: dict | None = None):
        return self.client.put(
            f"/api/v1/admin/slides/{slide}/draft",
            files=[("files", (name, data, "application/pdf")) for name, data in files],
            headers=headers if headers is not None else _auth(),
        )

    # ------------------------------------------------------------------ auth

    def test_requires_basic_auth_for_api_and_page(self) -> None:
        for path in ("/api/v1/admin/slides", "/api/v1/admin/slides/3", "/admin/"):
            res = self.client.get(path)
            self.assertEqual(res.status_code, 401, path)
            self.assertIn("Basic", res.headers.get("www-authenticate", ""))
            self.assertEqual(res.json()["error"]["code"], "unauthorized")
        self.assertEqual(self.client.get("/api/v1/admin/slides", headers=_auth(password="wrong")).status_code, 401)
        # The student API stays public.
        self.assertEqual(self.client.get("/api/v1/catalog").status_code, 200)

    def test_admin_closed_when_credentials_not_configured(self) -> None:
        with TestClient(create_app(db_path=self.db, mode="fake", admin_user="", admin_password="")) as client:
            self.assertEqual(client.get("/api/v1/admin/slides", headers=_auth()).status_code, 401)
            self.assertEqual(client.get("/api/v1/admin/slides", headers=_auth("", "")).status_code, 401)

    def test_rejects_cross_origin_writes(self) -> None:
        res = self._upload(3, [("a.pdf", _pdf("Noi dung"))], headers={**_auth(), "Origin": "https://evil.example"})
        self.assertEqual(res.status_code, 403)
        self.assertEqual(res.json()["error"]["code"], "forbidden_origin")
        same = self._upload(3, [("a.pdf", _pdf("Noi dung"))], headers={**_auth(), "Origin": "http://testserver"})
        self.assertEqual(same.status_code, 200)

    # ----------------------------------------------------------- list/detail

    def test_lists_14_slots_with_fixed_titles(self) -> None:
        res = self.client.get("/api/v1/admin/slides", headers=_auth())
        self.assertEqual(res.status_code, 200)
        slides = res.json()["slides"]
        self.assertEqual([s["slide_number"] for s in slides], list(range(1, 15)))
        for slot in slides:
            self.assertEqual(set(slot), {"slide_number", "title", "draft", "published"})
            self.assertEqual(slot["title"], SLOT_TITLES[slot["slide_number"]])
        catalog = self.client.get("/api/v1/catalog").json()["exams"]
        self.assertEqual(catalog[1]["title"], "Discovery & Problem Framing")

    def test_slot_out_of_range_is_422(self) -> None:
        for n in (0, 15):
            res = self.client.get(f"/api/v1/admin/slides/{n}", headers=_auth())
            self.assertEqual(res.status_code, 422)
            self.assertEqual(res.json()["error"]["code"], "invalid_input")

    # ---------------------------------------------------------------- upload

    def test_upload_creates_draft_without_touching_published(self) -> None:
        before = self.client.get("/api/v1/admin/slides/3", headers=_auth()).json()["slot"]["published"]
        res = self._upload(3, [("day03-v2.pdf", _pdf("Prompt la gi", "Tool calling")), ("bai-tap.pdf", _pdf("Vi du"))])
        self.assertEqual(res.status_code, 200, res.text)
        detail = res.json()
        slot = detail["slot"]
        self.assertEqual(slot["published"], before)
        self.assertEqual([d["file_name"] for d in slot["draft"]["documents"]], ["day03-v2.pdf", "bai-tap.pdf"])
        self.assertEqual(slot["draft"]["passage_count"], 3)
        preview = detail["draft_preview"]
        self.assertTrue(1 <= len(preview) <= 3)
        # The first passage of each file comes first.
        self.assertEqual([p["citation"]["file_name"] for p in preview[:2]], ["day03-v2.pdf", "bai-tap.pdf"])
        for item in preview:
            self.assertRegex(item["citation"]["source_id"], SOURCE_ID)
            self.assertEqual(item["citation"]["slide_number"], 3)
            self.assertTrue(item["text"])

    def test_rejects_non_pdf_image_only_and_too_many_files(self) -> None:
        not_pdf = self._upload(4, [("notes.pdf", b"hello world")])
        self.assertEqual((not_pdf.status_code, not_pdf.json()["error"]["code"]), (415, "unsupported_file"))
        wrong_ext = self._upload(4, [("notes.txt", _pdf("x"))])
        self.assertEqual(wrong_ext.status_code, 415)
        blank = self._upload(4, [("scan.pdf", _pdf(""))])
        self.assertEqual((blank.status_code, blank.json()["error"]["code"]), (422, "invalid_document"))
        six = self._upload(4, [(f"f{i}.pdf", _pdf("x")) for i in range(6)])
        self.assertEqual(six.status_code, 422)
        # Nothing above created a draft.
        self.assertIsNone(self.client.get("/api/v1/admin/slides/4", headers=_auth()).json()["slot"]["draft"])

    def test_rejects_file_over_10_mb(self) -> None:
        big = b"%PDF-1.4\n" + b"0" * (10 * 1024 * 1024)
        res = self._upload(5, [("big.pdf", big)])
        self.assertEqual((res.status_code, res.json()["error"]["code"]), (413, "too_large"))

    # --------------------------------------------------------------- publish

    def test_publish_is_atomic_and_checks_the_reviewed_draft(self) -> None:
        first = self._upload(6, [("a.pdf", _pdf("Ban nhap mot"))]).json()["slot"]["draft"]["revision_id"]
        second = self._upload(6, [("b.pdf", _pdf("Ban nhap hai"))]).json()["slot"]["draft"]["revision_id"]

        stale = self.client.post("/api/v1/admin/slides/6/publish", json={"revision_id": first}, headers=_auth())
        self.assertEqual((stale.status_code, stale.json()["error"]["code"]), (409, "stale_draft"))

        ok = self.client.post("/api/v1/admin/slides/6/publish", json={"revision_id": second}, headers=_auth())
        self.assertEqual(ok.status_code, 200, ok.text)
        slot = ok.json()["slot"]
        self.assertEqual(slot["published"]["revision_id"], second)
        self.assertEqual(ok.json()["draft_preview"], [])

    def test_attempt_keeps_its_questions_after_republish(self) -> None:
        attempt = self.client.post("/api/v1/attempts", json={"exam_id": "slide-07"})
        self.assertEqual(attempt.status_code, 201, attempt.text)
        body = attempt.json()
        rev = self._upload(7, [("moi.pdf", _pdf("Noi dung moi cho ngay 7"))]).json()["slot"]["draft"]["revision_id"]
        self.assertEqual(
            self.client.post("/api/v1/admin/slides/7/publish", json={"revision_id": rev}, headers=_auth()).status_code, 200
        )
        answers = [{"question_id": q["question_id"], "option_id": "a"} for q in body["questions"]]
        res = self.client.post("/api/v1/submissions", json={"attempt_id": body["attempt_id"], "answers": answers})
        self.assertEqual(res.status_code, 200, res.text)
        self.assertNotIn("moi.pdf", {c["file_name"] for item in res.json()["items"] for c in item["citations"]})


if __name__ == "__main__":
    unittest.main()
