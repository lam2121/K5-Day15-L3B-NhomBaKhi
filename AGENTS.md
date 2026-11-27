# AGENTS.md — hướng dẫn cho coding agent (Claude Code, Cursor, Codex…) làm việc trong repo này

> Ôn lại: ngày 12 · lab ngày 12. Nhóm sửa file này cho khớp bài của mình (thêm quy ước riêng, bỏ dòng không dùng).

## Repo này là gì

Repo nộp bài hackathon AI20K của nhóm: một bản chạy thử AI cho **một lát cắt** (xem `spec.md` §4), kèm bằng chứng, bộ câu thử và mô phỏng chi phí. Mọi câu trả lời phải chạy được bằng các lệnh dưới đây.

## Bắt đầu với vai của bạn

Đọc [vai và quy trình tích hợp](docs/agents.md), [hiến chương](.specify/memory/constitution.md), [hợp đồng CramAI v1](specs/001-cramai/contracts/cramai.md) và [task Spec Kit](specs/001-cramai/tasks.md). Khi được giao vai và task ID, áp dụng các tài liệu này cho đúng phần việc. Agent ngoài vai `lam` báo kết quả và ID task qua PR để Lâm cập nhật checklist chung. Nếu cần thay đổi file ngoài vai, bàn giao nội dung cho chủ file.

## Lệnh

```
python run.py                    # chạy bản chạy thử
python run.py check              # kiểm eval/benchmark.csv + eval/metric_spec.yaml
python run.py eval --try         # thử 3 câu đầu
python run.py eval               # chạy cả bộ → eval/run-N.csv + traces/run-N.jsonl
python run.py score eval/run-N.csv
python run.py simulate --try     # thử mô phỏng chi phí 10 phiên
python run.py simulate           # mô phỏng chi phí → cost/simulate-N.csv
```

Khung chỉ dùng thư viện chuẩn của Python. Thêm thư viện thì ghi vào `requirements.txt`.

## Cấu trúc code

| File | Ai sửa | Hợp đồng |
|---|---|---|
| `codebase/contracts.py` | Lâm | Kiểu Python dùng chung, kiểm nguồn và tạo `output` từ `result`. |
| `codebase/agent.py` | Hưng | `answer(text) -> AnswerResponse` có `output: str` và `result` theo hợp đồng v1. |
| `codebase/ai.py` | Lâm | `call_model(system, user) -> ModelResponse`, giữ `@model_call`. Token lấy từ `usage` của API. |
| `codebase/tools.py` | Khiêm | `search_slides(query, *, limit=12) -> list[SlidePassage]`, dùng `@tool`. |
| `codebase/app.py` | Phước Anh | CLI gọi `answer(text)`, hiển thị và duyệt bằng `result`. |
| `codebase/tracing.py`, `eval/run_eval.py`, `cost/simulate.py`, `run.py` | **khung — không sửa** | ghi trace, chạy bộ câu thử, mô phỏng chi phí |

## Luật — agent KHÔNG được làm

- Không commit `.env`, API key, dữ liệu cá nhân thật, nguyên file data BTC cấp.
- Không sửa `eval/run-*.csv`, `cost/simulate-*.csv`, `traces/*` đã chạy (trừ điền cột `pass`, `ghi_chu`).
- Không sửa chuẩn "đạt" (`spec.md` §7), `eval/metric_spec.yaml` sau CP2; không xoá câu thử trượt, không sửa `expected` cho khớp output.
- Không bịa người được phỏng vấn, trích dẫn, câu trả lời khảo sát, số liệu. Số không có nguồn thì ghi rõ *(tự ước tính)*.
- Công cụ có tác động ra ngoài (gửi tin, sửa dữ liệu, chấm điểm): chỉ tạo bản nháp chờ người duyệt.
- Không viết prompt "giấu" câu thử vào code (vd so khớp nguyên văn input của bộ câu thử).

## Quy ước của nhóm

- Trả lời người học bằng tiếng Việt, file UTF-8. Dùng `snake_case` cho hàm, biến, khoá JSON và `PascalCase` cho kiểu Python. Mã đoạn và mã câu thử theo hợp đồng v1.
- Chạy `python scripts/check_agent_scope.py --role <vai> --base <nhánh-đích>` và các kiểm tra liên quan trước PR. Cặp cùng review, Lâm hợp nhất và ghi artefact các lượt chính thức.
