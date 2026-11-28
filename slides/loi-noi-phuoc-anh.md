# Lời nói cả deck: Bùi Phước Anh trình bày một mình

Phước Anh đại diện nhóm nói cả 8 trang của `demo-slides.pdf`, tổng khoảng **5 phút**. Những chữ **in đậm** là con số cần nói rõ. Số liệu lấy từ `evidence/summary.md`, `eval/report.md`, `eval/run-2.csv`, `cost/cost-estimate.md` và `cost/simulate-1-summary.md`; phần web lấy từ `specs/003-cramai-exams/` và code `backend/`, `frontend/`.

| Trang | Nội dung | Thời gian |
|---|---|---|
| 1 | Mở đầu | 15 giây |
| 2 | Pain | 35 giây |
| 3 | Luồng sản phẩm | 35 giây |
| Demo | Web chạy trực tiếp (tuỳ chọn) | 60 giây |
| 4 | Ca B01, B21, B12 | 30 giây |
| 5 | Đánh giá | 35 giây |
| 6 | Chi phí | 35 giây |
| 7 | Kết luận | 30 giây |
| 8 | Bước tiếp theo | 20 giây |

Nếu không demo trực tiếp, bỏ đoạn Demo và nói chậm hơn ở trang 3–5.

## Trang 1: CramAI — Ôn slide, biết sai ở đâu

> Chào mọi người, mình là Phước Anh, đại diện NhomBaKhi gồm Lâm, Hưng, Khiêm và mình. Sản phẩm của nhóm là **CramAI**: tạo đề luyện tập từ chính slide khoá học, mỗi câu kèm đáp án và trang slide để học viên tự kiểm.

## Trang 2: Chỗ vướng khi ôn lại slide

> Nhóm khảo sát **21 học viên** ngoài nhóm, **14 người** từng ôn bằng slide. Trong 14 người đó, **12 người** gặp slide khó tự hiểu, **6 người** bỏ dở lần ôn gần nhất, và **7 người** đã tự nhờ AI tạo câu hỏi.
>
> Bốn buổi phỏng vấn cho thấy cùng một chuyện: có người tìm khoảng **10 phút** rồi bỏ dở vì không tìm được nội dung cần.
>
> Vậy vấn đề không phải thiếu tài liệu, mà là ôn xong không biết mình sai ở đâu, và sai thì phải đọc lại trang nào.

Chuyển trang: "CramAI giải quyết bằng cách gắn mỗi câu hỏi với một trang slide."

## Trang 3: Mỗi câu hỏi có trang để đối chiếu

> Luồng có bốn bước.
>
> Một, **admin** tải PDF slide lên, xem trước các đoạn trích rồi mới xuất bản. Học viên chỉ nhận đề từ slide đã duyệt.
>
> Hai, **model** tạo câu A–D chỉ từ các đoạn thuộc đúng bộ slide học viên chọn.
>
> Ba, **backend** kiểm cấu trúc, số câu và mã đoạn nguồn trước khi lưu đề. Nếu slide không đủ nội dung, hệ thống từ chối ra đề chứ không bịa cho đủ câu.
>
> Bốn, học viên chọn đáp án, thấy đúng sai ngay, rồi mở lời giải kèm trang slide khi cần.
>
> Mỗi bộ slide cho đề **5 câu**. Khi đủ 14 bộ đã xuất bản thì mở **đề giữa kỳ 14 câu**, mỗi bộ một câu.

Chuyển: "Mình cho mọi người xem bản web đang chạy." (Nếu không demo: "Đây là một câu cụ thể.")

## Demo trực tiếp (tuỳ chọn, khoảng 60 giây)

Mở sẵn `http://127.0.0.1:8000` trước khi lên trình bày.

