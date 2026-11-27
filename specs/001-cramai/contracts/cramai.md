# Hợp đồng CramAI v1

| Bên cung cấp | API | Bên dùng |
|---|---|---|
| Lâm · `codebase/ai.py` | `call_model(system: str, user: str) -> ModelResponse` | Hưng. Giữ `@model_call`, giữ lỗi kỹ thuật cho runner ghi lại. |
| Khiêm · `codebase/tools.py` | `search_slides(query: str, *, limit: int = 12) -> list[SlidePassage]` | Hưng. Trả rỗng khi không có đoạn đạt. Truy hồi chỉ đọc, giữ `@tool`. `limit` là số nguyên dương, tối đa chừng đó đoạn. |
| Hưng · `codebase/agent.py` | `answer(text: str) -> AnswerResponse` | Phước Anh và runner. Nhận nguyên một chuỗi input. Lỗi thông thường của người dùng trả trạng thái có cấu trúc. Lỗi kỹ thuật truyền ra để runner ghi. |
| Lâm · `codebase/contracts.py` | `resolve_citations(source_ids, passages)` và `make_response(result)` | Hưng dùng để tạo phản hồi, Phước Anh dùng fixture và các kiểu chung. |

## Format bàn giao

- Các module trong `codebase/` import theo cách runner đang dùng, ví dụ `from contracts import AnswerResponse`.
- File UTF-8, biến, hàm, khoá JSON dùng `snake_case`. Kiểu Python dùng `PascalCase`. Branch dùng chữ thường và dấu gạch ngang. Mã câu hỏi trong đề là `q01`, `q02`. Mã dòng benchmark độc lập dùng `B01`, `B02`, giữ mã cũ khi thêm câu.
- Model đề xuất nội dung câu, đáp án, độ khó và `source_ids`. Hưng dùng `resolve_citations` với chính các đoạn vừa truy hồi để lấy metadata. Nếu mã lạ hoặc câu không có nguồn, tự động loại câu khỏi kết quả. Nếu không còn câu, trả `no_evidence`. Kiểm tra mã nguồn đảm bảo trích dẫn tham chiếu dữ liệu đã truy hồi, nhưng không chứng minh đáp án đúng về mặt sư phạm; hiển thị nguồn để người học tham khảo trong lúc học.
- CLI đọc `result` và hiển thị mọi câu hợp lệ cùng đáp án, độ khó, file và trang để học viên học trực tiếp. Không có trạng thái duyệt hoặc loại câu. Eval và simulate đọc `output`. Dùng `make_response` để trường `output` luôn diễn đạt cùng nội dung với `result`.
- Eval lưu `id,input,expected,pass_criterion,type,source` theo đúng thứ tự. `type` là `thuong`, `kho` hoặc `tu_choi`. `source` bắt đầu bằng `nguoi_dung`, `data_that`, `tu_viet` hoặc `sinh_seed`, sau đó có thể ghi chi tiết. Bốn trạng thái phản hồi khác với ba loại câu thử.
- Chế độ giả gọi adapter đã trang trí rồi dựng bộ câu hỏi cố định có nhãn giả. Adapter starter không trả JSON ở chế độ giả. Hưng xử lý theo `model == "fake"`, giữ token 0. Chế độ thật parse và kiểm tra nội dung model. Log từ prompt, tool, kết quả và fixture công khai phải an toàn để nộp.

[Dữ liệu và trạng thái](../data-model.md) · [Ví dụ JSON chung](../../../tests/fixtures/cramai_demo.json)
