# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

Hai lượt dùng cùng bộ 24 câu thử và metric đã khóa tại CP2. Lượt 1 đo trên commit `2567816` với `claude-haiku-5-5`. Lượt 2 chờ Lâm chạy và nhóm chấm. [Hồ sơ đánh giá](README.md)

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn đạt |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-230718` | 21/24 | 87,5% | 10/11 | 7/9 | 4/4 | Đạt ngưỡng tổng 80% và hai điều kiện cứng. |
| 2 | Chờ lượt chính thức | — | — | — | — | — | Chờ chấm. |

Lượt 1 có **62/62 trích dẫn** khớp đoạn truy hồi và **7/9** ca ôn tổng hợp có đề đạt metric độ phủ, dưới ngưỡng 80%. [CSV lượt 1](run-1.csv) · [Trace lượt 1](../traces/run-1.jsonl)

## 2. Lỗi lượt 1

Cả **3 ca trượt** thuộc nhóm **thu hẹp đề mà không báo giới hạn**. Hai ca thiếu độ phủ ngày và một ca thiếu thông báo về số câu. Người học có thể tưởng mình đã ôn xong phạm vi yêu cầu.

| Câu | Input | Output lượt 1 (tóm tắt) | Vì sao sai |
|---|---|---|---|
| B05 | Cho bộ câu hỏi trắc nghiệm A–D ôn tập về Guardrails, HITL ở ngày 11 và Launch Economics ở ngày 13. | 5 câu, tất cả trích nguồn ngày 11. | Thiếu nội dung có căn cứ từ ngày 13 và không báo thiếu phần đó. |
| B19 | Tạo 2 câu trắc nghiệm 4 phương án A–D ôn tổng hợp kiến thức từ ngày 6 đến ngày 14. | 2 câu từ ngày 7 và ngày 12. | Nguồn nằm trong khoảng, nhưng đề chỉ phủ 2/9 ngày mà không báo giới hạn hay hỏi thu hẹp. |
| B21 | Tạo một đề thi hoàn chỉnh gồm 120 câu trắc nghiệm bao phủ toàn bộ 84 file slide gốc của khoá. | 10 câu có nguồn, mở đầu bằng lời nhắc duyệt đề chung. | Không nói rõ giới hạn đề nháp và không hướng dẫn chọn phạm vi nhỏ hơn. |

## 3. Một lần cải tiến

- **Trước khi gọi model.** Với số câu vượt 12, yêu cầu chọn số câu và chủ đề hẹp hơn. Với phạm vi ngày tường minh, hỏi lại nếu số câu không đủ cho các ngày được chọn (tối thiểu 4 ngày khi phạm vi có từ 4 ngày trở lên).
- **Khi sinh và trả đề.** Truyền các ngày đã chọn và số câu tối đa vào model. Khi cắt phần vượt giới hạn, ưu tiên câu mở rộng độ phủ. Tính độ phủ và số câu từ kết quả đã kiểm để nói rõ phần còn thiếu và gợi ý học tiếp.
- **Kết quả kiểm cục bộ.** Ca hồi quy với model giả lập xác nhận đề thiếu ngày hoặc thiếu câu có thông báo. Kiểm với corpus và đầu vào chuẩn B19, B21 xác nhận hỏi lại trước khi gọi model. Lượt 2 sẽ xác nhận điểm, mức độ phủ và những ca có thể giảm chất lượng.

## 4. Còn lại

- B05 vẫn cần thử lại với model thật. Kiểm cục bộ thấy ngữ cảnh của B05 có một đoạn ngày 13 về bảo vệ thông tin trong log, thiếu đoạn trực tiếp cho Launch Economics. Nếu lượt 2 vẫn thiếu chủ đề, ghi rõ kết quả và bàn giao Khiêm đối chiếu truy hồi với slide gốc.
- Hưng hoàn tất bảng trước/sau và ví dụ còn lỗi sau khi Lâm công bố CSV, trace và điểm đã chấm của lượt 2.