1. **Thực đơn 14 bộ slide.** "Đây là 14 bộ slide của khoá, bộ nào đã được admin xuất bản thì chọn được."
2. **Chọn một bộ, ví dụ Prompt Engineering & Tool Calling.** "Hệ thống tạo 5 câu từ đúng bộ này."
3. **Chọn một đáp án.** "Chọn xong là biết đúng hay sai, và không đổi được nữa, để học viên không thử lần lượt từng phương án."
4. **Bấm xem lời giải, mở trang nguồn.** "Lời giải chỉ gọi model khi học viên cần, và kèm ảnh trang slide gốc để đối chiếu."
5. **(Nếu còn thời gian) mở `/admin`.** "Admin tải PDF vào bản nháp, xem đoạn trích, rồi mới xuất bản. Bài học viên đang làm vẫn chấm theo bản cũ."

Nếu mạng hay model lỗi: nói "Phần này nhóm có video dự phòng" rồi chuyển sang trang 4, không cố sửa trên sân khấu.

## Trang 4: Từ một câu sai tới trang nguồn

> Đây là ca **B01** từ lượt đánh giá: hỏi về vòng lặp Tool Calling. Đáp án đúng là **B**, và hệ thống chỉ ra **trang 74** của slide Prompt Engineering & Tool Calling, kèm mã đoạn để kiểm.
>
> Hai ca giới hạn: **B21** xin **120 câu**, hệ thống báo tối đa **12 câu** mỗi đề và hỏi lại. **B12** đòi gửi đề thật lên Discord, hệ thống từ chối. CramAI chỉ tạo đề ôn, không tự chấm bài thi và không gửi gì ra ngoài.

## Trang 5: Lượt 2 đạt 22/24 ca thử

> Nhóm chạy hai lượt trên cùng **24 ca** thử, model Claude Haiku 5.5. Lượt 1 đạt **21/24**, lượt 2 đạt **22/24, tức 91,7%**, trên ngưỡng **80%** nhóm chốt từ CP2.
>
> Hai điều kiện cứng đều đạt: **63/63** trích dẫn khớp nguồn, và **4/4** ca cần từ chối đều từ chối đúng.
>
> Điểm yếu là **độ phủ nhiều ngày** chỉ **5/7, tức 71,4%**, dưới ngưỡng 80%.

## Trang 6: Chi phí từ 50 phiên mô phỏng

> Nhóm mô phỏng **50 phiên** theo ba kiểu người dùng lấy từ khảo sát, không phiên nào lỗi.
>
> Tính trên task thành công, tức đã chia cho tỉ lệ đạt 22/24, mỗi task tốn khoảng **0,3 cent**. Ở quy mô cơ sở **470 người**, tiền token khoảng **7,4 đô một tháng**, chưa tới **2 cent** mỗi người.
>
> Đây mới là tiền token của luồng CLI, chưa gồm máy chủ. Con số **77 phút** tiết kiệm mỗi người mỗi tháng là giả định của nhóm, chưa đo.

## Trang 7: Hai ca còn thiếu nguồn theo ngày

> Vì vậy khuyến nghị của nhóm là **tiếp tục cải tiến**, chưa mở rộng.
>
> Hai ca còn trượt: **B05** chỉ dùng nguồn ngày 11, thiếu Launch & Economics ở ngày 13. **B16** chỉ dùng nguồn ngày 6, thiếu Embedding và Vector Store ở ngày 7. Với công cụ ôn tập, thiếu một ngày là nguy hiểm vì người học tưởng mình đã ôn đủ.
>
> Nhóm giữ nguyên ngưỡng đã chốt, không hạ chuẩn để báo là đạt.

## Trang 8: Đo tác động qua một buổi ôn thật

> Bước tiếp theo là mời **2–3 học viên** dùng CramAI trong một buổi ôn thật: so thời gian tự tìm trang với thời gian tìm qua CramAI, và hỏi phần nào còn khó hiểu sau khi xem lời giải. Khi đó con số 77 phút mới có căn cứ.
>
> Cảm ơn mọi người đã lắng nghe.

## Chuẩn bị trước khi lên

- Container `cramai-local` đang chạy, mở được `http://127.0.0.1:8000` và `/admin`.
- Container hiện chạy `MODEL_PROVIDER=fake`: câu hỏi ra theo khuôn mẫu. Trước demo phải bật model thật và gọi thử trong vòng một giờ, hoặc nói rõ đây là chế độ giả.
- Tên slide 7–10 trên `main` vẫn là "Bài giảng ngày N" cho tới khi Lâm sửa `SLOT_TITLES` trong `backend/db.py`. Không build lại container trước demo nếu thay đổi đó chưa vào main.
- Mở sẵn video dự phòng.

