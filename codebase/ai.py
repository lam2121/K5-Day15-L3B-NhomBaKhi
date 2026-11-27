"""Adapter model của CramAI. Cấu hình cục bộ theo docs/connect-model.md."""

import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from contracts import ModelResponse
from tracing import model_call

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_env(path=os.path.join(ROOT, ".env")):
    """Đọc file .env (KEY=VALUE mỗi dòng) vào biến môi trường, không ghi đè biến đã có. Khung — không cần sửa."""
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env()
MODEL_PROVIDER = os.environ.get("MODEL_PROVIDER", "").strip().lower() or "fake"
MODEL_NAME = (os.environ.get("MODEL_NAME") or "").strip()
API_KEY = (os.environ.get("API_KEY") or "").strip()


def _post_json(url: str, headers: dict[str, str], body: dict) -> dict:
    request = Request(
        url,
        method="POST",
        headers={"Content-Type": "application/json", **headers},
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
    )
    try:
        with urlopen(request, timeout=60) as response:
            payload = json.load(response)
    except HTTPError as error:
        error.close()
        raise RuntimeError(f"{MODEL_PROVIDER}: HTTP {error.code}. Xem docs/connect-model.md.") from None
    except (URLError, TimeoutError):
        raise RuntimeError(f"{MODEL_PROVIDER}: không kết nối được hoặc hết thời gian chờ.") from None
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise RuntimeError(f"{MODEL_PROVIDER}: phản hồi API không phải JSON hợp lệ.") from None
    if not isinstance(payload, dict):
        raise RuntimeError(f"{MODEL_PROVIDER}: phản hồi API không phải một đối tượng JSON.")
    return payload


def _tokens(value: object, field: str) -> int:
    if type(value) is not int or value < 0:
        raise RuntimeError(f"{MODEL_PROVIDER}: usage thiếu hoặc không hợp lệ ở {field}.")
    return value


def _call_openai(system: str, user: str) -> ModelResponse:
    messages = [{"role": "user", "content": user}]
    if system:
        messages.insert(0, {"role": "system", "content": system})
    payload = _post_json(
        "https://api.openai.com/v1/chat/completions",
        {"Authorization": f"Bearer {API_KEY}"},
        {"model": MODEL_NAME, "messages": messages},
    )
    choices = payload.get("choices")
    if not choices or choices[0].get("finish_reason") != "stop":
        raise RuntimeError("openai: phản hồi bị chặn, thiếu nội dung hoặc chưa hoàn tất.")
    usage = payload.get("usage") or {}
    return {
        "text": choices[0]["message"].get("content"),
        "model": payload.get("model") or MODEL_NAME,
        "tokens_in": _tokens(usage.get("prompt_tokens"), "prompt_tokens"),
        "tokens_out": _tokens(usage.get("completion_tokens"), "completion_tokens"),
    }


def _call_gemini(system: str, user: str) -> ModelResponse:
    model = MODEL_NAME.removeprefix("models/")
    if not model:
        raise RuntimeError("gemini: cần mã model trong MODEL_NAME.")
    body = {"contents": [{"role": "user", "parts": [{"text": user}]}]}
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    payload = _post_json(
        f"https://generativelanguage.googleapis.com/v1beta/models/{quote(model, safe='')}:generateContent",
        {"x-goog-api-key": API_KEY},
        body,
    )
    candidates = payload.get("candidates")
    if not candidates or candidates[0].get("finishReason", "STOP") != "STOP":
        raise RuntimeError("gemini: phản hồi bị chặn, thiếu nội dung hoặc chưa hoàn tất.")
    parts = candidates[0].get("content", {}).get("parts", [])
    usage = payload.get("usageMetadata") or {}
    return {
        "text": "".join(part.get("text", "") for part in parts if not part.get("thought")),
        "model": payload.get("modelVersion") or model,
        "tokens_in": _tokens(usage.get("promptTokenCount"), "promptTokenCount"),
        "tokens_out": _tokens(usage.get("candidatesTokenCount"), "candidatesTokenCount")
        + _tokens(usage.get("thoughtsTokenCount", 0), "thoughtsTokenCount"),
    }


def _call_anthropic(system: str, user: str) -> ModelResponse:
    body = {
        "model": MODEL_NAME,
        "max_tokens": 8192,
        "messages": [{"role": "user", "content": user}],
    }
    if system:
        body["system"] = system
    payload = _post_json(
        "https://api.anthropic.com/v1/messages",
        {"Authorization": f"Bearer {API_KEY}", "anthropic-version": "2026-10-21"},
        body,
    )
    if payload.get("stop_reason") != "end_turn":
        raise RuntimeError("anthropic: phản hồi bị chặn, thiếu nội dung hoặc chưa hoàn tất.")

    usage = payload.get("usage") or {}
    input_tokens = _tokens(usage.get("input_tokens"), "input_tokens")
    for field in ("cache_creation_input_tokens", "cache_read_input_tokens"):
        if usage.get(field) is not None:
            input_tokens += _tokens(usage[field], field)
    return {
        "text": "".join(block["text"] for block in (payload.get("content") or []) if block.get("type") == "text"),
        "model": payload.get("model") or MODEL_NAME,
        "tokens_in": input_tokens,
        "tokens_out": _tokens(usage.get("output_tokens"), "output_tokens"),
    }


@model_call
def call_model(system: str, user: str) -> ModelResponse:
    """Return model text and measured usage. Technical errors reach the runner."""
    if MODEL_PROVIDER == "fake":
        last = (user.strip().splitlines() or [""])[-1]
        return {"text": "[câu trả lời giả — chưa nối model] " + last[:60], "model": "fake", "tokens_in": 0, "tokens_out": 0}

    providers = {"openai": _call_openai, "gemini": _call_gemini, "anthropic": _call_anthropic}
    if MODEL_PROVIDER not in providers:
        raise RuntimeError("MODEL_PROVIDER phải là fake, openai, gemini hoặc anthropic.")
    if not MODEL_NAME or not API_KEY:
        raise RuntimeError(f"{MODEL_PROVIDER}: cần MODEL_NAME và API_KEY trong .env.")

    result = providers[MODEL_PROVIDER](system, user)
    if not isinstance(result["text"], str) or not result["text"].strip():
        raise RuntimeError(f"{MODEL_PROVIDER}: phản hồi không có văn bản.")
    if result["tokens_in"] == 0 or result["tokens_out"] == 0:
        raise RuntimeError(f"{MODEL_PROVIDER}: phản hồi có văn bản nhưng usage báo 0 token.")
    return result
