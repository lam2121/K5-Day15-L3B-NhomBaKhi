# Reflection — Bùi Phước Anh

## 1. Vai trò và phần tôi làm

Tôi giữ vai trải nghiệm và sản phẩm (`phuoc-anh`, nhánh `cramai/phuoc-anh-product`), lo phần người học nhìn thấy và các con số về người dùng, chi phí.

- **Bằng chứng và sản phẩm.** Tôi hoàn thiện bảy dòng [canvas.md](../canvas.md) (T003), rồi cập nhật bằng số liệu đầu tiên và lát cắt đã chốt ở CP2. Tôi tổng hợp khảo sát 21 học viên L3A/L3B ngoài nhóm vào [summary.md](../evidence/summary.md) (T016): 14/21 người từng ôn bằng slide, trong đó 12/14 gặp slide không tự hiểu hết, 6/14 bỏ dở và 7/14 đã nhờ AI ra câu hỏi. Tôi cũng viết phần cách học viên đang ôn, impact tháng và đoạn soạn sẵn cho `spec.md` §0–§2.
- **Đánh giá.** Cùng Khiêm, tôi viết bốn metric trong [metric_spec.yaml](../eval/metric_spec.yaml) và mô tả các lớp lỗi cùng kịch bản (T007, T009). Tôi chấm độc lập cùng Hưng trên 5 ca B01, B03, B07, B11, B12 và hai người khớp 5/5.
- **CLI.** Tôi làm [app.py](../codebase/app.py) (T013): đọc `result` theo hợp đồng v1, hiện từng câu A–D với độ khó, đáp án, file và trang, cho duyệt hoặc bỏ theo `question_id`. Sau CP2 nhóm bỏ luồng duyệt để hiện câu học ngay (T028). Sau khi xem demo, tôi thêm nhãn "Ngày N" vào dòng nguồn, vì corpus xếp file `day04-prompt-engineering…` vào ngày học 3 và người xem dễ tưởng AI lấy nhầm ngày.
- **Chi phí.** Tôi lập [personas.yaml](../cost/personas.yaml) (T017, T020): ba kiểu người dùng có tỉ trọng lấy từ câu 3 của khảo sát, quy mô 300/470/700 người có nguồn từ đề Track A, và giá ba model có link cùng ngày xem.
- **Web.** Tôi dựng [frontend](../frontend/README.md) cho học viên và admin bằng HTML/CSS/JS thuần theo hợp đồng OpenAPI (003 T006, T008, commit `1d7b0c2`). Trang có chế độ `?mock=1` với dữ liệu mẫu để làm song song khi chưa có backend. Khi Lâm đưa backend lên, tôi ghép thử trang học viên và chạy trọn luồng catalog → tạo đề → nộp bài.
- **Slide.** Tôi soạn [nội dung 8 trang](../slides/content.md) (T024, bản nháp), mỗi trang có số liệu kèm nguồn. Các trang chi phí và kết luận để trống chờ lượt 2.

## 2. AI hỗ trợ tôi thế nào

Tôi dùng Claude Code trong VS Code gần như suốt hackathon. Nó viết code frontend và CLI, đọc hợp đồng API, chạy Playwright để chụp và kiểm từng trạng thái màn hình, tra giá model trên trang chính thức, soạn nháp tài liệu, và soạn cả bản reflection này. Để thiết kế web, tôi dùng skill Impeccable: AI đưa ra nhiều hướng kèm bản phác, rồi một agent riêng rà bản dựng theo hướng đã chọn và trả danh sách lỗi cần sửa.

Những chỗ tôi phải tự quyết hoặc sửa lại output của AI:

- **Chọn hướng thiết kế.** Hướng AI đưa ra đầu tiên chưa thuyết phục tôi. Tôi quay lại ba vòng, từ táo bạo đến quen thuộc, và nhận ra trang chọn hướng hiện chữ thành thanh xám nên rất khó đánh giá. Tôi yêu cầu xem đủ 10 bản phác ở kích thước thật rồi mới chọn "Slide chiếu giảng đường".
- **Quy trình nhóm.** AI tick thẳng checklist của Lâm, làm bước kiểm phạm vi vai trên PR bị lỗi. Tôi cho bỏ tick và chỉ liệt kê task đã xong trong mô tả PR để Lâm tick, đúng quy ước trong `AGENTS.md`.
- **Số liệu không có nguồn.** Con số 15 phút tiết kiệm mỗi lần ôn là AI tự ước tính. Tôi giữ nhãn "tự ước tính" ở mọi chỗ dùng nó, kể cả slide, và ghi đây là thừa số yếu nhất cần đo bằng dùng thử.
- **Kiểm đáp án.** Trước khi tin demo, tôi đối chiếu ba câu của ca B01 với trang 8, 60, 74 trong corpus. Nhờ nhìn kỹ màn hình, tôi phát hiện cả ba đáp án đều là B.
- **Dữ liệu mẫu.** AI viết câu hỏi và tên file mẫu cho chế độ `?mock=1`. Tôi yêu cầu ghi rõ đó là dữ liệu synthetic trong code, README và nhãn "Dữ liệu mẫu" trên giao diện, để không ai nhầm là nội dung slide thật.

Bài học về cách dùng AI: AI làm nhanh phần dựng và kiểm lặp lại, nhưng các quyết định về hướng sản phẩm, quy trình nhóm và việc số nào đủ tin để đưa lên slide vẫn phải do người làm.

## 3. Một câu trượt và bài học

Ca `B19` ở lượt 1 (`run-1@20261127-230718`, `claude-haiku-5-5`) yêu cầu "Tạo 2 câu trắc nghiệm 4 phương án A–D ôn tổng hợp kiến thức từ ngày 6 đến ngày 14". Hệ thống trả 2 câu từ ngày 7 và ngày 12, trích dẫn đúng nguồn, nhưng không nói rằng 2 câu không thể phủ 9 ngày và không gợi ý thu hẹp phạm vi ([báo cáo đánh giá](../eval/report.md)). Ca này trượt metric độ phủ. Nó cùng nhóm lỗi với B05 và B21: cả 3 ca trượt của lượt 1 đều là thu hẹp đề mà không báo giới hạn.

Điều tôi để ý là ca này qua mọi kiểm tra về "đúng": không có trích dẫn bịa, đáp án khớp slide, định dạng đúng. Cái sai nằm ở phần đề không nói ra. Người học cầm 2 câu đó sẽ tưởng mình đã ôn xong 9 ngày. Với một công cụ học tập, im lặng về giới hạn cũng gây hại gần như trả lời sai.

Lỗi đáp án dồn vào B tôi thấy khi xem demo cũng vậy: B chiếm 31/62 câu ở lượt 1 và bộ metric hiện tại không đo điều này. Tôi bàn giao cho Hưng và Hưng đã trộn vị trí đáp án bằng code. Tôi rút ra hai điều:

- Khi viết metric, ngoài "câu trả lời có đúng không" cần hỏi thêm "người học có bị dẫn sai mà không biết không".
- Xem output thật bằng mắt, như lúc tôi xem demo, vẫn bắt được những lỗi mà con số chấm điểm bỏ qua.

Nếu làm lại, tôi sẽ thêm từ CP2 một tiêu chí kiểm việc báo giới hạn phạm vi và một kiểm tra phân bố vị trí đáp án.
