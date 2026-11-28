"""Production tests for LMS grading, anti-cheat isolation, expiry, and concurrency."""

import sys
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app  # noqa: E402
from db import init_db, publish_revision, session  # noqa: E402


def _seed_all_14_slides(db_path: Path) -> None:
    with session(db_path) as conn:
        for n in range(1, 15):
            passages = [
                {
                    "source_id": f"day{n:02d}-d01-p{p:03d}-s01",
                    "file_name": f"slide-{n:02d}.pdf",
                    "page": p,
                    "text": f"Kiến thức trọng tâm ngày {n} trang {p} đủ căn cứ để kiểm tra.",
                }
                for p in range(1, 6)
            ]
            publish_revision(
                conn,
                revision_id=str(uuid4()),
                slide_number=n,
                documents=[{"file_name": f"slide-{n:02d}.pdf", "page_count": 5}],
                passages=passages,
            )


class GradingProductionTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.db_path = Path(self._tmp.name) / "test.db"
        init_db(self.db_path)
        self.app = create_app(db_path=self.db_path, mode="fake")
        _seed_all_14_slides(self.db_path)
        self.client = TestClient(self.app)

    def _create_slide03_attempt(self) -> dict:
        resp = self.client.post("/api/v1/attempts", json={"exam_id": "slide-03"})
        self.assertEqual(resp.status_code, 201)
        return resp.json()

    def test_attempt_hides_keys_and_submission_grades_deterministically(self):
        attempt = self._create_slide03_attempt()
        self.assertEqual(len(attempt["questions"]), 5)
        for q in attempt["questions"]:
            self.assertNotIn("correct_option_id", q)
            self.assertNotIn("citations", q)

        answers = [
            {"question_id": "q01", "option_id": "a"},
            {"question_id": "q02", "option_id": "a"},
            {"question_id": "q03", "option_id": "b"},
            {"question_id": "q04", "option_id": "c"},
            {"question_id": "q05", "option_id": "d"},
        ]
        res = self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": answers})
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["correct_count"], 2)
        self.assertEqual(body["total_questions"], 5)
        self.assertEqual(body["score_percent"], 40.0)
        self.assertEqual(len(body["items"]), 5)
        self.assertEqual(body["items"][0]["citations"][0]["slide_number"], 3)

    def test_midterm_grades_14_questions_with_one_decimal_percent(self):
        resp = self.client.post("/api/v1/attempts", json={"exam_id": "midterm"})
        self.assertEqual(resp.status_code, 201)
        attempt = resp.json()
        self.assertEqual(len(attempt["questions"]), 14)

        answers = [
            {"question_id": f"q{i:02d}", "option_id": "a" if i <= 3 else "b"}
            for i in range(1, 15)
        ]
        res = self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": answers})
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["correct_count"], 3)
        self.assertEqual(body["total_questions"], 14)
        self.assertEqual(body["score_percent"], 21.4)

    def test_invalid_answers_rejected_with_422(self):
        attempt = self._create_slide03_attempt()
        bad_payloads = [
            [{"question_id": "q01", "option_id": "a"}],  # thiếu câu
            [{"question_id": "q01", "option_id": "a"}] * 5,  # trùng câu
            [{"question_id": f"q{i:02d}", "option_id": "z"} for i in range(1, 6)],  # option lạ
        ]
        for answers in bad_payloads:
            res = self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": answers})
            self.assertEqual(res.status_code, 422)
            self.assertEqual(res.json()["error"]["code"], "invalid_answers")

    def test_missing_or_expired_attempt_returns_404(self):
        missing = self.client.post(
            "/api/v1/submissions",
            json={"attempt_id": str(uuid4()), "answers": [{"question_id": f"q{i:02d}", "option_id": "a"} for i in range(1, 6)]},
        )
        self.assertEqual(missing.status_code, 404)
        self.assertEqual(missing.json()["error"]["code"], "quiz_unavailable")

        attempt = self._create_slide03_attempt()
        past = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
        with session(self.db_path) as conn:
            conn.execute("UPDATE attempts SET expires_at = ? WHERE attempt_id = ?", (past, attempt["attempt_id"]))
        expired = self.client.post(
            "/api/v1/submissions",
            json={"attempt_id": attempt["attempt_id"], "answers": [{"question_id": f"q{i:02d}", "option_id": "a"} for i in range(1, 6)]},
        )
        self.assertEqual(expired.status_code, 404)
        self.assertEqual(expired.json()["error"]["code"], "quiz_unavailable")

    def test_idempotent_same_choices_and_409_on_tampered_resubmit(self):
        attempt = self._create_slide03_attempt()
        answers = [{"question_id": f"q{i:02d}", "option_id": "a"} for i in range(1, 6)]
        first = self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": answers})
        self.assertEqual(first.status_code, 200)

        # Nộp lại cùng lựa chọn nhưng đảo thứ tự câu vẫn idempotent 200
        retry = self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": list(reversed(answers))})
        self.assertEqual(retry.status_code, 200)
        self.assertEqual(retry.json()["correct_count"], first.json()["correct_count"])
        self.assertEqual(retry.json()["items"], first.json()["items"])

        # Đổi đáp án sau khi đã nộp -> 409 already_submitted
        tampered = [{"question_id": "q01", "option_id": "b"}] + answers[1:]
        conflict = self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": tampered})
        self.assertEqual(conflict.status_code, 409)
        self.assertEqual(conflict.json()["error"]["code"], "already_submitted")

    def test_snapshot_isolation_when_admin_republishes_mid_attempt(self):
        attempt = self._create_slide03_attempt()
        with session(self.db_path) as conn:
            publish_revision(
                conn,
                revision_id=str(uuid4()),
                slide_number=3,
                documents=[{"file_name": "new-slide-03.pdf", "page_count": 1}],
                passages=[{"source_id": "day03-d01-p001-s01", "file_name": "new-slide-03.pdf", "page": 1, "text": "Bản mới"}],
            )
        answers = [{"question_id": f"q{i:02d}", "option_id": "a"} for i in range(1, 6)]
        res = self.client.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": answers})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["items"][0]["citations"][0]["file_name"], "slide-03.pdf")

    def test_concurrent_conflicting_submissions_serialize_cleanly(self):
        attempt = self._create_slide03_attempt()
        a1 = [{"question_id": f"q{i:02d}", "option_id": "a"} for i in range(1, 6)]
        a2 = [{"question_id": f"q{i:02d}", "option_id": "b"} for i in range(1, 6)]

        def post_one(payload):
            with TestClient(self.app) as c:
                return c.post("/api/v1/submissions", json={"attempt_id": attempt["attempt_id"], "answers": payload}).status_code

        with ThreadPoolExecutor(max_workers=2) as pool:
            statuses = sorted(pool.map(post_one, [a1, a2]))
        self.assertEqual(statuses, [200, 409])

    def test_outline_only_slide_rejected_before_generation(self):
        with session(self.db_path) as conn:
            publish_revision(
                conn,
                revision_id=str(uuid4()),
                slide_number=1,
                documents=[{"file_name": "outline.pdf", "page_count": 2}],
                passages=[
                    {"source_id": "day01-d01-p001-s01", "file_name": "outline.pdf", "page": 1, "text": "Agenda: Intro & Q&A"},
                    {"source_id": "day01-d01-p002-s01", "file_name": "outline.pdf", "page": 2, "text": "[Dàn ý] Tóm tắt bài"},
                ],
            )
        res = self.client.post("/api/v1/attempts", json={"exam_id": "slide-01"})
        self.assertEqual(res.status_code, 422)
        self.assertEqual(res.json()["error"]["code"], "insufficient_evidence")

    def test_hallucinated_citation_and_relative_option_blocked(self):
        for case in ("relative_option", "fake_citation"):
            with self.subTest(case=case):
                def bad_gen(_exam_id, passages_by_slide, mode=case):
                    p = passages_by_slide[2][0]
                    return [
                        {
                            "question_id": f"q{i:02d}",
                            "prompt": f"Câu {i}?",
                            "options": [
                                {"option_id": "a", "text": f"Đáp án A {i}"},
                                {"option_id": "b", "text": f"Đáp án B {i}"},
                                {"option_id": "c", "text": f"Đáp án C {i}"},
                                {"option_id": "d", "text": "Cả A và B" if (mode == "relative_option" and i == 1) else f"Đáp án D {i}"},
                            ],
                            "correct_option_id": "a",
                            "slide_number": 2,
                            "citations": [{
                                "slide_number": 2,
                                "source_id": "day02-fake-999" if (mode == "fake_citation" and i == 1) else p["source_id"],
                                "file_name": p["file_name"],
                                "page": p["page"],
                            }],
                        }
                        for i in range(1, 6)
                    ]

                app_bad = create_app(db_path=self.db_path, mode="fake", generator=bad_gen)
                with TestClient(app_bad) as c:
                    res = c.post("/api/v1/attempts", json={"exam_id": "slide-02"})
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "insufficient_evidence")

    def test_retake_covers_new_passages_without_repeating_until_exhausted(self):
        with session(self.db_path) as conn:
            publish_revision(
                conn,
                revision_id=str(uuid4()),
                slide_number=4,
                documents=[{"file_name": "slide-04.pdf", "page_count": 10}],
                passages=[
                    {
                        "source_id": f"day04-d01-p{p:03d}-s01",
                        "file_name": "slide-04.pdf",
                        "page": p,
                        "text": f"Kiến thức trọng tâm trang {p} giúp ôn tập hiệu quả.",
                    }
                    for p in range(1, 11)
                ],
            )
        answers = [{"question_id": f"q{i:02d}", "option_id": "a"} for i in range(1, 6)]

        a1 = self.client.post("/api/v1/attempts", json={"exam_id": "slide-04"}).json()
        s1 = self.client.post("/api/v1/submissions", json={"attempt_id": a1["attempt_id"], "answers": answers}).json()
        pages1 = {c["page"] for item in s1["items"] for c in item["citations"]}

        a2 = self.client.post("/api/v1/attempts", json={"exam_id": "slide-04"}).json()
        s2 = self.client.post("/api/v1/submissions", json={"attempt_id": a2["attempt_id"], "answers": answers}).json()
        pages2 = {c["page"] for item in s2["items"] for c in item["citations"]}

        self.assertEqual(pages1, {1, 2, 3, 4, 5})
        self.assertEqual(pages2, {6, 7, 8, 9, 10})
        self.assertTrue(pages1.isdisjoint(pages2))

        # Lượt 3 khi đã phủ hết 10 trang vẫn tạo đề thành công (không báo 422)
        a3 = self.client.post("/api/v1/attempts", json={"exam_id": "slide-04"})
        self.assertEqual(a3.status_code, 201)

    def test_rate_limiter_blocks_burst_with_429_busy(self):
        limited_app = create_app(db_path=self.db_path, mode="fake", attempt_rate_limit=2)
        with TestClient(limited_app) as c:
            self.assertEqual(c.post("/api/v1/attempts", json={"exam_id": "slide-01"}).status_code, 201)
            self.assertEqual(c.post("/api/v1/attempts", json={"exam_id": "slide-01"}).status_code, 201)
            blocked = c.post("/api/v1/attempts", json={"exam_id": "slide-01"})
            self.assertEqual(blocked.status_code, 429)
            self.assertEqual(blocked.json()["error"]["code"], "busy")
            self.assertEqual(blocked.headers.get("retry-after"), "60")
            # IP khác không bị ảnh hưởng bởi burst của IP đầu
            async def other_ip_app(scope, receive, send):
                await limited_app({**scope, "client": ("203.0.113.50", 5000)}, receive, send)

            with TestClient(other_ip_app) as other:
                self.assertEqual(other.post("/api/v1/attempts", json={"exam_id": "slide-01"}).status_code, 201)
