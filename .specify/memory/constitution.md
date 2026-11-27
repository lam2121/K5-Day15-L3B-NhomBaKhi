<!-- Sync Impact Report: initial version 1.0.0; spec, plan, tasks and role guide aligned. -->
# Hiến chương CramAI

## Nguyên tắc

### I. Một lát cắt có bằng chứng

Nhóm chốt một học viên, một việc, một quyết định AI và một kết quả dựa trên bằng chứng. Bốn coding agent là cách tổ chức nhóm. Prototype dùng workflow vừa đủ cho lát cắt. Dữ liệu giả và số ước tính được ghi đúng loại.

### II. Giữ hợp đồng của bộ chấm

CLI, eval và simulate dùng `answer(text)`. Kết quả có `output` là chuỗi. Adapter dùng `@model_call` và token từ `usage`. Công cụ dùng `@tool`. Giữ nguyên `run.py`, `codebase/tracing.py`, `eval/run_eval.py` và `cost/simulate.py`.

### III. Kiểm chứng nguồn và bảo vệ dữ liệu

Chỉ đưa vào đề câu có căn cứ tra được trong tập đoạn đã cung cấp. Thiếu căn cứ thì thu hẹp kết quả hoặc yêu cầu bổ sung. Người học duyệt bản nháp. Prompt, phản hồi và công cụ có thể xuất hiện trong trace nộp bài. Chỉ truyền dữ liệu được phép và đã xử lý phù hợp. API key, PDF nguyên bản và thông tin cá nhân nằm ngoài artefact công khai.

### IV. Mỗi file có một đầu mối sửa

Mỗi vai phát triển trên branch riêng. Nhóm làm việc theo cặp và review chéo tại checkpoint. Người phụ trách sửa file của mình khi nhận bàn giao. Lâm giữ file dùng chung, đánh dấu task và tích hợp PR. Chủ file xác nhận các thay đổi hợp đồng họ tiêu thụ.

### V. Giữ lịch sử đánh giá

Commit chuẩn đạt và metric trước CP2. Sau CP2 chỉ bổ sung benchmark trước lượt 1. Hai lượt chính thức dùng cùng bộ câu. Chỉ điền các cột chấm được phép. Lâm tạo file lượt chính thức để tránh trùng số. Chi phí mỗi task thành công dùng tỉ lệ đã chấm lượt 2 trên đúng model đo.

## Chuẩn kỹ thuật

Python 3.10 trở lên và thư viện chuẩn cho API chung. Lâm cập nhật dependency sản phẩm trong `requirements.txt`. Nội dung cho học viên dùng tiếng Việt. Kiểu dữ liệu và mã định danh theo hợp đồng.

## Quy trình kiểm tra

Trước PR, chạy kiểm phạm vi file và các kiểm tra liên quan tới phần thay đổi. Trước checkpoint, cả nhóm soát yêu cầu BTC và trạng thái thật. Chế độ giả phục vụ tích hợp sớm. Lượt tính điểm cần model thật.

## Quản trị

Nhóm duyệt thay đổi về phạm vi, cách chấm và hợp đồng trước khi Lâm hợp nhất. Mọi thay đổi sau CP2 vào changelog theo đề. Thay đổi tương thích nâng phiên bản phụ hoặc vá. Thay đổi phá vỡ nguyên tắc nâng phiên bản chính và có phương án chuyển đổi. Luật BTC và `AGENTS.md` được áp dụng cùng hiến chương.

**Phiên bản** 1.0.0 · **Cập nhật** 2026-11-27 · **Phê duyệt** chờ nhóm xác nhận
