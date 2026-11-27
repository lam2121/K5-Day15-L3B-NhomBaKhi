"""CLI CramAI (T013): gõ yêu cầu ôn tập → answer() trong agent.py → hiện đề nháp và duyệt từng câu.

Chạy bằng: python run.py   (macOS/Linux có thể là python3, Windows có thể là py)

CLI đọc `result` (QuizResult, hợp đồng v1) thay vì in nguyên `output`:
- `ok`: hiện từng câu qNN với 4 phương án, đáp án, độ khó, tên file + số trang; học viên duyệt hoặc bỏ câu.
- `needs_clarification`, `no_evidence`, `out_of_scope`: chỉ hiện lời nhắn và bước tiếp theo, không hiện đề.
Duyệt / bỏ chỉ đổi trạng thái trong phiên CLI, không sửa dữ liệu gốc hay kết quả các lượt chấm.
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
REVIEW_LABELS = {None: "chưa duyệt", "approved": "đã duyệt", "rejected": "đã bỏ"}
HELP = """Lệnh duyệt đề (gõ sau khi có đề):
  /duyet q01 q02   duyệt các câu (hoặc /duyet tatca)
  /bo q03          bỏ câu sai (hoặc /bo tatca)
  /xem             xem lại đề và trạng thái duyệt
  /chot            chốt đề: in các câu đã duyệt
  /giup            in hướng dẫn này
