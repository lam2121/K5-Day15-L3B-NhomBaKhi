# Kế hoạch CramAI — frontend, backend và nguồn đề

**Feature** `003-cramai-exams` · **Ngày** 2026-11-27 · [Đặc tả](spec.md)

## Summary

Một frontend cho học viên và một trang admin, dùng backend HTTP cùng origin. Admin chuẩn bị 14 bộ và xuất bản từng phiên bản. Khi học viên chọn đề, backend lấy nguồn đúng phạm vi, gọi một workflow tạo đề và kiểm chứng ứng viên, lưu đáp án phía server rồi trả câu hỏi. Chấm bài bằng so sánh lựa chọn. [Hợp đồng API](contracts/openapi.json).

## Technical Context

| Thành phần | Kế hoạch |
|---|---|
| Frontend học viên | HTML/CSS/JS thuần trong `frontend/student/`, gồm danh mục, đang tạo đề, làm bài, kết quả, lỗi và hết hạn. Dùng text node để render nội dung do nguồn/model cung cấp. |
| Frontend admin | `frontend/admin/` gồm bảng 14 ô, tải PDF, xem bản nháp và xuất bản. Backend bảo vệ trang admin và API admin. |
| Backend | FastAPI/Uvicorn trong `backend/`, Python 3.10+, multipart và PDF parser. Dependency web có file riêng. Thêm web không thay đổi điểm vào CLI. |
| Lưu trữ | SQLite lưu bộ, revision, đoạn, metadata và lượt làm trên VPS. PDF lưu trong thư mục dữ liệu riêng, ngoài document root và ngoài repo. Cấu hình key, admin và đường dẫn trong môi trường dịch vụ. |
| Core | `generate_exam(exam_id, passages)` trả câu hỏi riêng cho web. Hưng dùng lại logic chọn nguồn và xác minh mã đoạn từ `answer(text)`. Giữ đầu ra CLI `{output, result}` hiện có và chỉ nhập một bản module trace. |
| Triển khai | Nginx là origin công khai, phục vụ frontend học viên và proxy `/api/`, `/admin/` tới Uvicorn trên loopback. Dùng TLS cho bản trên VPS và giới hạn yêu cầu tạo đề. |
| CI/CD | CI mở rộng để kiểm HTTP, quyền, dữ liệu, lượt nộp và tương thích CLI. Gói frontend/backend cùng SHA. Dữ liệu, PDF, file môi trường và khóa ở ngoài gói. |

## Luồng và điểm kiểm tra

1. **Nhập nguồn.** Admin tải tập PDF vào bản nháp của một ô. Xác minh file và lớp văn bản, tạo mã đoạn theo buổi/tệp/trang, rồi lưu bản nháp. Xuất bản đúng revision bằng giao dịch. Nếu thất bại, giữ con trỏ published cũ.
2. **Tạo đề.** Backend xác minh `exam_id`, lấy revision đang xuất bản và lọc nguồn đủ nội dung. Hưng tạo ứng viên và kiểm số câu, bốn lựa chọn khác nhau, đúng một đáp án và mã đoạn thuộc tập đã gửi model. Đề giữa kỳ phải có đúng một câu cho mỗi bộ. Từ chối tạo lượt nếu chưa đạt.
3. **Làm và nộp.** Lưu snapshot câu hỏi, phương án, đáp án và trích dẫn trước khi trả đề. Khóa đầu ra công khai bằng schema allowlist. Backend chấm và lưu một kết quả cho bộ lựa chọn hợp lệ đầu tiên. Gửi lại cùng bộ trả kết quả đã lưu. Đổi bộ sau khi đã nộp trả lỗi.
4. **Dịch vụ.** Một worker cho demo, giới hạn một tác vụ tạo đề cùng lúc vì tracer bàn giao dùng biến tiến trình. Dùng `try/finally` để đóng trace, chỉ log mã request, trạng thái và usage tổng hợp. Health không gọi model. Job deploy kiểm cả hai luồng, ghi SHA, giữ bản trước và sao lưu SQLite trước khi cập nhật.

## Công việc theo file

| Vai | File và phần sở hữu |
|---|---|
| **Lâm** | `backend/`, `deploy/`, API chung, SQLite, auth admin, chấm điểm, CI/CD và test hợp đồng. |
| **Hưng** | `codebase/agent.py`, `codebase/prompts/`, bộ sinh MCQ và kiểm phạm vi nguồn. |
| **Khiêm** | `codebase/tools.py`, `data/`, bộ nhập/trích dữ liệu PDF, mã đoạn, corpus và fixture được phép. Bàn giao lớp trích xuất cho API của Lâm. |
| **Phước Anh** | `frontend/`, UI học viên và UI admin. Dùng các fixture trong contract để triển khai song song với backend. |

## Constitution Check

Đề theo slide và đề giữa kỳ dùng cùng quyết định AI với tham số phạm vi. Admin thực hiện duyệt nguồn, backend chấm theo quy tắc. Giữ CLI, bộ chạy, các lượt đo và chuẩn đạt đã chốt. [Dữ liệu](data-model.md) · [Quyết định](research.md) · [Nghiệm thu](quickstart.md) · [Backlog](tasks.md).

[Tải file với FastAPI](https://fastapi.tiangolo.com/tutorial/request-files/) · [HTTP Basic của FastAPI](https://fastapi.tiangolo.com/advanced/security/http-basic-auth/) · [Giao dịch SQLite](https://www.sqlite.org/lang_transaction.html).
