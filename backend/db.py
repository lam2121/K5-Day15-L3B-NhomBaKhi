"""SQLite persistence and atomic submission transactions for CramAI backend."""

import json
import re
import sqlite3
from collections import defaultdict
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from grading import GradingError, grade_submission, normalize_and_validate

_DEFAULT_SEED = Path(__file__).resolve().parent.parent / "data" / "passages.jsonl"
_DAY_RE = re.compile(r"day(\d+)")
_PREVIEW_LIMIT = 3

# Display names for the 14 fixed slots, cleaned by hand from the course file
# names. Days 7-10 have no clear topic in their file names, so they keep a
# neutral label instead of a guessed one. File names are never shown as titles
# because some contain room codes and lecturers' names.
SLOT_TITLES = {
    1: "AI & LLM Foundation",
    2: "Discovery & Problem Framing",
    3: "Prompt Engineering & Tool Calling",
    4: "ReAct & Agent Loop",
    5: "AI Product Thinking & Requirements",
    6: "Data Engineering: Ingestion & Storage",
    7: "Bài giảng ngày 7",
    8: "Bài giảng ngày 8",
    9: "Bài giảng ngày 9",
    10: "Bài giảng ngày 10",
    11: "Guardrails & AI Safety",
    12: "AI SDLC",
    13: "Monitoring, Logging & Observability",
    14: "Deployment, Agent Benchmarking & Observability",
}

_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS slide_slots (
    slide_number          INTEGER PRIMARY KEY CHECK (slide_number BETWEEN 1 AND 14),
    title                 TEXT NOT NULL,
    published_revision_id TEXT,
    draft_revision_id     TEXT
);

