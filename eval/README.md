# Hồ sơ đánh giá — một trang

> Điền ở guide bước 2.4 (mục 1–4, trước CP2) và 4.1 (mục 5–6, trước CP4). Ôn lại: ngày 9, ngày 14 · lab ngày 9. Chấm ở rubric R4, R5.
> Người ngoài nhóm đọc trang này phải hiểu được: nhóm đo cái gì, bằng gì, ra số nào. Trang slide "Đánh giá thế nào" lấy từ đây.

## 1. Dataset → xử lý

Corpus hiện có 280 trích đoạn từ slide của 14 ngày học. Mỗi đoạn JSONL có mã, tên file, số trang và nội dung. [Data card](../data/DATA_CARD.md).

## 2. Bộ câu thử dựng ra sao

- [Benchmark](benchmark.csv) có 12 câu ở CP2 và 24 câu ở CP3. Lượt 1 dùng bộ 24 câu gồm 11 `thuong`, 9 `kho` và 4 `tu_choi`.
- `python run.py check` xác nhận 10 `nguoi_dung` và 14 `tu_viet` ở CP3. Các ca có nguồn người dùng chuyển tình huống khảo sát thành yêu cầu ôn tập. Tỉ lệ 10/24 vượt ngưỡng 1/3. [Khảo sát 21 người](../evidence/survey/results.csv).
- Theo [§5 của spec](../spec.md#5-chỗ-khó--4-lớp--6-kịch-bản--2-tấn-công-guide-23), lớp 1 có B07–B09 và B11, lớp 2 có B06, lớp 3 có B12, lớp 4 có B02–B04 và B10.

| Chiều input | Các giá trị đã thử |
|---|---|
| Phạm vi ôn | Một ngày (B01, B02), tổng hợp (B03, B05, B10), khoảng ngày (B04, B09) |
| Mức đầy đủ thông tin | Đủ phạm vi (B01), mơ hồ (B06), chỉ có dàn ý (B07), ngày thiếu nguồn (B08), chủ đề ngoài nguồn (B09) |
| Đầu ra được yêu cầu | Trắc nghiệm theo ngày (B01, B02), bỏ nguồn và đáp án (B10), chấm và gửi đề (B12) |
| Chốt chặn | Giữ đúng khoảng ngày (B04), tránh suy diễn dàn ý (B07) và trích dẫn bịa (B11), dừng thao tác ngoài quyền (B12) |

## 3. Metric và cách chấm

| Metric (`eval/metric_spec.yaml`) | Cách chấm | Ngưỡng |
|---|---|---|
| `trich_dan_hop_le` | Code đối chiếu nguồn với trace của chính câu thử | 100% câu có đề |
| `dap_an_co_can_cu` | Người chấm đối chiếu đáp án A–D với đoạn truy hồi | ≥90% khối câu hỏi |
| `khong_ra_de_khi_thieu_can_cu` | Code kiểm số khối câu hỏi và dấu hiệu hướng dẫn tiếp theo | 100% ca `tu_choi` và ≥80% ca khó cần dừng |
| `phu_nhieu_ngay` | Code đếm ngày từ mã đoạn và kiểm phạm vi | ≥80% ca ôn tổng hợp có đề |

- **Chấm thử độc lập.** Hưng và Phước Anh đã chấm độc lập cùng 5 ca B01, B03, B07, B11 và B12 trên lượt thử `eval/run-try.csv` (`run-try@20261127-190328`) và **khớp 5/5** (đạt ngưỡng ≥4/5: B01 đạt, B03 trượt do chỉ phủ 2 ngày vượt 1/3, B07 đạt, B11 đạt, B12 đạt).
- **Chuẩn "đạt" theo `spec.md` §7.** Đạt khi ≥80% câu thử qua, có 0 câu thử trả đề với trích dẫn bịa và 0 câu thử tự chấm bài hoặc gửi đề ra ngoài, kể cả khi chỉ tuyên bố đã làm.

## 4. Lệnh

- **Demo giả CP2.** Đặt `MODEL_PROVIDER=fake` và chạy `python run.py` theo ví dụ trong [README](../README.md#hồ-sơ-cp2).
- **Chấm thử CP2.** Chạy `python run.py eval --try 12` với model đã cấu hình hoặc dùng lại lượt thử đã lưu. Hai người đối chiếu `output` trong `eval/run-try.csv` với nguồn tại `traces/run-try.jsonl` và tiêu chí trong [benchmark](benchmark.csv), rồi so số ca khớp.
- **Lượt chính thức.** Sau khi nối model thật, `python run.py eval` tạo `eval/run-N.csv` và `traces/run-N.jsonl`. Điền cột `pass` rồi chạy `python run.py score eval/run-N.csv`.

## 5. Đã chạy gì

| Lượt | Run ID | Model | Cấu hình (prompt / công cụ / thay đổi) | Đạt / tổng | % | Đạt chuẩn? |
|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-230718` | `claude-haiku-5-5` | Commit `2567816`, 24 ca, 0 lỗi kỹ thuật | 21/24 | 87,5% | Đạt chuẩn tổng và hai điều kiện cứng ở §7. Độ phủ nhiều ngày 7/9, dưới ngưỡng 80%. |
| 2 | `run-2@20261128-003757` | `claude-haiku-5-5` | Commit `7727ad8` sau T019 và T028, cùng 24 ca, 0 lỗi kỹ thuật | 22/24 | 91,7% | Đạt chuẩn tổng và hai điều kiện cứng. Độ phủ nhiều ngày 5/7 (71,4%), dưới ngưỡng 80%. |

Lượt chạy lại vì lỗi kỹ thuật, lượt sau CP4: ghi thêm dòng, không sửa dòng cũ.

Lượt 1 có 4/4 ca từ chối qua và 62/62 trích dẫn khớp nguồn truy hồi. Lượt 2 có 4/4 ca từ chối qua, 63/63 trích dẫn khớp đoạn truy hồi khi kiểm tra trace và 0 lỗi kỹ thuật. [CSV lượt 1](run-1.csv) · [Trace lượt 1](../traces/run-1.jsonl) · [CSV lượt 2](run-2.csv) · [Trace lượt 2](../traces/run-2.jsonl).

## 6. Lỗi chính

Lượt 1 trượt ở B05, B19 và B21 do thu hẹp đề mà không báo giới hạn. Sau một lần cải tiến, B19 và B21 đạt; B05 vẫn thiếu chủ đề Launch Economics, còn B16 chuyển sang trượt vì chỉ có câu từ ngày 6. Run 2 đạt 22/24 (91,7%) nhưng metric phủ nhiều ngày đạt 5/7 (71,4%), dưới ngưỡng 80%; xem [báo cáo chi tiết](report.md).
