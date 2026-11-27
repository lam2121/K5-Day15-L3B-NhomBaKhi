---
name: CramAI
description: Trắc nghiệm ôn thi sinh từ slide đã duyệt; mọi đáp án dẫn về đúng file và trang slide.
colors:
  projector-canvas: "#f7f8fa"
  elevated-sheet: "#ffffff"
  recessed-well: "#eef1f5"
  lecture-slate: "#1d2a44"
  slate-raised: "#26365a"
  ink: "#14171f"
  ink-muted: "#4a5162"
  on-slate: "#ffffff"
  on-slate-muted: "#b9c3d8"
  hairline: "#dfe3ea"
  line: "#c5ccd8"
  slate-line: "#55658a"
  brand-blue: "#3b5bdb"
  brand-blue-strong: "#2f4cc4"
  brand-tint: "#e9eeff"
  on-brand: "#ffffff"
  laser-amber: "#f59f00"
  success: "#1b7a0c"
  success-tint: "#e8f5e4"
  error: "#c9303a"
  error-tint: "#fdecec"
  warning: "#8a5a00"
  warning-tint: "#fff4d6"
typography:
  display:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "4rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  frame-number:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  body-lg:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  label:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  frame: "4px"
  inner: "8px"
  element: "12px"
  container: "16px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.on-brand}"
    typography: "{typography.body}"
    rounded: "{rounded.inner}"
    padding: "0 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.brand-blue-strong}"
  button-primary-lg:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.inner}"
    padding: "0 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.elevated-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    padding: "0 20px"
    height: "40px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    padding: "0 12px"
    height: "40px"
  button-quiet-hover:
    backgroundColor: "{colors.recessed-well}"
  answer-option:
    backgroundColor: "{colors.elevated-sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.element}"
    padding: "12px 20px"
    height: "64px"
  answer-option-selected:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.ink}"
  slide-frame:
    backgroundColor: "{colors.elevated-sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.frame-number}"
    rounded: "{rounded.frame}"
    padding: "12px 16px"
  slide-frame-unavailable:
    backgroundColor: "{colors.recessed-well}"
    textColor: "{colors.ink-muted}"
  source-card:
    backgroundColor: "{colors.elevated-sheet}"
    rounded: "{rounded.element}"
    padding: "16px"
  deck-thumb:
    backgroundColor: "transparent"
    textColor: "{colors.on-slate-muted}"
    rounded: "{rounded.frame}"
    width: "48px"
    height: "28px"
  deck-thumb-answered:
    backgroundColor: "{colors.on-slate}"
    textColor: "{colors.lecture-slate}"
  shell-bar:
    backgroundColor: "{colors.lecture-slate}"
    textColor: "{colors.on-slate}"
    height: "64px"
    padding: "8px 32px"
  notice-error:
    backgroundColor: "{colors.error-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.element}"
    padding: "20px 24px"
  notice-warning:
    backgroundColor: "{colors.warning-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.element}"
    padding: "20px 24px"
---

# Design System: CramAI

## Overview

**Creative North Star: "The Lecture-Hall Projector"**

CramAI looks like the room the slides were first shown in: a dark slate band across the top where the lecturer's controls live, a pale projector-screen ground below, and everything that stands for a slide drawn as a small 16:9 frame with its number in the corner. The learner is never shown an abstract card; they are shown a slide, a page, a deck. The frame is the unit of the whole system: catalog entries, quiz progress, citations, admin slot rows and draft excerpts are all the same nearly-square 16:9 outline at different sizes.

Density is calm and work-like. One question at a time, one primary action, generous 4px-based spacing, and a single blue for anything the learner chose or should press next. Status is carried by shape before colour: answered thumbnails are filled, unanswered are hollow, missing or unavailable things are dashed, and states that end something (an expired attempt, an unpublished slot) are stamped on, never removed. Light and dark themes share every role through `light-dark()` pairs in `tokens.css`; the slate shell stays dark in both.

The token vocabulary is a plain-CSS reimplementation of two references, kept as a binding product constraint: Astryx (Meta) for radius steps, the 4px spacing scale, control heights, the 2px focus outline and status hues; Kumo (Cloudflare) for the brand blue, the canvas / elevated / recessed surface roles, and the hairline-versus-line border split. Neither library is a dependency.

**Key Characteristics:**
- Slate shell (dark in both themes) over a projector-screen canvas.
- The 16:9 slide frame with a corner number is the recurring signature at every scale.
- One accent: brand blue for selection and the primary action; laser amber only as a "here" marker.
- State by fill shape and border style (filled, hollow, dashed, stamped) before hue.
- Be Vietnam Pro throughout with tabular figures; numbers 01–14 are primary identity.
- Flat surfaces separated by hairlines; one soft shadow, only as a hover lift.