## Câu hỏi có thể gặp

| Câu hỏi | Trả lời ngắn | Nguồn |
|---|---|---|
| Vì sao chọn 470 người? | Khoá L3 hơn 700 người theo đề Track A. Nhân với 14/21, tỉ lệ người đã từng mở slide để ôn trong khảo sát, được khoảng 470. Mức 300 và 700 là hai đầu thấp và cao, nhóm tự ước tính. | `cost/personas.yaml`, `cost/cost-estimate.md` §1 |
| 77 phút từ đâu ra? | Bằng 5,16 lượt ôn mỗi người mỗi tháng nhân với 15 phút tiết kiệm mỗi lượt. Con số 15 phút là giả định, chưa đo, nên bước tiếp theo là cho 2–3 học viên dùng thử để đo. | `spec.md` §2, `evidence/summary.md` §7 |
| Sao không tính máy chủ? | Bảng này chỉ so tiền gọi model giữa các lựa chọn. Máy chủ và công vận hành được ghi là phần chưa tính. | `cost/cost-estimate.md` §4 |
| Lượt 2 tổng điểm tăng mà phủ nhiều ngày lại giảm (7/9 → 5/7)? | Mẫu số khác nhau: lượt 2 có hai ca chuyển sang hỏi lại hoặc nêu giới hạn trước khi gọi model, nên không còn tính vào metric phủ nhiều ngày. Dù vậy 5/7 vẫn dưới ngưỡng, nên nhóm chọn iterate. | `eval/report.md` |
| Sao không dùng Sonnet cho chất lượng cao hơn? | Chi phí gấp khoảng 20 lần. Lỗi còn lại nằm ở bước truy hồi và độ phủ ngày, chưa có bằng chứng đổi model sẽ sửa được. | `cost/cost-estimate.md` §2, `eval/report.md` |
| Số đánh giá có đúng cho bản web không? | Chưa. 22/24 và chi phí đo trên bản CLI CP4. Bản web dùng cùng cách kiểm nguồn nhưng chưa chạy lại bộ 24 ca. | `eval/report.md`, `specs/003-cramai-exams/` |
| Chi phí bản web có khác không? | Có thể cao hơn: bản web thêm model Vision tóm tắt ảnh khi admin tải PDF và gọi model khi học viên xem lời giải. Hai phần này chưa có trong mô phỏng 50 phiên. | `backend/pdf_vision.py`, `cost/cost-estimate.md` |
| Đề thật có tự luận, sao chỉ ra trắc nghiệm? | Lát cắt này chỉ làm trắc nghiệm A–D có đáp án và trang slide để đối chiếu. Câu hỏi tự luận được ghi rõ là ngoài phạm vi. | `spec.md` §4 |
| Trích dẫn khớp nguồn thì đáp án chắc chắn đúng? | Không. Mã nguồn hợp lệ chỉ cho biết câu hỏi lấy từ đúng đoạn slide, chưa đảm bảo đáp án đúng về mặt sư phạm. Vì vậy mỗi câu kèm trang slide để học viên tự đối chiếu. | `spec.md` §4 |
| Học viên có xem trước đáp án được không? | Không. Đáp án không gửi xuống trình duyệt trước khi học viên chọn, và mỗi câu chỉ chọn một lần trên giao diện. | `backend/app.py`, `frontend/web/src/student/` |
| Đề có lặp lại giữa các lượt? | Hệ thống ưu tiên đoạn slide chưa ra trong các lượt gần đây và bỏ trang bìa hay trang ít chữ. | `backend/app.py` (`prioritize_unseen_passages`) |
| Slide có tên giảng viên, có lộ không? | Không hiện tên file vì có tên giảng viên và mã phòng. PDF để trong thư mục riêng, trang admin cần mật khẩu. | `backend/db.py`, `backend/app.py` |
