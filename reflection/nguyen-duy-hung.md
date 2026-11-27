# Reflection — Nguyễn Duy Hưng

## 1. Vai trò và phần tôi làm

Tôi phụ trách luồng AI tạo đề ôn, từ tra slide, gọi model đến kiểm mã đoạn và trả bản nháp có đáp án, độ khó và trang nguồn.
Tôi cùng Phước Anh chấm độc lập 5 ca ở CP2, kết quả khớp 5/5.
Sau lượt 1, tôi soát ba ca trượt và sửa cách luồng báo giới hạn về số câu và độ phủ. [Workflow](../codebase/agent.py) · [Báo cáo đánh giá](../eval/report.md)

## 2. AI hỗ trợ tôi thế nào

Tôi dùng Codex để đọc kết quả đã chấm, đối chiếu trace và chuẩn bị kiểm thử với model giả lập.
Các lần chạy thử trên PowerShell cho thấy cách truyền input tiếng Việt ảnh hưởng đến hành vi. Tôi đặt UTF-8 rồi chạy lại trước khi dùng kết quả để kết luận.
Tôi đối chiếu đáp án và trang nguồn bằng tay ở các ca thử để kiểm xem câu hỏi có thực sự bám đoạn slide.

## 3. Một câu trượt và bài học

B19 yêu cầu 2 câu cho ngày 6–14. Hai câu được tạo đều có nguồn, nhưng bản nháp chỉ phủ ngày 7 và ngày 12 mà không nói rõ giới hạn.
Một trích dẫn hợp lệ xác minh được nguồn của từng câu, còn độ phủ cần kiểm trên toàn đề.
Tôi bổ sung bước hỏi chọn ngày trọng tâm hoặc tăng số câu khi số câu yêu cầu quá ít cho phạm vi ôn. [Lượt 1](../eval/run-1.csv)
