"""FastAPI service for CramAI web exams and deterministic LMS grading."""

import base64
import binascii
import os
import secrets
import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import FastAPI, File, Path as PathParam, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from db import (
    create_attempt_record,
    get_admin_detail,
    get_published_passages,
    init_db,
    list_admin_slots,
    list_catalog,
    publish_draft,
    save_draft,
    session,
    submit_attempt_tx,
)
from grading import GradingError

_EXAM_ID_PATTERN = r"^(slide-(0[1-9]|1[0-4])|midterm)$"
_ATTEMPT_TTL = timedelta(minutes=60)
_DEFAULT_DB = Path(__file__).resolve().parent.parent / "data-private" / "cramai_web.db"
_CODEBASE_DIR = Path(__file__).resolve().parent.parent / "codebase"

# Admin upload limits (contract: PUT /admin/slides/{n}/draft).
_MAX_FILES = 5
_MAX_FILE_BYTES = 10 * 1024 * 1024
_MAX_TOTAL_BYTES = 25 * 1024 * 1024
_MULTIPART_OVERHEAD = 1024 * 1024
_ADMIN_PREFIXES = ("/admin", "/api/v1/admin")


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


class PublishRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    revision_id: UUID


def _is_admin_path(path: str) -> bool:
    return any(path == prefix or path.startswith(prefix + "/") for prefix in _ADMIN_PREFIXES)


def _basic_credentials(header: str | None) -> tuple[str, str] | None:
    if not header or not header.lower().startswith("basic "):
        return None
    try:
        decoded = base64.b64decode(header[6:].strip(), validate=True).decode("utf-8")
    except (binascii.Error, UnicodeDecodeError):
        return None
    user, sep, password = decoded.partition(":")
    return (user, password) if sep else None


def _extract_pdf_passages():
    """Khiem's extractor lives in codebase/tools.py; the container puts codebase/ on PYTHONPATH."""
    if str(_CODEBASE_DIR) not in sys.path:
        sys.path.append(str(_CODEBASE_DIR))
    from tools import extract_pdf_passages

    return extract_pdf_passages


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


