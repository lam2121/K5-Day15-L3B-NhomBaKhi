# Lời nói trang 6–7: Bùi Phước Anh

Phần này khoảng 2 phút, mỗi trang chừng 1 phút. Những chữ **in đậm** là con số cần nói rõ. Tất cả số liệu đều lấy từ `cost/cost-estimate.md`, `cost/simulate-1-summary.md` và `eval/report.md`.

## Trang 6: Chi phí token theo mô phỏng 50 phiên

> Câu hỏi tiếp theo là: chạy CramAI thật thì tốn bao nhiêu.
>
> Nhóm mô phỏng **50 phiên** dùng thật, chia theo ba kiểu người dùng lấy từ khảo sát: người ôn ít, người ôn mỗi tuần và người ôn thường xuyên. Mô phỏng chạy trên Claude Haiku 5.5 và không có phiên nào lỗi.
>
> Chúng tôi tính chi phí trên **task thành công**, tức là chia cho tỉ lệ đạt **22/24** của lượt 2, chứ không giả định hệ thống luôn đúng. Với Haiku, mỗi task thành công tốn khoảng **0,3 cent** ($0.0031).
>
> Ở quy mô cơ sở **470 người**, chi phí token khoảng **7,4 đô một tháng**, tức chưa tới **2 cent mỗi người mỗi tháng**. Nếu đổi sang Sonnet thì đắt hơn khoảng 20 lần, khoảng 148 đô một tháng.
>
> Nhóm cũng nói rõ giới hạn: đây mới là tiền token, chưa gồm máy chủ hay công vận hành. Giá Sonnet và Gemini được ước tính trên lượng token đo bằng Haiku. Còn con số **77 phút tiết kiệm mỗi người mỗi tháng** là ước tính, chưa đo bằng dùng thử.

Chuyển trang: "Vậy với chi phí thấp như vậy, nhóm có nên triển khai luôn không?"

## Trang 7: Kết luận dựa trên số liệu

> Khuyến nghị của nhóm là **iterate**: tiếp tục thử nghiệm có giới hạn, chưa mở rộng.
>
> Lý do để tiếp tục: tổng điểm đạt **22/24, tức 91,7%**, trên ngưỡng 80% mà nhóm chốt từ CP2. Hai điều kiện cứng đều đạt: **không có trích dẫn bịa** nào trong lượt 2, và **không có ca nào** tự chấm điểm hay gửi đề ra ngoài.
>
> Lý do chưa mở rộng: độ phủ nhiều ngày chỉ đạt **5/7, tức 71,4%**, dưới ngưỡng 80%. Khi học viên xin đề trải qua nhiều ngày học, hệ thống vẫn có lúc bỏ sót một ngày. Ca B16 chỉ ra câu từ ngày 6, thiếu ngày 7. Với công cụ ôn tập, điều này nguy hiểm vì người học tưởng mình đã ôn đủ.
>
> Nhóm giữ nguyên ngưỡng đã chốt từ CP2, không hạ chuẩn để báo là đạt.

Chuyển trang: "Nếu có thêm một tuần, nhóm sẽ làm ba việc…" (Khiêm nói trang 8.)

## Câu hỏi có thể gặp

| Câu hỏi | Trả lời ngắn | Nguồn |
|---|---|---|
| Vì sao chọn 470 người? | Khoá L3 hơn 700 người theo đề Track A. Nhân với 14/21, tỉ lệ người đã từng mở slide để ôn trong khảo sát, được khoảng 470. Mức 300 và 700 là hai đầu thấp và cao, nhóm tự ước tính. | `cost/personas.yaml`, `cost/cost-estimate.md` §1 |
| 77 phút từ đâu ra? | Bằng 5,16 lượt ôn mỗi người mỗi tháng nhân với 15 phút tiết kiệm mỗi lượt. Con số 15 phút là giả định, chưa đo, nên bước tiếp theo là cho 2–3 học viên dùng thử để đo. | `spec.md` §2, `evidence/summary.md` §7 |
| Sao không tính máy chủ? | Bảng này chỉ so tiền gọi model giữa các lựa chọn. Máy chủ và công vận hành được ghi là phần chưa tính. | `cost/cost-estimate.md` §4 |
| Lượt 2 tổng điểm tăng mà phủ nhiều ngày lại giảm (7/9 → 5/7)? | Mẫu số khác nhau: lượt 2 có hai ca chuyển sang hỏi lại hoặc nêu giới hạn trước khi gọi model, nên không còn tính vào metric phủ nhiều ngày. Dù vậy 5/7 vẫn dưới ngưỡng, nên nhóm chọn iterate. | `eval/report.md` |
| Sao không dùng Sonnet cho chất lượng cao hơn? | Chi phí gấp khoảng 20 lần. Lỗi còn lại nằm ở bước truy hồi và độ phủ ngày, chưa có bằng chứng đổi model sẽ sửa được. | `cost/cost-estimate.md` §2, `eval/report.md` |
