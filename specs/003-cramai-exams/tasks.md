# Backlog CramAI Exams

**Chủ feature** Lâm · **Phạm vi** Frontend học viên, frontend admin, backend, nguồn và VPS. [Spec](spec.md) · [Plan](plan.md) · [API](contracts/openapi.json). ID bắt đầu lại theo feature. Dùng [backlog 001](../001-cramai/tasks.md) để theo checkpoint; Lâm duy trì chuẩn chấm ở một nơi.

## Giai đoạn 1 — Chuẩn bị và bàn giao contract

- [ ] T001 **Lâm** tạo khung `backend/`, dependency web riêng, cấu hình SQLite và thư mục dữ liệu ngoài repo. Cả nhóm dùng cùng commit có OpenAPI trước khi mở PR theo vai.
- [ ] T002 [P] **Khiêm** lập nguồn theo 14 bộ, rà quyền sử dụng và bàn giao tập PDF rút gọn hoặc fixture synthetic trong `data/`. Giữ nguyên bản ghi benchmark đã chốt.
- [ ] T003 [P] **Hưng** dùng [contract Python](contracts/core.md) xây bộ sinh đề 5/14 câu trong `codebase/agent.py`, giữ `answer(text)`, kiểm đúng một lựa chọn và nguồn từng bộ.
  - Đã thêm `generate_exam(exam_id, passages_by_slide)` theo contract và giữ `answer(text)`; backend live path đã gọi thành công một lượt Slide 03 và nhận năm câu hợp lệ. Full contract checks vẫn nằm trong T009.
  - Bổ sung tương thích citation `dayNN-pNNN-sNN` cho revision PDF admin đã xuất bản trước khi có document index; ID nguồn gốc được giữ nguyên. PDF upload mới tiếp tục dùng `dayNN-dNN-pNNN-sNN`.

## Giai đoạn 2 — US2 · Admin chuẩn bị và xuất bản (P1)

- [ ] T004 [P] [US2] **Khiêm** viết trích PDF theo `SlidePassage` trong `codebase/tools.py`, bàn giao cách kiểm PDF hỏng, thiếu lớp văn bản và mã đoạn cho Lâm.
- [x] T005 [US2] **Lâm** trong `backend/` triển khai 14 vị trí, HTTP Basic admin, nhập draft có giới hạn, preview và publish nguyên tử theo `AdminList`, `AdminDetail`, `PublishRequest`. PDF gốc ở volume riêng; API chỉ trả ảnh từng trang theo citation.
- [ ] T006 [P] [US2] **Phước Anh** trong `frontend/admin/` làm màn hình danh sách, chọn bộ, tải PDF, xem bản nháp, xuất bản và báo lỗi theo `AdminDetail`.

## Giai đoạn 3 — US1 · Chọn, làm và chấm đề (P1)

- [ ] T007 [US1] **Lâm** trong `backend/` triển khai `CatalogResponse`, `AttemptResponse`, `SubmissionResponse`, snapshot, thời hạn và chấm điểm. Kiểm đúng số câu và khóa đáp án trước khi trả DTO.
  - Luồng `POST /api/v1/attempts` chọn model thật khi `MODEL_PROVIDER` không phải `fake`, giữ generator giả cho offline mode, kiểm số lượng/độ phủ và chỉ trả câu hỏi cùng phương án trước khi nộp. Một lượt Slide 03 dùng `.env` bị ignore ở checkout gốc trả `mode=live`, năm câu, không lộ đáp án hoặc citations trước khi nộp. Key không được chép vào worktree; kiểm HTTP đầy đủ vẫn thuộc T009.
- [ ] T008 [P] [US1] **Phước Anh** trong `frontend/student/` làm danh mục, loading, form làm bài và màn hình kết quả. Dùng mẫu `AttemptResponse` và `SubmissionResponse` trước khi ghép backend.
- [ ] T009 [US1] **Lâm** ghép và thêm `tests/test_web_exams.py`. Kiểm đủ 15 mục, kích hoạt đề giữa kỳ, số câu và phủ đủ bộ, quyền admin, chặn khóa đáp án, nộp trùng, hết hạn, cập nhật slide và lỗi model. Cả nhóm demo hai phạm vi.

## Giai đoạn 4 — US3 · CI/CD và phát hành VPS (P2)

- [ ] T010 [P] [US3] **Lâm** trong `deploy/` định nghĩa reverse proxy, service, HTTPS, đường dẫn dữ liệu, giới hạn lưu lượng và khôi phục theo SHA.
- [ ] T011 [US3] **Lâm** mở rộng `.github/workflows/ci.yml` để kiểm hợp đồng, smoke web và đóng gói cùng commit. Giữ các lệnh CLI/eval/simulate.
- [ ] T012 [US3] **Lâm** triển khai khi có quyền VPS, tài liệu được phép và cấu hình model. Ghi SHA và kết quả nghiệm thu, chấm bài và kiểm khôi phục trong `deploy/README.md`.

## Giai đoạn 5 — US4 · Giải thích và xem trang nguồn sau khi chọn (P1)

- [x] T013 [US4] **Lâm + Phước Anh** sau mỗi lựa chọn, hiện ngay đúng/sai và đáp án đúng từ snapshot qua endpoint check không gọi model; thêm nút giải thích tùy chọn gọi model và mở trang nguồn. Snapshot toàn văn trang, render đúng trang PDF riêng thành PNG. PDF gốc nằm trong volume Docker `/data/slides`, không phục vụ công khai; fallback hiển thị toàn văn trích xuất và nói rõ khi ảnh gốc chưa có. Đồng bộ OpenAPI, kiểu frontend, mock và hướng dẫn lưu trữ.

- [x] T014 [US2] **Lâm** phân tích biểu đồ/sơ đồ bằng PDF Vision một lần trong luồng upload admin, lưu tóm tắt theo file/trang trong revision và dùng lại khi sinh đề/giải thích. Giữ PDF gốc trong volume riêng, không ghi nội dung vào trace và báo lỗi upload nếu provider Vision không hoàn tất.
  - Hoàn tất adapter inline cho Anthropic, Gemini và OpenAI; PDF được chia thành phần 80 trang, summary lưu cùng passage và đưa vào context tạo đề/giải thích. Kiểm cú pháp Python, OpenAPI JSON và phạm vi; chưa thử upload PDF thật.

## Phụ thuộc và điều kiện ghép

T002, T003, T004 và frontend làm song song từ contract. T005 cần T001/T004, T007 cần T003/T005, T009 ghép cả hai frontend với API. Web dùng để demo khi đã nghiệm thu luồng đầu cuối. Các mốc của hackathon tiếp tục bám commit CP2, chỉ đưa web vào hồ sơ khi phạm vi được nhóm chốt và phù hợp quy định. Các run cũ giữ nguyên.

Nếu nhóm chọn phạm vi admin và danh mục cho hồ sơ CP2, Phước Anh cập nhật `canvas.md` trên branch của mình theo T007 trong feature 001. Lâm chốt hồ sơ chung dựa trên bản nhóm đã duyệt.
