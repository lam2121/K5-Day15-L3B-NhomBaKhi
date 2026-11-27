# Reflection — Nguyễn Văn Lâm

> Bản nháp do Codex tổng hợp từ task và artefact trong repo. Lâm cần đọc lại, sửa nếu chưa đúng trải nghiệm của mình và xác nhận trước khi nộp.

## 1. Vai trò và phần tôi làm

Tôi phụ trách tích hợp bản CLI, adapter model và hồ sơ nộp. Tôi xác minh usage thật, chạy lượt đánh giá 1 và 2, rồi chạy mô phỏng 50 phiên bằng cùng model với lượt 2. Tôi cũng tích hợp bảng chi phí vào spec, rà rủi ro và hoàn thiện PDF 8 trang CP4. [Lịch sử task](../specs/001-cramai/tasks.md) · [Hồ sơ đánh giá](../eval/README.md) · [Mô phỏng chi phí](../cost/cost-estimate.md)

## 2. AI hỗ trợ tôi thế nào

Tôi dùng Codex để hỗ trợ adapter model, rà tài liệu và tạo slide CP4 từ số liệu đã có trong repo. Tôi đối chiếu token với trace, kiểm số liệu với CSV đánh giá và mô phỏng, rồi rà từng trang PDF sau khi render. Tôi giữ các giới hạn quan trọng trong nội dung: số phút tiết kiệm là ước tính, độ phủ nhiều ngày lượt 2 dưới ngưỡng và PDF là bản raster.

## 3. Một câu trượt và bài học

B05 vẫn trượt ở lượt 2. Yêu cầu gồm Guardrails/HITL ngày 11 và Launch Economics ngày 13, nhưng 11/12 đoạn gửi model thuộc ngày 11; đoạn duy nhất từ ngày 13 nói về bảo vệ thông tin trong log chứ không có căn cứ trực tiếp cho Launch Economics. [Báo cáo](../eval/report.md)

Tôi rút ra rằng mã nguồn và trang trích dẫn hợp lệ chưa đủ để chứng minh nội dung đáp ứng toàn bộ chủ đề được hỏi. Cần kiểm tra độ liên quan và độ phủ của đoạn truy hồi với từng chủ đề yêu cầu, rồi báo phần còn thiếu cho người học.
