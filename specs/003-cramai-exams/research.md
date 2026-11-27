# Quyết định và căn cứ

| Quyết định | Lý do |
|---|---|
| Hai giao diện trên cùng origin | Tách thao tác quản lý nguồn và trải nghiệm làm bài, cùng hợp đồng và một lần phát hành. |
| 14 ô cố định và một lựa chọn tổng hợp | Học viên biết phạm vi đề trước khi tạo. Một core tạo đề chạy với tham số phạm vi. |
| Đề 5 câu theo bộ và 14 câu giữa kỳ | Phạm vi nhỏ dễ demo. Giữa kỳ có một câu từ mỗi bộ, đo được độ phủ. Nếu thiếu nguồn, hệ thống báo thiếu căn cứ. |
| SQLite và lưu snapshot lượt làm | Quản lý draft/published và giữ kết quả ổn định khi thay nguồn hoặc restart. |
| Auth admin ở backend | Mã frontend không chứa thông tin xác thực. Backend kiểm quyền với HTTP Basic qua TLS. Khi có Origin khác cấu hình, từ chối các thao tác nhập và xuất bản. |
| So đáp án phía server | Giữ khóa đáp án phía dịch vụ và chấm theo quy tắc. Model tập trung vào việc tạo câu hỏi có căn cứ. |

[FastAPI multipart](https://fastapi.tiangolo.com/tutorial/request-files/) · [FastAPI HTTP Basic](https://fastapi.tiangolo.com/advanced/security/http-basic-auth/) · [SQLite transaction](https://www.sqlite.org/lang_transaction.html).
