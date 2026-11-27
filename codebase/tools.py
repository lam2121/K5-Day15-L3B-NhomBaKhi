"""Công cụ truy hồi và trích xuất đoạn slide cho CramAI."""

import json
import os
import re
import unicodedata
from collections.abc import Sequence
from functools import lru_cache
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

MAX_PDFS_PER_SLOT = 5
MAX_PAGES_PER_PDF = 120
MAX_PAGES_PER_SLOT = 300
MAX_PASSAGE_CHARS = 1200


def _fold(text: str) -> str:
    nfd = unicodedata.normalize("NFD", text.lower().replace("đ", "d").replace("Đ", "d"))
    return "".join(ch for ch in nfd if unicodedata.category(ch) != "Mn")


def _day_of(passage: SlidePassage) -> str:
    match = _DAY_PREFIX.match(passage["source_id"])
    return match.group(1) if match else ""


@lru_cache(maxsize=2)
def _load_index_cached(path_str: str, mtime_ns: int) -> tuple[tuple[str, str, SlidePassage], ...]:
    del mtime_ns  # chỉ dùng làm khoá vô hiệu hoá cache khi file thay đổi
    entries: list[tuple[str, str, SlidePassage]] = []
    with open(path_str, encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            passage: SlidePassage = json.loads(line)
            entries.append((_day_of(passage), _fold(f"{passage['file_name']} {passage['text']}"), passage))
    return tuple(entries)


def _load_index() -> tuple[tuple[str, str, SlidePassage], ...]:
    if not _PASSAGES_PATH.exists():
        return ()
    return _load_index_cached(str(_PASSAGES_PATH), _PASSAGES_PATH.stat().st_mtime_ns)


def _extract_days(folded: str) -> set[str]:
    days: set[str] = set()
    for start_s, end_s in _DAY_RANGE.findall(folded):
        lo, hi = int(start_s), int(end_s)
        if lo <= hi:
            days.update(f"day{d:02d}" for d in range(lo, hi + 1))
    for num_s in _DAY_SINGLE.findall(folded):
        days.add(f"day{int(num_s):02d}")
    return days


def _round_robin_by_day(entries: list[tuple[str, str, SlidePassage]], limit: int) -> list[SlidePassage]:
    buckets: dict[str, list[SlidePassage]] = {}
    for day, _, passage in entries:
        buckets.setdefault(day, []).append(passage)
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

    entries = _load_index()
    if not entries:
        return []

    folded = _fold(query)
    days = _extract_days(folded)
    pool = [item for item in entries if item[0] in days] if days else list(entries)
    if not pool:
        return []

    raw_tokens = re.findall(r"[a-z0-9]+", folded)
    topic_tokens = {
        tok for tok in raw_tokens
        if len(tok) >= 2 and tok not in _STOP_WORDS and not tok.isdigit() and not tok.startswith("day")
    }
    if not topic_tokens:
        if days or any(hint in folded for hint in _BROAD_HINTS):
            return _round_robin_by_day(pool, limit)
        return []

    scored: list[tuple[int, str, SlidePassage]] = []
    for _, haystack, passage in pool:
        hits = sum(1 for tok in topic_tokens if tok in haystack)
        if hits:
            scored.append((-hits, passage["source_id"], passage))
    scored.sort(key=lambda item: (item[0], item[1]))
    return [item[2] for item in scored[:limit]]


def _sanitize_pdf_name(raw_name: str) -> str:
    name = Path(raw_name).name.strip()
    if not name or name in {".", ".."} or any(mark in name for mark in "/\\:\r\n"):
        raise ValueError(f"Tên tệp PDF không hợp lệ: {raw_name!r}")
    return name


def _open_pdf_doc(pymupdf_mod, item: str | os.PathLike[str] | tuple[str, bytes]):
    if isinstance(item, tuple):
        if len(item) != 2 or not isinstance(item[0], str) or not isinstance(item[1], (bytes, bytearray)):
            raise ValueError("Mục PDF dạng tuple phải là (file_name, bytes).")
        file_name = _sanitize_pdf_name(item[0])
        return file_name, pymupdf_mod.open(stream=bytes(item[1]), filetype="pdf")
    path = Path(item)
    file_name = _sanitize_pdf_name(path.name)
    return file_name, pymupdf_mod.open(path)


def extract_pdf_passages(
    files: Sequence[str | os.PathLike[str] | tuple[str, bytes]],
    slide_number: int,
) -> dict:
    """Trích xuất SlidePassage từ 1–5 PDF cho một vị trí slide (01–14) của web backend.

    Hàm thuần trích xuất (không ghi DB/ổ đĩa). Lazy import pymupdf để CLI giữ nguyên stdlib.
    """
    if type(slide_number) is not int or not 1 <= slide_number <= 14:
        raise ValueError("slide_number phải là số nguyên từ 1 đến 14.")
    if not files or len(files) > MAX_PDFS_PER_SLOT:
        raise ValueError(f"Mỗi bộ slide nhận từ 1 đến {MAX_PDFS_PER_SLOT} tệp PDF.")

    import pymupdf

    pymupdf.TOOLS.mupdf_display_errors(False)
    documents: list[dict[str, int | str]] = []
    passages: list[SlidePassage] = []
    total_pages = 0

    for doc_idx, item in enumerate(files, start=1):
        try:
            file_name, doc = _open_pdf_doc(pymupdf, item)
        except ValueError:
            raise
        except Exception as exc:
            raise ValueError(f"Tệp PDF hỏng hoặc không đọc được: {exc}") from None

        try:
            page_count = len(doc)
            if page_count < 1 or page_count > MAX_PAGES_PER_PDF:
                raise ValueError(f"{file_name}: số trang ({page_count}) phải nằm trong 1..{MAX_PAGES_PER_PDF}.")
            total_pages += page_count
            if total_pages > MAX_PAGES_PER_SLOT:
                raise ValueError(f"Tổng số trang vượt giới hạn {MAX_PAGES_PER_SLOT} trang/bộ.")

            doc_chars = 0
            for page_no, page in enumerate(doc, start=1):
                cleaned = " ".join(page.get_text().split())
                if not cleaned:
                    continue
                doc_chars += len(cleaned)
                text = (
                    cleaned[:MAX_PASSAGE_CHARS].rsplit(" ", 1)[0] + "…"
                    if len(cleaned) > MAX_PASSAGE_CHARS
                    else cleaned
                )
                passages.append({
                    "source_id": f"day{slide_number:02d}-d{doc_idx:02d}-p{page_no:03d}-s01",
                    "file_name": file_name,
                    "page": page_no,
                    "text": text,
                })
            if doc_chars == 0:
                raise ValueError(f"{file_name}: PDF thiếu lớp văn bản (không hỗ trợ PDF chỉ có ảnh/scan).")
            documents.append({"file_name": file_name, "page_count": page_count})
        finally:
            doc.close()

    return {"slide_number": slide_number, "documents": documents, "passages": passages}


if __name__ == "__main__":
    assert len(search_slides("Tạo đề ôn tập tổng hợp giữa kỳ nhiều ngày", limit=6)) >= 4
    assert len({p["source_id"][:5] for p in search_slides("ôn tổng hợp nhiều ngày", limit=8)}) >= 4
    assert search_slides("Tạo câu hỏi về Quantum Computing") == []
    assert search_slides("Ôn tập ngày 99") == []
    assert len(search_slides("Prompt Engineering và Tool Calling ở ngày 3")) >= 1
    assert search_slides("") == []

    import pymupdf as _pm
    _doc = _pm.open()
    _doc.new_page().insert_text((72, 72), "Day 03: Prompt Engineering and Tool Calling.")
    _res = extract_pdf_passages([("day03-sample.pdf", _doc.tobytes())], 3)
    assert _res["documents"] == [{"file_name": "day03-sample.pdf", "page_count": 1}]
    assert _res["passages"][0]["source_id"] == "day03-d01-p001-s01"

    _blank = _pm.open()
    _blank.new_page()
    for _bad in (("corrupt.pdf", b"not-a-pdf"), ("scan.pdf", _blank.tobytes())):
        try:
            extract_pdf_passages([_bad], 3)
            raise AssertionError("Expected ValueError")
        except ValueError:
            pass
    print("tools.py self-check OK")
