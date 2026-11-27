import io
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "codebase"))

import ai
import tracing


class ModelAdapterTests(unittest.TestCase):
    def test_fake_never_calls_network(self):
        with patch.object(ai, "MODEL_PROVIDER", "fake"), patch.object(ai, "urlopen") as post:
            result = ai.call_model("", "Câu thử")
        post.assert_not_called()
        self.assertEqual(result["model"], "fake")
        self.assertEqual((result["tokens_in"], result["tokens_out"]), (0, 0))

    def test_openai_returns_measured_usage_and_records_trace(self):
        payload = {
            "model": "openai-test-snapshot",
            "choices": [{"message": {"content": "Đáp án"}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 32, "completion_tokens": 11},
        }
        with patch.multiple(ai, MODEL_PROVIDER="openai", MODEL_NAME="openai-test", API_KEY="test-key"):
            with patch.object(ai, "urlopen", return_value=self.response(payload)) as post:
                tracing.begin("test-openai")
                try:
                    result = ai.call_model("Vai trò", "Câu thử")
                finally:
                    summary, _ = tracing.end()
        request = post.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.openai.com/v1/chat/completions")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-key")
        self.assertEqual(json.loads(request.data)["messages"][0], {"role": "system", "content": "Vai trò"})
        self.assertEqual(result, {"text": "Đáp án", "model": "openai-test-snapshot", "tokens_in": 32, "tokens_out": 11})
        self.assertEqual((summary["model_calls"], summary["tokens_in"], summary["tokens_out"]), (1, 32, 11))

    def test_gemini_counts_thought_tokens_and_returns_only_answer_text(self):
        payload = {
            "modelVersion": "gemini-test-snapshot",
            "candidates": [{"content": {"parts": [{"text": "thinking", "thought": True}, {"text": "OK"}]}}],
            "usageMetadata": {"promptTokenCount": 24, "candidatesTokenCount": 2, "thoughtsTokenCount": 7},
        }
        with patch.multiple(ai, MODEL_PROVIDER="gemini", MODEL_NAME="models/gemini-test", API_KEY="test-key"):
            with patch.object(ai, "urlopen", return_value=self.response(payload)) as post:
                result = ai.call_model("Vai trò", "Câu thử")
        request = post.call_args.args[0]
        self.assertEqual(request.full_url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent")
        self.assertEqual(request.get_header("X-goog-api-key"), "test-key")
        self.assertEqual(json.loads(request.data)["systemInstruction"], {"parts": [{"text": "Vai trò"}]})
        self.assertEqual(result, {"text": "OK", "model": "gemini-test-snapshot", "tokens_in": 24, "tokens_out": 9})

    def test_missing_usage_is_not_filled_with_estimates(self):
        payload = {"choices": [{"message": {"content": "OK"}, "finish_reason": "stop"}]}
        with patch.multiple(ai, MODEL_PROVIDER="openai", MODEL_NAME="openai-test", API_KEY="test-key"):
            with patch.object(ai, "urlopen", return_value=self.response(payload)):
                with self.assertRaisesRegex(RuntimeError, "prompt_tokens"):
                    ai.call_model("", "Câu thử")

    def test_http_error_does_not_copy_provider_body_to_trace(self):
        server_error = HTTPError("https://api.openai.com/", 429, "Rate limited", {}, io.BytesIO(b"test-key"))
        with patch.multiple(ai, MODEL_PROVIDER="openai", MODEL_NAME="openai-test", API_KEY="test-key"):
            with patch.object(ai, "urlopen", side_effect=server_error):
                with self.assertRaisesRegex(RuntimeError, "HTTP 429") as error:
                    ai.call_model("", "Câu thử")
        self.assertNotIn("test-key", str(error.exception))

    @staticmethod
    def response(payload):
        return io.BytesIO(json.dumps(payload).encode("utf-8"))
