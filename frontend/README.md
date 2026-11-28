# CramAI frontend (feature 003)

Two pages built with React 18, TypeScript, Tailwind CSS 3 and Vite 5, with framer-motion for transitions. Look: "Tiệc trà", see [DESIGN.md](DESIGN.md).

| Folder | Task | Who uses it | Main screens |
|---|---|---|---|
| `student/` | T008 | Học viên L3 | Menu of 14 slide decks and the midterm, generating, one question per screen, confirm submit, result with citations, expired, errors |
| `admin/` | T006 | Nhóm NhomBaKhi | List of 14 decks, upload PDF to a draft, preview excerpts, publish with confirmation, errors |

`student/` and `admin/` contain **build output** and are committed. The backend serves them as plain static files (`backend/app.py` mounts `student/` at `/` and `admin/` at `/admin/`), so neither the backend nor the Docker image needs Node. The source lives in `web/`.

Both pages call the same-origin API at `/api/v1`, following [contracts/openapi.json](../specs/003-cramai-exams/contracts/openapi.json). They never hold admin credentials: the backend protects `/admin/` and `/api/v1/admin/*` with HTTP Basic, and the browser prompts for the login.

## Edit and rebuild

Requires Node 20 or newer.

```
cd frontend/web
npm install
npm run dev      # http://localhost:5173/student/?mock=1 and /admin/?mock=1; /api is proxied to 127.0.0.1:8000
npm run build    # type-checks, then writes ../student and ../admin
```

Commit the rebuilt `student/` and `admin/` together with the source change. The build uses relative asset paths (`base: './'`), so the output works at `/`, `/admin/` or `/student/`.

| Source | What it holds |
|---|---|
| `web/src/shared/` | API client, OpenAPI types, UI parts (icons, notices, awning), base CSS, fonts |
| `web/src/art/art.tsx` | SVG illustrations: pastries, tiered cake, teapot, macarons, score cake |
| `web/src/student/` | Student app: `App.tsx` (state and flow), `Catalog`, `Quiz`, `Result`, `session.ts`, `mock.ts` |
| `web/src/admin/` | Admin app and its mock |

## Try it without a backend

Serve the built folders from the repository root:

```
python -m http.server 8765 --directory frontend
```

- Student: http://127.0.0.1:8765/student/?mock=1
- Admin: http://127.0.0.1:8765/admin/?mock=1

`?mock=1` loads a separate mock chunk with **synthetic** data. The questions, file names and excerpts in it are made up for UI testing and are not taken from the course slides. The page shows a "Dữ liệu mẫu" badge in this mode.

| Student URL | What you see |
|---|---|
| `?mock=1` | Slide 07 is unpublished, so the midterm is locked |
| `?mock=1&scenario=full` | All 14 slides published, so the midterm (14 câu) opens |
| `?mock=1&scenario=short` | Attempts expire after 45 seconds, to test the expired screen |
| Slide 14 | `insufficient_evidence` |
| Slide 13 | `busy` (429) on the first try |

In the admin mock, Slide 03 has a draft waiting to be published and Slide 07 has no source yet. A file whose name contains `scan` is rejected as `invalid_document`.

## Integration notes for the backend (Lâm)

- **Student page tested against `backend/app.py` (main `b39e64a`, fake mode) on 2026-11-28** through Playwright: `GET /api/v1/catalog` 200, `POST /api/v1/attempts` 201, `POST /api/v1/submissions` 200, no console errors. The result screen listed citations with file name, page and source id.
- **Admin page tested against the admin API (T005, branch `cramai/phuoc-anh-admin-api`) on 2026-11-28** through Playwright with HTTP Basic: list 200, detail 200, an image-only PDF rejected with 422 `invalid_document`, a text PDF uploaded as a draft with its excerpts, then published 200. Without credentials the API answers 401.
- The backend reads admin credentials from `CRAMAI_ADMIN_USER` and `CRAMAI_ADMIN_PASSWORD`. If either is empty, `/admin/` and `/api/v1/admin/*` stay closed. Writes from another `Origin` are refused with 403; set `CRAMAI_PUBLIC_ORIGIN` (for example `https://cramai.example`) when the service runs behind a proxy.
- Error bodies must follow `ErrorResponse`. The UI maps `error.code` to Vietnamese copy with a recovery step. A 429 from the proxy without JSON is treated as `busy`, and a 413 without JSON as "file too large".
- The admin upload sends `PUT /api/v1/admin/slides/{n}/draft` as multipart with repeated `files` fields. Before sending, the page checks: at most 5 files, at most 10 MiB each, at most 25 MiB in total.
- The student page keeps the attempt in `sessionStorage` (`cramai.student.v1`) for the current tab only. A reload resumes the quiz or shows the result again. Re-sending the same answers after a network error relies on submission being idempotent.
- Text from the API or the model is rendered by React as text. Nothing is inserted as HTML.

## Licences

Baloo 2 and Nunito are under the SIL Open Font License 1.1 and are bundled from `@fontsource`. All illustrations are original SVG drawn for this project.
