# Mô hình dữ liệu

Các kiểu Python chuẩn nằm trong [`codebase/contracts.py`](../../codebase/contracts.py). Ví dụ dùng chung tại [fixture tổng hợp](../../tests/fixtures/cramai_demo.json).

| Kiểu | Trường và ràng buộc |
|---|---|
| `Citation` | `source_id` ổn định theo đoạn, dạng `day01-p003-s01`. `file_name` là tên tệp hiển thị, không kèm đường dẫn. `page` là số trang vật lý PDF bắt đầu từ 1. |
| `SlidePassage` | Có các trường của `Citation` cùng `text` là trích đoạn ngắn được phép dùng. Corpus chạy lại được ở `data/passages.jsonl`, UTF-8, mỗi dòng một đoạn. Mỗi mã đoạn ánh xạ đến một đoạn duy nhất. |
| `QuizQuestion` | `question_id` ổn định trong đề, dạng `q01`. `prompt`, `answer` có nội dung. `difficulty` thuộc `easy`, `medium`, `hard`. `citations` có ít nhất một nguồn trong tập đoạn truy hồi. |
| `QuizResult` | `schema_version: 1`, `status`, `message`, `questions`. Trạng thái `ok` có câu hỏi. `needs_clarification`, `no_evidence`, `out_of_scope` có hướng dẫn tiếp theo và danh sách rỗng. |
| `AnswerResponse` | `output: str` phục vụ bộ chạy và đánh giá, `result: QuizResult` cho CLI đọc cấu trúc. Cả hai được tạo từ cùng bản nháp. |
| `ModelResponse` | `text`, `model`, `tokens_in`, `tokens_out`. Token thật lấy từ usage của API. Lỗi kỹ thuật truyền về bộ chạy. |

Câu hỏi gắn với một hoặc nhiều mã đoạn. Học viên duyệt bằng `question_id` trong phiên CLI. Thao tác duyệt không chỉnh dữ liệu gốc hay kết quả của các lượt chấm. [Hợp đồng CLI và Python](contracts/cramai.md).
