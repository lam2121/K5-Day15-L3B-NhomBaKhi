# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, no build step, no framework (fixed by `specs/003-cramai-exams/plan.md` and confirmed by the user). Student UI in `frontend/student/`, admin UI in `frontend/admin/`. Same-origin backend at `/api/v1` per `specs/003-cramai-exams/contracts/openapi.json`. Nginx serves the student UI; `/admin/` is proxied to the backend, which guards it with HTTP Basic. Frontend code never holds credentials.

## Users

- **Học viên L3 (AI20K, lớp L3A/L3B), primary.** Đang ôn thi giữa kỳ từ 14 bộ slide của khoá. Mostly on a laptop at a desk, often with the slide PDF open beside the quiz; must still work well on a phone.
- **Admin = thành viên nhóm NhomBaKhi.** Technical team members who upload PDFs for each of the 14 slots, check the draft, and publish it for the demo.

## Product Purpose

Học viên chọn một bộ slide (đề 5 câu) hoặc đề giữa kỳ (14 câu, mỗi bộ một câu), làm trắc nghiệm A–D do AI tạo từ slide đã duyệt, nộp, rồi xem điểm, đáp án và trích dẫn tên file + số trang. Success: a practice attempt in under two minutes, and the learner can verify every answer against the original slide page.

## Positioning

Unlike asking ChatGPT for questions, every CramAI question is generated only from slides the team has published, and each answer comes with the exact file name and page to check. When the sources are not enough, CramAI says so and suggests another scope instead of inventing questions.

## Operating Context

- Catalog always shows 15 entries: Slide 01 → Slide 14, then Đề giữa kỳ. Unavailable entries stay visible with a reason; the midterm is unavailable when any slot is unpublished.
- Attempt lifetime 60 minutes. Answer keys and citations reach the browser only after submission. Duplicate submission of the same choices returns the same score.
- Generation can fail: `insufficient_evidence`, `exam_unavailable`, `busy` (429, possibly non-JSON), `upstream_error`. Never auto-retry generation.
- Admin upload: ≤5 text PDFs per slot, ≤20 MiB each, ≤50 MiB total per upload; encrypted or image-only PDFs are rejected. Publishing a new revision does not change attempts already in progress.

## Capabilities and Constraints

- Language: Vietnamese UI copy, UTF-8.
- Model/source-provided text is rendered only as text nodes (no HTML injection).
- Out of scope: student accounts, LMS/Discord integration, student file upload, OCR, essay questions, real grades.
- A synthetic mock mode is needed to build and demo without the backend; mock data must be labelled synthetic.

## Brand Commitments

- Name: CramAI.
- Binding visual constraint from the user: reference the design tokens of Astryx (Meta) and Kumo (Cloudflare) and reimplement them in plain CSS; do not depend on either library.

## Evidence on Hand

- Survey, 27/11/2026, n = 21 learners outside the team (`evidence/survey/results.csv`, summary in `evidence/summary.md`): 12/14 who review with slides use ChatGPT or another AI tool; 7/14 ask AI to generate self-check questions; 6/14 do not self-check; 12/14 find some slides hard to understand alone.
- No interviews, testimonials, or usage metrics yet. Do not fabricate any.

## Product Principles

1. Every answer must be checkable: show the source (file, page) wherever an answer is revealed.
2. Say what is missing instead of filling gaps; a short honest exam beats a full invented one.
3. Practice, not grading: scores are for self-review only.
4. Fast to start: from opening the page to the first question in one click.

## Accessibility & Inclusion

No product-specific standard set; follow WCAG 2.2 AA as the default floor (keyboard operation for the whole quiz, visible focus, sufficient contrast, reduced motion respected).
