"""Pure deterministic grading logic for CramAI LMS submissions."""

VALID_OPTIONS = frozenset({"a", "b", "c", "d"})


class GradingError(Exception):
    def __init__(self, code: str, status_code: int, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.message = message


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
