# Hợp đồng Python cho đề web

HTTP dùng [OpenAPI](openapi.json). CLI, eval và simulate tiếp tục dùng [hợp đồng v1](../../001-cramai/contracts/cramai.md).

## Hưng và Khiêm

- Khiêm bàn giao hàm `extract_pdf_passages(files, slide_number)` trong `codebase/tools.py`. Đầu vào là các file do backend đã kiểm giới hạn và vị trí admin đã chọn. Đầu ra gồm tên hiển thị, số trang và các `SlidePassage` của vị trí đó. Không ghi DB hoặc xuất bản từ hàm này.
- Chuẩn mã đoạn `dayNN-dNN-pNNN-sNN` theo bộ slide, thứ tự PDF trong revision, trang vật lý PDF bắt đầu từ 1 và thứ tự đoạn trong trang. Ví dụ `day03-d01-p002-s01`. Metadata đến từ bộ trích xuất.
- Hưng bàn giao `generate_exam(exam_id, passages)` trong `codebase/agent.py`. Backend truyền các đoạn từ đúng revision đã xuất bản. Hàm trả danh sách `ExamQuestion` đã kiểm, hoặc báo thiếu căn cứ. Lỗi provider được truyền để backend ánh xạ thành lỗi dịch vụ.

## Hưng và Lâm

`ExamQuestion` nội bộ gồm `question_id`, `prompt`, `options` [{ `option_id`, `text` }], `correct_option_id`, `slide_number` và `citations`. Mỗi câu có bốn option ID `a,b,c,d` duy nhất, nội dung khác nhau và đúng một đáp án. Hưng kiểm mã đoạn với tập đã gửi model qua `resolve_citations`. Với đề giữa kỳ, Hưng và backend đều kiểm mỗi vị trí 1–14 xuất hiện đúng một lần, trích dẫn của câu thuộc vị trí đó.

Lâm lưu snapshot câu hỏi, đáp án và nguồn, sau đó dựng DTO chỉ có trường được phép trả. Việc nộp bài và chấm điểm chỉ đọc snapshot. CLI tiếp tục nhận `output` và `result` v1. Báo cáo CP dùng đúng benchmark, metric và phiên bản workflow đã chốt tương ứng.
