"""Công cụ truy hồi đoạn slide cho CramAI — chỉ đọc, giữ @tool theo hợp đồng v1."""

import json
import re
import unicodedata
from pathlib import Path

from contracts import SlidePassage
from tracing import tool

_PASSAGES_PATH = Path(__file__).resolve().parents[1] / "data" / "passages.jsonl"
_DAY_PREFIX = re.compile(r"^(day\d{2})-")
_DAY_RANGE = re.compile(r"(?:day|ngay|buoi)\s*0?(\d{1,2})\s*(?:-|den|toi|\.\.)\s*(?:day|ngay|buoi)?\s*0?(\d{1,2})")
_DAY_SINGLE = re.compile(r"(?:day|ngay|buoi)\s*0?(\d{1,2})\b")
_BROAD_HINTS = ("tong hop", "giua ky", "nhieu ngay", "ca khoa", "toan bo", "tat ca")
_STOP_WORDS = {
    "tao", "sinh", "cho", "de", "on", "tap", "cau", "hoi", "ve", "giup", "minh", "toi",
    "va", "cua", "trong", "theo", "mot", "cac", "nhung", "bai", "giang", "slide", "ngay",
    "buoi", "file", "pdf", "muc", "do", "vua", "kho", "trac", "nghiem", "tu", "luan",
    "ngan", "dap", "an", "trich", "dan", "trang", "giua", "ky", "tong", "hop", "nhieu",
    "khoa", "hoc", "hay", "nhat", "moi", "can", "cu", "ro", "rang", "giai", "thich",
    "tu", "khoa", "la", "co", "khong", "den", "toi", "phien", "bo", "du", "lieu",
}


def _fold(text: str) -> str:
    nfd = unicodedata.normalize("NFD", text.lower().replace("đ", "d").replace("Đ", "d"))
    return "".join(ch for ch in nfd if unicodedata.category(ch) != "Mn")


def _load_passages() -> list[SlidePassage]:
    if not _PASSAGES_PATH.exists():
        return []
    with _PASSAGES_PATH.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def _extract_days(folded: str) -> set[str]:
    days: set[str] = set()
    for start_s, end_s in _DAY_RANGE.findall(folded):
        lo, hi = int(start_s), int(end_s)
        if lo <= hi:
            days.update(f"day{d:02d}" for d in range(lo, hi + 1))
    for num_s in _DAY_SINGLE.findall(folded):
        days.add(f"day{int(num_s):02d}")
    return days


def _day_of(passage: SlidePassage) -> str:
    match = _DAY_PREFIX.match(passage["source_id"])
    return match.group(1) if match else ""


def _round_robin_by_day(passages: list[SlidePassage], limit: int) -> list[SlidePassage]:
    buckets: dict[str, list[SlidePassage]] = {}
    for p in passages:
        buckets.setdefault(_day_of(p), []).append(p)
    picked: list[SlidePassage] = []
    keys = sorted(buckets)
    while len(picked) < limit and any(buckets.values()):
        for key in keys:
            if buckets[key] and len(picked) < limit:
                picked.append(buckets[key].pop(0))
    return picked


@tool
def search_slides(query: str, *, limit: int = 12) -> list[SlidePassage]:
    """Tra cứu các đoạn slide khớp chủ đề hoặc phạm vi ngày ôn tập.
    Input: truy vấn (str), limit số nguyên dương. Output: list[SlidePassage]. Không tác động ra ngoài."""
    if type(limit) is not int or limit < 1:
        raise ValueError("limit must be a positive integer")
    if not isinstance(query, str) or not query.strip():
        return []

    passages = _load_passages()
    if not passages:
        return []

    folded = _fold(query)
    days = _extract_days(folded)
    if days:
        passages = [p for p in passages if _day_of(p) in days]
        if not passages:
            return []

    raw_tokens = re.findall(r"[a-z0-9]+", folded)
    topic_tokens = {
        tok for tok in raw_tokens
        if len(tok) >= 2 and tok not in _STOP_WORDS and not tok.isdigit() and not tok.startswith("day")
    }
    if not topic_tokens:
        if days or any(hint in folded for hint in _BROAD_HINTS):
            return _round_robin_by_day(passages, limit)
        return []

    scored: list[tuple[int, str, SlidePassage]] = []
    for p in passages:
        haystack = _fold(f"{p['file_name']} {p['text']}")
        hits = sum(1 for tok in topic_tokens if tok in haystack)
        if hits:
            scored.append((-hits, p["source_id"], p))
    scored.sort(key=lambda item: (item[0], item[1]))
    return [item[2] for item in scored[:limit]]


# ponytail: giữ stub tạm để starter agent.py không lỗi import trước khi Hưng chuyển sang search_slides
def search_example(query: str) -> list:
    """Stub tương thích tạm cho starter agent.py."""
    return [{"code": p["source_id"], "text": p["text"]} for p in search_slides(query, limit=3)]


if __name__ == "__main__":
    assert len(search_slides("Tạo đề ôn tập tổng hợp giữa kỳ nhiều ngày", limit=6)) >= 4
    assert len({p["source_id"][:5] for p in search_slides("ôn tổng hợp nhiều ngày", limit=8)}) >= 4
    assert search_slides("Tạo câu hỏi về Quantum Computing") == []
    assert search_slides("Ôn tập ngày 99") == []
    assert len(search_slides("Prompt Engineering và Tool Calling ở ngày 3")) >= 1
    assert search_slides("") == []
    print("tools.py self-check OK")
