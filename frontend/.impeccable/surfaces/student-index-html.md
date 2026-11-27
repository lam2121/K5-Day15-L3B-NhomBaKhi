---
version: 1
slug: "student-index-html"
primary_target: "student/index.html"
related_targets: ["admin/index.html"]
---

# Surface brief: CramAI student + admin web

**Scope** `frontend/student/` (catalog, generating, quiz, result, expired, errors) and `frontend/admin/` (14-slot table, upload PDF, draft preview, publish). **Mode** Operate. Code-led.

**Audience and job** Học viên L3 on a laptop beside the slide PDF: pick a set, answer 5 or 14 A–D questions within 60 min, submit, check each answer against file + page. Admin = team members publishing 14 slots.

**Constraints** Plain HTML/CSS/JS, `/api/v1` per OpenAPI, text nodes only for model text, keys/citations only after submit, no auto-retry, `?mock=1` synthetic mode. Tokens referenced from Astryx (radius 8/12/16, spacing 4px scale, control 28/32/36, focus 2px, status hues) and Kumo (brand blue, canvas/elevated/recessed surfaces, hairline vs line borders, light-dark()).

## Direction contract

THESIS: Every answer leads back to the exact slide frame and page the learner saw in class; refuses the generic quiz card stack with a progress bar.
OWN-WORLD: Lecture-hall slate shell (#1d2a44) over projector-screen ground (#f7f8fa); Kumo brand blue for selection and the primary action; laser amber only for "you are here"; citations drawn as miniature 16:9 slide frames with the page number in the corner; Be Vietnam Pro throughout, tabular figures.
STORY: Learner sees 15 sets as a numbered deck, starts one in one click, answers with the deck strip showing progress, submits, then reads each verdict beside its source frame (file, page) and can start another set.
FIRST VIEWPORT: Slate top bar: CramAI, exam title, deck strip of question thumbnails (filled answered, hollow unanswered, amber ring current), timer right. Left column ≤760px: question number, prompt 28px, four A–D options. Right column 380px: "Nguồn của câu này" slide-frame panel (locked until submit). Sticky bottom bar: answered count + primary "Nộp bài".
FORM: Slide projection world, position 3 of 7 on own ordered list; seed:7dcde4811c230788. Raises: publish isolated + confirmed (dark console); states stamp, nothing vanishes (ticket wallet); answered vs unanswered by fill shape, not colour (exposure record); 01–14 numbering as primary identity (Saville).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