## Colors

A cool, low-chroma slate-and-paper palette with one confident blue and one small amber spark. Every light value in the frontmatter has a dark-theme partner in `tokens.css` (declared with `light-dark()`); the shell text colours and laser amber are single-valued.

### Primary
- **Projector Blue** (brand-blue): the only interactive accent. Primary buttons, the selected answer's border, fill and key disc, focus outlines on light ground, the admin drop-zone hover and publish confirmation, and text links. Deepens to **Pressed Projector Blue** (brand-blue-strong) on hover; **Projector Wash** (brand-tint) is the selected-answer and selected-row fill and the text selection colour.

### Secondary
- **Lecture Slate** (lecture-slate): the shell band on both surfaces, the outline of cited source frames and admin mini-frames, and the page-number text inside citations. It is structure, not decoration. **Raised Slate** (slate-raised) and **Slate Rule** (slate-line) are the shell's own raised surface and hollow-thumbnail border.

### Tertiary
- **Laser Amber** (laser-amber): the laser-pointer dot. It marks "you are here" and "look here": the current-question ring in the deck strip, the dot in the brand mark, the dot on a revealed source frame, the generating animation, focus outlines inside the shell, missing / wrong thumbnails in the shell, and the timer under five minutes. It appears only on or beside the slate shell or inside a frame as a dot; never as a fill for text or panels on the light canvas.

### Neutral
- **Projector Canvas** (projector-canvas): page ground; also the interior of cited and admin frames.
- **Elevated Sheet** (elevated-sheet): answer options, cards, catalog frames, notices, the action bar, tables.
- **Recessed Well** (recessed-well): unavailable frames, table header row, quiet-button and row hover.
- **Ink** (ink) and **Muted Ink** (ink-muted): body text and secondary text (meta, hints, captions, page counts).
- **On-Slate** (on-slate) and **On-Slate Muted** (on-slate-muted): brand and timer text in the shell; exam title and hollow thumbnail numbers.
- **Hairline** (hairline): borders of flat surfaces (options at rest, cards, notices, table rules). **Line** (line): borders of things that are more object-like (catalog frames, secondary buttons, hover state of options, dashed placeholders).

### Status
- **Success / Error / Warning** with matching tints, from Astryx hues, each AA on its own tint. Success marks the correct key and live slots; error marks the learner's wrong pick, wrong review items and blocking failures; warning marks unavailable stamps, draft slots, and the "unanswered questions" status.

### Named Rules
**The One Blue Rule.** Brand blue means "chosen" or "press this next". It is never a heading colour, a decorative fill or a status.

**The Laser Dot Rule.** Amber is a pointer, not a paint. It appears as a dot, a ring or a short run of text on the slate shell, and nowhere as a surface.

**The Hairline-or-Line Rule.** Flat surfaces get a hairline; objects you can pick or that represent a slide get a line. Never stack both on one element.

## Typography

**Display Font:** Be Vietnam Pro (self-hosted, weights 400/500/600/700, Vietnamese + Latin subsets) with system-ui fallback
**Body Font:** Be Vietnam Pro
**Label/Mono Font:** none distinct; labels are Be Vietnam Pro 600

**Character:** A single humanist sans with full Vietnamese diacritics, set firmly (600–700) for anything numbered or asked, and plain 400 for reading. Tabular figures are on at the body level so timers, scores, page numbers and 01–14 all align.

### Hierarchy
- **Display** (700, 4rem, line-height 1, -0.03em): the result score figure only; drops to 3rem on phones, with the denominator set at 1.5rem muted.
- **Headline** (700, 2.25rem, 1.2, -0.02em): page headings (catalog, admin). Drops to 1.5rem (student) or 1.75rem (admin) at ≤720px. Balanced wrapping.
- **Title** (600, 1.75rem, 1.35, -0.01em): the question prompt, max 34ch, pretty wrapping; 1.5rem on phones. Section-level titles use 1.25–1.5rem at 600–700.
- **Frame Number** (700, 1.75rem, line-height 1, -0.02em): the two-digit slide number inside a frame; 1.5rem inside citation frames.
- **Body Large** (400, 1.0625rem, 1.45): answer option text and page lead paragraphs (lead capped at 65ch).
- **Body** (400, 1rem, 1.55): everything else; reading measures capped between 52ch and 72ch.
- **Label** (600, 0.875rem): question position, verdict, table headers, status chips, source file names.
- **Caption** (600, 0.8125rem): frame corner meta, stamps, review tags, keyboard keys, passage IDs (passage IDs at 400).