Gõ nội dung khác để tạo đề mới. Thoát: Ctrl+C hoặc Enter 2 lần với dòng trống."""


def _where(e):
    """File (trong codebase/) gây lỗi khi nạp: SyntaxError có e.filename, lỗi khác lấy khung cuối của traceback."""
    import traceback
    path = getattr(e, "filename", None) or (traceback.extract_tb(e.__traceback__)[-1].filename if e.__traceback__ else "")
    if not path:
        return "codebase/"
    p = os.path.abspath(path)
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.relpath(p, base).replace(os.sep, "/") if p.startswith(base) else path


def render_question(question: dict, review: str | None = None, show_review: bool = False) -> str:
    """Một câu: mã · độ khó (· trạng thái duyệt), đề + 4 phương án, đáp án, nguồn."""
    head = f'{question["question_id"]} · {DIFFICULTY_LABELS.get(question["difficulty"], question["difficulty"])}'
    if show_review:
        head += f" · {REVIEW_LABELS.get(review, review)}"
    sources = "; ".join(f'{_day_label(c["source_id"])}{c["file_name"]}, trang {c["page"]} [{c["source_id"]}]' for c in question["citations"])
    return f'{head}\n{question["prompt"].strip()}\nĐáp án: {question["answer"].strip()}\nNguồn: {sources}'


def _day_label(source_id: str) -> str:
    """'day03-p074-s01' → 'Ngày 3 · '. Ngày học lấy từ mã đoạn của corpus, vì tên file gốc có thể ghi khác (vd. day04)."""
    prefix = source_id.split("-", 1)[0]
    if prefix.startswith("day") and prefix[3:].isdigit():
        return f"Ngày {int(prefix[3:])} · "
    return ""


def render_result(result: dict, reviews: dict | None = None) -> str:
    """Hiện QuizResult. Trạng thái khác `ok` chỉ hiện lời nhắn, không có câu hỏi."""
    status = result["status"]
    if status != "ok":
        return f'[{STATUS_LABELS.get(status, status)}] {result["message"].strip()}'
    reviews = reviews or {}
    blocks = [result["message"].strip()]
    blocks += [render_question(q, reviews.get(q["question_id"]), show_review=True) for q in result["questions"]]
    blocks.append("Duyệt: /duyet q01 · bỏ: /bo q01 · chốt: /chot · hướng dẫn: /giup")
    return "\n\n".join(blocks)


class ReviewSession:
    """Trạng thái duyệt của đề đang xem. Chỉ sống trong phiên CLI."""

    def __init__(self) -> None:
        self.result: dict | None = None
        self.reviews: dict[str, str] = {}

    def load(self, result: dict) -> None:
        self.result = result if result.get("status") == "ok" and result.get("questions") else None
        self.reviews = {}

    def _ids(self) -> list[str]:
        return [q["question_id"] for q in self.result["questions"]] if self.result else []

    def handle(self, line: str) -> str:
        """Xử lý một lệnh bắt đầu bằng '/'. Trả lời nhắn để in."""
        parts = line.strip().split()
        cmd, args = parts[0].lower(), [a.lower() for a in parts[1:]]
        if cmd == "/giup":
            return HELP
        if self.result is None:
            return "Chưa có đề để duyệt. Hãy gõ yêu cầu ôn tập trước, ví dụ: ôn G10 ngày 3."
        if cmd == "/xem":
            return render_result(self.result, self.reviews)
        if cmd in ("/duyet", "/bo"):
            ids = self._ids()
            targets = ids if args == ["tatca"] else args
            if not targets:
                return f"Ghi mã câu sau lệnh, ví dụ: {cmd} {ids[0]}"
            unknown = [t for t in targets if t not in ids]
            if unknown:
                return f'Không có câu {", ".join(unknown)} trong đề. Các câu hiện có: {", ".join(ids)}.'
            state = "approved" if cmd == "/duyet" else "rejected"
            for t in targets:
                self.reviews[t] = state
            return f'{REVIEW_LABELS[state].capitalize()}: {", ".join(targets)}. {self.progress()}'
        if cmd == "/chot":
            pending = [i for i in self._ids() if i not in self.reviews]
            if pending:
                return f'Còn {len(pending)} câu chưa duyệt: {", ".join(pending)}. Duyệt hoặc bỏ hết rồi /chot.'
            kept = [q for q in self.result["questions"] if self.reviews[q["question_id"]] == "approved"]
            if not kept:
                return "Bạn đã bỏ hết các câu. Hãy tạo đề mới với chủ đề khác."
            return f"Đề đã chốt ({len(kept)} câu):\n\n" + "\n\n".join(render_question(q) for q in kept)
        return f"Không hiểu lệnh {cmd}.\n{HELP}"

    def progress(self) -> str:
        ids = self._ids()
        approved = sum(1 for i in ids if self.reviews.get(i) == "approved")
        rejected = sum(1 for i in ids if self.reviews.get(i) == "rejected")
        return f"Đã duyệt {approved} · đã bỏ {rejected} · chưa duyệt {len(ids) - approved - rejected} / {len(ids)} câu."


def main() -> int:
    try:
        import tracing
        from agent import answer
    except Exception as e:  # lỗi cú pháp, thiếu thư viện… trong codebase/
        print("Không nạp được codebase/ — lỗi ở %s: %s: %s" % (_where(e), type(e).__name__, e))
        print("Sửa lỗi rồi chạy lại. Cách nối model: docs/connect-model.md")
        return 1
    print("CramAI — tạo đề ôn trắc nghiệm từ slide. Gõ yêu cầu rồi Enter, ví dụ: ôn G10 và workflow cố định ngày 3.")
    print("Gõ /giup để xem lệnh duyệt. Thoát: Ctrl+C (hoặc Enter 2 lần với dòng trống).")
    session = ReviewSession()
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
        if text.startswith("/"):
            print(session.handle(text))
            continue
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
        s, _ = tracing.end()
        result = response.get("result") if isinstance(response, dict) else None
        if isinstance(result, dict) and "status" in result:
            session.load(result)
            print(render_result(result))
        else:  # agent chưa trả `result` theo hợp đồng v1
            print(response.get("output", "") if isinstance(response, dict) else response)
        print("   (model: %s · gọi model %d lần · công cụ %d lần · token vào %d / ra %d)"
              % (", ".join(s["models"]) or "—", s["model_calls"], s["tool_calls"], s["tokens_in"], s["tokens_out"]))


if __name__ == "__main__":
    sys.exit(main())
