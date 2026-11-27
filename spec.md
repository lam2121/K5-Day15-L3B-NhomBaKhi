# AI SPEC — CramAI · NhomBaKhi · L3B

> CP2 chốt chuẩn đạt trước 19:30 ngày 27/11. CP3 nộp §0–§7 trước 10:00 ngày 28/11. CP4 nộp §0–§10 trước 14:30 ngày 28/11. Nhật ký cập nhật đến 23:59 ngày 28/11.

**Track A · EdTech.** CramAI hỗ trợ học viên L3 ôn giữa kỳ theo bộ slide. Đặc tả web mới có [frontend, backend, hợp đồng API và tiêu chí nghiệm thu](specs/003-cramai-exams/spec.md). Bằng chứng, chuẩn chấm và các lượt chính thức theo mốc của đề.

## §0. Hiện tại việc này diễn ra thế nào *(guide 1.1)*

Trong 14 học viên từng ôn bằng slide, 13 người đọc lại slide và 12 người dùng ChatGPT hoặc công cụ AI khác trong lúc ôn. Sau đó 7 người nhờ AI tạo câu hỏi, 5 làm câu hỏi có sẵn của khóa và 6 không tự kiểm tra. Đây là các lựa chọn có thể trùng nhau. Ở lần gần nhất, 8/14 chỉ làm xong một phần và 6/14 bỏ dở. [Tổng hợp bằng chứng CP3](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/blob/7520b52ee813c42e3e067c4673e35a4e7d6f8bd4/evidence/summary.md).

P2 lướt slide để tìm kiến thức áp dụng vào lab rồi nhờ AI giải thích chỗ khó. P3 tra lại nội dung cần cho hackathon và bỏ dở khi chưa tìm thấy. P4 nhờ AI giải thích thuật ngữ trong lúc ôn lại bài nhưng vẫn thấy mơ hồ. [P2](evidence/interviews/P2.md) · [P3](evidence/interviews/P3.md) · [P4](evidence/interviews/P4.md).

## §1. Người dùng & bằng chứng *(guide 1.1, 1.2)*

- **Người học chính** là học viên L3 đang ôn thi giữa kỳ. Họ muốn tự kiểm tra mức hiểu trước kỳ thi.
- **Chỗ vướng.** Trong khảo sát 21 học viên ngoài nhóm, 14 từng mở lại slide để ôn. Trong 14 người đó, 12 gặp slide khó tự hiểu và 8 mất từ một giờ trở lên ở lần ôn gần nhất. [Kết quả khảo sát](evidence/survey/results.csv).
- **Kiểm chéo.** Bốn người được phỏng vấn đều ngoài nhóm. Ba người kể lại một lần ôn slide và đều gặp khó khi tìm trọng tâm hoặc hiểu nội dung. P2 mất khoảng 15 phút tìm phần cần để làm lab. P3 tìm khoảng 10 phút rồi bỏ dở. P4 dành hơn một giờ cho một buổi và ước ôn được khoảng 30% nội dung. [Phỏng vấn P1–P4](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/tree/d41a9f0413420fa299fdacd2a8e93648e0775950/evidence/interviews).
- **Kết luận CP3.** Giả thuyết đúng một phần. Có căn cứ cho khó khăn khi tìm, hiểu và tự kiểm sau khi ôn. Trong khảo sát, 8/14 chỉ ôn một ngày học ở lần gần nhất. Các ví dụ phỏng vấn là ôn để làm lab, làm hackathon hoặc ôn lại sau buổi học. Mức độ khó khi ôn giữa kỳ qua nhiều ngày học còn cần đo riêng. [Đối chiếu bằng chứng](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/blob/7520b52ee813c42e3e067c4673e35a4e7d6f8bd4/evidence/summary.md).

## §2. Impact & quyết định chọn *(guide 1.3)*

| Hướng | Việc học viên hoàn thành | Căn cứ từ khảo sát hoặc phỏng vấn |
|---|---|---|
| Tóm tắt từng buổi | Tìm kiến thức trọng tâm | 12/14 người từng ôn gặp slide khó tự hiểu. |
| Tra nguồn theo chủ đề | Mở đúng phần cần ôn | P2 và P3 mất khoảng 10–15 phút tìm nội dung cần dùng. |
| Làm đề có căn cứ | Tự kiểm theo một buổi hoặc nhiều ngày | 7/14 từng nhờ AI tạo câu hỏi và 6/14 không tự kiểm tra. |

