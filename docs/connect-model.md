# Nối model cho CramAI

`codebase/ai.py` hỗ trợ Gemini, OpenAI và Claude qua thư viện chuẩn Python. `call_model(system, user)` giữ hợp đồng `ModelResponse` và `@model_call`, trả văn bản, mã model và số token từ API. Nhánh giả vẫn dùng được cho CP2.

## Cấu hình

Chép `.env.example` thành `.env` nếu chưa có. Chọn cấu hình phù hợp với model mà tài khoản nhóm truy cập được.

```dotenv
MODEL_PROVIDER=gemini
MODEL_NAME=<mã model trên Gemini API>
API_KEY=<Gemini API key của nhóm>
```

```dotenv
MODEL_PROVIDER=openai
MODEL_NAME=<mã model hỗ trợ Chat Completions>
API_KEY=<OpenAI API key của nhóm>
```

```dotenv
MODEL_PROVIDER=anthropic
MODEL_NAME=claude-haiku-5-5
API_KEY=<Claude API key của workspace nhóm>
```

Giữ API key trong `.env` cục bộ. Đặt `MODEL_PROVIDER=fake` hoặc để trống để chạy giả với token 0. Biến môi trường đã đặt trong shell được ưu tiên hơn `.env`. [Gemini API](https://ai.google.dev/api/generate-content) · [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat) · [Anthropic Messages API](https://platform.claude.com/docs/en/api/http/messages/create).

## Kiểm adapter trước khi ghép workflow

Từ thư mục gốc, lệnh dưới gửi đúng một prompt mẫu và chỉ in mã model cùng usage.

```text
python -c "import sys; sys.path.insert(0, 'codebase'); from ai import call_model; result = call_model('', 'Tra loi dung mot tu OK.'); print(result['model'], result['tokens_in'], result['tokens_out'])"
```

Khi tên model khác `fake` và cả hai số token dương, ghi mã đó trong bàn giao. Sau khi Hưng ghép workflow và Khiêm thay benchmark mẫu, dùng `python run.py eval --try` để kiểm cả đường đi trước khi chạy lượt 1. Mô phỏng và bảng giá dùng đúng mã model ghi trong lượt đo. [Quickstart checkpoint](../specs/001-cramai/quickstart.md).

## Lỗi thường gặp

| Lỗi | Xử lý |
|---|---|
| Thiếu `MODEL_NAME` hoặc `API_KEY` | Kiểm `.env` và biến môi trường trên máy chạy. |
| HTTP 400 hoặc 404 | Kiểm mã model và endpoint hỗ trợ model đó. |
| HTTP 401 hoặc 403 | Kiểm key và quyền truy cập model. |
| HTTP 429 | Kiểm hạn mức. Khi chạy lô, thử `--wait 4` giữa các lượt. |
| Thiếu usage, hết thời gian hoặc phản hồi bị cắt | Kiểm lại bằng prompt ngắn. Runner ghi lỗi để nhóm xử lý trước lượt chính thức. |

Gemini cộng token suy luận riêng vào token đầu ra. OpenAI và Claude dùng số token đầu ra tổng từ API. Claude cộng token đầu vào đọc và tạo cache vào tổng token đầu vào, nếu API trả các trường này. Dữ liệu prompt có thể xuất hiện trong trace, nên chỉ dùng nội dung được phép đưa vào hồ sơ công khai.
