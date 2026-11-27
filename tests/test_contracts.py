import json
import os
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / "codebase"), str(ROOT / "eval")]

from contracts import make_response, resolve_citations
from run_eval import call_case
import tracing


class ContractTests(unittest.TestCase):
    def setUp(self):
        fixture = ROOT / "tests" / "fixtures" / "cramai_demo.json"
        self.sample = json.loads(fixture.read_text(encoding="utf-8"))

    def test_supported_answer_in_actual_eval_harness(self):
        def answer(text):
            self.assertEqual(text, self.sample["input"])
            result = self.sample["result"]
            self.assertEqual(
                resolve_citations(self.sample["selected_source_ids"], self.sample["passages"]),
                result["questions"][0]["citations"],
            )
            return make_response(result)

        row, _ = call_case(answer, tracing, "contract-demo", self.sample["input"])
        self.assertEqual(row["error"], "")
        self.assertIn(self.sample["result"]["questions"][0]["answer"], row["output"])
        self.assertIn("vi-du-tu-dung.pdf, trang 1 [demo-p001-s01]", row["output"])

    def test_unretrieved_source_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "not retrieved"):
            resolve_citations(["demo-p002-s01"], self.sample["passages"])

    def test_wrong_page_is_rejected(self):
        passage = self.sample["passages"][0]
        passage["page"] = 2
        with self.assertRaisesRegex(ValueError, "citation ID or page"):
            resolve_citations(self.sample["selected_source_ids"], [passage])

    def test_no_evidence_has_a_message_and_no_questions(self):
        result = self.sample["no_evidence_result"]
        self.assertEqual(make_response(result), {"output": result["message"], "result": result})
        result["questions"] = self.sample["result"]["questions"]
        with self.assertRaisesRegex(ValueError, "only an ok result"):
            make_response(result)

    def test_fake_cli_can_make_sourced_questions_with_current_corpus(self):
        result = subprocess.run(
            [sys.executable, "run.py"],
            cwd=ROOT,
            env=dict(os.environ, MODEL_PROVIDER="fake", PYTHONIOENCODING="utf-8"),
            input="Ôn Prompt Engineering và Tool Calling ở ngày 3.\nÔn hết giúp mình.\n\n\n",
            encoding="utf-8",
            capture_output=True,
            check=True,
        )
        self.assertIn("Đề ôn tập mẫu CP2 đã sẵn sàng", result.stdout)
        self.assertIn("Nguồn:", result.stdout)
        self.assertIn("day03-p", result.stdout)
        self.assertIn("model: fake", result.stdout)
        self.assertIn("Bạn muốn ôn chủ đề nào", result.stdout)