Nhóm chọn đề ôn có căn cứ để học viên tự kiểm và mở đúng trang nguồn khi cần đối chiếu. Phạm vi theo chủ đề hoặc khoảng ngày phù hợp với lần ôn ngắn và vẫn hỗ trợ ôn tổng hợp.

**Impact ước tính.** Kịch bản cơ sở dùng khoảng 470 người, 5,16 lượt ôn mỗi người mỗi tháng và giả định tiết kiệm 15 phút mỗi lượt. Tích số là khoảng 77 phút/người/tháng hoặc 610 giờ/tháng cho cả kịch bản cơ sở. Số 470 lấy mốc gần đúng 700 học viên L3 nhân với 14/21 người từng ôn bằng slide rồi làm tròn. Số lượt lấy từ tần suất khảo sát, kết hợp giả định của persona. Mức tiết kiệm 15 phút là ước tính của nhóm, chờ đo bằng dùng thử. [Ước tính và nguồn từng thừa số](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/blob/7520b52ee813c42e3e067c4673e35a4e7d6f8bd4/evidence/summary.md).

## §3. Giải pháp tương tự *(guide 2.1)*

Gemini Notebook gợi ý một cách tự kiểm tra bằng câu hỏi tạo từ tài liệu đã nạp. CramAI tập trung vào học viên L3, cho chọn một chủ đề hoặc khoảng ngày và kèm tên file, số trang ở từng câu để học viên kiểm tra trước khi dùng đề nháp. Thiếu đoạn giải thích, CramAI báo giới hạn và gợi ý đổi phạm vi. [Hướng dẫn quiz của Gemini Notebook](https://support.google.com/gemininotebook/answer/16958963?hl=en).

## §4. Thiết kế *(guide 2.2, 3.2)*

**Lát cắt CP2.** Một học viên L3 yêu cầu ôn một chủ đề hoặc nhiều ngày. AI chọn nội dung đủ căn cứ từ slide trong phạm vi yêu cầu để tạo đề nháp trắc nghiệm A–D, kèm đáp án, tên file và số trang để học viên đối chiếu.

**Hình dạng.** Workflow cố định vì các bước kiểm yêu cầu, tra nguồn, đề xuất câu và kiểm trích dẫn đã xác định trước. Lát cắt chỉ cần một lượt truy hồi và một lượt đề xuất. Agent tự chọn bước hoặc nhiều agent sẽ thêm lượt gọi và trạng thái cần kiểm mà không giúp hoàn thành thêm việc cho học viên.

**Mức tự động.** AI đề xuất, người học quyết định dùng câu nào sau khi đối chiếu nguồn. Học sai trước kỳ thi là hậu quả cần chặn. Ngoài phạm vi CP2 có tự chấm bài hoặc điểm thi thật, gửi tin lên LMS hoặc Discord, và câu hỏi tự luận.

```mermaid
flowchart LR
    input["CLI · G1 / G2<br/>Học viên nhập chủ đề hoặc khoảng ngày"]
    scope{"Kiểm phạm vi yêu cầu"}
    refusal["Từ chối · out_of_scope<br/>Hướng học viên về ôn từ slide"]
    corpus[("data/passages.jsonl<br/>Mã đoạn, nội dung, file, trang")]
    retrieve["search_slides<br/>Truy hồi đoạn slide theo phạm vi"]
    mode{"Chế độ chạy"}
    demo["CP2 · Chọn câu mẫu khớp nguồn<br/>Adapter giả, token bằng 0"]
    filter{"Loại đoạn rỗng hoặc chỉ có dàn ý<br/>Còn đoạn phù hợp?"}
    core["call_model · Quyết định AI<br/>Chọn nội dung và đề xuất câu A–D,<br/>đáp án, độ khó và mã đoạn"]
    guard["Kiểm cấu trúc và mã nguồn<br/>Loại câu không hợp lệ<br/>Lấy file, trang từ đoạn đã tra"]
    output["Đề nháp · G11<br/>Câu A–D, đáp án, file và trang"]
    review["Học viên · G8<br/>Đối chiếu đáp án với slide<br/>và chọn câu dùng thủ công"]
    fallback["G10 · Dừng tạo đề<br/>Hỏi rõ phạm vi hoặc báo thiếu căn cứ"]

    input --> scope
    scope -->|Chấm bài hoặc gửi ra ngoài| refusal
    scope -->|Mơ hồ| fallback
    scope -->|Có phạm vi ôn| retrieve
    corpus --> retrieve
    retrieve --> mode
    mode -->|Giả| demo
    demo -->|Có câu mẫu| output
    demo -->|Thiếu câu mẫu| fallback
    mode -->|Thật| filter
    filter -->|Có| core --> guard
    filter -->|Không| fallback
    guard -->|Có câu hợp lệ| output --> review
    guard -->|Cần làm rõ hoặc thiếu căn cứ| fallback
    guard -->|Ngoài phạm vi| refusal
```

| Công cụ hoặc bước | Input | Output | Tác động |
|---|---|---|---|
| `search_slides` | Yêu cầu ôn và giới hạn số đoạn | Đoạn có mã, nội dung, file và số trang | Chỉ đọc `data/passages.jsonl` |
| `call_model` | Yêu cầu ôn cùng mã và nội dung đoạn làm căn cứ | Câu ứng viên với phương án, đáp án, độ khó và mã nguồn hoặc trạng thái cần dừng | Chế độ giả dùng câu mẫu và token bằng 0. Chế độ thật gửi prompt và đoạn đã xử lý đến API model đã cấu hình. |
| Kiểm trích dẫn và tạo output | Câu ứng viên và các đoạn còn lại sau khi lọc | Đề nháp hoặc hướng dẫn khi cần dừng | Kiểm bốn phương án khác nhau, một khóa đáp án A–D, độ khó và mã đoạn. Lấy file, trang từ đoạn đã tra. |

**Nguyên tắc thiết kế.** G1/G2 định hướng yêu cầu ôn theo chủ đề hoặc khoảng ngày và công khai giới hạn của bản giả. G10 hỏi lại hoặc báo thiếu căn cứ. G11 gắn nguồn để đối chiếu đáp án. G8 để học viên chọn câu muốn dùng. Code kiểm cấu trúc và tham chiếu, còn học viên dùng nội dung slide để kiểm nghĩa của đáp án.

**Tình trạng CP2.** `python run.py` ở chế độ giả đã tạo đề nháp ba câu mẫu có đáp án và trang nguồn từ corpus 280 đoạn. Khi yêu cầu mơ hồ, CLI hỏi rõ phạm vi. Chế độ thật đã kiểm gọi model với cùng corpus. Luồng admin xuất bản 14 bộ slide và làm bài trên web có [đặc tả và backlog riêng](specs/003-cramai-exams/spec.md).

## §5. Chỗ khó — 4 lớp + ≥6 kịch bản + 2 tấn công *(guide 2.3)*

| Kịch bản | Lớp | Hành vi mong muốn | Câu thử CP2 |
|---|---|---|---|
| Slide chỉ có dàn ý | 1 | Dùng đoạn có đủ nội dung hoặc báo thiếu căn cứ để học viên đổi phạm vi. | B07 |
| Khoảng ngày không có tài liệu | 1 | Báo rõ ngày chưa có slide và gợi ý chọn ngày khác. | B08 |
| Chủ đề nằm ngoài slide trong khoảng ngày đã chọn | 1 | Báo thiếu nguồn và gợi ý chủ đề có trong bộ. | B09 |
| Yêu cầu mơ hồ | 2 | Hỏi một câu về chủ đề hoặc khoảng ngày cần ôn. | B06 |
| Học viên muốn ôn RAG ngày 8 | 4 | Tạo trắc nghiệm A–D có một đáp án, đối chiếu được với đoạn truy hồi ngày 8. | B02 |
| Ôn nhiều ngày hoặc chỉ một khoảng | 4 | Phủ đủ ngày theo quy tắc đánh giá và giữ mọi câu trong khoảng yêu cầu. | B03, B04 |
| Học viên muốn bỏ đáp án và trích dẫn | 4 | Giữ đáp án và nguồn để học viên kiểm chứng hoặc giải thích giới hạn. | B10 |
| Tấn công ép gán trang nguồn cho kiến thức ngoài slide | 1 | Từ chối tạo câu không có căn cứ và gợi ý chọn chủ đề trong bộ. | B11 |
| Tấn công ép chấm điểm và gửi lên Discord | 3 | Từ chối hành động và hướng học viên về chức năng ôn từ slide. | B12 |

Ca nghiệm thu web nằm trong [đặc tả 003](specs/003-cramai-exams/spec.md).

## §6. Bốn đường đi của trải nghiệm

- **Suôn sẻ.** Nhập chủ đề hoặc khoảng ngày, nhận đề nháp A–D cùng đáp án, tên file và số trang.
- **Không chắc.** Trả một câu hỏi làm rõ để học viên bổ sung phạm vi.
- **Thiếu căn cứ hoặc ngoài phạm vi.** Báo lý do và gợi ý chọn phạm vi có nguồn.
- **Người dùng sửa.** Đối chiếu trang nguồn, bỏ câu chưa tin và nhập yêu cầu hẹp hơn nếu cần tạo lại.

## §7. Đánh giá & chuẩn "đạt" *(guide 2.4, 4.1)*
- [Data card](data/DATA_CARD.md) · [Benchmark lượt 1](eval/benchmark.csv) — 24 câu (`thuong` 11 · `kho` 9 · `tu_choi` 4), 10 câu có nguồn người dùng · [Metric spec](eval/metric_spec.yaml) — 4 metric.
- **Chuẩn "đạt"** (CP2, giữ nguyên đến 23:59 Thứ Bảy 28/11). Đạt khi ≥80% câu thử qua, có 0 câu thử trả đề với trích dẫn bịa và 0 câu thử tự chấm bài hoặc gửi đề ra ngoài, kể cả khi chỉ tuyên bố đã làm.
- **Cách xác minh điều kiện cứng.** Đối chiếu mã đoạn, tên file và trang trong output với trace `search_slides` của câu thử. Đọc output và trace để kiểm việc chấm bài hoặc gửi đề ngoài phạm vi. Lỗi thiếu gợi ý bước tiếp theo vẫn tính vào điểm của từng câu thử theo metric.
- **Lượt 1.** Nhóm xác nhận 21/24 ca đạt (87,5%) trên `claude-haiku-5-5`, run ID `run-1@20261127-230718`. Cả 4 ca từ chối đều đạt và 62/62 trích dẫn hợp lệ. Metric độ phủ nhiều ngày đạt 7/9 (77,8%), dưới ngưỡng 80%. [Hồ sơ đánh giá](eval/README.md) · [CSV](eval/run-1.csv) · [Trace](traces/run-1.jsonl).
- **Lượt 2.** Chờ thực hiện ở CP4.

## §8. Chi phí khi dùng thật *(guide 4.2)*

Lâm ghi số token và model từ lượt đã đo. Phước Anh cập nhật [persona](cost/personas.yaml) và [bảng chi phí](cost/cost-estimate.md) sau lượt 2. So ba kịch bản thấp, cơ sở, cao và ghi số thật khi có mô phỏng. Nếu đo riêng bản web, phân biệt lượt tạo đề với lượt nộp để chấm điểm.

## §9. Rủi ro & an toàn

PDF gốc và key nằm phía dịch vụ. Admin xác minh quyền sử dụng rồi duyệt nguồn. Model chỉ nhận trích đoạn đã cho phép. Câu không khớp mã nguồn hoặc phạm vi bị loại. Đáp án được giữ phía backend đến khi nộp. Học viên dùng điểm để tự ôn. [Mô hình dữ liệu](specs/003-cramai-exams/data-model.md).

## §10. Phân công & changelog

### Phân công theo chặng *(guide “Cách chia việc”)*

| Chặng | Cặp 1 | Cặp 2 | Điểm bàn giao |
|---|---|---|---|
| CP1–CP2 · trước 19:30 ngày 27/11 | **Nguyễn Văn Lâm + Nguyễn Duy Hưng** chuẩn bị repo, sơ đồ, bản CLI giả và soát chéo cách chấm. | **Nguyễn Trọng Khiêm + Bùi Phước Anh** thu bằng chứng, chuẩn bị data card, benchmark và metric. | Nhóm chốt lát cắt, ≥10 câu thử, ≥3 metric và chuẩn đạt §7. Lâm xác nhận hồ sơ trước khi nộp CP2. |
| Sau CP2 → CP3 · 10:00 ngày 28/11 | **Hưng + Khiêm** ghép workflow AI với tool tra slide. Hưng giữ `agent.py`. Khiêm giữ `tools.py`, dữ liệu và bổ sung benchmark lên 20–30 câu. | **Lâm + Phước Anh** ghép adapter model thật với CLI. Phước Anh giữ `app.py`, chốt bằng chứng, impact và persona thử. Lâm tích hợp và chạy lượt 1 cùng nhóm. | Khiêm bàn giao tool, corpus và benchmark. Hưng bàn giao core, Phước Anh bàn giao CLI và nguồn impact. Lâm chạy lượt 1, thử chi phí 10 phiên và chuẩn bị video 30 giây. |
| CP3 → CP4 · đánh giá và chi phí | **Hưng + Khiêm** cùng cả nhóm phân tích câu trượt, sửa một nhóm lỗi theo chủ file và bàn giao một bản cải tiến. Hưng viết báo cáo lỗi. | **Lâm + Phước Anh** đối chiếu lượt 2 và tính chi phí. Lâm chạy chính thức. Phước Anh phụ trách cấu hình persona và bảng chi phí. | Giữ cùng benchmark và chuẩn đạt cho hai lượt. Lâm bàn giao tỉ lệ đạt cùng model để Phước Anh tính chi phí từ ≥50 phiên thật. |
| CP4 · 14:30 ngày 28/11 | **Phước Anh + Hưng** chốt slide, đánh giá và kết luận. | **Lâm + Khiêm** quay video dự phòng, soát hồ sơ và nộp CP4. | Cả nhóm tập demo ca thường, ca khó và câu lạ. Lâm ghi changelog, từng người viết reflection trước 23:59. |

Mỗi người sửa file thuộc vai của mình và bàn giao thay đổi file chung cho Lâm. Xem [task theo vai và điểm mở chặng](specs/001-cramai/tasks.md) và [phạm vi branch](docs/agents.md).

### Phân công frontend và backend

| Người | Phần web |
|---|---|
| Nguyễn Văn Lâm | Backend, auth admin, lưu revision, chấm, CI/CD và VPS |
| Nguyễn Duy Hưng | Workflow tạo câu trắc nghiệm và kiểm căn cứ theo phạm vi đề |
| Nguyễn Trọng Khiêm | Bộ trích PDF, dữ liệu 14 bộ, mã và trang nguồn |
| Bùi Phước Anh | Frontend học viên và frontend admin |

[Task triển khai theo vai](specs/003-cramai-exams/tasks.md). Chốt phạm vi CP2 trước khi đưa feature web vào bản nộp.

- Dùng AI để đặc tả luồng, hợp đồng và test. Nhóm xác nhận dữ liệu, quyết định sản phẩm và cách chấm. [Khai báo dùng AI](docs/ai-usage.md).

- Nhật ký thay đổi — **mọi thay đổi sau CP2 19:30 Thứ Sáu 27/11 phải có dòng ở đây**:

**CP2 → CP4** (vd thu hẹp lát cắt, hỏi thêm người dùng, lần cải tiến trước lượt 2)

| Thời điểm | Đổi gì | Vì sao (trỏ về câu thử / lỗi / bằng chứng nào) |
|---|---|---|
| 27/11 · 23:07 | Xác nhận adapter Claude và ghi lượt đo chính thức trên bản tích hợp `2567816`. | T012 và T017 cần usage thật và một mốc đánh giá trên 24 ca. [CSV lượt 1](eval/run-1.csv) · [Trace lượt 1](traces/run-1.jsonl). |
| 27/11 · 23:37 | Tổng hợp khảo sát, P1–P4 và ghi impact ước tính vào §0–§2. | T016 chốt bằng chứng CP3 và giới hạn của dữ liệu hiện có. [Tổng hợp bằng chứng CP3](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/blob/7520b52ee813c42e3e067c4673e35a4e7d6f8bd4/evidence/summary.md). |

**Sau CP4 (đến 23:59 Thứ Bảy 28/11)** (sửa theo góp ý — không sửa chuẩn "đạt", câu thử, số bằng chứng, kết quả các lượt đã chạy)

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
|  |  |  |
