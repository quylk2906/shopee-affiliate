import type { AffiliateProvider } from '@/lib/affiliate-url';
import { createShopeeCustomLinks } from '@/lib/shopee';

export { detectProvider } from '@/lib/affiliate-url';

type ProviderConfig = {
  endpoint?: string;
  clientId?: string;
  secret?: string;
};

function getProviderConfig(provider: AffiliateProvider): ProviderConfig {
  if (provider === 'shopee') {
    return {
      endpoint: process.env.SHOPEE_AFFILIATE_API_URL,
      clientId: process.env.SHOPEE_AFFILIATE_APP_ID,
      secret: process.env.SHOPEE_AFFILIATE_SECRET,
    };
  }
  return {
    endpoint: process.env.TIKTOK_AFFILIATE_API_URL,
    clientId: process.env.TIKTOK_AFFILIATE_APP_KEY,
    secret: process.env.TIKTOK_AFFILIATE_SECRET,
  };
}

function readAffiliateUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const nested =
    data.data && typeof data.data === 'object'
      ? (data.data as Record<string, unknown>)
      : null;
  const candidate =
    data.affiliateUrl ??
    data.affiliate_url ??
    data.shortLink ??
    data.short_link ??
    nested?.affiliateUrl ??
    nested?.affiliate_url ??
    nested?.shortLink ??
    nested?.short_link ??
    (Array.isArray(nested?.batchCustomLink)
      ? (nested.batchCustomLink[0] as Record<string, unknown> | undefined)
          ?.shortLink
      : undefined);
  return typeof candidate === 'string' && candidate.startsWith('http')
    ? candidate
    : null;
}

export async function createAffiliateLink(
  provider: AffiliateProvider,
  productUrl: string,
) {
  if (process.env.AFFILIATE_API_MOCK === 'true') {
    const encoded = Buffer.from(productUrl).toString('base64url').slice(0, 14);
    return `https://affiliate.local/${provider}/${encoded}`;
  }

  if (provider === 'shopee') {
    const response = await createShopeeCustomLinks([productUrl]);
    if (!response.ok) throw new Error('PROVIDER_REQUEST_FAILED');
    const affiliateUrl = readAffiliateUrl(await response.json());
    if (!affiliateUrl) throw new Error('PROVIDER_RESPONSE_INVALID');
    return affiliateUrl;
  }

  const config = getProviderConfig(provider);
  if (!config.endpoint || !config.clientId || !config.secret) {
    throw new Error('API_CONFIG_MISSING');
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Affiliate-Client-Id': config.clientId,
      'X-Affiliate-Secret': config.secret,
    },
    body: JSON.stringify({ productUrl, provider }),
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) throw new Error('PROVIDER_REQUEST_FAILED');
  const affiliateUrl = readAffiliateUrl(await response.json());
  if (!affiliateUrl) throw new Error('PROVIDER_RESPONSE_INVALID');
  return affiliateUrl;
}
