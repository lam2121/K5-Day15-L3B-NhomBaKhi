# Khai báo dùng AI

README của nhóm có mục "Dùng AI vào việc gì" (2–3 dòng, bắt buộc). Ghi chi tiết vào bảng dưới đây.

> Luật của đề: dùng AI để làm bài thoải mái, nhưng **ai không giải thích được phần có tên mình thì phần đó nhận 0 điểm**. Khai thiếu không bị trừ; giấu mới bị.

| Việc | Công cụ AI | AI làm gì | Người kiểm/sửa gì | Ai phụ trách |
|---|---|---|---|---|
| Adapter model và kiểm thử | Codex | Viết kết nối Gemini/OpenAI, chuẩn hoá usage và thêm kiểm thử phản hồi HTTP giả lập | Lâm review cách lấy token, giữ thông tin xác thực cục bộ và xác minh bằng một cuộc gọi thật trước lượt chính thức | Lâm |
| Prompt / thiết kế lời gọi mô hình | Codex | Hỗ trợ soạn/rà prompt, luồng hỏi lại và kiểm thử hồi quy | Hưng đối chiếu output, trace và chấm các ca với Phước Anh; Lâm xác minh artefact lượt chính thức | Hưng |
| Đào log pre-class | Không làm | Nhóm không dùng log pre-class để kết luận về pain ôn slide | Không áp dụng; xem [tổng hợp bằng chứng](../evidence/summary.md) | Nhóm |
| Trích PDF và truy hồi slide | Trợ lý AI (tên công cụ chưa ghi trong reflection) | Rà hợp đồng dự án, hỗ trợ viết script PyMuPDF và tối ưu cache truy hồi | Khiêm bỏ câu tự luận không khớp phạm vi, thay dữ liệu tự dựng bằng 280 đoạn từ slide thật và bổ sung kiểm lỗi PDF thiếu/hỏng | Khiêm |
| Câu hỏi phỏng vấn / khảo sát | Chưa có khai báo đã xác minh | Chưa rõ AI có tham gia soạn hay rà câu hỏi | Chủ phần khảo sát cần xác nhận; không suy ra việc dùng AI từ nội dung câu hỏi | Chưa xác nhận |
| Viết câu thử (benchmark) | Chưa có khai báo đã xác minh | Chưa rõ AI có tham gia soạn câu thử hay không | Khiêm cần xác nhận việc dùng AI; giữ nguyên `source` của từng câu | Khiêm |
| Mock `synthetic` cho giao diện | Claude Code | Soạn câu hỏi và tên file mẫu cho chế độ `?mock=1` | Phước Anh yêu cầu gắn nhãn dữ liệu mẫu ở code, README và giao diện; xác nhận dữ liệu này không lấy từ slide thật | Phước Anh |
| Chấm cột `pass` bằng LLM | Chưa thấy artefact ghi dùng LLM làm giám khảo | Hồ sơ hiện tại không ghi có dùng LLM để chấm | Các ca chấm độc lập CP2 do Hưng và Phước Anh đối chiếu; chủ lượt cần bổ sung nếu có dùng LLM ở lượt chính thức | Nhóm |
| Slide CP4 | Codex | Tạo, render và xuất PDF 8 trang từ dữ liệu và kết quả đã có trong repo | Lâm đối chiếu số với `evidence/summary.md`, `eval/report.md`, CSV và summary chi phí; rà đủ 8 trang. Nhóm cần xác nhận kết luận cuối | Lâm |

**Không dùng AI để:** tạo người được phỏng vấn, trích dẫn, câu trả lời khảo sát; sửa kết quả các lượt đã chạy (`eval/run-*.csv`, `cost/simulate-*.csv`, `traces/`).

Các dòng ghi **chưa xác nhận** cần chủ phần việc trả lời trước khi nộp. Nội dung về từng người được tổng hợp từ reflection tương ứng; không suy đoán khi hồ sơ chưa có khai báo.
