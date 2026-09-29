# Lấy Link

Trang tạo link hoa hồng Shopee và TikTok Shop, xây dựng bằng Next.js App Router. Giao diện không yêu cầu đăng nhập và có thể cài đặt như PWA.

## Chạy local

```bash
bun install
cp .env.example .env.local
bun run dev
```

Shopee dùng phiên đăng nhập trong `app/api/affiliate-links/env.ts`. Cookie này chỉ
được đọc ở server và sẽ cần thay khi phiên Shopee hết hạn. TikTok vẫn dùng adapter
được cấu hình bằng biến môi trường. Để kiểm tra giao diện mà không gọi nhà cung
cấp, đặt `AFFILIATE_API_MOCK=true`; không dùng chế độ mock trên production.

## Kết nối API affiliate

Sao chép `.env.example` thành `.env.local`, sau đó điền URL adapter và khóa cho Shopee/TikTok. Khóa chỉ được đọc trong Route Handler phía server và không có tiền tố `NEXT_PUBLIC_`.

Adapter nhận `POST` JSON `{ productUrl, provider }`, cùng các header `X-Affiliate-Client-Id` và `X-Affiliate-Secret`. Kết quả có thể dùng một trong các trường `affiliateUrl`, `affiliate_url`, `shortLink` hoặc `short_link` (trực tiếp hoặc trong `data`). Cách này giữ logic ký request riêng của từng nền tảng ở adapter, thuận tiện cập nhật khi bạn có tài khoản API chính thức.

## Shopee cookie APIs

- `GET /api/shopee/click-report` — nhận các query filter của Shopee, mặc định 7 ngày gần nhất.
- `GET /api/shopee/conversion` — nhận các query filter của Shopee, mặc định 7 ngày gần nhất.
- `POST /api/shopee/custom-link` — body `{ "productUrl": "...", "subIds": ["..."] }` hoặc `{ "links": ["..."], "subIds": ["..."] }`.
- `GET /api/shopee/product?item_id=...` — dữ liệu một sản phẩm; bỏ `item_id` để gọi danh sách và truyền các filter Shopee qua query string.

Các Route Handler luôn gửi cookie từ server, tắt cache, giới hạn thời gian request
và không trả cookie về client. Đây là API nội bộ có thể đọc dữ liệu tài khoản;
không triển khai công khai khi chưa thêm xác thực cho ứng dụng.
