# Lấy Link

Trang tạo link hoa hồng Shopee và TikTok Shop, xây dựng bằng Next.js App Router. Giao diện không yêu cầu đăng nhập và có thể cài đặt như PWA.

## Chạy local

```bash
bun install
cp .env.example .env.local
bun run dev
```

Mặc định API trả về trạng thái chưa cấu hình. Để kiểm tra toàn bộ giao diện thành công ở local, đặt `AFFILIATE_API_MOCK=true`. Không dùng chế độ mock trên production.

## Kết nối API affiliate

Sao chép `.env.example` thành `.env.local`, sau đó điền URL adapter và khóa cho Shopee/TikTok. Khóa chỉ được đọc trong Route Handler phía server và không có tiền tố `NEXT_PUBLIC_`.

Adapter nhận `POST` JSON `{ productUrl, provider }`, cùng các header `X-Affiliate-Client-Id` và `X-Affiliate-Secret`. Kết quả có thể dùng một trong các trường `affiliateUrl`, `affiliate_url`, `shortLink` hoặc `short_link` (trực tiếp hoặc trong `data`). Cách này giữ logic ký request riêng của từng nền tảng ở adapter, thuận tiện cập nhật khi bạn có tài khoản API chính thức.
