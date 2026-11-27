"""Trích xuất đoạn trích ngắn đại diện từ 14 ngày slide PDF trong data-private/ ra data/passages.jsonl.

Chạy cục bộ (khi có data-private/): python evidence/scripts/build_passages.py
Không dùng ở runtime (codebase/tools.py chỉ đọc data/passages.jsonl bằng stdlib).
"""

import json
import re
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "codebase"))
from contracts import resolve_citations  # noqa: E402

PRIVATE_DIR = ROOT / "data-private"
OUT_PATH = ROOT / "data" / "passages.jsonl"
SKIP_PREFIXES = ("03 - References", "03 - Tài liệu", "04 - References", "04 - grading", "05 - References", "05 - Day 2 - Lab", "06 - References", "10 - [Lab]")
MAX_PER_DAY = 20
MAX_CHARS = 450
MIN_CHARS = 120


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _pick_deck(day_dir: Path) -> Path:
    candidates = [
        p for p in sorted(day_dir.glob("*.pdf"))
        if not p.name.startswith(SKIP_PREFIXES)
    ]
    best_path, best_rich = candidates[0], -1
    for pdf in candidates:
        with pymupdf.open(pdf) as doc:
            rich = sum(1 for pg in doc if len(_clean(pg.get_text())) >= MIN_CHARS)
        if rich > best_rich:
            best_path, best_rich = pdf, rich
    return best_path


def _sample_even(items: list, k: int) -> list:
    if len(items) <= k:
        return items
    step = len(items) / k
    return [items[int(i * step)] for i in range(k)]


def main() -> int:
    pymupdf.TOOLS.mupdf_display_errors(False)
    passages: list[dict] = []
    stats: list[str] = []

    for day_dir in sorted(PRIVATE_DIR.glob("Day *")):
        m = re.match(r"Day\s*0?(\d{1,2})\b", day_dir.name)
        if not m:
            continue
        day_tag = f"day{int(m.group(1)):02d}"
        deck = _pick_deck(day_dir)

        rich_pages: list[tuple[int, str]] = []
        with pymupdf.open(deck) as doc:
            for idx, pg in enumerate(doc, start=1):
                if idx == 1:
                    continue  # bỏ trang bìa
                txt = _clean(pg.get_text())
                if len(txt) >= MIN_CHARS:
                    excerpt = txt[:MAX_CHARS].rsplit(" ", 1)[0] + "…" if len(txt) > MAX_CHARS else txt
                    rich_pages.append((idx, excerpt))

        selected = _sample_even(rich_pages, MAX_PER_DAY)
        for page_no, excerpt in selected:
            passages.append({
                "source_id": f"{day_tag}-p{page_no:03d}-s01",
                "file_name": deck.name,
                "page": page_no,
                "text": excerpt,
            })
        stats.append(f"{day_tag}: {len(selected)}/{len(rich_pages)}p <- {deck.name}")

    resolve_citations([p["source_id"] for p in passages], passages)
    OUT_PATH.write_text(
        "\n".join(json.dumps(p, ensure_ascii=False) for p in passages) + "\n",
        encoding="utf-8",
    )
    print("\n".join(stats))
    print(f"Total passages written: {len(passages)} -> {OUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
