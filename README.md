# Hà Linh Travel — Operations Client

Web vận hành nội bộ cho điều phối xe, quản lý tài xế và các nghiệp vụ liên quan.

## Khởi chạy

```sh
pnpm install
Copy-Item .env.example .env.development
pnpm dev
```

`VITE_API_BASE_URL` phải trỏ tới Laravel API. Cấu hình thiếu hoặc sai định dạng sẽ được báo ngay khi ứng dụng khởi động.

## JWT session

- Đăng nhập nhận access token và lưu qua Pinia persist.
- Mọi API, bao gồm `POST /auth/refresh`, gửi token hiện tại qua `Authorization: Bearer <token>`.
- Khi API trả 401, client chỉ refresh một lần cho các request đồng thời, nhận token mới rồi thử lại request ban đầu.
- Refresh thất bại sẽ xóa session và đưa người dùng về trang đăng nhập.

## Kiểm tra chất lượng

```sh
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

`pnpm lint` chỉ kiểm tra. Dùng `pnpm lint:fix` khi muốn tự động sửa các lỗi có thể sửa được.
