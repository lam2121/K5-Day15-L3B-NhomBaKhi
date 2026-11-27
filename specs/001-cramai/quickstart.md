# Kiểm tra và bàn giao CramAI

Chạy từ thư mục gốc repo. Chi tiết vai, branch và lệnh kiểm phạm vi ở [hướng dẫn cho bốn agent](../../docs/agents.md).

## Kiểm hợp đồng khi làm song song

```text
python -m unittest discover -s tests
python .specify/scripts/python/check_prerequisites.py --json --require-spec --require-tasks --include-tasks
```

Smoke test dùng fixture giả, xác minh shape, tra mã nguồn, cả ca có đề và ca thiếu nguồn. Bộ kiểm hợp đồng không cần model hoặc PDF thật.

## Kiểm tích hợp checkpoint

- **CP2:** chạy `python run.py` ở chế độ giả, một ca thường và một ca thiếu căn cứ. Chạy `python run.py check` và xác minh benchmark của nhóm, ít nhất ba metric, chuẩn đã commit.
- **CP3:** đặt `.env` cục bộ theo [hướng dẫn nối model](../../docs/connect-model.md). Dùng `python run.py eval --try` để thấy token thật. Sau đó Lâm chạy `python run.py eval`, nhóm chấm, Lâm chạy `python run.py score eval/run-1.csv` với đúng file hợp lệ, rồi thử `python run.py simulate --try`. Kiểm một input ngoài dữ liệu và xuất video 30 giây.
- **CP4:** Lâm chạy và lưu lượt 2 trên cùng bộ thử, chấm xong rồi dùng `python run.py simulate --rate-from eval/run-2.csv` với đúng model, seed cố định và ít nhất 50 phiên. Tên lượt trên lệnh là ví dụ. Dùng file lượt 2 thực tế. Demo ca thường, ca khó và một input lạ.

Giữ prompt, output và trace công khai ở mức dữ liệu được phép. `eval --fake` kiểm riêng bộ chạy mẫu, bỏ qua `answer`. Kết quả giả chỉ dùng để kiểm kỹ thuật.
