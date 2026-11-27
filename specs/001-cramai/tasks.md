# Tasks — CramAI · NhomBaKhi

Các cặp cùng chịu trách nhiệm theo từng chặng ở [§10 của spec nộp bài](../../spec.md#10-phân-công--changelog). Tên in đậm là đầu mối bàn giao, tên người viết từng file theo [bảng quyền sửa](../../docs/agents.md). Lâm cập nhật checklist khi tích hợp. Đầu vào là [đặc tả](spec.md), [kế hoạch](plan.md) và [hợp đồng v1](contracts/cramai.md).

**Phụ trách** gồm Nguyễn Văn Lâm (Lâm), Nguyễn Duy Hưng (Hưng), Nguyễn Trọng Khiêm (Khiêm) và Bùi Phước Anh (Phước Anh). `[P]` đánh dấu việc có thể chạy song song với việc khác ở cùng chặng khi đã có đầu vào, trên các file khác nhau.

## Giai đoạn 1 — Khám phá và chuẩn bị · CP1, 17:00 ngày 27/11

- [x] T001 [P] **Lâm** kiểm đúng format `TEAMS.md`, đội trưởng ở dòng 1 và repo GitHub công khai khi kiểm tra không đăng nhập. `python run.py check` xác nhận 4 thành viên.
- [x] T002 [P] **Khiêm** cùng nhóm ghi và commit giả thuyết, dấu hiệu kiểm chứng và nguồn dự kiến trong `evidence/hypothesis.md` trước khi thu thập. Mỗi thành viên phỏng vấn ít nhất một học viên hoặc tự đào một câu hỏi trên dữ liệu. Theo Canvas, hẹn ít nhất ba học viên L3 ngoài nhóm từ hai nhóm khác, hỏi lần ôn thật trong một tháng qua (10–15 phút), ghi từng bản ẩn danh ở `evidence/interviews/P1.md`, `P2.md`, `P3.md`. Lấy số và một trích dẫn đầu để soát trước CP2, hoàn tất thu thập trước CP3.
  - Nhóm xác nhận đã hoàn thành phỏng vấn P1–P4 và cả bốn đều ngoài nhóm. Có bốn bản ghi ẩn danh và khảo sát 21 người. [Giả thuyết](../../evidence/hypothesis.md) · [Phỏng vấn P1–P4](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/tree/d41a9f0413420fa299fdacd2a8e93648e0775950/evidence/interviews).
- [x] T003 **Phước Anh** cùng cả nhóm hoàn thiện bảy dòng `canvas.md` sau khi T002 đã ghi giả thuyết và nguồn dự kiến. Lâm nộp CP1 với Track A, mô tả pain 1–2 câu không dùng chữ AI, lát cắt dự kiến một câu và link repo công khai.

## Giai đoạn 2 — Thiết kế và khung đánh giá · CP2, 19:30 ngày 27/11

- [x] T004 **Hưng** sau 20 phút cả nhóm tổng hợp bằng chứng ban đầu ở T002, cùng Phước Anh so ít nhất ba hướng, ghi lý do chọn và giữ các hướng loại để Lâm cập nhật `spec.md` §2–§4. So giải pháp tương tự, rồi chốt một người dùng, một việc, một quyết định AI và một kết quả demo được trong hai phút. Bàn giao sơ đồ có lý do chọn hình dạng và mức tự động, ít nhất ba việc ngoài phạm vi, hợp đồng công cụ, điểm người duyệt, chỗ chặn rủi ro lớn nhất và ít nhất ba nguyên tắc gắn vào sơ đồ, gồm G10.
- [x] T005 [P] **Khiêm** kiểm nguồn PDF và ghi nguồn, phiên bản, số đoạn, cách xử lý và ẩn danh trong `data/DATA_CARD.md`. Repo công khai chỉ chứa trích đoạn ngắn của tài liệu khoá hoặc nội dung tự dựng, giữ tên file và số trang để kiểm chứng khi có nguồn thật. Dữ liệu giả lập ghi nhãn, cách sinh và seed nếu sinh bằng script.
- [x] T006 [P] **Hưng** thay luồng ví dụ bằng luồng CramAI chạy với fixture giả `tests/fixtures/cramai_demo.json` và adapter giả trong `codebase/agent.py`, tạo `AnswerResponse` qua `make_response` theo [hợp đồng v1](contracts/cramai.md). Lâm kiểm luồng bằng `python run.py`.
- [x] T007 [P] **Phước Anh** cùng Khiêm mô tả bốn lớp lỗi, ít nhất sáu kịch bản và thêm hai tình huống thử chỗ chặn rủi ro để Lâm cập nhật `spec.md` §5–§6. Mỗi kịch bản chỉ ra sản phẩm nói gì, hiện gì, người dùng làm gì tiếp và trỏ về ít nhất một câu thử. Cập nhật `canvas.md` với số và trích dẫn đầu, lát cắt đã chốt và 1–3 dòng thay đổi từ CP1.
- [x] T008 **Khiêm** từ T005 và T007 thay ba dòng ví dụ trong `eval/benchmark.csv` bằng ít nhất 10 câu của nhóm, đủ sáu cột `id,input,expected,pass_criterion,type,source`, ít nhất năm `kho`, hai `tu_choi` nhắm chỗ chặn rủi ro và ≥1/3 từ `nguoi_dung` hoặc `data_that`. Dùng lưới 3–5 chiều để soát độ phủ, bàn giao nguồn và cách dựng để Lâm điền `eval/README.md`.
- [x] T009 **Phước Anh** cùng Khiêm chạy tay 10–20 input bằng prompt nháp, nhóm lỗi rồi viết ít nhất ba metric trong `eval/metric_spec.yaml` với định nghĩa kiểm được, cách chấm và ngưỡng. Hưng review từ cặp còn lại, chấm độc lập cùng Phước Anh trên 5 output. Bàn giao mức khớp cho Lâm ghi vào `eval/README.md`, sửa định nghĩa nếu dưới 4/5.
- [x] T010 **Lâm** soát chéo T004–T009 và chạy `python run.py check`. Kiểm Phước Anh đã cập nhật `canvas.md` bằng số bằng chứng đầu, một trích dẫn, lát cắt đã chốt và 1–3 dòng thay đổi từ CP1. Commit chuẩn đạt ở `spec.md` §7 gồm tỉ lệ đạt và điều kiện cứng do nhóm chốt trước 19:30. Nộp CP2 với tiến độ thu bằng chứng, link spec và benchmark.

Hồ sơ CP2 và lệnh demo giả đã tập hợp tại [README](../../README.md#hồ-sơ-cp2). T009 đã chốt kết quả chấm độc lập khớp 5/5 trên 5 ca (`B01, B03, B07, B11, B12`). Đội trưởng tích hợp vào `main` và nộp CP2 (T010). [Chi tiết kiểm tra](../../eval/README.md).

### Phân công sau CP2

Mở chặng dưới đây khi T010 hoàn tất và cả nhóm có commit CP2 để làm mốc. Chuẩn đạt và metric đã chốt giữ nguyên. Benchmark chỉ bổ sung đến trước lượt 1, rồi dùng đúng bộ đó cho cả hai lượt chính thức.

| Vai | Đến CP3 | Đến CP4 |
|---|---|---|
| **Nguyễn Văn Lâm** · tích hợp | Ghép PR theo thứ tự nguồn → AI → CLI, xác minh adapter bằng một cuộc gọi thật (T012), chạy lượt 1 và thử 10 phiên (T017), chuẩn bị video 30 giây và nộp CP3 (T018). | Chạy lượt 2 sau khi nhận bản cải tiến (T021), chạy mô phỏng ≥50 phiên (T022), cập nhật file hồ sơ chung, kiểm video và nộp CP4 (T023, T025). |
| **Nguyễn Duy Hưng** · workflow AI | Ghép tool và adapter trong `codebase/agent.py`, kiểm đầu ra có nguồn và ca thiếu căn cứ, bàn giao core cho Lâm (T014). | Dẫn phân tích lỗi lượt 1, sửa phần AI nếu lỗi thuộc workflow, bàn giao bản cải tiến, viết `eval/report.md` và cung cấp số liệu cho slide (T019, T021, T024). |
| **Nguyễn Trọng Khiêm** · dữ liệu và câu thử | Bàn giao `tools.py`, corpus và data card (T011). Bổ sung benchmark đủ 20–30 câu và báo mốc hoàn thành trước lượt 1 (T015). | Đối chiếu lỗi với nguồn, sửa tool nếu được chọn trong lần cải tiến và bàn giao đúng ca cần kiểm (T019). Chuẩn bị cảnh quay video với Lâm (T023). |
| **Bùi Phước Anh** · trải nghiệm và sản phẩm | Hoàn thiện `app.py` theo fixture (T013), `evidence/summary.md` và số impact (T016). Chuẩn bị cấu hình persona tối thiểu để Lâm thử 10 phiên (T017). | Hoàn thiện `cost/personas.yaml` (T020), `cost/cost-estimate.md` từ tỉ lệ đạt lượt 2 (T022) và slide (T024). |

**Phạm vi web.** Admin xuất bản 14 bộ slide. Học viên chọn đề và làm bài trong [feature web 003](../003-cramai-exams/spec.md). Backlog này giữ phần CLI, benchmark và các hạng mục nộp CP2–CP4.

## Giai đoạn 3 — US1 · Ôn giữa kỳ bằng đề có căn cứ từ slide · CP3, 10:00 ngày 28/11

**P1 · MVP theo Canvas chốt tại CP2.** Học viên L3 đang ôn giữa kỳ nhận đề luyện tập nháp với câu hỏi AI chọn từ slide, kèm đáp án, nhãn độ khó và trích dẫn tên file, số trang. Corpus bám các ngày học trong phạm vi chốt, mỗi ngày có thể gồm nhiều file. Chỉ dùng đoạn đủ nội dung làm căn cứ.

**Kiểm tra độc lập.** Chạy `python run.py` với bộ slide được phép dùng. Đối chiếu độ phủ của đề, xác minh đáp án và trích dẫn trên PDF gốc, rồi thử bỏ một câu trước khi chốt. Chạy thêm một input thiếu căn cứ và kiểm tra hệ thống yêu cầu bổ sung hoặc thu hẹp kết quả.

- [x] T011 [P] [US1] **Khiêm** xử lý các slide trong phạm vi T004. Giữ PDF gốc trong `data-private/` cục bộ, đưa vào `data/passages.jsonl` phần trích được phép để người ngoài chạy lại. Triển khai `search_slides` dùng kiểu `SlidePassage` theo [mô hình dữ liệu](data-model.md), giữ `@tool` trong `codebase/tools.py`, bàn giao ví dụ và cập nhật `data/DATA_CARD.md`.
  - Đã bàn giao 280 đoạn trên 14 ngày và kiểm truy hồi trong lượt 1. [PR #9](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/pull/9) · [Data card](../../data/DATA_CARD.md).
- [x] T012 [P] [US1] **Lâm** xác minh adapter `ModelResponse` đã có trong `codebase/ai.py` bằng cấu hình `.env` cục bộ và một cuộc gọi thật theo `docs/connect-model.md`. Bàn giao tên model, token vào và ra cho Hưng.
  - Xác nhận ngày 27/11 trên bản tích hợp `2567816` với `claude-haiku-5-5`, 22 token vào và 37 token ra cho prompt kiểm tra adapter. Ba ca thử T017 tiếp theo đều ghi nhận usage dương.
- [x] T013 [P] [US1] **Phước Anh** dùng giao diện dòng lệnh hiện có ở `codebase/app.py` để học viên xem đáp án, độ khó, trích dẫn, chỗ thiếu căn cứ và duyệt hoặc bỏ câu theo T004 và T007. Đọc `QuizResult` và các `question_id` theo [mô hình dữ liệu](data-model.md), kiểm độc lập bằng fixture. Bàn giao cách chạy `python run.py` để Lâm cập nhật `README.md`.
- [x] T014 [US1] **Hưng** tích hợp công cụ và adapter T011–T012 trong `codebase/agent.py`. AI thật chọn câu từ trích đoạn đủ căn cứ và theo độ phủ trong phạm vi học viên yêu cầu. Dựng `QuizQuestion` có nhãn độ khó và `AnswerResponse` theo [mô hình dữ liệu](data-model.md). Giải mã nguồn bằng `resolve_citations`, xử lý thiếu căn cứ theo G10. Token và lỗi kỹ thuật do adapter T012 và runner ghi. Chạy bản thử riêng, không kết nối LMS, Discord hoặc pre-class.
  - Workflow đã merge và chạy hết 24 ca với Claude thật. Độ phủ nhiều ngày đạt 7/9 ở lượt 1, dưới ngưỡng 80%. [PR #12](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/pull/12) · [Lượt 1](../../eval/run-1.csv).
- [x] T015 [P] [US1] **Khiêm** sau T011 bổ sung `eval/benchmark.csv` lên 20–30 câu, giữ tỉ lệ nguồn thật và các loại câu theo T008. Đối chiếu các đáp án và trang trích dẫn với PDF gốc. Giữ nguyên các câu đã chốt và chỉ thêm câu mới trước lượt 1.
  - Đã kiểm 12 ca CP2 được giữ nguyên và thêm 12 ca trước lượt 1. Bộ 24 ca có 10 ca nguồn người dùng, 9 ca khó và 4 ca từ chối. [PR #10](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/pull/10) · [Benchmark](../../eval/benchmark.csv).
- [x] T016 [P] [US1] **Phước Anh** cùng nhóm dành 30 phút chốt `evidence/summary.md` và bàn giao nội dung §0–§2 cho Lâm cập nhật `spec.md`. Ghi ít nhất một nguồn đạt ngưỡng, năm ví dụ hoặc trích dẫn có nguồn đã ẩn danh, số phỏng vấn dạng x/n và giả thuyết đúng, sai hay cần đổi. Khiêm so tín hiệu `data/preclass/` với phỏng vấn. Nếu dùng làm nguồn R1, Khiêm định nghĩa mẫu số và bộ lọc trước khi đếm, lưu cách chạy lại cùng x/N và % trong `evidence/data-mining.md`. Log pre-class chỉ đo hành vi trên pre-class. Tính impact tháng và lưu số lần dùng cho persona, chỉ ra nguồn hoặc ghi tự ước tính cho từng thừa số. Mô tả hệ thống hiện tại có nguồn hoặc ghi “chưa kiểm”.
  - Đã tổng hợp khảo sát 21 người và P1–P4, có trích dẫn ẩn danh, kết luận giả thuyết và impact ghi rõ giả định. Nội dung đã đưa vào §0–§2. [Summary CP3](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/blob/7520b52ee813c42e3e067c4673e35a4e7d6f8bd4/evidence/summary.md) · [Spec](../../spec.md).
- [x] T017 [US1] **Lâm** sau T013–T015 chạy `python run.py eval --try` thấy token > 0, rồi chạy lượt 1 cùng nhóm. Chấm `pass` từng câu theo metric và chạy `python run.py score eval/run-1.csv`. Giữ file lượt chạy, trace, model, token và run ID. Phước Anh sở hữu `cost/personas.yaml` và bàn giao cấu hình chạy thử. Lâm chạy 10 phiên bằng `python run.py simulate --try`.
  - Lượt `run-1@20261127-230718` chạy 24/24 ca trên commit `2567816` với `claude-haiku-5-5`, 0 lỗi kỹ thuật. Nhóm xác nhận 21/24 ca đạt, 4/4 ca từ chối qua và độ phủ nhiều ngày đạt 7/9 ca. [CSV lượt 1](../../eval/run-1.csv) · [Trace lượt 1](../../traces/run-1.jsonl).
  - `simulate-try@20261127-231207` chạy đủ 10 phiên với persona của Phước Anh tại `8559a5e`, seed 42, đo bằng `claude-haiku-5-5` và lấy tỉ lệ từ `eval/run-1.csv`. Ghi 77.957 token vào, 42.942 token ra và 0 phiên lỗi. CSV, tóm tắt và trace thử lưu cục bộ theo quy ước của bộ chạy.
- [ ] T018 [US1] **Lâm** sau T016–T017 ghi kết quả lượt 1 vào `eval/README.md` và `spec.md` §7. Quay video 30 giây thao tác thật và AI thật, chia sẻ bằng YouTube không công khai hoặc Drive mở bằng link, rồi kiểm ẩn danh. Nộp CP3 với link `evidence/summary.md`, `spec.md` đã commit đủ §0–§7, video, x/N và run ID, khai rõ phần còn thiếu.
  - Đã chốt §0–§2, điểm 21/24 và run ID. Còn video 30 giây, kiểm truy cập ẩn danh và xác nhận nộp. [Hồ sơ đánh giá](../../eval/README.md).

## Giai đoạn 4 — Cải tiến, chi phí và demo · CP4, 14:30 ngày 28/11

- [ ] T019 [P] **Hưng** cùng nhóm đọc câu trượt của T017 và đặt tên nhóm lỗi. Hưng sửa `codebase/agent.py` hoặc bàn giao cho Khiêm sửa `codebase/tools.py` trên branch của Khiêm nếu lỗi nằm ở nguồn. Giới hạn một lần cải tiến nhắm nhóm lỗi lớn nhất và gửi lý do để Lâm ghi `spec.md` §10.
- [ ] T020 [P] **Phước Anh** cùng Lâm hoàn thiện `cost/personas.yaml` với seed cố định, ít nhất ba kiểu dùng có tỉ trọng và số lần dùng mỗi tháng, quy mô người dùng L3 có nguồn, các giả định ghi rõ. Ghi giá trả phí ở hai mức model trở lên, kèm link và ngày xem.
  - Đã có seed, ba persona và ba mức giá có link và ngày xem. Còn ghi nguồn quy mô L3 từ tài liệu Track A của đề vào file cấu hình. [Persona](../../cost/personas.yaml).
- [ ] T021 **Hưng** bàn giao bản cải tiến T019 cho Lâm chạy lượt 2 trên nguyên bộ câu thử của lượt 1. Cả nhóm chấm, Lâm ghi run ID, model, cấu hình và điểm vào `eval/README.md` cùng `spec.md` §7. Trong `eval/report.md`, ghi ít nhất ba lỗi với input, output và lý do sai, thay đổi đã làm và lỗi còn lại. Nếu lượt 2 giảm điểm, báo số thực tế.
- [ ] T022 **Lâm** sau T020–T021 chạy `python run.py simulate --rate-from eval/run-2.csv` với đúng model đã đo trong lượt 2 và đúng file lượt 2 thực tế. Lưu ≥50 phiên, token, số lần gọi và thời gian trong `cost/simulate-N.csv`. Phước Anh dùng tỉ lệ đạt đã chấm để tính chi phí mỗi task thành công ở `cost/cost-estimate.md`, tính ba kịch bản tháng thấp, cơ sở, cao và so chi phí mỗi người mỗi tháng với impact §2. Lâm nhận số để cập nhật `spec.md` §8. Nếu dùng token đo trên một model để tính theo bảng giá model khác, ghi rõ đó là ước tính.
- [ ] T023 [P] **Khiêm** sau T021 cùng Lâm quay video dự phòng với một tình huống thường và một tình huống khó, thao tác và đầu ra model thật. Lâm kiểm liên kết bằng cửa sổ ẩn danh và ghi vào `README.md`.
- [ ] T024 **Phước Anh** cùng Hưng sau T022 hoàn thiện tám trang theo `slides/outline.md` và xuất `demo-slides.pdf`, mỗi trang có ít nhất một số, trích dẫn có nguồn hoặc kết quả đo. Cả nhóm chốt go, iterate hoặc stop, tập một ca thường, một ca khó và một input lạ. Mỗi người trình bày ít nhất một phần.
- [ ] T025 **Lâm** sau T022–T024 soát bảy hạng mục và commit hồ sơ CP4. Hưng và Khiêm bàn giao dữ liệu, giới hạn hành vi, người có thể bị hại và cách chặn để Lâm ghi `spec.md` §9. Cả nhóm ghi 2–3 dòng về cách dùng AI và phần người kiểm trong `docs/ai-usage.md` và §10. Nộp phòng demo, link repo, kết quả lượt 1 → lượt 2, chi phí mỗi task thành công ở kịch bản cơ sở kèm model, slide, video và phần còn thiếu.
- [ ] T026 **Lâm** rà commit cuối trước 23:59 ngày 28/11. Mỗi người viết `reflection/<ten-khong-dau>.md` về phần mình làm, AI hỗ trợ thế nào và bài học từ một câu trượt. Mỗi người gửi giờ, nội dung và lý do cho mọi sửa sau CP4 để Lâm ghi `spec.md` §10. Giữ nguyên chuẩn đạt, bộ câu thử, số bằng chứng và kết quả các lượt đã chạy. Chạy thêm thì tạo lượt mới.

## Hạ tầng tích hợp

- [x] T027 [P] **Lâm** thiết lập `.github/workflows/ci.yml` để kiểm thử PR, kiểm phạm vi vai và đóng gói commit trên `main`. Xác minh lượt GitHub Actions đầu tiên và tài liệu tải bản bàn giao trong `docs/ci-cd.md`. Làm song song với chuẩn bị CP2.
  - Đã kiểm job `Role scope` trên PR và gói ZIP kèm checksum do CI tạo trên `main`. [CI PR #11](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/actions/runs/46030109366) · [Gói bàn giao trên `main`](https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi/actions/runs/46033324155) · [Hướng dẫn tải](../../docs/ci-cd.md).

## Thứ tự và điểm bàn giao

- Trước CP2, Hưng bàn giao hợp đồng ở T004 để Khiêm làm dữ liệu, Phước Anh làm đường đi trải nghiệm và hai cặp review chéo. T005 có thể làm song song với T004. T006 và T007 có thể làm song song sau T004.
- Sau CP2, chạy T011, T012 và T013 song song. T011 và T012 bàn giao cho T014. Lâm chỉ chạy lượt 1 sau khi luồng, giao diện và bộ câu thử đã ghép xong.
- Sau CP3, T019 và T020 chạy song song. T022 cần kết quả chấm của T021 để tính chi phí mỗi task thành công. Chuẩn đạt và metric đã chốt tại CP2 áp dụng cho cả hai lượt.
- Trước mỗi checkpoint 15 phút, cả nhóm rà mạch pain, impact, giải pháp, đánh giá và chi phí. Mỗi người biết chạy `eval` và `simulate` và giải thích được một câu trượt.
- Nếu còn thời gian trước CP4, Khiêm và Phước Anh điều phối 2–3 học viên ngoài nhóm dùng thử bản đã chạy. Ghi quan sát, trích dẫn, mức độ nghiêm trọng và quyết định sửa hoặc giữ trong `validation/log.md`. Việc này tính vào mục Bonus của rubric, theo guide 4.3.
