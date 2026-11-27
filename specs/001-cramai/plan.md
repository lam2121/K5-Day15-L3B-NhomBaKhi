# Kế hoạch triển khai CramAI

**Feature** `001-cramai` · **Ngày** 2026-11-27 · [Đặc tả](spec.md)

## Summary

Dùng workflow cố định gồm tra đoạn slide, model đề xuất các câu đủ căn cứ, kiểm mã đoạn và trả đề nháp để học viên duyệt. Giữ CLI và runner của đề. Bốn vai triển khai trên branch riêng theo API Python và fixture dùng chung.

## Technical Context

| Mục | Quyết định |
|---|---|
| Runtime | Python 3.10+, UTF-8. Spec Kit 1.4.5 có skill Codex trong repo. |
| Dependencies | API chung dùng thư viện chuẩn. Adapter model theo `docs/connect-model.md`. Lâm quản lý `requirements.txt`. |
| Dữ liệu | JSONL cho trích đoạn được phép, JSON cho mẫu hợp đồng, CSV và YAML cho eval/cost theo starter. PDF gốc cục bộ. |
| Entry points | `python run.py`, `python run.py eval`, `python run.py simulate` đều dùng `answer(text)`. |
| Kiểm tra | `python -m unittest discover -s tests`, smoke CLI, `python run.py check`, eval và simulate có trace. |
| Scope | Một đề ôn nháp theo chủ đề cho học viên L3. Số slide theo bằng chứng, kiểm quyền sử dụng và thời gian. |

## Constitution Check

- **Một lát cắt.** Feature có một user story và một quyết định AI. Bằng chứng, phạm vi và chuẩn đạt cần xác nhận bởi nhóm đúng thời hạn.
- **Hợp đồng runner.** `output: str` giữ cho harness, `result` làm giao diện đọc được cấu trúc. Giữ nguyên các file khung.
- **Nguồn an toàn.** `source_id` chỉ tham chiếu đoạn truy hồi. Cột metadata lấy từ công cụ, người học duyệt. Fixture công khai được gắn nhãn dữ liệu tự dựng.
- **Một đầu mối mỗi file.** Bảng vai và script kiểm phạm vi PR có cùng ranh giới. Chỉ Lâm cập nhật spec/task chung hoặc tạo run chính thức.
- **Lịch sử đánh giá.** CP2 đóng chuẩn/metric. CP3 hoàn thành benchmark trước lượt 1. CP4 dùng nguyên benchmark và tỉ lệ đạt lượt 2 cùng model.

## Project Structure

```text
codebase/
  contracts.py   # Lâm: kiểu, kiểm tham chiếu, output
  ai.py          # Lâm: adapter và usage
  tools.py       # Khiêm: truy hồi slide
  agent.py       # Hưng: luồng quyết định
  app.py         # Phước Anh: CLI và duyệt
tests/
  fixtures/      # Dữ liệu tự dựng chung để phát triển độc lập
scripts/
  check_agent_scope.py
specs/001-cramai/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/
  quickstart.md
  tasks.md
```

Biên phụ thuộc đi từ CLI và runner vào `agent`, từ `agent` vào `tools` và `ai`. Mọi bên dùng `contracts`, không có import ngược. Hợp đồng chung không đọc file và không gọi model. [Quyết định thiết kế](research.md) · [API](contracts/cramai.md) · [Quickstart](quickstart.md).

## Bàn giao và tích hợp

Bốn người có thể bắt đầu từ cùng fixture. Merge hợp đồng trước, sau đó provider và nguồn dữ liệu, rồi workflow và CLI. Cả nhóm xem một ca có đề và một ca thiếu căn cứ. Lâm kiểm phạm vi từng PR và duy trì bảng task, chuẩn đạt và changelog. [Vai và lệnh](../../docs/agents.md) · [Task theo checkpoint](tasks.md).
