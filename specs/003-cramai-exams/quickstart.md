# Nghiệm thu frontend và backend

Các lệnh chạy sau khi các task tương ứng hoàn tất. Dùng dữ liệu mẫu đánh dấu synthetic để kiểm offline.

```text
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

1. Mở `http://127.0.0.1:8000/`. Kiểm đủ Slide 01–14 và Đề giữa kỳ ở cuối. Chưa xuất bản gì thì các mục hiện lý do.
2. Mở `/admin/` với tài khoản admin cục bộ. Tải PDF mẫu, kiểm trước và xuất bản Slide 03. Học viên làm 5 câu, xem điểm và nguồn sau nộp.
3. Nạp đủ 14 mẫu và kiểm đề giữa kỳ có 14 câu, mỗi bộ đóng góp một câu. Trình duyệt đọc API tạo bài để xác nhận không có khóa đáp án trước khi nộp.
4. Kiểm gửi trùng, bài hết hạn, PDF lỗi, quyền admin thiếu hoặc sai, mất mạng hoặc thiếu căn cứ. Thay bộ slide khi có bài đang làm và xác nhận điểm vẫn dựa trên snapshot.
5. Chạy `python run.py`, `python run.py check`, `python run.py eval --fake`. Dùng model thật và `simulate --try` theo [quickstart MVP](../001-cramai/quickstart.md) trước khi ghi lượt chính thức.
6. Trên VPS, kiểm HTTPS, phiên bản trả từ health, ca có nguồn và ca khó. Thử khôi phục đồng thời frontend/backend về SHA trước, chỉ dùng schema DB tương thích hoặc bản sao lưu theo tác vụ deploy.

[Hợp đồng HTTP](contracts/openapi.json) · [Quyền và điểm giao](../../docs/agents.md).
