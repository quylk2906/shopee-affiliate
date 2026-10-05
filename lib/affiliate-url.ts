export type AffiliateProvider = "shopee" | "tiktok";

const SHOPEE_HOSTS = new Set(["shopee.vn", "shp.ee", "shope.ee"]);

function matchesHost(host: string, supportedHosts: Set<string>) {
  for (const supportedHost of supportedHosts) {
    if (host === supportedHost || host.endsWith(`.${supportedHost}`))
      return true;
  }
  return false;
}

export function detectProvider(productUrl: string): AffiliateProvider | null {
  try {
    const host = new URL(productUrl).hostname.toLowerCase();
    if (matchesHost(host, SHOPEE_HOSTS)) return "shopee";
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
    return null;
  } catch {
    return null;
  }
}

export function isSupportedAffiliateUrl(productUrl: string) {
  return detectProvider(productUrl) !== null;
}
