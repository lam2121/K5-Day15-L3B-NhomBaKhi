# Tóm tắt mô phỏng simulate-1@20261128-010157

Do `python run.py simulate` sinh ra — không sửa tay. Chép bảng sang `cost/cost-estimate.md`.

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| on_it | 5 | 1 | 4267 | 1743 | 1.0 | 1.0 |
| on_moi_tuan | 27 | 2 | 6917 | 3771 | 1.7 | 1.9 |
| on_thuong_xuyen | 18 | 3 | 9131 | 5311 | 2.2 | 2.9 |

Tỉ lệ đạt dùng để tính: 22/24 (92%) — lượt run-2@20261128-003757

- Tỉ lệ đạt lấy từ lượt nhóm chọn: eval/run-2.csv (--rate-from).

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (300 người) | Chi phí / tháng — cơ sở (470 người) | Chi phí / tháng — cao (700 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| claude-haiku-5-5 (vào 0.1 · ra 0.5 $/1M) | $0.0028 | $0.0031 | $0.0014 | $4.74 | $7.42 | $11.06 | $0.0158 |
| claude-sonnet-5-5 (vào 2.0 · ra 10.0 $/1M) | $0.0561 | $0.0612 | $0.0271 | $94.77 | $148.48 | $221.14 | $0.3159 |
| gemini-3.8-flash (vào 0.75 · ra 3.75 $/1M) | $0.0210 | $0.0230 | $0.0102 | $35.54 | $55.68 | $82.93 | $0.1185 |

- Chi phí / task thành công = chi phí / phiên ÷ tỉ lệ đạt. Chi phí / câu hỏi đạt = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (2.3) ÷ tỉ lệ đạt — tỉ lệ đạt đo theo từng câu thử.
- Token đo trên model: claude-haiku-5-5. Giá tính theo từng model trong bảng — model khác bộ tách token thì số token thật có thể lệch; ghi rõ "đo trên model X, tính giá model Y" trong cost/cost-estimate.md.
- Phiên lỗi (không tính vào trung bình): 0/50.
