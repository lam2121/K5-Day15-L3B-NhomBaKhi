# Mô hình dữ liệu CramAI Web

| Thực thể | Trường chính và ràng buộc |
|---|---|
| `SlideSlot` | `slide_number` là khóa 1–14, tên Slide 01–14. Có tối đa một con trỏ draft và một con trỏ published. |
| `SlideRevision` | UUID, vị trí, thời điểm, metadata PDF và các đoạn đã trích. Bản nháp độc lập với bản published. Xuất bản cập nhật con trỏ trong một giao dịch. |
| `Document` / `SlidePassage` | Tên hiển thị, số trang, `storage_key` riêng tương đối với volume `/data/slides`, `source_id`, `page` và `text`. Bản PDF ở volume riêng; SQLite chỉ giữ metadata và đoạn trích. Mã đoạn ổn định trong revision. Giới hạn 5 PDF/bộ, 20 MiB/file, 50 MiB/lần, 120 trang/file và 300 trang/bộ. |
| `CatalogExam` | `slide-01`…`slide-14` rồi `midterm`. Mỗi mục có `available`, `reason` và số câu. Slide đủ dữ liệu khi có revision published. Midterm mở sau khi cả 14 bộ published. |
| `Attempt` | UUID khó đoán, `exam_id`, revision và snapshot câu hỏi, đáp án, nguồn. `expires_at` sau 60 phút từ lúc tạo. Học viên giữ ID phiên trong bộ nhớ trình duyệt. |
| `Submission` | Một lựa chọn hợp lệ cho mỗi câu, snapshot điểm và chi tiết đã chấm. Lượt nộp hợp lệ đầu tiên được lưu. Cùng tập lựa chọn trả lại cùng điểm. Một tập khác sau khi nộp trả lỗi. |
| `Score` | `correct_count`, `total_questions`, `score_percent` làm tròn một chữ số thập phân và chi tiết từng câu. Đúng 1 điểm, sai 0 điểm. |

Chỉ admin tải/xem PDF gốc tại VPS. Không mount volume PDF vào static server. Payload tạo bài có câu hỏi và phương án; khi học viên chủ động bấm nút giải thích, API mới tiết lộ đáp án và trả PNG của trang đúng sau khi xác thực attempt/citation. Payload chấm bài có đáp án đúng và nguồn. Không giữ thông tin định danh học viên. Dọn lượt hết hạn theo lịch vận hành của dịch vụ. [Ràng buộc core](contracts/core.md) · [Schema HTTP](contracts/openapi.json).
