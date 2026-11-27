"""FastAPI service for CramAI web exams and deterministic LMS grading."""

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from db import (
    create_attempt_record,
    get_published_passages,
    init_db,
    list_catalog,
    session,
    submit_attempt_tx,
)
from grading import GradingError

_EXAM_ID_PATTERN = r"^(slide-(0[1-9]|1[0-4])|midterm)$"
_ATTEMPT_TTL = timedelta(minutes=60)
_DEFAULT_DB = Path(__file__).resolve().parent / "cramai_web.db"


class AttemptRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    exam_id: str = Field(pattern=_EXAM_ID_PATTERN)


class AnswerItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question_id: str = Field(pattern=r"^q[0-9]{2,}$")
    option_id: str


class SubmissionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    attempt_id: UUID
    answers: list[AnswerItem]


def _error_json(status_code: int, code: str, message: str, request_id: str | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"request_id": request_id or str(uuid4()), "error": {"code": code, "message": message}},
    )


def _default_fake_generator(exam_id: str, passages_by_slide: dict[int, list[dict]]) -> list[dict]:
    """Build deterministic grounded questions for fake/local mode without calling external LLM."""
    questions: list[dict] = []
    if exam_id == "midterm":
        targets = [(slide_num, passages_by_slide[slide_num][0]) for slide_num in sorted(passages_by_slide)]
    else:
        slide_num = next(iter(passages_by_slide))
        pool = passages_by_slide[slide_num]
        targets = [(slide_num, pool[i % len(pool)]) for i in range(5)]

    for idx, (slide_num, passage) in enumerate(targets, start=1):
        snippet = passage["text"][:100].rstrip("…")
        questions.append({
            "question_id": f"q{idx:02d}",
            "prompt": f"Theo {passage['file_name']} trang {passage['page']}, nội dung nào đúng?",
            "options": [
                {"option_id": "a", "text": snippet},
                {"option_id": "b", "text": "Nội dung không được đề cập trong tài liệu."},
                {"option_id": "c", "text": "Thao tác bị từ chối vì thiếu kiểm chứng."},
                {"option_id": "d", "text": "Kết quả tự động suy đoán ngoài slide."},
            ],
            "correct_option_id": "a",
            "slide_number": slide_num,
            "citations": [{
                "slide_number": slide_num,
                "source_id": passage["source_id"],
                "file_name": passage["file_name"],
                "page": passage["page"],
            }],
        })
    return questions


def _to_public_questions(questions: list[dict]) -> list[dict]:
    """Allowlist public fields only so answer keys and citations never leak before submission."""
    return [
        {"question_id": q["question_id"], "prompt": q["prompt"], "options": q["options"]}
        for q in questions
    ]


def create_app(*, db_path: str | Path | None = None, mode: str | None = None) -> FastAPI:
    resolved_db = Path(db_path or os.environ.get("CRAMAI_WEB_DB") or _DEFAULT_DB)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        init_db(resolved_db)
        yield

    app = FastAPI(title="CramAI Exam API", version="1.0.0", lifespan=lifespan)
    app.state.db_path = resolved_db
    app.state.mode = mode or os.environ.get("MODEL_PROVIDER", "fake").strip().lower() or "fake"
    if app.state.mode not in {"fake", "live"}:
        app.state.mode = "live"

    @app.exception_handler(GradingError)
    async def handle_grading_error(_: Request, exc: GradingError) -> JSONResponse:
        return _error_json(exc.status_code, exc.code, exc.message)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, _: RequestValidationError) -> JSONResponse:
        if request.url.path.endswith("/submissions"):
            return _error_json(422, "invalid_answers", "Hãy chọn đúng một đáp án cho mỗi câu.")
        return _error_json(400, "invalid_input", "Dữ liệu đầu vào không hợp lệ.")

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_: Request, __: Exception) -> JSONResponse:
        return _error_json(500, "internal_error", "Lỗi hệ thống nội bộ.")

    @app.get("/api/v1/health")
    def get_health() -> dict:
        return {"status": "ok", "mode": app.state.mode, "version": "local"}

    @app.get("/api/v1/catalog")
    def get_catalog() -> dict:
        with session(resolved_db) as conn:
            return {"exams": list_catalog(conn)}

    @app.post("/api/v1/attempts", status_code=201)
    def create_attempt(body: AttemptRequest) -> dict:
        with session(resolved_db) as conn:
            passages_by_slide = get_published_passages(conn, body.exam_id)
        questions = _default_fake_generator(body.exam_id, passages_by_slide)
        expected_count = 14 if body.exam_id == "midterm" else 5
        if len(questions) != expected_count:
            raise GradingError("insufficient_evidence", 422, "Chưa đủ căn cứ để tạo đề theo phạm vi này.")

        now = datetime.now(timezone.utc)
        expires_at = now + _ATTEMPT_TTL
        attempt_id = str(uuid4())
        with session(resolved_db) as conn:
            create_attempt_record(
                conn,
                attempt_id=attempt_id,
                exam_id=body.exam_id,
                questions=questions,
                created_at=now,
                expires_at=expires_at,
            )
        return {
            "request_id": str(uuid4()),
            "mode": app.state.mode,
            "attempt_id": attempt_id,
            "exam_id": body.exam_id,
            "expires_at": expires_at.isoformat().replace("+00:00", "Z"),
            "questions": _to_public_questions(questions),
        }

    @app.post("/api/v1/submissions")
    def submit_attempt(body: SubmissionRequest) -> dict:
        with session(resolved_db) as conn:
            scored = submit_attempt_tx(
                conn,
                attempt_id=str(body.attempt_id),
                raw_answers=[item.model_dump() for item in body.answers],
            )
        return {
            "request_id": str(uuid4()),
            "attempt_id": str(body.attempt_id),
            **scored,
        }

    return app


app = create_app()
