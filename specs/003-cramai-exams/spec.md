# Đặc tả CramAI — 14 bộ slide và đề giữa kỳ

**Feature** `003-cramai-exams` · **Ngày** 2026-11-27 · **Trạng thái** Đặc tả mới, chờ triển khai.

CramAI giúp học viên L3 làm đề luyện tập ngay trên web từ tài liệu admin đã duyệt. Có 14 lựa chọn theo bộ slide và một đề luyện thi giữa kỳ tổng hợp. Hiện trạng và quy tắc chấm của hackathon ở [spec nộp bài](../../spec.md).

## User Scenarios & Testing

### US1 — Chọn đề, làm và xem kết quả (P1)

Học viên mở danh mục theo thứ tự Slide 01 → Slide 14 → Đề giữa kỳ. Học viên chọn phạm vi, làm đề trắc nghiệm do AI tạo từ nguồn được duyệt và xem điểm cùng trích dẫn sau khi nộp.

1. Có Slide 03 đã xuất bản. Chọn Slide 03 cho đề năm câu chỉ dựa vào bộ đó. Học viên chọn một đáp án mỗi câu, nộp và xem đúng/tổng, điểm phần trăm, đáp án đúng và tên file, trang.
2. Cả 14 bộ đã xuất bản. Chọn Đề giữa kỳ cho đúng 14 câu, mỗi bộ đóng góp một câu. Kiểm nguồn theo từng bộ trong màn hình kết quả.
3. Một bộ chưa sẵn sàng. Danh mục vẫn hiện đủ 15 lựa chọn. Slide đó và đề giữa kỳ ở trạng thái chưa sẵn sàng, kèm lý do.
4. AI không tìm đủ câu có căn cứ. Người học nhận lý do và bước tiếp theo. Nếu nộp thiếu câu, giao diện đánh dấu phần chưa trả lời.
5. Gửi nộp trùng cùng lựa chọn trả cùng kết quả. Hết thời hạn thì người học được mời tạo lượt mới.

**Kiểm độc lập.** Nạp nguồn mẫu, chạy một đề Slide 03, một ca thiếu nguồn và một đề giữa kỳ với đủ 14 nguồn. So lại kết quả và dùng dữ liệu mạng để kiểm tra đáp án chỉ đến trình duyệt sau khi nộp.

### US2 — Admin quản lý nguồn của 14 bộ (P1)

Admin đăng nhập và chọn vị trí trong 01–14 để nạp PDF, xem bản nháp và xuất bản nội dung đủ quyền sử dụng.

1. Admin có thể nạp một hoặc nhiều PDF cho một bộ, xem tên file, số trang và đoạn đại diện, sau đó xuất bản đúng bản nháp.
2. Khi file không hợp lệ hoặc quá trình nhập lỗi, bản đã xuất bản vẫn dùng được. Bản nháp chưa xuất bản không xuất hiện trong dữ liệu đề.
3. Thay thế bộ slide tạo phiên bản mới. Bài đang làm vẫn được chấm theo câu hỏi, đáp án và trích dẫn đã nhận. Người dùng không có quyền admin không thể sửa tài liệu.

**Kiểm độc lập.** Xuất bản bộ mẫu, tạo một lượt làm bài, thay phiên bản bộ đó và xác nhận lượt cũ vẫn chấm đúng. Kiểm yêu cầu admin khi chưa đăng nhập.

### US3 — Vận hành bản demo trên VPS (P2)

Lâm xác minh frontend và backend cùng bản phát hành, theo dõi trạng thái và có cách quay về phiên bản đã kiểm khi lỗi.

**Kiểm độc lập.** Mở web và kiểm phiên bản dịch vụ, làm một bài bằng model đã nối, sau đó khôi phục một bản tương thích và kiểm lại hai luồng.

## Requirements

- **FR-001** Danh mục luôn có 14 bộ Slide 01–14 và mục Đề giữa kỳ ở cuối. Từng mục có trạng thái và lý do khi chưa mở.
- **FR-002** Chỉ admin quản lý tài liệu. Mỗi bộ có thể chứa nhiều PDF. Nguồn chỉ được dùng sau khi admin kiểm và xuất bản.
- **FR-003** AI tạo đề theo phạm vi đã chọn. Một bài theo slide có năm câu từ đúng bộ. Một bài giữa kỳ có 14 câu, mỗi bộ một câu. Thiếu căn cứ để đủ đề thì báo rõ.
- **FR-004** Mỗi câu trắc nghiệm có đúng bốn lựa chọn, một đáp án đúng và ít nhất một trích dẫn kiểm được. Trình duyệt nhận câu hỏi và phương án trước khi nộp, rồi nhận điểm, đáp án và nguồn sau khi nộp.
- **FR-005** Người học chọn hoặc đổi đáp án trong lượt đang làm và được chỉ ra câu chưa trả lời. Backend chấm xác định, mỗi câu một điểm.
- **FR-006** Lượt làm bài gắn với đúng phiên bản câu hỏi, đáp án và nguồn, kể cả khi admin cập nhật dữ liệu. Lượt hết hạn sau 60 phút.
- **FR-007** CramAI dùng cùng chính sách kiểm căn cứ cho CLI và web. Bộ chạy, dữ liệu và cách chấm chính thức của hackathon tuân theo mốc CP2.
- **FR-008** Bản demo chạy riêng với tài liệu được phép. PDF gốc, key, thông tin admin và đáp án của lượt chưa nộp nằm phía dịch vụ. Tài liệu là nguồn tham khảo cho AI.
- **FR-009** Frontend và backend có thể chạy cục bộ, sau đó phát hành cùng một phiên bản trên một VPS.

## Success Criteria

- **SC-001** Danh mục được kiểm đủ 15 mục đúng thứ tự. Hai phạm vi đề cho ra đúng số câu và độ phủ quy định, hoặc trả lý do khi thiếu căn cứ.
- **SC-002** Một lượt làm bài demo trong hai phút với nguồn mẫu. Điểm khớp cách chấm 1 điểm/câu. Các đáp án đúng chỉ xuất hiện sau khi nộp.
- **SC-003** Kiểm được quyền admin, lỗi file, thay thế tài liệu trong khi có bài đang làm và hai chế độ giả/thật.
- **SC-004** CLI, eval và simulate chạy theo cửa vào của đề. Nếu nhóm dùng web để demo, kết quả web được kiểm riêng với cùng chính sách nguồn.
- **SC-005** Khi phát hành lên VPS, kiểm được mã bản phát hành, một ca có nguồn và một ca thiếu nguồn. Lưu kết quả thử khôi phục.

## Giả định và phạm vi

14 bộ là 14 mục học tập có thứ tự. Một mục có thể gồm nhiều PDF của cùng buổi. Bản đầu nhận PDF có lớp văn bản. Các đề là đề luyện tập, điểm dùng cho tự ôn. Tài khoản học viên, LMS, tải file từ phía học viên và OCR nằm ngoài phạm vi.
