# Đặc tả CramAI

**Feature** `001-cramai` · **Ngày tạo** 2026-11-27 · **Trạng thái** Chốt lát cắt bằng bằng chứng ở CP2.

Bài nộp BTC dùng [spec gốc](../../spec.md). Đặc tả Spec Kit này giúp bốn vai phát triển cùng một prototype. [Canvas của nhóm](../../canvas.md).

Luồng này là cửa vào CLI và bộ chấm của hackathon. Phiên bản có admin xuất bản 14 bộ slide, danh mục đề và làm bài online dùng [đặc tả web](../003-cramai-exams/spec.md).

## User Scenarios & Testing

### User Story 1 — Nhận đề ôn giữa kỳ có căn cứ (P1)

Một học viên L3 nhập chủ đề hoặc yêu cầu ôn. AI chọn các câu có căn cứ trong bộ slide đã chốt. Học viên nhận một đề nháp có đáp án, độ khó và trang nguồn để kiểm tra và duyệt.

**Kiểm độc lập.** Dùng dữ liệu mẫu được phép cùng model thật đã nối, chạy `python run.py`. Nhập một chủ đề có trong mẫu, đối chiếu câu hỏi và trang nguồn rồi thử một chủ đề thiếu căn cứ và một yêu cầu ngoài phạm vi.

1. Yêu cầu rõ và có đoạn phù hợp. Đề nháp có trích dẫn kiểm được, học viên loại được câu trước khi chốt.
2. Chủ đề mơ hồ. Học viên nhận câu hỏi làm rõ.
3. Thiếu nguồn hoặc ngoài phạm vi. Học viên nhận thông báo giới hạn và bước tiếp theo.
4. Model lỗi kỹ thuật. Bộ chạy ghi lỗi để phân biệt với phản hồi thiếu nguồn.

## Requirements

- **FR-001** Một quyết định AI dựa trên các đoạn đã truy hồi. Model giả phục vụ tích hợp CP2. Model thật bắt buộc từ CP3.
- **FR-002** Mỗi câu có đáp án, độ khó và ít nhất một nguồn thuộc tập đoạn truy hồi. Trang trích dẫn lấy từ bản ghi nguồn.
- **FR-003** Trạng thái thiếu nguồn, mơ hồ hoặc ngoài phạm vi có thông báo tiếp tục và danh sách câu rỗng. Duyệt hoặc loại câu là thao tác cục bộ của người dùng.
- **FR-004** CLI, eval và simulate dùng chung bộ xử lý. Eval lưu output dạng chuỗi, model, token và trace.
- **FR-005** Prototype chạy riêng, dữ liệu công khai và dữ liệu gửi model được kiểm trước. Dữ liệu chạy thử được phân biệt với bằng chứng pain.
- **FR-006** Chốt cách chấm tại CP2. Hai lượt đánh giá dùng cùng benchmark. Chi phí dùng tỉ lệ đạt thực của đúng model.
- **FR-007** Bốn vai có phạm vi sửa file, dùng chung hợp đồng và xác minh bằng smoke cùng kiểm phạm vi PR.

## Success Criteria

- **SC-001** Demo trong hai phút có ca thường và ca khó, nguồn kiểm được và đường lui khi thiếu căn cứ.
- **SC-002** CP2 có ≥10 câu, ≥3 metric và chuẩn đạt đã commit. CP3 có 20–30 câu, ≥5 câu khó, ≥2 câu từ chối nhắm chỗ chặn rủi ro, ≥1/3 nguồn thật và lượt 1 gọi AI thật.
- **SC-003** CP4 có hai lượt đã chấm, ≥50 phiên, ≥3 persona, ba kịch bản chi phí, ≥2 mức giá model, slide và video dự phòng.
- **SC-004** Có ≥1 nguồn pain đạt ngưỡng, ≥5 ví dụ hoặc trích dẫn có nguồn và bảng impact ≥3 hướng.

## Giả định

Corpus theo các ngày học và bộ slide trong Canvas chốt tại CP2. Một ngày có thể gồm nhiều PDF. Chỉ phần đã kiểm nguồn và đủ nội dung làm căn cứ vào lát cắt. Bằng chứng, thông tin nối model và chuẩn CP2 do nhóm xác nhận. [Kế hoạch triển khai](plan.md).
