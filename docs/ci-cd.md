# CI/CD của CramAI

[Workflow GitHub Actions](../.github/workflows/ci.yml) do Lâm phụ trách. Pipeline dùng cho prototype dòng lệnh và gói bàn giao theo commit.

| Sự kiện | Việc chạy |
|---|---|
| Pull request vào `main` | Kiểm thử trên Ubuntu/Python 3.10 và Windows/Python 3.12. PR từ bốn branch vai chạy thêm kiểm phạm vi sửa file. |
| Push lên `lam` | Chạy cùng bộ kiểm thử cho nhánh tích hợp của Lâm. |
| Push hoặc chạy thủ công trên `main` | Chạy cùng kiểm thử rồi tạo `cramai.zip` và checksum SHA-256 trong artifact của commit đó. |

`python run.py check` in tình trạng benchmark, metric và `TEAMS.md`. Đây là báo cáo để soát checkpoint, vì bộ khung trả về mã 0 cả khi có cảnh báo. `python run.py eval --fake` chỉ kiểm bộ chạy. Lâm vẫn dùng model thật để tạo các lượt chính thức theo [Quickstart](../specs/001-cramai/quickstart.md).

## Chạy trước khi mở PR

```text
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
python run.py check
python run.py eval --fake
python scripts/check_agent_scope.py --role lam --base origin/main
```

Đổi `lam` thành vai tương ứng khi làm trên branch khác. Nếu lỗi phạm vi, chuyển phần thay đổi đó cho người phụ trách file. [Vai và branch](agents.md).

## Lấy gói bàn giao

Trong GitHub Actions, mở lượt **CramAI CI/CD** thành công trên `main`, chọn artifact `cramai-<commit>-<lần chạy>`. Ở Linux hoặc Git Bash, kiểm file tải về bằng `sha256sum -c cramai.zip.sha256`. Gói ZIP chứa nội dung đã commit, gồm cả hồ sơ đánh giá, chi phí và tài liệu có mặt tại commit. Job dừng nếu phát hiện file đã track trùng quy tắc ignore.

Gói này dùng để bàn giao bản có thể tải về. Trước khi nộp, đối chiếu yêu cầu của từng checkpoint và dùng đúng commit cùng link repo. [GitHub Actions artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data).

## Oracle VPS deployment

The main CI pipeline can deploy the exact tested main commit to Oracle after the environment secrets and ORACLE_VPS_DEPLOY_ENABLED repository variable are configured. See [Deploy CramAI to an Oracle Cloud VPS](deploy-oracle-vps.md) for server setup, HTTPS, persistent data, secrets, and rollback guidance.