### Named Rules
**The Numbers Lead Rule.** Slide numbers are written as two digits (01–14) and set heavier than the title beside them; the number is the identity, the title is the description.

**The Tabular Rule.** Figures are always tabular. A timer or score that shifts width while it changes is a bug.

## Layout

A centred column capped at 1440px with 32px side gutters (16px at ≤720px) and 48px top padding (24–32px on phones). The page head is capped at 72ch.

- **Catalog:** an auto-fill grid of slide cards, minimum 208px per column with 20px gaps, collapsing to exactly two columns on phones; the midterm sits below as a full-width panel split 1.2 : 1 between copy and a 7-column mosaic of 14 mini frames (stacks on phones).
- **Quiz and review:** two columns, a reading column up to 760px and a source column 280–380px, pushed apart (`space-between`) with 48px gap. At ≤1024px they stack, and the source column caps at 520px.
- **Admin:** table and detail panel at 1.15 : 1 (detail min 360px), the detail sticky at 88px from the top; stacks at ≤1080px, and secondary table columns are hidden at ≤720px.
- **Bars:** a sticky slate shell at the top (min 64px) and, on quiz screens, a fixed elevated action bar at the bottom (min 72px) with the answered count left and actions right. Main content reserves bottom padding for it.
- **Rhythm:** the 4px scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64). Option lists breathe at 12px, cards at 20px, sections at 40px. Controls are 32 / 40 / 48px tall (larger than Astryx's 28/32/36, because this is a learning surface used with a pointer and a keyboard).

## Elevation & Depth

Flat by default. Surfaces separate by tone (canvas → elevated → recessed) and by 1px hairlines, not by shadow. The slate shell gets its depth from contrast alone.

### Shadow Vocabulary
- **Hover lift** (`box-shadow: 0 1px 2px rgb(20 23 31 / 0.06), 0 4px 12px rgb(20 23 31 / 0.06)`): only on an available catalog frame on hover or keyboard focus, paired with a 2px upward translate and a slate border.
- **Selection ring** (`box-shadow: 0 0 0 1px` brand blue): thickens the selected option's border to 2px without a layout shift.
- **Laser ring** (`box-shadow: 0 0 0 2px` slate, `0 0 0 4px` laser amber): the current deck thumbnail.

### Named Rules
**The Flat-At-Rest Rule.** Nothing casts a shadow while still. The one ambient shadow is a response to hover or focus on a pickable slide; the selection and laser rings are outlines drawn with box-shadow, not depth.

## Shapes

Two radius families do different jobs. Anything that *is* a slide (catalog frames, deck thumbnails, citation frames, admin mini and excerpt frames, stamps) keeps a nearly square 4px corner and a 16:9 aspect ratio, outlined at 1.5px, so it reads as a projected slide rather than a UI card. Everything that *holds* content follows the Astryx steps: 8px for buttons, review options and small controls; 12px for answer options, source cards, notices and the upload zone; 16px for review items, the midterm panel, the admin table and detail panel. Answer keys are circles (32px, 28px in review) with a 2px ring; status dots are 10px circles; the mock-data badge is a full pill.

Border style is meaningful: solid for present, dashed for absent or locked (unavailable frames, locked citations before submit, missing answers, empty admin slots, the upload drop zone).

**The Frame Rule.** A slide is always 16:9, 4px corners, 1.5px outline, with its number in a corner. Never round a frame to the 12px container radius.

## Components

### Buttons
Firm and plain, a clear hierarchy of three.
- **Shape:** gently rounded (8px), 40px tall by default, 48px for the primary action in a bar or a hero panel, weight 600, with an optional 18px leading or trailing line icon.
- **Primary:** projector blue on white text; deepens on hover. One per view region.
- **Secondary:** elevated sheet with a line border; the border darkens to muted ink on hover.
- **Quiet:** transparent, padding reduced to 12px; recessed well on hover. Used for low-stakes actions such as cancel.
- **Focus / Disabled:** 2px brand-blue outline offset 2px (laser amber inside the shell); disabled at 55% opacity with a not-allowed cursor.

### Answer Options
The heart of the quiz: four full-width rows, A–D.
- **Rest:** elevated sheet, hairline border, 12px radius, min 64px tall, body-large text, a 32px circular key with a 2px muted ring.
- **Hover:** border steps up to line.
- **Selected:** border and a 1px ring in brand blue, projector-wash fill, the key disc fills blue with white letter.
- **Focus:** 2px outline on the whole row. The native radio stays in place, invisible, over the row; keys A–D select from the keyboard.
- **Review variant:** 8px radius, transparent at rest; the correct key gets a success border, tint and filled disc with a "Đáp án đúng" tag; a wrong pick gets error border and tint with a hollow error disc.

### Slide Frame (signature)
A 16:9 outline with the two-digit number top-left and a meta line bottom-right. Available frames sit on the elevated sheet with a line border and lift on hover. Unavailable frames go recessed and dashed, their number muted, with a rotated warning **stamp** (caption, 700, 1.5px outline, rotated -3°) stating the reason. The entry stays in place.

### Source Card (signature)
"Nguồn của câu này". A 12px card holding a citation frame (slate outline on canvas ground, page number "tr. N" in a small elevated label bottom-right, a laser dot top-right), then the file name (label) and passage ID (caption, muted). Before submit the frame is dashed, muted, with a centred lock icon and "tr. ?".

### Deck Strip
In the shell, one 48×28px frame per question with its number bottom-right. Hollow = unanswered, filled white = answered, laser ring = current. After submit: filled with a check = correct, hollow amber outline with a cross = wrong; dashed amber = missing at submit. Readable without colour.

### Cards / Containers
- **Corner Style:** 12px for cards and notices, 16px for large panels.
- **Background:** elevated sheet over the canvas.
- **Shadow Strategy:** none (see Elevation).
- **Border:** hairline; review items with a wrong answer switch the border to error.
- **Internal Padding:** 16–24px; panels 24px, shrinking to 16–20px on phones.

### Notices
Icon (20–22px) left, title and body right, optional action row. Error and warning variants carry a coloured border, tinted fill and coloured icon; success exists in admin. Errors name the cause and offer the next step; they never retry generation on their own.

### Stamps
A state that ends or blocks something is stamped onto the content rather than replacing it: the warning stamp on an unavailable slide, and the larger expired stamp (800, 1.25rem, 2.5px error outline, rotated -4°) above a quiz that stays visible.

### Navigation (shell)
Slate band, sticky. Brand mark (a frame outline with an amber dot) and "CramAI" at 700, exam title muted and truncated, deck strip, then timer or state right-aligned at 600 with a clock icon (turns amber when ≤5 minutes left) and the "Dữ liệu mẫu" pill in mock mode. At ≤720px the title and strip wrap to their own full-width rows.

### Admin Table and Detail
A 16px-radius table on the elevated sheet, recessed header row, hairline row rules, recessed hover and projector-wash for the selected row. Each slot row starts with a 48×27 mini frame (dashed when empty). Slot state is a 10px dot plus label: filled success = live, ring warning = draft, dashed muted = none. The sticky detail panel lists facts as a two-column definition list, documents, a dashed 12px upload zone (turns blue and washed while dragging over), draft excerpts with small citation frames, and a publish zone set apart by 40px and a hairline rule; publishing asks for confirmation inside a blue-bordered, washed box.

### Inputs / Fields
No free-text inputs exist. File selection uses a visually hidden native input with the secondary button as its visible face; focus on the input outlines the button.

## Do's and Don'ts

### Do:
- **Do** draw anything that stands for a slide or a page as a 16:9 frame with 4px corners, 1.5px outline and its number in a corner.
- **Do** write slide numbers as two digits (01–14) with tabular figures, heavier than the title next to them.
- **Do** show state by fill and border style first (filled / hollow / dashed / stamped), then reinforce with colour and an icon or word.
- **Do** keep unavailable and expired things visible and stamped with their reason.
- **Do** reserve brand blue for the selected answer, the primary action, focus and links.
- **Do** keep laser amber to dots, rings and short shell text that say "here".
- **Do** use hairline borders for flat surfaces and line borders for pickable objects.
- **Do** pull every colour, radius, space and duration from `tokens.css`, and keep the student and admin copies identical.
- **Do** respect reduced motion: transitions and the laser animation drop to zero.

### Don't:
- **Don't** add a second accent hue or use blue for headings, decoration or status.
- **Don't** fill panels or body text on the light canvas with laser amber.
- **Don't** round slide frames to container radii or give them shadows at rest.
- **Don't** remove an entry, a question or a citation to signal that it is unavailable, missing or expired.
- **Don't** distinguish answered from unanswered by colour alone.
- **Don't** import Astryx or Kumo packages; tokens are reimplemented in plain CSS.
