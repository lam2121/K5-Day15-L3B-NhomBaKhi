# Bốn agent làm chung CramAI

Dùng bốn phiên Codex, mỗi người một vai và một branch. Khởi đầu từ cùng commit đã có Spec Kit và hợp đồng v1. Cặp review theo từng chặng ở [spec nộp bài §10](../spec.md#10-phân-công--changelog).

| Người và vai | Branch | File phụ trách |
|---|---|---|
| Nguyễn Văn Lâm · tích hợp và model | `lam` | `codebase/ai.py`, `codebase/contracts.py`, `backend/`, `deploy/`, tài liệu và cấu hình dùng chung, Spec Kit, [CI/CD](ci-cd.md), `scripts/`, `tests/`, `eval/README.md` và output các lượt chính thức. |
| Nguyễn Duy Hưng · workflow AI | `cramai/hung-workflow` | `codebase/agent.py`, `codebase/prompts/` (nếu cần), `eval/report.md`. |
| Nguyễn Trọng Khiêm · nguồn và bộ câu thử | `cramai/khiem-data` | `codebase/tools.py`, `data/`, ghi chép và cách đếm trong `evidence/` trừ summary, `eval/benchmark.csv`. |
| Bùi Phước Anh · trải nghiệm và sản phẩm | `cramai/phuoc-anh-product` | `frontend/`, `codebase/app.py`, `canvas.md`, `evidence/summary.md`, `eval/metric_spec.yaml`, hai file cấu hình/báo cáo chi phí, `slides/`, `demo-slides.pdf`, `validation/`. |

Mỗi người sở hữu file reflection mang tên mình. Danh sách đường dẫn chính xác nằm trong [script kiểm phạm vi](../scripts/check_agent_scope.py). File khung BTC giữ nguyên theo `AGENTS.md`.

## Bắt đầu trên máy mỗi người

1. Lâm đưa baseline đã review lên nhánh chung và gửi SHA. Mỗi người fetch rồi tạo branch của mình từ SHA đó. Dùng bốn clone hoặc bốn worktree riêng. Ví dụ trên máy Hưng, `git switch -c cramai/hung-workflow SHA_BASELINE`.
2. Chọn feature trong checkout mới. Chạy hai lệnh dưới từ gốc repo trong PowerShell. Chạy lại sau khi tạo checkout mới. Spec Kit lưu lựa chọn cho checkout đó.

   ```powershell
   $env:SPECIFY_FEATURE_DIRECTORY = 'specs/001-cramai'
   python .specify/scripts/python/setup_tasks.py --json | ConvertFrom-Json | Select-Object FEATURE_DIR, AVAILABLE_DOCS
   ```

   Trên Bash dùng `export SPECIFY_FEATURE_DIRECTORY=specs/001-cramai` rồi chạy cùng lệnh Python, bỏ phần sau dấu pipe. Nếu dùng Codex, mở phiên mới tại checkout để nạp skill repo-local. [Tích hợp Codex của Spec Kit](https://github.github.com/spec-kit/integrations/codex.html).
3. Dán một trong bốn yêu cầu dưới đây. Thay `Txxx` bằng ID đang làm trong [backlog Spec Kit](../specs/001-cramai/tasks.md).

## Yêu cầu khởi động cho bốn agent

- **Lâm:** “Dùng `$speckit-implement` cho Txxx của vai `lam`. Đọc AGENTS, hiến chương, checklist và hợp đồng v1. Chỉ sửa file vai `lam`. Ưu tiên model adapter, tích hợp, kiểm contract và ghi artefact chính thức. Bàn giao run ID, model, điểm và đường dẫn cho từng người.”
- **Hưng:** “Dùng `$speckit-implement` cho Txxx của vai `hung`. Chỉ sửa file vai `hung`. Dùng `from contracts import …`, lấy dữ liệu qua `search_slides`, model qua `call_model`, tạo kết quả qua `make_response`. Dùng fixture để kiểm độc lập. Gửi nội dung §4, thay đổi rủi ro hoặc changelog cho Lâm.”
- **Khiêm:** “Dùng `$speckit-implement` cho Txxx của vai `khiem`. Chỉ sửa file vai `khiem`. Bàn giao `search_slides`, mã đoạn và dữ liệu mẫu được phép. Đưa nguồn và ID câu thử cho Hưng, Phước Anh và Lâm. Giữ PDF nguyên bản cục bộ và ghi rõ hạn chế bằng chứng.”
- **Phước Anh:** “Dùng `$speckit-implement` cho Txxx của vai `phuoc-anh`. Chỉ sửa file vai `phuoc-anh`. Kiểm CLI với fixture, đọc `result` theo schema, chuẩn bị metric cùng Khiêm. Bàn giao nội dung pain, impact, cách chấm và chi phí cho Lâm cập nhật các trang chung.”

Mỗi agent báo ID hoàn thành trong PR. Lâm là người cập nhật ô task chung, `spec.md` gốc và hồ sơ đánh giá khi hợp nhất. Dùng `$speckit-analyze` để rà chéo. Khi chạy được giao nhiệm vụ cụ thể, ID và vai là phạm vi áp dụng cho `$speckit-implement`.

Trước CP2, dựa trên task T004–T010 của 001. Khi T010 hoàn tất, chọn ID trong [bảng phân công sau CP2](../specs/001-cramai/tasks.md#phân-công-sau-cp2) và bắt đầu từ cùng commit CP2. Hưng và Khiêm ghép workflow với nguồn. Phước Anh làm CLI dựa trên fixture và bàn giao persona. Lâm ghi lượt chạy chính thức và cập nhật task chung.

Khi nhận task web, đặt `SPECIFY_FEATURE_DIRECTORY=specs/003-cramai-exams` và đọc [backlog web](../specs/003-cramai-exams/tasks.md). Luôn ghi mã feature cùng ID task. Lâm làm backend, Hưng giữ core, Khiêm giữ bộ trích PDF, Phước Anh làm hai giao diện. Cả bốn dùng cùng [hợp đồng HTTP](../specs/003-cramai-exams/contracts/openapi.json) và [hợp đồng Python](../specs/003-cramai-exams/contracts/core.md).

## Handoff và thứ tự ghép

1. **Hợp đồng trước.** Lâm đưa [hợp đồng v1](../specs/001-cramai/contracts/cramai.md), [mẫu JSON](../tests/fixtures/cramai_demo.json) và smoke test lên baseline. Mỗi vai làm phần của mình dựa trên đó. Việc cần đổi giao diện dùng chung đi qua một PR do Lâm tổng hợp, review bởi các vai bị ảnh hưởng.
2. **Ghép dữ liệu và adapter trước.** Khiêm bàn giao mẫu passage và một query kỳ vọng có kết quả. Lâm xác nhận chế độ giả, kết quả model và usage. Hưng ghép workflow. Phước Anh có thể làm CLI song song từ mẫu JSON, rồi kiểm qua `answer` sau khi ghép.
3. **Khoá cách đo.** Lâm ghi chuẩn đạt, commit metric đã review trước CP2. Trước lượt 1, Khiêm và Phước Anh xác nhận benchmark và metric; Lâm chạy các lượt chính thức trên branch tích hợp, dùng một bộ input cho cả hai lượt và công bố artefact. Mỗi người tham gia chấm theo metric. Chạy thử cá nhân dùng artefact cục bộ và báo số qua PR.
4. **Kiểm trước PR.** Trong lệnh dưới, thay role và base bằng vai và commit nền hoặc nhánh đích của PR. Chỉ yêu cầu merge sau khi review chéo.

   ```text
   python scripts/check_agent_scope.py --role hung --base origin/main
   python -m unittest discover -s tests
   git diff --check
   ```

   Script phát hiện file ngoài phạm vi đã commit, staged, unstaged, untracked và cả hai đầu của đổi tên. GitHub Actions chạy lại kiểm phạm vi khi PR từ branch của vai vào `main`. Khi branch tích hợp gom nhiều vai, kiểm từng PR trước khi ghép. Nếu một file ngoài phạm vi xuất hiện, gửi yêu cầu cho chủ file và bỏ thay đổi đó khỏi PR.

Mẫu nội dung PR gồm ID task, file đã đổi, lệnh kiểm và kết quả, đầu ra cần người khác dùng, rủi ro hoặc phụ thuộc còn lại. Việc phát sinh sau CP2 đưa cho Lâm ghi vào changelog.