CREATE TABLE IF NOT EXISTS slide_revisions (
    revision_id    TEXT PRIMARY KEY,
    slide_number   INTEGER NOT NULL REFERENCES slide_slots(slide_number),
    documents_json TEXT NOT NULL,
    passages_json  TEXT NOT NULL,
    created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
    attempt_id     TEXT PRIMARY KEY,
    exam_id        TEXT NOT NULL,
    questions_json TEXT NOT NULL,
    created_at     TEXT NOT NULL,
    expires_at     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attempts_exam_created ON attempts(exam_id, created_at DESC);

CREATE TABLE IF NOT EXISTS submissions (
    attempt_id      TEXT PRIMARY KEY REFERENCES attempts(attempt_id),
    answers_json    TEXT NOT NULL,
    correct_count   INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    score_percent   REAL NOT NULL,
    result_json     TEXT NOT NULL,
    submitted_at    TEXT NOT NULL
);
"""


def _parse_iso(ts: str) -> datetime:
    dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


@contextmanager
def session(db_path: str | Path) -> Iterator[sqlite3.Connection]:
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path), timeout=5.0, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.execute("PRAGMA foreign_keys=ON;")
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def _tx(conn: sqlite3.Connection) -> Iterator[None]:
    conn.execute("BEGIN IMMEDIATE")
    try:
        yield
        conn.execute("COMMIT")
    except Exception:
        conn.execute("ROLLBACK")
        raise


def _seed_from_jsonl(conn: sqlite3.Connection) -> None:
    grouped: dict[int, list[dict]] = defaultdict(list)
    with _DEFAULT_SEED.open("r", encoding="utf-8") as fh:
        for line in fh:
            if not line.strip():
                continue
            item = json.loads(line)
            if (m := _DAY_RE.search(item.get("source_id", ""))) and 1 <= (n := int(m.group(1))) <= 14:
                grouped[n].append(item)

    if not grouped:
        return

    ts = datetime.now(timezone.utc).isoformat()
    with _tx(conn):
        for slide_num, passages in grouped.items():
            rev_id = str(uuid4())
            fname = passages[0].get("file_name", f"slide-{slide_num:02d}.pdf")
            docs = [{"file_name": fname, "page_count": max(p.get("page", 1) for p in passages)}]
            conn.execute(
                "INSERT INTO slide_revisions (revision_id, slide_number, documents_json, passages_json, created_at) "
                "VALUES (?, ?, ?, ?, ?)",
                (rev_id, slide_num, json.dumps(docs, ensure_ascii=False), json.dumps(passages, ensure_ascii=False), ts),
            )
            conn.execute(
                "UPDATE slide_slots SET published_revision_id = ? WHERE slide_number = ?",
                (rev_id, slide_num),
            )


def init_db(db_path: str | Path) -> None:
    with session(db_path) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.executescript(_SCHEMA_SQL)
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(slide_slots)")}
        if "draft_revision_id" not in columns:  # databases created before the admin API
            conn.execute("ALTER TABLE slide_slots ADD COLUMN draft_revision_id TEXT")
        conn.executemany(
            "INSERT OR IGNORE INTO slide_slots (slide_number, title) VALUES (?, ?)",
            [(n, SLOT_TITLES[n]) for n in range(1, 15)],
        )
        # Slots are fixed, so their names always follow SLOT_TITLES. This also
        # repairs names that earlier versions generated from file names.
        conn.executemany(
            "UPDATE slide_slots SET title = ? WHERE slide_number = ?",
            [(SLOT_TITLES[n], n) for n in range(1, 15)],
        )
        has_published = conn.execute(
            "SELECT 1 FROM slide_slots WHERE published_revision_id IS NOT NULL LIMIT 1"
        ).fetchone()
        if not has_published and _DEFAULT_SEED.is_file():
            _seed_from_jsonl(conn)


def list_catalog(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        "SELECT slide_number, title, published_revision_id FROM slide_slots ORDER BY slide_number"
    ).fetchall()
    exams: list[dict] = []
    all_ready = len(rows) == 14

    for r in rows:
        n = r["slide_number"]
        ready = r["published_revision_id"] is not None
        all_ready = all_ready and ready
        exams.append({
            "exam_id": f"slide-{n:02d}",
            "title": r["title"],
            "slide_number": n,
            "available": ready,
            "reason": None if ready else f"Slide {n:02d} chưa được xuất bản.",
            "question_count": 5,
        })

    exams.append({
        "exam_id": "midterm",
        "title": "Đề giữa kỳ",
        "slide_number": None,
        "available": all_ready,
        "reason": None if all_ready else "Đề giữa kỳ mở sau khi đủ 14 bộ slide được xuất bản.",
        "question_count": 14,
    })
    return exams


def publish_revision(
    conn: sqlite3.Connection,
    *,
    revision_id: str,
    slide_number: int,
    documents: list[dict],
    passages: list[dict],
) -> None:
    rev = save_draft(conn, slide_number=slide_number, documents=documents, passages=passages, revision_id=revision_id)
    publish_draft(conn, slide_number=slide_number, revision_id=rev)


def get_published_passages(conn: sqlite3.Connection, exam_id: str) -> dict[int, list[dict]]:
    target = None if exam_id == "midterm" else int(exam_id.split("-")[1])
    rows = conn.execute(
        "SELECT s.slide_number, r.passages_json FROM slide_slots s "
        "JOIN slide_revisions r ON s.published_revision_id = r.revision_id "
        "WHERE (? IS NULL OR s.slide_number = ?) ORDER BY s.slide_number",
        (target, target),
    ).fetchall()
    expected = 14 if target is None else 1
    if len(rows) != expected:
        raise GradingError("exam_unavailable", 409, "Đề chưa mở vì thiếu bộ slide đã xuất bản.")
    return {r["slide_number"]: json.loads(r["passages_json"]) for r in rows}


def recent_seen_sources(conn: sqlite3.Connection, exam_id: str, *, limit: int = 10) -> set[str]:
    """Return source_ids already used in recent attempts for this exam_id to avoid repeat questions."""
    rows = conn.execute(
        "SELECT questions_json FROM attempts WHERE exam_id = ? ORDER BY created_at DESC LIMIT ?",
        (exam_id, limit),
    ).fetchall()
    return {
        c["source_id"]
        for r in rows
        for q in json.loads(r["questions_json"])
        for c in q.get("citations", ())
        if c.get("source_id")
    }


def create_attempt_record(
    conn: sqlite3.Connection,
    *,
    attempt_id: str,
    exam_id: str,
    questions: list[dict],
    created_at: datetime,
    expires_at: datetime,
) -> None:
    with _tx(conn):
        conn.execute(
            "INSERT INTO attempts (attempt_id, exam_id, questions_json, created_at, expires_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                attempt_id,
                exam_id,
                json.dumps(questions, ensure_ascii=False),
                created_at.isoformat(),
                expires_at.isoformat(),
            ),
        )


def submit_attempt_tx(
    conn: sqlite3.Connection,
    *,
    attempt_id: str,
    raw_answers: list[dict],
) -> dict:
    """Atomically validate, grade, and persist an attempt submission."""
    current_time = datetime.now(timezone.utc)
    with _tx(conn):
        attempt = conn.execute(
            "SELECT questions_json, expires_at FROM attempts WHERE attempt_id = ?",
            (attempt_id,),
        ).fetchone()
        if attempt is None or current_time >= _parse_iso(attempt["expires_at"]):
            raise GradingError("quiz_unavailable", 404, "Bài làm không còn khả dụng. Hãy tạo lượt mới.")

        questions = json.loads(attempt["questions_json"])
        canonical = normalize_and_validate(questions, raw_answers)
        answers_json = json.dumps(canonical, ensure_ascii=False, separators=(",", ":"))

        existing = conn.execute(
            "SELECT answers_json, result_json FROM submissions WHERE attempt_id = ?",
            (attempt_id,),
        ).fetchone()
        if existing is not None:
            if existing["answers_json"] == answers_json:
                return json.loads(existing["result_json"])
            raise GradingError("already_submitted", 409, "Bài này đã nộp với lựa chọn khác.")

        scored = grade_submission(questions, canonical)
        conn.execute(
            "INSERT INTO submissions "
            "(attempt_id, answers_json, correct_count, total_questions, score_percent, result_json, submitted_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                attempt_id,
                answers_json,
                scored["correct_count"],
                scored["total_questions"],
                scored["score_percent"],
                json.dumps(scored, ensure_ascii=False, separators=(",", ":")),
                current_time.isoformat(),
            ),
        )
        return scored


# ---------------------------------------------------------------- admin (T005)


def _revision_summary(conn: sqlite3.Connection, revision_id: str | None) -> dict | None:
    if revision_id is None:
        return None
    row = conn.execute(
        "SELECT documents_json, passages_json FROM slide_revisions WHERE revision_id = ?",
        (revision_id,),
    ).fetchone()
    if row is None:
        return None
    documents = json.loads(row["documents_json"])
    return {
        "revision_id": revision_id,
        "documents": [
            {"file_name": document["file_name"], "page_count": document["page_count"]}
            for document in documents
        ],
        "passage_count": len(json.loads(row["passages_json"])),
    }


def _admin_slot(conn: sqlite3.Connection, row: sqlite3.Row) -> dict:
    return {
        "slide_number": row["slide_number"],
        "title": row["title"],
        "draft": _revision_summary(conn, row["draft_revision_id"]),
        "published": _revision_summary(conn, row["published_revision_id"]),
    }


_SLOT_COLUMNS = "slide_number, title, published_revision_id, draft_revision_id"


def list_admin_slots(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(f"SELECT {_SLOT_COLUMNS} FROM slide_slots ORDER BY slide_number").fetchall()
    return [_admin_slot(conn, r) for r in rows]


def _draft_preview(conn: sqlite3.Connection, slide_number: int, draft_id: str | None, published_id: str | None) -> list[dict]:
    """Up to three passages of an unpublished draft: the first of each file, then the following ones."""
    if draft_id is None or draft_id == published_id:
        return []
    row = conn.execute("SELECT passages_json FROM slide_revisions WHERE revision_id = ?", (draft_id,)).fetchone()
    passages = json.loads(row["passages_json"]) if row else []
    picked: list[dict] = []
    seen_files: set[str] = set()
    seen_ids: set[int] = set()
    for idx, p in enumerate(passages):
        if p["file_name"] not in seen_files:
            seen_files.add(p["file_name"])
            seen_ids.add(idx)
            picked.append(p)
            if len(picked) >= _PREVIEW_LIMIT:
                break
    for idx, p in enumerate(passages):
        if len(picked) >= _PREVIEW_LIMIT:
            break
        if idx not in seen_ids:
            picked.append(p)
    return [
        {
            "citation": {
                "slide_number": slide_number,
                "source_id": p["source_id"],
                "file_name": p["file_name"],
                "page": p["page"],
            },
            "text": p["text"],
        }
        for p in picked[:_PREVIEW_LIMIT]
    ]


def get_admin_detail(conn: sqlite3.Connection, slide_number: int) -> dict:
    row = conn.execute(f"SELECT {_SLOT_COLUMNS} FROM slide_slots WHERE slide_number = ?", (slide_number,)).fetchone()
    if row is None:
        raise GradingError("invalid_input", 422, "Chỉ có vị trí 01–14.")
    return {
        "slot": _admin_slot(conn, row),
        "draft_preview": _draft_preview(conn, slide_number, row["draft_revision_id"], row["published_revision_id"]),
    }


def save_draft(
    conn: sqlite3.Connection,
    *,
    slide_number: int,
    documents: list[dict],
    passages: list[dict],
    revision_id: str | None = None,
) -> str:
    """Store a new revision as the slot's draft. The published pointer is left untouched."""
    revision_id = revision_id or str(uuid4())
    ts = datetime.now(timezone.utc).isoformat()
    with _tx(conn):
        conn.execute(
            "INSERT INTO slide_revisions (revision_id, slide_number, documents_json, passages_json, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (revision_id, slide_number, json.dumps(documents, ensure_ascii=False), json.dumps(passages, ensure_ascii=False), ts),
        )
        conn.execute("UPDATE slide_slots SET draft_revision_id = ? WHERE slide_number = ?", (revision_id, slide_number))
    return revision_id


def get_attempt_question(conn: sqlite3.Connection, *, attempt_id: str, question_id: str) -> dict:
    """Return a private question snapshot only while its attempt is active."""
    row = conn.execute(
        "SELECT questions_json, expires_at FROM attempts WHERE attempt_id = ?",
        (attempt_id,),
    ).fetchone()
    if row is None or datetime.now(timezone.utc) >= _parse_iso(row["expires_at"]):
        raise GradingError("quiz_unavailable", 404, "Lượt làm bài không còn khả dụng. Hãy tạo lượt mới.")
    for question in json.loads(row["questions_json"]):
        if question.get("question_id") == question_id:
            return question
    raise GradingError("quiz_unavailable", 404, "Câu hỏi không thuộc lượt làm bài này.")


def publish_draft(conn: sqlite3.Connection, *, slide_number: int, revision_id: str) -> None:
    """Atomically publish the draft the admin reviewed; a different current draft means someone uploaded in between."""
    with _tx(conn):
        row = conn.execute("SELECT draft_revision_id FROM slide_slots WHERE slide_number = ?", (slide_number,)).fetchone()
        if row is None or row["draft_revision_id"] != revision_id:
            raise GradingError("stale_draft", 409, "Bản nháp đã thay đổi. Hãy tải lại để duyệt.")
        conn.execute(
            "UPDATE slide_slots SET published_revision_id = ? WHERE slide_number = ?",
            (revision_id, slide_number),
        )
