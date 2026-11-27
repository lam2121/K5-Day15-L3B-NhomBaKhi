# Data card — dữ liệu bản chạy thử dùng

> Điền ở guide bước 2.4 (bản đầu ở CP2, đủ ở CP3). Ôn lại: ngày 6 · lab ngày 6. Chấm ở rubric R4.
> Một trang. Mỗi dataset một mục. Dữ liệu chạy thử (bài mẫu, thông báo mẫu, đoạn transcript…) để trong thư mục `data/` này.
> Không commit nguyên tài liệu khoá, dữ liệu cá nhân thật hay nguyên file data BTC cấp — chỉ đoạn trích ngắn, bản viết lại, hoặc số đã tổng hợp.

## Dataset 1 · Trích đoạn slide 14 ngày học (`data/passages.jsonl`)

| | |
|---|---|
| Dùng để làm gì | Nguồn truy hồi chính cho công cụ `search_slides` trong `codebase/tools.py`, phục vụ sinh câu hỏi có căn cứ và đối chiếu `resolve_citations`. |
| Từ đâu | Tài liệu bài giảng khoá AI20K (14 ngày học, từ `Day 01` đến `Day 14`). File PDF gốc giữ cục bộ tại `data-private/` (đã chặn commit bởi `.gitignore`). |
| Xử lý những bước gì | Chọn 1 bộ slide bài giảng chi tiết đại diện cho mỗi ngày (loại bỏ tài liệu tham khảo `References_` và lab), bỏ trang bìa, chuẩn hoá khoảng trắng, lọc trang có nội dung $\ge 120$ ký tự, lấy mẫu đều 20 trang/ngày và cắt gọn tối đa 450 ký tự/đoạn, đánh mã `dayNN-pNNN-s01` theo số trang PDF vật lý (script tái tạo: `evidence/scripts/build_passages.py`). |
| Số dòng / số đoạn | 280 đoạn (20 đoạn/ngày × 14 ngày, UTF-8 JSONL). |
| Phiên bản / ngày lấy | Khoá K5 · 2026-11-27 |
| Nhãn | `thật` (trích đoạn ngắn được phép) |
| Giới hạn | Mỗi ngày đại diện bằng 1 bộ slide chính và trích tối đa 450 ký tự/trang để không đưa nguyên văn tài liệu bản quyền lên repo công khai; một số slide dạng dàn ý ngắn (< 120 ký tự) đã được lọc bỏ ở bước tiền xử lý. |
