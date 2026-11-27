# Reflection — Bùi Phước Anh

## 1. Vai trò và phần tôi làm

Tôi phụ trách trải nghiệm và sản phẩm. Ở bản CLI, tôi làm [app.py](../codebase/app.py) (T013) để hiện đề A–D kèm độ khó, file và trang nguồn, cho học viên duyệt hoặc bỏ từng câu, sau thêm nhãn "Ngày N" vào dòng nguồn. Tôi cùng Khiêm viết [metric_spec.yaml](../eval/metric_spec.yaml), cùng Hưng chấm độc lập 5 ca và khớp 5/5 (T009), hoàn thiện [canvas.md](../canvas.md) và tổng hợp khảo sát 21 học viên trong [summary.md](../evidence/summary.md) (T016). Tôi điền [personas.yaml](../cost/personas.yaml) với ba persona và giá ba model có link (T020). Với web, tôi làm [frontend](../frontend/README.md) cho học viên và admin (003 T006/T008, commit `1d7b0c2`), rồi ghép thử trang học viên với backend của Lâm. Tôi cũng soạn nháp nội dung [slide](../slides/content.md).

## 2. AI hỗ trợ tôi thế nào

Tôi dùng Claude Code để viết frontend, CLI, các file chi phí và bản nháp tài liệu, kể cả bản reflection này. Tôi dùng skill Impeccable để chọn hướng thiết kế và để một agent riêng rà bản dựng. Tôi phải tự quyết và sửa nhiều chỗ. AI đề xuất hướng thiết kế, tôi quay lại ba vòng và xem đủ 10 bản phác rồi mới chọn "Slide chiếu giảng đường". AI tick thẳng checklist của Lâm làm bước kiểm phạm vi vai bị lỗi, nên tôi cho bỏ tick để đúng quy trình. Con số 15 phút tiết kiệm mỗi lần là AI tự ước tính, tôi giữ nhãn "tự ước tính" chứ không coi đó là số đo. Khi xem demo, tôi tự đối chiếu ba câu với trang slide gốc trước khi tin đáp án.

## 3. Một câu trượt và bài học

Ca `B19` ở lượt 1 yêu cầu ôn tổng hợp từ ngày 6 đến ngày 14, nhưng đề chỉ có 2 câu, lấy từ ngày 7 và ngày 12, và không báo phần còn thiếu ([báo cáo đánh giá](../eval/report.md)). Mọi trích dẫn đều đúng nguồn, nên nếu chỉ kiểm "có căn cứ" thì ca này trông như đạt. Người học thì sẽ tưởng mình đã ôn xong 9 ngày. Khi xem demo, tôi còn thấy đáp án dồn vào B: 31/62 câu ở lượt 1. Bộ metric hiện tại không đo được cả hai lỗi này. Bài học của tôi là đánh giá một sản phẩm học tập phải đo cả những gì đề không nói ra, không chỉ những gì đề nói đúng.
