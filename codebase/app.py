"""CLI CramAI: tạo câu hỏi có nguồn từ slide và hiển thị để học trực tiếp.

Run with: python run.py (macOS/Linux may use python3; Windows may use py)
"""
import os
import sys

for _stream in (sys.stdout, sys.stderr, sys.stdin):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

DIFFICULTY_LABELS = {"easy": "Dễ", "medium": "Vừa", "hard": "Khó"}
STATUS_LABELS = {
    "needs_clarification": "Cần nói rõ hơn",
    "no_evidence": "Thiếu căn cứ trong slide",
    "out_of_scope": "Ngoài phạm vi CramAI",
}


def _where(e):
    """Trả đường dẫn module tương đối khi có lỗi import hoặc cú pháp."""
    import traceback

    path = getattr(e, "filename", None) or (
        traceback.extract_tb(e.__traceback__)[-1].filename if e.__traceback__ else ""
    )
    if not path:
        return "codebase/"
    path = os.path.abspath(path)
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.relpath(path, base).replace(os.sep, "/") if path.startswith(base) else path


def render_question(question: dict) -> str:
    """Hiển thị câu hỏi cùng đáp án, độ khó và nguồn."""
    head = f'{question["question_id"]} · {DIFFICULTY_LABELS.get(question["difficulty"], question["difficulty"])}'
    sources = "; ".join(
        f'{citation["file_name"]}, trang {citation["page"]} [{citation["source_id"]}]'
        for citation in question["citations"]
    )
    return (
        f'{head}\n{question["prompt"].strip()}\n'
        f'Đáp án: {question["answer"].strip()}\nNguồn: {sources}'
    )


def render_result(result: dict) -> str:
    """Hiển thị mọi câu hợp lệ để học viên học ngay."""
    status = result["status"]
    if status != "ok":
        return f'[{STATUS_LABELS.get(status, status)}] {result["message"].strip()}'
    blocks = [result["message"].strip()]
    blocks.extend(render_question(question) for question in result["questions"])
    return "\n\n".join(blocks)


def main() -> int:
    try:
        import tracing
        from agent import answer
    except Exception as e:  # lỗi cú pháp, thiếu thư viện… trong codebase/
        print("Không nạp được codebase/ — lỗi ở %s: %s: %s" % (_where(e), type(e).__name__, e))
        print("Sửa lỗi rồi chạy lại. Cách nối model: docs/connect-model.md")
        return 1
    print("CramAI — tạo câu hỏi ôn tập có nguồn từ slide để bạn học trực tiếp.")
    print("Gõ chủ đề hoặc phạm vi cần ôn rồi nhấn Enter. Thoát: Ctrl+C hoặc Enter 2 lần với dòng trống.")
    blank = 0
    while True:
        try:
            text = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if not text:
            blank += 1
            if blank >= 2:
                return 0
            continue
        blank = 0
        tracing.begin("app")
        try:
            response = answer(text)
        except NotImplementedError as e:
            tracing.end()
            print("Chưa nối model: %s" % e)
            return 1
        except Exception as e:  # lỗi gọi model: báo rồi cho hỏi tiếp
            tracing.end()
            print("[lỗi] %s: %s" % (type(e).__name__, e))
            continue
        summary, _ = tracing.end()
        result = response.get("result") if isinstance(response, dict) else None
        if isinstance(result, dict) and "status" in result:
            print(render_result(result))
        else:  # agent chưa trả `result` theo hợp đồng v1
            print(response.get("output", "") if isinstance(response, dict) else response)
        print("   (model: %s · gọi model %d lần · công cụ %d lần · token vào %d / ra %d)"
              % (", ".join(summary["models"]) or "—", summary["model_calls"], summary["tool_calls"],
                 summary["tokens_in"], summary["tokens_out"]))


if __name__ == "__main__":
    sys.exit(main())
