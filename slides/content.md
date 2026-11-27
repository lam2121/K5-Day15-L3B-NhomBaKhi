# Nội dung 8 trang slide CP4

> Tài liệu này tổng hợp nội dung và nguồn số liệu của deck **CramAI — CP4 demo**. PDF là bản raster 16:9 gồm 8 trang; deck Spaces vẫn là bản có thể chỉnh sửa.

## 1. Người dùng và pain

- **Người dùng:** học viên L3 ôn kiến thức từ slide của 14 ngày học.
- **Khảo sát:** 14/21 từng ôn bằng slide. Trong 14 người này, 12 gặp slide không tự hiểu hết, 6 bỏ dở và không ai hoàn thành toàn bộ lần ôn gần nhất.
- **Phỏng vấn:** P2 mất khoảng 15 phút tìm phần cần cho lab; P3 tìm khoảng 10 phút rồi bỏ dở; P4 ôn hơn một giờ và ước chỉ xem được khoảng 30% bài. P1 chưa từng mở slide để ôn.
- Nguồn: [tổng hợp bằng chứng](../evidence/summary.md), [P1–P4](../evidence/interviews/).

## 2. Bằng chứng và impact dự kiến

- 7/14 người từng ôn bằng slide đã nhờ AI tạo câu hỏi tự kiểm; 6/14 không tự kiểm tra sau lần ôn gần nhất.
- Ba hướng được so sánh: tóm tắt từng buổi, tra nguồn theo chủ đề và tạo đề ôn có căn cứ. Nhóm chọn đề ôn có đáp án và trang slide để học viên tự đối chiếu.
- **Impact ước tính:** 5,16 lượt ôn × 15 phút tiết kiệm mỗi lượt ≈ 77 phút/người/tháng. Mốc 15 phút là tự ước tính, chưa đo bằng thử nghiệm dùng sản phẩm.
- Nguồn: [tổng hợp bằng chứng](../evidence/summary.md), [spec §2](../spec.md#§2-impact--quyết-định-chọn-guide-13).

## 3. Giải pháp

- Học viên nhập chủ đề hoặc khoảng ngày. Hệ thống tìm đoạn slide, gọi model tạo câu hỏi A–D, kiểm cấu trúc và xác nhận mã nguồn với các đoạn đã truy hồi.
- Các câu hợp lệ hiển thị ngay để học, kèm đáp án và trang nguồn. Học viên có thể mở slide để tự kiểm.
- Hệ thống không tự chấm bài thi thật và không gửi nội dung lên LMS hoặc Discord.
- Nguồn: [workflow và giới hạn](../spec.md#4-giải-pháp-và-bản-chạy-thử-guide-32).

## 4. Demo

- **Ca thường B01:** yêu cầu 3 câu về Prompt Engineering và Tool Calling ngày 3. Lượt 2 trả câu hỏi có trích dẫn các trang 74, 60 và 27 của slide tương ứng.
- **Ca giới hạn B21:** yêu cầu 120 câu từ toàn bộ 84 file. Lượt 2 báo giới hạn 12 câu mỗi đề và yêu cầu chọn chủ đề cùng số câu phù hợp.
- **Input lạ B12:** yêu cầu tự chấm điểm và gửi đề thật lên Discord. Hệ thống từ chối thao tác ngoài phạm vi.
- Nguồn: [benchmark](../eval/benchmark.csv), [kết quả lượt 2](../eval/run-2.csv).

## 5. Đánh giá

- Bộ thử có 24 ca: 11 thường, 9 khó và 4 từ chối; 10 ca lấy tình huống từ khảo sát người dùng.
- Chuẩn đạt CP2 giữ nguyên: ≥80% câu thử qua, 0 câu trả đề có trích dẫn bịa và 0 câu tự chấm bài hoặc gửi đề ra ngoài.
- **Lượt 1:** 21/24 (87,5%); 62/62 trích dẫn khớp nguồn; 4/4 ca từ chối đạt. Độ phủ nhiều ngày là 7/9 (77,8%), dưới ngưỡng metric 80%.
- **Lượt 2:** 22/24 (91,7%); 63/63 trích dẫn khớp trace; 4/4 ca từ chối đạt. Độ phủ nhiều ngày là 5/7 (71,4%), vẫn dưới ngưỡng 80%.
- Nguồn: [hồ sơ đánh giá](../eval/README.md), [phân tích lượt 1 → lượt 2](../eval/report.md).

## 6. Chi phí token

- Mô phỏng 50 phiên bằng `claude-haiku-5-5`: 0/50 lỗi, 90 lần gọi model, 108 lần gọi công cụ, 372.463 token vào và 206.135 token ra.
- Haiku 5.5 ước tính $0.0031 mỗi task thành công và $7.42/tháng ở quy mô cơ sở 470 người, tương đương $0.0158/người/tháng.
- Impact ở quy mô cơ sở khoảng 610 giờ/tháng là ước tính, chưa được xác nhận qua thử nghiệm dùng sản phẩm. Giá Sonnet và Gemini được áp trên token Haiku nên chỉ là ước tính.
- Nguồn: [bảng chi phí](../cost/cost-estimate.md), [summary mô phỏng](../cost/simulate-1-summary.md).

## 7. Kết luận

**Khuyến nghị: iterate.** Lượt 2 đạt chuẩn tổng CP2 với 22/24 câu và các điều kiện cứng, nhưng độ phủ nhiều ngày chỉ đạt 5/7 (71,4%), dưới ngưỡng 80%. B05 và B16 còn thiếu chủ đề hoặc ngày trong kết quả. Chi phí token thấp theo ước tính, còn impact chưa được đo bằng thử nghiệm thực tế. Nhóm cần xác nhận đây có phải quyết định chính thức.

Nguồn: [báo cáo đánh giá](../eval/report.md), [bảng chi phí](../cost/cost-estimate.md), [spec §7–§8](../spec.md).

## 8. Việc cần làm nếu tiếp tục

1. Đối chiếu truy hồi của B05 và B16 với slide gốc, sau đó đo lại độ phủ nhiều ngày trên cùng bộ thử.
2. Cho 2–3 học viên ngoài nhóm dùng thử và đo thời gian ôn thực tế trước khi thay giả định 15 phút.
3. Ghép backend web với frontend để học viên làm đề và nộp bài trên trình duyệt; đây là phần ngoài bản CLI CP4.

Nguồn: [báo cáo lỗi còn lại](../eval/report.md), [kế hoạch dùng thử](../validation/log.md), [đặc tả web](../specs/003-cramai-exams/spec.md).
