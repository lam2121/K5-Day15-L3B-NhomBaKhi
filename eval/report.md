# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

Hai lượt dùng cùng bộ 24 câu thử, cùng metric đã khóa tại CP2 và cùng model `claude-haiku-5-5`. Mốc lượt 1 là `2567816`. Artefact lượt 2 được ghi trên nền `7727ad8` sau T019 và T028. [Hồ sơ đánh giá](README.md) · [Commit lưu lượt 2](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/commit/d72650c)

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn đạt |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-230718` | 21/24 | 87,5% | 10/11 | 7/9 | 4/4 | Đạt ngưỡng tổng 80% và hai điều kiện cứng. |
| 2 | `run-2@20261128-003757` | 22/24 | 91,7% | 9/11 | 9/9 | 4/4 | Đạt ngưỡng tổng 80% và hai điều kiện cứng. |

Lượt 2 tăng **1 ca đạt** (khoảng **4,2 điểm phần trăm**) và có **0 lỗi kỹ thuật**. Khi chạy lại bước truy hồi trên mốc lượt 2, cả **63/63 trích dẫn** đều khớp mã đoạn, tên file và trang của các đoạn gửi cho model. Độ phủ nhiều ngày giảm từ **7/9 (77,8%)** xuống **5/7 (71,4%)**, dưới ngưỡng 80% ở cả hai lượt. Mẫu số thay đổi vì lượt 2 hỏi lại ở B19 và B21, nên hai ca này ra khỏi nhóm ôn tổng hợp có đề. [Metric](metric_spec.yaml) · [CSV lượt 1](run-1.csv) · [Trace lượt 1](../traces/run-1.jsonl) · [CSV lượt 2](run-2.csv) · [Trace lượt 2](../traces/run-2.jsonl)

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
- **Kết quả lượt 2.** B19 và B21 chuyển sang đạt. B05 báo thiếu độ phủ và vẫn trượt. B16 chuyển sang trượt.

| Ca | Lượt 1 → lượt 2 | Output lượt 2 (tóm tắt) | Kết quả kiểm |
|---|---|---|---|
| B05 | Trượt → Trượt | 10 câu từ ngày 11, báo phủ 1/2 ngày và gợi ý chọn phần còn thiếu. | Đã báo giới hạn. Đề vẫn thiếu Launch Economics từ ngày 13. |
| B16 | Đạt → Trượt | 4 câu từ ngày 6, báo phủ 1/2 ngày. | Yêu cầu Data Engineering ngày 6 và Embedding, Vector Store ngày 7. Lượt 1 có nguồn cả hai ngày. Lượt 2 thiếu ngày 7. |
| B19 | Trượt → Đạt | Hỏi chọn tối đa 2 ngày trọng tâm hoặc tăng số câu để phủ ít nhất 4 ngày. | Người học được chọn lại phạm vi trước khi sinh đề. Số lần gọi model bằng 0. |
| B21 | Trượt → Đạt | Báo tối đa 12 câu mỗi đề và yêu cầu chọn chủ đề, số câu phù hợp. | Giới hạn được nêu trước khi sinh đề. Số lần gọi model bằng 0. |

Nguồn đối chiếu từng ca nằm trong [CSV đã chấm](run-2.csv) và [trace lượt 2](../traces/run-2.jsonl).

## 4. Còn lại

- **B05.** Khi chạy lại bước truy hồi trên mốc lượt 2, 11/12 đoạn gửi model thuộc ngày 11. Đoạn ngày 13 duy nhất là `day13-p102-s01` về bảo vệ thông tin trong log, thiếu căn cứ trực tiếp cho Launch Economics.
- **B16.** Cùng phép kiểm, 11/12 đoạn thuộc ngày 6. Ngày 7 có một đoạn `day07-p006-s01` và lượt 2 chọn cả bốn câu từ ngày 6.
- **Bàn giao Khiêm.** Đối chiếu B05/B16 với PDF gốc và thử kiểm độ liên quan của các đoạn từ ngày được yêu cầu nhưng ít có mặt trong ngữ cảnh. Khi đọc kết quả, kiểm cả độ phủ lẫn ý nghĩa đáp án để tránh học sai hoặc bỏ sót chủ đề.

## 5. Phát hiện bổ sung về vị trí đáp án

- **Lượt 1.** Đếm 62 câu trắc nghiệm từ 24 ca thử. Vị trí đáp án đúng là A 7, B 31, C 19, D 5. Chọn B cho mọi câu trong lượt này đúng 31/62. Riêng ba câu của B01 có đáp án B, C, B. [CSV lượt 1](run-1.csv)
- **Lượt 2 trước bản trộn.** Đếm được A 9, B 34, C 18, D 2 trên 63 câu. [CSV lượt 2](run-2.csv)
- **Bản sửa riêng sau T019.** Workflow trộn thứ tự bốn lựa chọn và gán lại chữ cái theo nội dung đáp án đúng. Thứ tự có thể tái lập với cùng đề bài và tập phương án. Prompt yêu cầu phương án tự đứng được khi đổi vị trí, và bộ kiểm lọc các mẫu tham chiếu vị trí phổ biến. [PR #23](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/pull/23)
- **Kiểm cục bộ trên đầu ra lượt 1.** Áp dụng bước trộn cho cùng 62 câu cho phân bố A 21, B 13, C 15, D 13. Cả 62 câu giữ đúng nội dung đáp án và mã nguồn.

## 6. Bàn giao CP4

- **T019 cho Lâm.** Ghi §10 hai thay đổi đã tích hợp. PR #16 bổ sung bước hỏi lại và báo giới hạn sau khi B05, B19, B21 trượt ở lượt 1. PR #23 bổ sung bước trộn sau khi phát hiện 31/62 câu của lượt 1 có đáp án B. [PR #16](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/pull/16) · [PR #23](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/pull/23)
- **T024 cho Phước Anh.** Trang đánh giá dùng **21/24 → 22/24** và ghi riêng độ phủ **7/9 → 5/7**. Dùng B19 để minh họa việc chuyển từ đề 2 câu chỉ phủ 2/9 ngày sang câu hỏi chọn ngày trọng tâm hoặc tăng số câu. Nếu đưa kết quả trộn đáp án lên slide, ghi đó là kiểm cục bộ trên 62 câu lượt 1. Ca tập demo gồm B01 (thường), B03 (ôn tổng hợp) và B21 (yêu cầu vượt giới hạn).
- **T025 cho Lâm.** Workflow chỉ gửi các đoạn slide được phép sử dụng, đối chiếu mã nguồn với ngữ cảnh và hỏi lại khi phạm vi vượt giới hạn. Học viên có thể ôn sai nếu đáp án diễn giải lệch hoặc thiếu buổi. CLI hiển thị các câu đủ cấu trúc cùng trang nguồn để người học tra lại. Nhóm đối chiếu nội dung đáp án và độ phủ với slide khi chấm.
- **Khai báo dùng AI.** Hưng dùng Codex để soạn và rà prompt, triển khai luồng hỏi lại và kiểm thử hồi quy. Hưng đối chiếu output và nguồn, chấm độc lập các ca CP2 cùng Phước Anh và kiểm lại số liệu trước khi đưa vào báo cáo.
