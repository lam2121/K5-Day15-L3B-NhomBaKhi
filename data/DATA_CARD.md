# Data card — dữ liệu bản chạy thử dùng

> Điền ở guide bước 2.4 (bản đầu ở CP2, đủ ở CP3). Ôn lại: ngày 6 · lab ngày 6. Chấm ở rubric R4.
> Một trang. Mỗi dataset một mục. Dữ liệu chạy thử (bài mẫu, thông báo mẫu, đoạn transcript…) để trong thư mục `data/` này.
> Không commit nguyên tài liệu khoá, dữ liệu cá nhân thật hay nguyên file data BTC cấp — chỉ đoạn trích ngắn, bản viết lại, hoặc số đã tổng hợp.

## Dataset 1 · Tập đoạn mẫu CP2 (`data/passages.jsonl`)

| | |
|---|---|
| Dùng để làm gì | Nguồn cho công cụ `search_slides` ở giai đoạn CP2 để kiểm tra hợp đồng `SlidePassage`, `resolve_citations` và `phu_nhieu_ngay`. |
| Từ đâu | Nhóm tự viết lại theo khái niệm chung của lát cắt CramAI (không trích nguyên văn file PDF bản quyền khoá học). |
| Xử lý những bước gì | Viết theo schema `SlidePassage` (`source_id`, `file_name`, `page`, `text`), đánh mã `dayNN-pNNN-sNN` trải đều 6 ngày (`day01`, `day03`, `day05`, `day07`, `day10`, `day12`), có 1 đoạn dạng dàn ý (`day07-p002-s01`) để kiểm bẫy thiếu nội dung. |
| Số dòng / số đoạn | 12 đoạn (UTF-8 JSONL). |
| Phiên bản / ngày lấy | v0.1-cp2 · 2026-11-27 |
| Nhãn | `synthetic` |
| Giới hạn | Dữ liệu tự dựng quy mô nhỏ phục vụ tích hợp hợp đồng CP2; chưa phản ánh đầy đủ độ nhiễu và mật độ dàn ý của bộ slide PDF thật 14 ngày (sẽ thay bằng trích đoạn cho phép ở T011 trước CP3). **Không phải bằng chứng pain.** |

**Data `synthetic` (nhóm tự sinh):** Tạo thủ công 12 đoạn JSONL bám đúng cấu trúc `SlidePassage` của `specs/001-cramai/data-model.md`, kiểm tay 12/12 dòng bởi Nguyễn Trọng Khiêm (khớp regex `source_id` và `page` trong `codebase/contracts.py`).

## Dataset 2 · Bộ slide PDF 14 ngày học (Kế hoạch T011 · CP3)

| | |
|---|---|
| Dùng để làm gì | Nguồn chính cho công cụ `search_slides` trong bản chạy thử thật ở CP3–CP4. |
| Từ đâu | Tài liệu bài giảng khoá AI20K (14 ngày học, nhiều bộ slide của các giảng viên). File PDF gốc lưu cục bộ trong `data-private/`, **không** commit lên GitHub. |
| Xử lý những bước gì | Trích xuất văn bản theo từng trang PDF vật lý (`page >= 1`), làm sạch khoảng trắng/header lặp, giữ đoạn trích ngắn hợp lệ và gắn nhãn đoạn chỉ có dàn ý. |
| Số dòng / số đoạn | Đang xử lý tại T011 (cập nhật đủ trước CP3). |
| Phiên bản / ngày lấy | Khoá K5 · 2026-11-27 |
| Nhãn | `thật` (trích đoạn ngắn được phép) |
| Giới hạn | Nhiều slide chỉ chứa gạch đầu dòng gợi ý giảng trên lớp; các trang dạng dàn ý không đủ nội dung để làm căn cứ đáp án cho câu hỏi.
