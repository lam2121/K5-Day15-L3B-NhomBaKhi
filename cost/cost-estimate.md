# Chi phí khi dùng thật

> CP4 · 28/11/2026. Mô phỏng dùng giá trả phí chuẩn, dù lượt thử có thể chạy qua gói miễn phí. Các phép tính dưới đây được chép từ `cost/simulate-1-summary.md`, không tự đổi số liệu đầu ra.

## 1. Đầu vào

- **Persona:** `cost/personas.yaml` có 3 kiểu. Tỉ lệ 14% / 50% / 36%; lần dùng mỗi người mỗi tháng 2 / 4 / 8 (tương ứng trung bình có trọng số **5,16 phiên/người/tháng**); 1 / 2 / 3 lượt hỏi mỗi phiên. Tần suất tuần lấy từ khảo sát ngày 27/11, câu 3, trong 14 người từng ôn bằng slide. Tần suất tháng và lượt hỏi/phiên có phần **tự ước tính**.
- **Quy mô:** thấp 300, cơ sở 470, cao 700 người. Mốc khoá học L3 hơn 700 lấy từ [Track A](https://github.com/VinUni-AI20k/K5-L3-Day15-AI-Product-Hackathon/blob/main/tracks/track-a-edtech.md#L73). Cơ sở ước theo 700 × 14/21 người từng mở slide ôn tập trong khảo sát; cao là toàn bộ 700 (tự ước tính), thấp 300 (tự ước tính).
- **Giá trả phí chuẩn (USD / 1 triệu token):** Claude Haiku 5.5 $0,10 vào / $0,50 ra; Claude Sonnet 5.5 $2 / $10; Gemini 3.8 Flash $0,75 / $3,75. Nguồn chính thức: [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) và [Google AI Studio](https://aistudio.google.com/docs/models/gemini-3.8-flash#pricing), kiểm tra ngày 28/11/2026. Mức Gemini nêu áp dụng đến 31/12/2026.
- **Tỉ lệ đạt dùng để tính:** 22/24 (91,7%) từ `run-2@20261128-003757` (`eval/run-2.csv`). Chuẩn tổng CP2 đạt; riêng metric phủ nhiều ngày là 5/7 (71,4%), dưới ngưỡng 80% và không được đổi.
- **Token đo trên:** `claude-haiku-5-5`. Giá Haiku dùng đúng model đo; giá Sonnet và Gemini áp trên cùng lượng token nên chỉ là ước tính, chưa đo trực tiếp bằng hai model đó.

## 2. Kết quả mô phỏng

Lượt `cost/simulate-1.csv` · run ID `simulate-1@20261128-010157` · 50 phiên · seed 42 · 0/50 phiên lỗi. Lượt chạy ghi 90 lần gọi model, 108 lần gọi công cụ, 372.463 token vào và 206.135 token ra.

| Model (giá vào/ra trên 1M token) | Chi phí / phiên | Chi phí / task thành công | / tháng — thấp (300) | / tháng — cơ sở (470) | / tháng — cao (700) | / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 ($0,10 / $0,50) | $0.0028 | $0.0031 | $4.74 | $7.42 | $11.06 | $0.0158 |
| Claude Sonnet 5.5 ($2 / $10), ước tính token | $0.0561 | $0.0612 | $94.77 | $148.48 | $221.14 | $0.3159 |
| Gemini 3.8 Flash ($0,75 / $3,75), ước tính token | $0.0210 | $0.0230 | $35.54 | $55.68 | $82.93 | $0.1185 |

Chi phí / task thành công = chi phí trung bình mỗi phiên ÷ tỉ lệ đạt 22/24; không giả định hệ thống đạt 100%. Số chi tiết theo persona và công thức nằm trong [`simulate-1-summary.md`](simulate-1-summary.md); CSV và trace gốc: [`simulate-1.csv`](simulate-1.csv), [`simulate-1.jsonl`](../traces/simulate-1.jsonl).

## 3. So với impact

- **Impact ước tính:** khoảng 77 phút/người/tháng (5,16 lượt ôn × giả định tiết kiệm 15 phút/lượt); kịch bản cơ sở tương ứng khoảng 610 giờ/tháng. Cả tần suất tháng lẫn 15 phút tiết kiệm đều chưa được kiểm bằng thử nghiệm dùng sản phẩm. Xem [spec §2](../spec.md#§2-impact--quyết-định-chọn-guide-13) và [tính từng thừa số](../evidence/summary.md#7-impact-tháng).
- **Chi phí token cơ sở:** Claude Haiku khoảng $0.0158/người/tháng; Sonnet $0.3159 và Gemini $0.1185 nếu giữ nguyên lượng token giả định.
- **Kết luận:** nên tiếp tục thử nghiệm theo hướng **iterate**: chi phí token ước tính thấp so với impact thời gian kỳ vọng, nhưng impact chưa được xác nhận bằng dùng thử và độ phủ nhiều ngày đang dưới ngưỡng; chưa đủ căn cứ để kết luận triển khai rộng.

## 4. Giới hạn ước tính

Các con số chỉ tính token model. Chưa gồm máy chủ, lưu trữ, mạng, giám sát, thuế, chi phí vận hành hay giờ công. Kết quả mô hình khác Haiku là ước tính vì dùng lượng token Haiku. Nếu đổi prompt, model, cache, giới hạn lượt gọi hoặc ngày hiệu lực bảng giá, cần tạo lượt mô phỏng mới; giữ nguyên CSV đã chạy.
