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

if __package__:
    from .grading import GradingError, grade_submission, normalize_and_validate
else:  # Support the legacy top-level `db` import used by local test utilities.
    from grading import GradingError, grade_submission, normalize_and_validate

_DEFAULT_SEED = Path(__file__).resolve().parent.parent / "data" / "passages.jsonl"
_DAY_RE = re.compile(r"day(\d+)")
_LEGACY_SOURCE_ID_RE = re.compile(r"^(day(?:0[1-9]|1[0-4]))-p(\d{3,})-s(\d{2,})$")

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
            title = re.sub(r"^(?:\d+\s*-\s*)?day\d+-|\.pdf$", "", fname).replace("-", " ").strip().title()
            docs = [{"file_name": fname, "page_count": max(p.get("page", 1) for p in passages)}]
            conn.execute(
                "INSERT INTO slide_revisions (revision_id, slide_number, documents_json, passages_json, created_at) "
                "VALUES (?, ?, ?, ?, ?)",
                (rev_id, slide_num, json.dumps(docs, ensure_ascii=False), json.dumps(passages, ensure_ascii=False), ts),
            )
            conn.execute(
                "UPDATE slide_slots SET published_revision_id = ?, title = ? WHERE slide_number = ?",
                (rev_id, title or f"Slide {slide_num:02d}", slide_num),
            )


def init_db(db_path: str | Path) -> None:
    with session(db_path) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.executescript(_SCHEMA_SQL)
        slot_columns = {row["name"] for row in conn.execute("PRAGMA table_info(slide_slots)").fetchall()}
        if "draft_revision_id" not in slot_columns:
            conn.execute("ALTER TABLE slide_slots ADD COLUMN draft_revision_id TEXT")
        conn.executemany(
            "INSERT OR IGNORE INTO slide_slots (slide_number, title) VALUES (?, ?)",
            [(n, f"Slide {n:02d}") for n in range(1, 15)],
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
    ts = datetime.now(timezone.utc).isoformat()
    with _tx(conn):
        conn.execute(
            "INSERT INTO slide_revisions (revision_id, slide_number, documents_json, passages_json, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (revision_id, slide_number, json.dumps(documents, ensure_ascii=False), json.dumps(passages, ensure_ascii=False), ts),
        )
        conn.execute(
            "UPDATE slide_slots SET published_revision_id = ? WHERE slide_number = ?",
            (revision_id, slide_number),
        )


def save_draft_revision(
    conn: sqlite3.Connection,
    *,
    revision_id: str,
    slide_number: int,
    documents: list[dict],
    passages: list[dict],
) -> None:
    ts = datetime.now(timezone.utc).isoformat()
    with _tx(conn):
        conn.execute(
            "INSERT INTO slide_revisions (revision_id, slide_number, documents_json, passages_json, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (revision_id, slide_number, json.dumps(documents, ensure_ascii=False), json.dumps(passages, ensure_ascii=False), ts),
        )
        conn.execute(
            "UPDATE slide_slots SET draft_revision_id = ? WHERE slide_number = ?",
            (revision_id, slide_number),
        )


def publish_draft_revision(conn: sqlite3.Connection, *, slide_number: int, revision_id: str) -> None:
    with _tx(conn):
        slot = conn.execute(
            "SELECT draft_revision_id FROM slide_slots WHERE slide_number = ?",
            (slide_number,),
        ).fetchone()
        if slot is None or slot["draft_revision_id"] != revision_id:
            raise GradingError("stale_draft", 409, "Bản nháp đã thay đổi. Hãy tải lại để duyệt.")
        revision = conn.execute(
            "SELECT slide_number FROM slide_revisions WHERE revision_id = ?",
            (revision_id,),
        ).fetchone()
        if revision is None or revision["slide_number"] != slide_number:
            raise GradingError("stale_draft", 409, "Bản nháp không còn hợp lệ. Hãy tải lại để duyệt.")
        conn.execute(
            "UPDATE slide_slots SET published_revision_id = ?, draft_revision_id = NULL WHERE slide_number = ?",
            (revision_id, slide_number),
        )


def _admin_slot(conn: sqlite3.Connection, row: sqlite3.Row) -> dict:
    def revision_summary(revision_id: str | None) -> dict | None:
        if not revision_id:
            return None
        revision = conn.execute(
            "SELECT documents_json, passages_json FROM slide_revisions WHERE revision_id = ?",
            (revision_id,),
        ).fetchone()
        if revision is None:
            return None
        documents = json.loads(revision["documents_json"])
        passages = json.loads(revision["passages_json"])
        return {
            "revision_id": revision_id,
            "documents": [
                {"file_name": document["file_name"], "page_count": document["page_count"]}
                for document in documents
            ],
            "passage_count": len(passages),
        }

    return {
        "slide_number": row["slide_number"],
        "title": row["title"],
        "draft": revision_summary(row["draft_revision_id"]),
        "published": revision_summary(row["published_revision_id"]),
    }


def list_admin_slides(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        "SELECT slide_number, title, draft_revision_id, published_revision_id FROM slide_slots ORDER BY slide_number"
    ).fetchall()
    return [_admin_slot(conn, row) for row in rows]


def get_admin_slide_detail(conn: sqlite3.Connection, slide_number: int) -> dict:
    row = conn.execute(
        "SELECT slide_number, title, draft_revision_id, published_revision_id FROM slide_slots WHERE slide_number = ?",
        (slide_number,),
    ).fetchone()
    if row is None:
        raise GradingError("invalid_input", 422, "Chỉ có vị trí 01–14.")
    slot = _admin_slot(conn, row)
    preview: list[dict] = []
    revision_id = row["draft_revision_id"]
    if revision_id:
        revision = conn.execute(
            "SELECT passages_json FROM slide_revisions WHERE revision_id = ?",
            (revision_id,),
        ).fetchone()
        if revision:
            for passage in json.loads(revision["passages_json"])[:3]:
                preview.append({
                    "citation": {
                        "slide_number": slide_number,
                        "source_id": passage["source_id"],
                        "file_name": passage["file_name"],
                        "page": passage["page"],
                    },
                    "text": passage["text"],
                })
    return {"slot": slot, "draft_preview": preview}


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
    passages_by_slide = {r["slide_number"]: json.loads(r["passages_json"]) for r in rows}
    # CP3 seed passages identify day/page/segment only. The web contract also
    # includes the document index; legacy seeded files contain one PDF per day.
    # Normalize only the returned copy so stored revisions remain untouched.
    for passages in passages_by_slide.values():
        for passage in passages:
            match = _LEGACY_SOURCE_ID_RE.fullmatch(passage.get("source_id", ""))
            if match:
                day_id, page, segment = match.groups()
                passage["source_id"] = f"{day_id}-d01-p{page}-s{segment}"
    return passages_by_slide


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


def get_attempt_question(conn: sqlite3.Connection, *, attempt_id: str, question_id: str) -> dict:
    """Return a private question snapshot for an explanation or source-page request."""
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
