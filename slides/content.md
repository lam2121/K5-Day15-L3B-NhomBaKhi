# Nội dung 8 trang slide (bản nháp T024)

> Khung theo [outline](outline.md). Mỗi trang có ít nhất một số có nguồn. Ô **CHỜ** điền sau lượt 2 (T021) và chi phí (T022). Chưa xuất `demo-slides.pdf`.

## 1. Người dùng và pain

- **Ai:** học viên L3 ôn lại kiến thức từ 14 ngày slide.
- **Số:** 14/21 người từng ôn bằng slide; trong đó 12/14 gặp slide không tự hiểu hết, 6/14 bỏ dở, 0/14 ôn xong hẳn ([khảo sát](../evidence/summary.md)).
- **Lời kể:** "mất rất nhiều thời gian khoảng 10 phút xong lại bỏ ngang vì không tìm được thông tin cần thiết" (P3).

## 2. Vì sao chọn bài này

- 7/14 người đã nhờ AI ra câu hỏi tự kiểm, 6/14 không tự kiểm tra.
- Ba hướng đã so: tóm tắt từng buổi, tra nguồn theo chủ đề, làm đề có căn cứ. Chọn hướng cuối ([spec §2](../spec.md)).
- Impact ước tính: khoảng 77 phút mỗi người mỗi tháng, khoảng 610 giờ mỗi tháng ở kịch bản cơ sở (15 phút tiết kiệm mỗi lần là tự ước tính).

## 3. Giải pháp

- **Lát cắt:** học viên nhập chủ đề hoặc khoảng ngày, AI chọn đoạn slide đủ căn cứ và tạo đề A–D kèm đáp án, file và trang. Các câu hợp lệ hiện ngay để học; học viên tự đối chiếu trang nguồn (luồng duyệt từng câu đã bỏ ở T028).
- **Hình dạng:** workflow cố định: kiểm phạm vi → `search_slides` → `call_model` → kiểm mã nguồn ([sơ đồ spec §4](../spec.md)).
- **Mức tự động:** AI đề xuất, người học quyết định. Không tự chấm điểm thi thật, không gửi lên LMS hoặc Discord.

## 4. Demo live

- **Ca thường:** B01, 3 câu Prompt Engineering và Tool Calling ngày 3. Ở lần chạy thử với `claude-haiku-5-5`: 1 lần gọi model, khoảng 3.800 token vào, 1.600 token ra; cả 3 đáp án khớp trang 8, 60, 74.
- **Ca khó:** B12, yêu cầu tự chấm điểm và gửi đề lên Discord bị từ chối, hoặc B21, đề 120 câu được hỏi thu hẹp.
- **Dự phòng:** video 30 giây (T018, T023).

## 5. Đánh giá thế nào

- 24 câu thử: 11 thường, 9 khó, 4 từ chối; 10/24 lấy từ người dùng. 4 metric, chuẩn đạt ≥80% và 0 trích dẫn bịa ([hồ sơ đánh giá](../eval/README.md)).
- **Lượt 1** `run-1@20261127-230718`: 21/24 câu đạt (87,5%), 62/62 trích dẫn khớp nguồn, 4/4 ca từ chối đạt.
- **Lỗi chính:** 3 ca thu hẹp đề mà không báo giới hạn (B05, B19, B21) ([báo cáo](../eval/report.md)).
- **Lượt 2:** CHỜ.

## 6. Chi phí khi dùng thật

- Model đo: `claude-haiku-5-5` (vào 0,10 / ra 0,50 USD mỗi triệu token). So thêm `claude-sonnet-5-5` và `gemini-3.8-flash` ([personas](../cost/personas.yaml)).
- Chi phí mỗi task thành công, 3 kịch bản 300 / 470 / 700 người: CHỜ T022.
- So với impact khoảng 77 phút mỗi người mỗi tháng: CHỜ.

## 7. Kết luận

CHỜ số trang 5 và 6. Dự kiến dạng: go hoặc iterate, dẫn tỉ lệ đạt lượt 2, chi phí mỗi người mỗi tháng và impact.

## 8. Nếu có thêm 1 tuần

1. Ghép web CramAI (frontend 003 đã có, chờ backend) để học viên làm đề và nộp trên trình duyệt.
2. Đo thời gian tiết kiệm thật bằng 2–3 học viên dùng thử ([validation](../validation/log.md)), thay số 15 phút tự ước tính.
3. Sửa lỗi lượt 1 còn lại. Vị trí đáp án đã được trộn bằng code (`78a019d`) sau khi lượt 1 có đáp án B chiếm 31/62 câu; lượt 2 sẽ cho biết phân bố mới.
