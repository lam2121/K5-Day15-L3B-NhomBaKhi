# CramAI frontend (feature 003)

Two static UIs in plain HTML/CSS/JS with no build step:

| Folder | Task | Who uses it | Main screens |
|---|---|---|---|
| `student/` | T008 | Học viên L3 | Danh mục 14 bộ slide và Đề giữa kỳ, đang tạo đề, làm bài, xác nhận nộp, kết quả kèm trích dẫn file và trang, hết hạn, lỗi |
| `admin/` | T006 | Nhóm NhomBaKhi | Bảng 14 bộ, tải PDF vào bản nháp, xem đoạn trích, xuất bản có xác nhận, lỗi |

Both UIs call the same-origin API at `/api/v1`, following [contracts/openapi.json](../specs/003-cramai-exams/contracts/openapi.json). They never hold admin credentials: the backend protects `/admin/` and `/api/v1/admin/*` with HTTP Basic, and the browser prompts for the login.

## Try it without a backend

Run from the repository root:

```
python -m http.server 8765 --directory frontend
```

- Student UI: http://127.0.0.1:8765/student/?mock=1
- Admin UI: http://127.0.0.1:8765/admin/?mock=1

`?mock=1` loads `mock.js`, which serves **synthetic** data. The questions, file names, and excerpts in it are made up for UI testing and are not taken from the course slides. Student scenarios:

| URL | What you see |
|---|---|
| `?mock=1` | Slide 07 is unpublished, so Đề giữa kỳ is unavailable |
| `?mock=1&scenario=full` | All 14 slides published, so you can take Đề giữa kỳ (14 câu) |
| `?mock=1&scenario=short` | Attempts expire after 45 seconds, to test the expired screen |
| Slide 14 | `insufficient_evidence` |
| Slide 13 | `busy` (429) on the first try |

In the admin mock, Slide 03 has a draft waiting to be published and Slide 07 has no source yet. A file whose name contains `scan` is rejected as `invalid_document`.

## Integration notes for the backend (Lâm)

- **Student UI tested against `backend/app.py` (main `f54e189`, fake mode) on 2026-11-28.** The test served `frontend/student/` from the same FastAPI app via `StaticFiles`. The database had 13 published slides with Slide 07 missing. Run through Playwright: `GET /api/v1/catalog` 200, `POST /api/v1/attempts` 201, `POST /api/v1/submissions` 200, no console errors. The catalog showed 14 slides with Slide 07 disabled along with the reason the backend returned. The attempt had 5 questions, and the result listed citations `slide-03.pdf`, page 1. The backend has no `/api/v1/admin/*` routes yet, so the admin UI has not been tested against it.
- Serve `student/` at the site root and `admin/` at `/admin/`. Each folder is self-contained: it includes its own fonts and `tokens.css`. Keep the two `tokens.css` copies identical.
- Error bodies must follow `ErrorResponse`. The UI maps `error.code` to Vietnamese copy with a recovery step. A 429 from the proxy without JSON is treated as `busy`. A 413 without JSON is treated as "file too large".
- The admin upload sends `PUT /api/v1/admin/slides/{n}/draft` as multipart with repeated `files` fields. Before sending, the UI checks: at most 5 files, at most 10 MiB each, at most 25 MiB in total.
- The student UI keeps the attempt in `sessionStorage` for the current tab only. A reload resumes the quiz or shows the result again. Re-sending the same answers after a network error relies on submission being idempotent.
- All text from the API or the model is inserted as text nodes. Nothing is rendered as HTML.

## Design

The design direction is "slide chiếu giảng đường": a slate lecture-hall shell, citations drawn as slide frames with page numbers, and a deck strip that shows progress through the questions. See [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md). The tokens reimplement Astryx (Meta) and Kumo (Cloudflare) in plain CSS; neither library is loaded. The font is Be Vietnam Pro (SIL OFL 1.1, see `fonts/OFL.txt`), self-hosted with its Vietnamese subset.
