"""Shared Python interfaces for CramAI's workflow, CLI, and evaluation."""

import re
from collections.abc import Iterable
from typing import Literal, TypedDict


Difficulty = Literal["easy", "medium", "hard"]
QuizStatus = Literal["ok", "needs_clarification", "no_evidence", "out_of_scope"]

_SOURCE_ID = re.compile(r"[a-z][a-z0-9-]*-p([0-9]{3,})-s([0-9]{2,})")
_QUESTION_ID = re.compile(r"q[0-9]{2,}")
_DIFFICULTY_LABELS = {"easy": "Dễ", "medium": "Vừa", "hard": "Khó"}
_STATUSES = {"ok", "needs_clarification", "no_evidence", "out_of_scope"}


class Citation(TypedDict):
    source_id: str
    file_name: str
    page: int


class SlidePassage(Citation):
    text: str


class QuizQuestion(TypedDict):
    question_id: str
    prompt: str
    answer: str
    difficulty: Difficulty
    citations: list[Citation]


class QuizResult(TypedDict):
    schema_version: Literal[1]
    status: QuizStatus
    message: str
    questions: list[QuizQuestion]


class AnswerResponse(TypedDict):
    output: str
    result: QuizResult


class ModelResponse(TypedDict):
    text: str
    model: str
    tokens_in: int
    tokens_out: int


def _check_citation(citation: Citation) -> None:
    source_id = citation["source_id"]
    match = _SOURCE_ID.fullmatch(source_id)
    page = citation["page"]
    if not match or type(page) is not int or page < 1 or int(match[1]) != page or int(match[2]) < 1:
        raise ValueError(f"Invalid citation ID or page: {source_id!r}")
    file_name = citation["file_name"].strip()
    if not file_name or file_name in {".", ".."} or any(mark in file_name for mark in "/\\:\r\n"):
        raise ValueError(f"Citation must identify a file by name: {source_id!r}")


def resolve_citations(source_ids: Iterable[str], passages: Iterable[SlidePassage]) -> list[Citation]:
    """Resolve each model-selected ID against the passages actually retrieved."""
    by_id: dict[str, Citation] = {}
    for passage in passages:
        source_id = passage["source_id"]
        if source_id in by_id:
            raise ValueError(f"Duplicate retrieved source: {source_id!r}")
        citation: Citation = {"source_id": source_id, "file_name": passage["file_name"], "page": passage["page"]}
        _check_citation(citation)
        by_id[source_id] = citation

    citations = []
    for source_id in dict.fromkeys(source_ids):
        if source_id not in by_id:
            raise ValueError(f"Source was not retrieved: {source_id!r}")
        citations.append(by_id[source_id])
    if not citations:
        raise ValueError("A question needs at least one retrieved source")
    return citations


def make_response(result: QuizResult) -> AnswerResponse:
    """Validate the shared result and render the same content for eval and cost."""
    status = result["status"]
    if type(result["schema_version"]) is not int or result["schema_version"] != 1 or status not in _STATUSES:
        raise ValueError("Unsupported schema version or quiz status")
    message = result["message"].strip()
    questions = result["questions"]
    if not message or bool(questions) != (status == "ok"):
        raise ValueError("A message is required, and only an ok result contains questions")

    sections = [message]
    seen_ids = set()
    for question in questions:
        question_id = question["question_id"]
        if not _QUESTION_ID.fullmatch(question_id) or int(question_id[1:]) < 1 or question_id in seen_ids:
            raise ValueError(f"Invalid or duplicate question ID: {question_id!r}")
        seen_ids.add(question_id)
        difficulty = question["difficulty"]
        prompt, answer = question["prompt"].strip(), question["answer"].strip()
        citations = question["citations"]
        if difficulty not in _DIFFICULTY_LABELS or not prompt or not answer or not citations:
            raise ValueError(f"Incomplete question: {question_id}")
        sources = []
        for citation in citations:
            _check_citation(citation)
            sources.append(f'{citation["file_name"]}, trang {citation["page"]} [{citation["source_id"]}]')
        sections.append(f"{question_id} · {_DIFFICULTY_LABELS[difficulty]}\n{prompt}\nĐáp án: {answer}\nNguồn: " + "; ".join(sources))
    return {"output": "\n\n".join(sections), "result": result}
