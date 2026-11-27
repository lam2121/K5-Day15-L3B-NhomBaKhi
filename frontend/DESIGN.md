# CramAI design: "Tiệc trà"

The UI is a tea party. Each of the 14 slide decks is a pastry on the menu, the midterm is a three-tier cake with one strawberry per deck, and citations hang like tea-bag tags. The theme is there to make studying feel lighter. Every cute element sits next to plain words that say what it means, so nobody has to decode the metaphor.

Source of truth: `web/tailwind.config.ts` (tokens), `web/src/shared/index.css` (base and button classes), `web/src/art/art.tsx` (illustrations).

## Colour

The five brand colours were chosen by the product owner. The deeper tones are derived so text keeps at least 4.5:1 contrast.

| Token | Hex | Use |
|---|---|---|
| `strawberry` | `#F28076` | Primary buttons, selected answer, wrong-answer outline, awning stripes |
| `blush` | `#FFB6AF` | Soft fills: selected answer ground, hover, focus rings on cards |
| `cream` | `#FAE0C7` | Plates behind illustrations, quiet chips, awning stripes |
| `apricot` | `#FBC193` | Timer, "chờ xuất bản" state, mock badge, warnings |
| `mint` | `#4EB09B` | Correct answers, "đã xuất bản" state, citation tags, publish action |
| `milk` | `#FFF9F4` | Page ground under a faint gingham pattern |
| `cocoa` | `#4A2C2A` | All body text and button labels |
| `cocoa-soft` | `#7A5249` | Secondary text |
| `strawberry-ink` | `#8E2F28` | Red text ("sai", errors) |
| `mint-deep` | `#22705F` | Green text ("đúng") and the focus outline |

Buttons put cocoa text on the pastel fill instead of white text, because white on `#F28076` or `#4EB09B` fails contrast.

## Type

- **Baloo 2** (600–800) for headings, numbers and buttons: rounded and chunky.
- **Nunito** (400–800) for body text.
- Both are self-hosted woff2 from `@fontsource` (SIL OFL 1.1). Only the latin, latin-ext and vietnamese subsets ship (`web/src/shared/fonts.css`).

## Illustration style

Soft sticker style, inspired by kawaii strawberry-dessert sticker sheets (reference image from the product owner; nothing is traced or copied):

- Outlines are a deeper shade of the shape they surround (berry red, crust brown, mint, pink), never black or cocoa.
- A light SVG turbulence filter (`Sheet` in `art.tsx`) makes lines wobble like a hand drawing.
- Strawberries carry seeds, mint leaves and a white highlight. Cream is white with a soft pink outline. Sparkles (`Spark`) sit around each drawing.
- The page ground is pink grid paper, with a few faint sparkles and berries fixed behind the content (`Backdrop`).

## Shapes and motion

- Radii are soft everywhere: `rounded-blob` (2rem) for plates, `rounded-pill` for buttons and chips.
- Plates have a cocoa-tinted drop plus a 2px "shelf" shadow. Buttons have a solid shelf shadow that grows on hover and flattens on press.
- The striped awning at the top has a scalloped edge (`.scallop-bottom`).
- Motion: cards fade in once on load, questions slide sideways when you move between them, the teapot pours while the quiz is being generated, and the timer wiggles when it reaches 5 minutes. `MotionConfig reducedMotion="user"` and a CSS override stop all of it when the user asks for reduced motion.

## Metaphor map

| Thing | Drawn as | Always labelled with |
|---|---|---|
| Slide deck (exam) | Pastry card, a different drawing for each of the 14 decks | "Slide NN", title, "5 câu" |
| Unpublished deck | Its pastry faded and desaturated, with a small lock sticker | "Chưa mở" plus the backend's reason |
| Midterm | Slender three-tier cake on a stand, 14 strawberries on the tier fronts; an empty dashed circle means that deck is missing | "Đề giữa kỳ", count N/14 |
| Generating | Teapot pouring into a cup | "Đang pha đề N câu…" |
| Question progress | Row of macarons: outlined = unanswered, strawberry = answered, apricot = skipped at submit, mint = correct, crossed = wrong | aria-label per question |
| Score | Top view of a cake cut into one slice per question; strawberry slices are correct | "N/M", "X% câu đúng" |
| Citation | Tea-bag tag with the page number | Slide, page, file name, source id |
| Admin | "Bếp bánh" (bakery kitchen) | Plain state labels: Đã xuất bản, Chờ xuất bản, Chưa có nguồn |
