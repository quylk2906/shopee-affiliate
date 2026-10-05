import { createAffiliateLink, detectProvider } from '@/lib/affiliate';
import { normalizeAffiliateUrl } from '@/lib/affiliate-url';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: 'Dữ liệu gửi lên không hợp lệ.' },
      { status: 400 },
    );
  }

  const productUrl = normalizeAffiliateUrl(
    typeof payload === 'object' && payload !== null && 'productUrl' in payload
      ? String(payload.productUrl)
      : '',
  );
  if (!productUrl || productUrl.length > 2048) {
    return Response.json(
      { error: 'Link sản phẩm không hợp lệ.' },
      { status: 400 },
    );
  }

  const provider = detectProvider(productUrl);
  if (!provider) {
    return Response.json(
      { error: 'Chỉ hỗ trợ link sản phẩm Shopee và TikTok Shop.' },
      { status: 400 },
    );
  }

  try {
    const affiliateUrl = await createAffiliateLink(provider, productUrl);
    return Response.json({ affiliateUrl, provider });
  } catch (error) {
    if (error instanceof Error && error.message === 'API_CONFIG_MISSING') {
      return Response.json(
        {
          error:
            'API affiliate chưa được cấu hình. Hãy cập nhật khóa Shopee/TikTok trong tệp môi trường.',
        },
        { status: 503 },
      );
    }
    return Response.json(
      { error: 'Nhà cung cấp chưa thể tạo link. Vui lòng thử lại sau.' },
      { status: 502 },
    );
  }
}