def create_app(
    *,
    db_path: str | Path | None = None,
    mode: str | None = None,
    admin_user: str | None = None,
    admin_password: str | None = None,
    public_origin: str | None = None,
    generator=None,
) -> FastAPI:
    """`generator(exam_id, passages_by_slide) -> questions` defaults to the offline fake generator."""
    resolved_db = Path(db_path or os.environ.get("CRAMAI_WEB_DB") or _DEFAULT_DB)
    generate = generator or _default_fake_generator
    # Admin credentials come from service configuration only. Without both
    # values the admin page and API stay closed (fail closed).
    admin_user = admin_user if admin_user is not None else os.environ.get("CRAMAI_ADMIN_USER", "")
    admin_password = admin_password if admin_password is not None else os.environ.get("CRAMAI_ADMIN_PASSWORD", "")
    public_origin = (public_origin if public_origin is not None else os.environ.get("CRAMAI_PUBLIC_ORIGIN", "")).rstrip("/")

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
        if request.url.path.startswith("/api/v1/admin/"):
            return _error_json(422, "invalid_input", "Yêu cầu admin không hợp lệ. Chỉ có vị trí 01–14.")
        return _error_json(400, "invalid_input", "Dữ liệu đầu vào không hợp lệ.")

    @app.middleware("http")
    async def guard_admin(request: Request, call_next):
        """HTTP Basic for /admin/ and /api/v1/admin/*, same-origin writes, and an early body-size cap."""
        path = request.url.path
        if not _is_admin_path(path):
            return await call_next(request)

        creds = _basic_credentials(request.headers.get("authorization"))
        ok = bool(admin_user and admin_password and creds) and (
            secrets.compare_digest(creds[0].encode(), admin_user.encode())
            & secrets.compare_digest(creds[1].encode(), admin_password.encode())
        )
        if not ok:
            response = _error_json(401, "unauthorized", "Cần đăng nhập admin.")
            response.headers["WWW-Authenticate"] = 'Basic realm="CramAI admin", charset="UTF-8"'
            return response

        if request.method not in ("GET", "HEAD", "OPTIONS"):
            origin = request.headers.get("origin")
            expected = public_origin or f"{request.url.scheme}://{request.headers.get('host', '')}"
            if origin and origin.rstrip("/") != expected:
                return _error_json(403, "forbidden_origin", "Yêu cầu khác nguồn không được phép.")
            length = request.headers.get("content-length")
            if length and length.isdigit() and int(length) > _MAX_TOTAL_BYTES + _MULTIPART_OVERHEAD:
                return _error_json(413, "too_large", "Mỗi file tối đa 10 MB, tổng tối đa 25 MB.")
        return await call_next(request)

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
        try:
            questions = generate(body.exam_id, passages_by_slide)
        except GradingError:
            raise
        except Exception:  # model or network failure: no attempt is stored
            raise GradingError("upstream_error", 502, "Chưa gọi được model. Hãy thử lại sau.") from None
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

    # ------------------------------------------------------------ admin (T005)

    @app.get("/api/v1/admin/slides")
    def admin_list() -> dict:
        with session(resolved_db) as conn:
            return {"slides": list_admin_slots(conn)}

    @app.get("/api/v1/admin/slides/{slide_number}")
    def admin_detail(slide_number: int = PathParam(ge=1, le=14)) -> dict:
        with session(resolved_db) as conn:
            return get_admin_detail(conn, slide_number)

    @app.put("/api/v1/admin/slides/{slide_number}/draft")
    async def admin_upload_draft(
        slide_number: int = PathParam(ge=1, le=14),
        files: list[UploadFile] = File(...),
    ) -> dict:
        if not 1 <= len(files) <= _MAX_FILES:
            raise GradingError("invalid_input", 422, "Chọn từ 1 đến 5 file PDF.")
        payload: list[tuple[str, bytes]] = []
        total = 0
        for upload in files:
            name = (upload.filename or "").strip()
            data = await upload.read(_MAX_FILE_BYTES + 1)
            if len(data) > _MAX_FILE_BYTES:
                raise GradingError("too_large", 413, "Mỗi file tối đa 10 MB.")
            total += len(data)
            if total > _MAX_TOTAL_BYTES:
                raise GradingError("too_large", 413, "Tổng dung lượng tối đa 25 MB.")
            if not name.lower().endswith(".pdf") or not data.startswith(b"%PDF-"):
                raise GradingError("unsupported_file", 415, "Chỉ hỗ trợ PDF.")
            payload.append((name, data))

        try:
            extracted = _extract_pdf_passages()(payload, slide_number)
        except ImportError:
            raise GradingError("internal_error", 500, "Máy chủ thiếu thư viện đọc PDF.") from None
        except Exception as exc:  # broken, locked, image-only or oversized PDF
            raise GradingError("invalid_document", 422, f"PDF bị lỗi, bị khóa hoặc thiếu lớp văn bản. {exc}") from None
        if not extracted["passages"]:
            raise GradingError("invalid_document", 422, "PDF thiếu lớp văn bản.")

        with session(resolved_db) as conn:
            save_draft(conn, slide_number=slide_number, documents=extracted["documents"], passages=extracted["passages"])
            return get_admin_detail(conn, slide_number)

    @app.post("/api/v1/admin/slides/{slide_number}/publish")
    def admin_publish(body: PublishRequest, slide_number: int = PathParam(ge=1, le=14)) -> dict:
        with session(resolved_db) as conn:
            publish_draft(conn, slide_number=slide_number, revision_id=str(body.revision_id))
            return get_admin_detail(conn, slide_number)

    # Mount static frontend if directory exists (unified local fullstack / production container)
    frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
    if (frontend_dir / "student").is_dir():
        from fastapi.staticfiles import StaticFiles

        if (frontend_dir / "admin").is_dir():
            app.mount("/admin", StaticFiles(directory=str(frontend_dir / "admin"), html=True), name="admin")
        app.mount("/", StaticFiles(directory=str(frontend_dir / "student"), html=True), name="student")

    return app


app = create_app()
