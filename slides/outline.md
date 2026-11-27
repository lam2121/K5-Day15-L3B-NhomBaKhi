# Dàn slide CP4 → nguồn số liệu

> Deck 8 trang đã được tạo và rà trong Spaces: [CramAI — CP4 demo](https://chatgpt.com/space/page_0a48e81fdfdc819195402c350d1b024d). PDF nộp bài nằm ở `demo-slides.pdf`; đây là bản raster 8 trang 16:9 từ render của deck để giữ nguyên hình thức khi xuất, còn bản Spaces dùng để chỉnh sửa. Deck Spaces vẫn riêng tư, không cần link công khai nếu nộp PDF. Trang 7 nêu khuyến nghị **iterate** theo số liệu, chưa thay cho quyết định chính thức của nhóm.

| # | Trang | Nội dung và bằng chứng | Nguồn | Trạng thái nội dung |
|---|---|---|---|---|
| 1 | Người dùng và pain | P2 ~15 phút tìm nội dung; P3 ~10 phút rồi bỏ dở; P4 ước ôn ~30% sau hơn một giờ | `evidence/summary.md`, P1–P4 đã ẩn danh | ☑ |
| 2 | Bằng chứng và tác động dự kiến | Khảo sát 21 người, 14/21 từng mở slide; impact ~77 phút/người/tháng được ghi là ước tính | `evidence/summary.md`, `spec.md` §2 | ☑ |
| 3 | Luồng sản phẩm | Nhập phạm vi → tìm slide → AI tạo câu → kiểm nguồn → học với đáp án và trích dẫn | `spec.md` §4 | ☑ |
| 4 | Demo: ca thường, ca giới hạn và input lạ | B01 tạo đề ôn; B21 yêu cầu 120 câu vượt giới hạn; B12 yêu cầu chấm điểm và gửi đề ra ngoài | `eval/benchmark.csv`, `eval/run-2.csv` | ☑ |
| 5 | Đánh giá trên cùng bộ 24 câu | 21/24 → 22/24; trace 62/62 → 63/63; phủ nhiều ngày 7/9 → 5/7, đều dưới ngưỡng 80% | `eval/README.md`, `eval/report.md` | ☑ |
| 6 | Chi phí token 50 phiên | Haiku $0.0031/task thành công; $7.42/tháng ở kịch bản cơ sở; so với impact ước tính | `cost/cost-estimate.md`, `cost/simulate-1-summary.md` | ☑ |
| 7 | Kết luận theo dữ liệu | Khuyến nghị iterate do độ phủ nhiều ngày 71,4%, đồng thời nêu điểm tổng đạt 91,7% | `eval/report.md`, `cost/cost-estimate.md` | ☑ |
| 8 | Nếu có thêm một tuần | Xử lý lỗi B05/B16, đo phủ nhiều ngày, xác nhận impact bằng thử nghiệm | `eval/report.md` mục lỗi còn lại, `validation/log.md` | ☑ |

## Dự kiến người trình bày

| Trang | Người nói (kế hoạch) |
|---|---|
| 1, 2 | Nguyễn Văn Lâm |
| 3, 5 | Nguyễn Duy Hưng |
| 4, 8 | Nguyễn Trọng Khiêm |
| 6, 7 | Bùi Phước Anh |

Đây là kế hoạch phân phần để mỗi thành viên có nội dung nói; chưa xác nhận buổi tập chung.

## Còn phải kiểm trước khi nộp

- Nhóm xác nhận quyết định go / iterate / stop; deck hiện đề xuất iterate theo số liệu. Kịch bản tập ba tình huống có ở [demo-rehearsal.md](demo-rehearsal.md); nhóm cần tập thật trước khi đánh dấu xong.
- Nộp [demo-slides.pdf](../demo-slides.pdf). Deck Spaces vẫn riêng tư; PDF đã sẵn sàng làm phương án nộp tệp.
- Xác nhận repo chạy được trên máy demo, `.env` có key riêng trên máy đó, và gọi thử model trong vòng một giờ trước demo.
- Kiểm video dự phòng CP4 có cả hai tình huống thật, mở được ẩn danh. Video CP3 hiện có trong [Drive](https://drive.google.com/drive/folders/1-X27aMPKkXqvF0ocGa-9sURYSGslVCXk?usp=sharing), nhưng chưa xác minh nội dung CP4.
