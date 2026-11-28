# Hợp đồng Python cho đề web

HTTP dùng [OpenAPI](openapi.json). CLI, eval và simulate tiếp tục dùng [hợp đồng v1](../../001-cramai/contracts/cramai.md).

## Hưng và Khiêm

- Khiêm bàn giao hàm `extract_pdf_passages(files, slide_number)` trong `codebase/tools.py`. Đầu vào là các file do backend đã kiểm giới hạn và vị trí admin đã chọn. Đầu ra gồm tên hiển thị, số trang và các `SlidePassage` của vị trí đó. Không ghi DB hoặc xuất bản từ hàm này.
- Mã mới dùng chuẩn `dayNN-dNN-pNNN-sNN` theo bộ slide, thứ tự PDF trong revision, trang vật lý PDF bắt đầu từ 1 và thứ tự đoạn trong trang. Ví dụ `day03-d01-p002-s01`. Để dùng tiếp revision admin đã xuất bản từ phiên bản cũ, backend cũng chấp nhận mã legacy `dayNN-pNNN-sNN` như tài liệu thứ nhất; giữ nguyên mã này trong citation và không sinh mã legacy cho PDF upload mới.
- Hưng bàn giao `generate_exam(exam_id, passages)` trong `codebase/agent.py`. Backend truyền các đoạn từ đúng revision đã xuất bản. Hàm trả danh sách `ExamQuestion` đã kiểm, hoặc báo thiếu căn cứ. Lỗi provider được truyền để backend ánh xạ thành lỗi dịch vụ.

## Hưng và Lâm

`ExamQuestion` nội bộ gồm `question_id`, `prompt`, `options` [{ `option_id`, `text` }], `correct_option_id`, `slide_number` và `citations`. Mỗi câu có bốn option ID `a,b,c,d` duy nhất, nội dung khác nhau và đúng một đáp án. Hưng kiểm mã đoạn với tập đã gửi model qua `resolve_citations`. Với đề giữa kỳ, Hưng và backend đều kiểm mỗi vị trí 1–14 xuất hiện đúng một lần, trích dẫn của câu thuộc vị trí đó.

## Giải thích theo yêu cầu của học viên

- Trước khi tạo attempt, backend snapshot riêng toàn bộ văn bản trích xuất của từng trang được câu hỏi dẫn nguồn, cùng đáp án và citation. `AttemptResponse` không chứa các trường riêng này. `ExplanationSourcePage.text_is_complete` phân biệt văn bản toàn trang PDF mới với passage cũ có thể bị cắt.
- Sau khi học viên chọn đáp án, `POST /attempts/{attempt_id}/questions/{question_id}/check` trả `is_correct` và `correct_option_id` từ snapshot; route này không trả citation/trang/lời giải và không gọi model. Nút giải thích là thao tác riêng: `POST /attempts/{attempt_id}/questions/{question_id}/explanation` mới gọi `call_model`, trả lời giải tiếng Việt và `source_pages` có trích dẫn, văn bản trang cùng `image_url` tùy chọn.
- PDF gốc nằm trong `CRAMAI_DOCUMENT_DIR` (Docker mặc định `/data/slides` trên volume `/data`), không mount như static asset và không trả nguyên file. Revision lưu `storage_key` tương đối với volume để tránh trùng tên tệp. `GET /attempts/{attempt_id}/questions/{question_id}/source-pages/{source_id}` kiểm attempt còn hạn và citation rồi render đúng trang thành PNG với `Cache-Control: private, no-store`. Nếu file gốc thiếu, `image_url` là null và frontend ghi rõ fallback văn bản trích xuất.
- `source_id` phải là citation của question snapshot; không lấy PDF hoặc passage từ revision mới hơn. Một request explanation không ghi đáp án vào session hay submission và chỉ được thực hiện theo thao tác rõ ràng của người học.

## Admin tải và xuất bản PDF riêng tư

- Các route `/admin/slides...` yêu cầu HTTP Basic với `CRAMAI_ADMIN_USER` và `CRAMAI_ADMIN_PASSWORD`; route upload/publish chỉ chấp nhận cùng origin. Không đặt credential hoặc PDF trong frontend.
- Upload nhận tối đa 5 PDF, 20 MiB/tệp, 50 MiB/lần; chỉ lưu sau khi `extract_pdf_passages` xác nhận PDF đọc được, trong giới hạn trang và có lớp văn bản. Upload bản nháp không thay đổi bản đang xuất bản.
- Khi provider thật được bật, upload chạy Vision một lần trên từng PDF theo các phần tối đa 80 trang; kết quả tóm tắt biểu đồ/sơ đồ được lưu trong `passages_json` theo document index và trang, đồng thời xuất hiện trong preview để admin rà trước khi publish. Attempt và giải thích dùng lại summary đã lưu. PDF được gửi inline tới provider model đã cấu hình để xử lý Vision; nội dung PDF không được ghi vào trace và không có URL công khai. Chế độ fake bỏ qua Vision.
- File tạm được ghi vào `CRAMAI_DOCUMENT_DIR` rồi đổi tên nguyên tử theo `slide-NN/{revision_id}/document-NN.pdf`. SQLite lưu metadata, `storage_key` tương đối và văn bản trích xuất; không lưu BLOB hoặc public URL. Lỗi ghi DB sẽ xóa thư mục upload mới và giữ revision cũ.
- Nút publish chỉ đổi con trỏ revision trong giao dịch SQLite. Attempt đang chạy giữ nguyên câu hỏi/đáp án/source snapshot. Volume `/data` cần được mount bền vững khi chạy container; image không chứa PDF người dùng tải lên.

Lâm lưu snapshot câu hỏi, đáp án và nguồn, sau đó dựng DTO chỉ có trường được phép trả. Việc nộp bài và chấm điểm chỉ đọc snapshot. CLI tiếp tục nhận `output` và `result` v1. Báo cáo CP dùng đúng benchmark, metric và phiên bản workflow đã chốt tương ứng.
