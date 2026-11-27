# Quyết định kỹ thuật và căn cứ

| Quyết định | Lý do | Phương án đã cân nhắc |
|---|---|---|
| Workflow cố định; tự động kiểm nguồn và hiển thị mọi câu hợp lệ để học | Đầu vào, tra slide, quyết định chọn câu và kiểm trích dẫn có đường đi rõ. Bỏ bước người học duyệt hoặc loại câu để có thể học ngay sau khi tạo. | Agent tự chọn bước hoặc yêu cầu người học duyệt từng câu sẽ thêm trạng thái và làm gián đoạn việc ôn. |
| API hàm Python | CLI, eval và simulate đã nạp cùng `answer(text)`. Kiểu dữ liệu chia sẻ và fixture đủ để bốn vai làm độc lập. | HTTP API cần tiến trình, cấu hình và đường kiểm thứ hai. |
| Lấy trang và tên file từ dữ liệu tra được | Model chỉ chọn mã nguồn. Payload cho CLI chứa thành phần trích dẫn đã đối chiếu. | Tin metadata do model tự ghi làm tăng nguy cơ báo sai trang. |
| Một đầu mối ghi mỗi file dùng chung | Bộ chạy đánh số file theo bản đang có. Một người chạy chính thức giữ được thứ tự và dấu vết. | Bốn branch tự tạo run chính thức sẽ đụng tên và làm khó truy nguyên. |
| Phỏng vấn kiểm pain, log pre-class chỉ bổ trợ | Bài toán là ôn giữa kỳ. Pre-class đo hành vi trước buổi, không trực tiếp đo buổi tự ôn. | Coi lượt xem lại là số người gặp pain sẽ vượt quá điều dữ liệu cho thấy. |

Căn cứ trong repo nhóm gồm [Canvas](../../canvas.md), [khung vận hành](../../README.md) và [AGENTS](../../AGENTS.md). Phạm vi slide, API key và ngưỡng đánh giá là đầu vào của nhóm tại các checkpoint. Hợp đồng dùng mẫu tổng hợp để bốn vai bắt đầu song song.
