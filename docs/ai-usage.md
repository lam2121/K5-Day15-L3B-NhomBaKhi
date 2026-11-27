# Khai báo dùng AI

README của nhóm có mục "Dùng AI vào việc gì" (2–3 dòng, bắt buộc). Ghi chi tiết vào bảng dưới đây.

> Luật của đề: dùng AI để làm bài thoải mái, nhưng **ai không giải thích được phần có tên mình thì phần đó nhận 0 điểm**. Khai thiếu không bị trừ; giấu mới bị.

| Việc | Công cụ AI | AI làm gì | Người kiểm/sửa gì | Ai phụ trách |
|---|---|---|---|---|
| Adapter model và kiểm thử | Codex | Viết kết nối Gemini/OpenAI, chuẩn hoá usage và thêm kiểm thử phản hồi HTTP giả lập | Lâm review cách lấy token, giữ thông tin xác thực cục bộ và xác minh bằng một cuộc gọi thật trước lượt chính thức | Lâm |
| Prompt / thiết kế lời gọi mô hình | Codex | Hỗ trợ soạn/rà prompt, luồng hỏi lại và kiểm thử hồi quy | Hưng đối chiếu output, trace và chấm các ca với Phước Anh; Lâm xác minh artefact lượt chính thức | Hưng |
| Đào data (viết script đếm, gợi ý nhãn) | | | Kiểm tay __ dòng, khớp __ | |
| Rà câu hỏi phỏng vấn / khảo sát | | Chỉ rà câu dẫn dắt | | |
| Viết câu thử (benchmark) | | | Mỗi câu thử có `source`; câu thử AI viết được ghi rõ | |
| Sinh data `synthetic` (nếu có) | | | Seed __ · kiểm tay __ dòng | |
| Chấm cột `pass` bằng LLM (nếu có) | | | Kiểm tra thủ công __ câu thử, khớp __/__ | |
| Slide CP4 | Codex | Tạo và xuất PDF 8 trang từ dữ liệu và kết quả đã có trong repo | Đối chiếu số với `evidence/summary.md`, `eval/report.md`, CSV và summary chi phí; render và rà đủ 8 trang. Nhóm còn xác nhận kết luận cuối | Lâm |

**Không dùng AI để:** tạo người được phỏng vấn, trích dẫn, câu trả lời khảo sát; sửa kết quả các lượt đã chạy (`eval/run-*.csv`, `cost/simulate-*.csv`, `traces/`).

Các ô còn trống chưa có khai báo xác minh trong repo. Chủ phần việc cần xác nhận có dùng AI hay không và ghi phần người kiểm trước khi nộp.
