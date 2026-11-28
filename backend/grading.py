"""Pure deterministic grading and anti-hallucination verification for CramAI."""

import re

VALID_OPTIONS = frozenset({"a", "b", "c", "d"})
_OUTLINE_RE = re.compile(
    r"^\s*(?:\[[^\]\n]*\bdàn ý\b[^\]\n]*\]|dàn ý\b|agenda\b|outline\b|mục lục\b|q\s*&\s*a\b|thank you\b|cảm ơn\b)",
    re.IGNORECASE,
)
_RELATIVE_OPTION_RE = re.compile(
    r"\b(?:phương án|đáp án|lựa chọn|ý)\s+(?:(?:ở|nêu)\s+)?(?:trên|dưới)\b"
    r"|\b(?:all|none|both|neither)\s+of\s+the\s+(?:above|below)\b"
    r"|^(?:cả|chỉ|both|either|only)\s+[a-d]\s+(?:và|hoặc|and|or)\s+[a-d]\b",
    re.IGNORECASE,
)


class GradingError(Exception):
    def __init__(
        self,
        code: str,
        status_code: int,
        message: str,
        *,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.message = message
        self.headers = headers


def filter_substantive_passages(passages_by_slide: dict[int, list[dict]]) -> dict[int, list[dict]]:
    """Drop outline-only or empty passages before LLM generation to prevent hallucination."""
    filtered: dict[int, list[dict]] = {}
    for slide_num, passages in passages_by_slide.items():
        kept = [
            p for p in passages
            if len((txt := p.get("text", "").strip())) >= 15
            and len((words := txt.split())) >= 3
            and not (_OUTLINE_RE.match(txt) and len(words) < 12)
        ]
        if not kept:
            raise GradingError("insufficient_evidence", 422, "Slide chỉ có dàn ý hoặc chưa đủ nội dung để tạo đề.")
        filtered[slide_num] = kept
    return filtered


def prioritize_unseen_passages(
    exam_id: str,
    passages_by_slide: dict[int, list[dict]],
    seen_source_ids: set[str],
) -> dict[int, list[dict]]:
    """Prefer unseen passages across retakes; fall back to full pool when unseen count is low."""
    if not seen_source_ids:
        return passages_by_slide
    min_needed = 1 if exam_id == "midterm" else 5
    prioritized: dict[int, list[dict]] = {}
    for slide_num, passages in passages_by_slide.items():
        unseen = [p for p in passages if p.get("source_id") not in seen_source_ids]
        prioritized[slide_num] = (
            unseen
            if len(unseen) >= min_needed
            else sorted(passages, key=lambda p: p.get("source_id") in seen_source_ids)
        )
    return prioritized


def validate_generated_questions(
    exam_id: str,
    questions: list[dict],
    passages_by_slide: dict[int, list[dict]],
) -> None:
    """Deterministic citation & option integrity gate; fail closed before persisting attempt."""
    expected_count = 14 if exam_id == "midterm" else 5
    if len(questions) != expected_count:
        raise GradingError("insufficient_evidence", 422, "Chưa đủ câu hỏi có căn cứ để tạo đề này.")

    if exam_id == "midterm":
        if sorted(q.get("slide_number") for q in questions) != list(range(1, 15)):
            raise GradingError("insufficient_evidence", 422, "Chưa đủ căn cứ để tạo đề có đủ 14 bộ slide.")
    else:
        requested_slide = int(exam_id.split("-")[1])
        if any(q.get("slide_number") != requested_slide for q in questions):
            raise GradingError("upstream_error", 502, "Model trả đề không đúng phạm vi đã chọn.")

    valid_sources = {
        (slide_num, p.get("source_id"), p.get("file_name"), p.get("page"))
        for slide_num, passages in passages_by_slide.items()
        for p in passages
    }

    for q in questions:
        options = q.get("options") or []
        option_ids = {o.get("option_id") for o in options}
        texts = [str(o.get("text", "")).strip() for o in options]
        if (
            not str(q.get("prompt", "")).strip()
            or len(options) != 4
            or option_ids != VALID_OPTIONS
            or q.get("correct_option_id") not in VALID_OPTIONS
            or len({t.lower() for t in texts if t}) != 4
            or any(_RELATIVE_OPTION_RE.search(t) for t in texts)
        ):
            raise GradingError("insufficient_evidence", 422, "Câu hỏi sinh ra không đạt chuẩn 4 lựa chọn độc lập.")

        citations = q.get("citations") or []
        if not citations or any(
            c.get("slide_number") != q.get("slide_number")
            or (c.get("slide_number"), c.get("source_id"), c.get("file_name"), c.get("page")) not in valid_sources
            for c in citations
        ):
            raise GradingError("insufficient_evidence", 422, "Trích dẫn câu hỏi không khớp nguồn slide đã xuất bản.")


def normalize_and_validate(questions: list[dict], raw_answers: list[dict]) -> list[dict[str, str]]:
    """Validate 1-to-1 answer coverage against snapshot questions and canonicalize order."""
    expected_ids = [q["question_id"] for q in questions]
    expected_set = set(expected_ids)
    by_qid: dict[str, str] = {}

    for item in raw_answers:
        qid = item.get("question_id")
        oid = item.get("option_id")
        if qid not in expected_set or qid in by_qid or oid not in VALID_OPTIONS:
            raise GradingError("invalid_answers", 422, "Hãy chọn đúng một đáp án cho mỗi câu.")
        by_qid[qid] = oid

    if len(by_qid) != len(expected_ids):
        raise GradingError("invalid_answers", 422, "Hãy chọn đúng một đáp án cho mỗi câu.")

    return [{"question_id": qid, "option_id": by_qid[qid]} for qid in expected_ids]


def grade_submission(questions: list[dict], canonical_answers: list[dict[str, str]]) -> dict:
    """Score canonicalized choices against immutable attempt snapshot."""
    selected_by_qid = {ans["question_id"]: ans["option_id"] for ans in canonical_answers}
    items: list[dict] = []
    correct_count = 0

    for question in questions:
        qid = question["question_id"]
        selected_id = selected_by_qid[qid]
        correct_id = question["correct_option_id"]
        is_correct = selected_id == correct_id
        correct_count += int(is_correct)
        items.append({
            "question_id": qid,
            "selected_option_id": selected_id,
            "correct_option_id": correct_id,
            "is_correct": is_correct,
            "citations": question["citations"],
        })

    total = len(questions)
    return {
        "correct_count": correct_count,
        "total_questions": total,
        "score_percent": round(correct_count * 100 / total, 1),
        "items": items,
    }
