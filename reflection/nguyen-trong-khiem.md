# Reflection — Nguyễn Trọng Khiêm

## 1. Vai trò và phần tôi làm

Tôi phụ trách dữ liệu 14 ngày slide, công cụ truy hồi và bộ câu thử cho cả CLI lẫn đặc tả web. Tôi đã trích xuất 280 đoạn trích ngắn từ 14 ngày PDF cục bộ sang [passages.jsonl](../data/passages.jsonl), khai báo [DATA_CARD.md](../data/DATA_CARD.md), cài đặt `search_slides` và `extract_pdf_passages` trong [tools.py](../codebase/tools.py). Tôi cũng hoàn thiện [benchmark.csv](../eval/benchmark.csv) đủ 24 câu (10/24 từ khảo sát thật $n=21$) cùng [results.csv](../evidence/survey/results.csv) và [questions.md](../evidence/survey/questions.md).

## 2. AI hỗ trợ tôi thế nào

Tôi dùng trợ lý AI để rà hợp đồng dự án, viết script trích PDF bằng `pymupdf`, tối ưu cache truy hồi. Tuy nhiên tôi phải tự kiểm và chỉnh lại nhiều output từ AI: bỏ các câu tự luận ở `B02` cho khớp lát cắt chỉ dùng trắc nghiệm 4 phương án A–D, chuyển từ dữ liệu tự dựng sang 280 đoạn slide thật 14 ngày, và bổ sung kiểm chứng PDF hỏng/thiếu lớp văn bản cho hàm web.

## 3. Một câu trượt và bài học

Ca `B05` ở lượt 1 yêu cầu ôn cả Guardrails/HITL (ngày 11) và Launch Economics (ngày 13), nhưng kết quả cả 5 câu đều lấy từ ngày 11 và thiếu nội dung Launch Economics của ngày 13 ([Báo cáo đánh giá](../eval/report.md)). Kiểm tra lại cho thấy bộ trích ngày 13 đang chọn file thiên về logging/observability thay vì slide Launch & Economics. Bài học rút ra là chất lượng truy hồi phụ thuộc trực tiếp vào bước chọn bộ slide đại diện khi nạp corpus, không chỉ ở thuật toán tìm kiếm.
