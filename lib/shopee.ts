import 'server-only';

import { get } from '@vercel/global-config';

const SHOPEE_AFFILIATE_ORIGIN = 'https://affiliate.shopee.vn';
const SHOPEE_COOKIE_CONFIG_KEY =
  process.env.SHOPEE_COOKIE_CONFIG_KEY?.trim() || 'shoppeCookie';
const DEFAULT_TIMEOUT_MS = 15_000;
const SESSION_CHECK_PATH =
  '/api/v3/offer/product/list?page_offset=0&page_limit=1&client_type=1';

export type ShopeeSessionStatus = 'valid' | 'expired' | 'unknown';

export type ShopeeSessionCheck = {
  status: ShopeeSessionStatus;
  message: string;
};

const CUSTOM_LINK_QUERY = `
  query batchGetCustomLink(
    $linkParams: [CustomLinkParam!]
    $sourceCaller: SourceCaller
  ) {
    batchCustomLink(
      linkParams: $linkParams
      sourceCaller: $sourceCaller
    ) {
      shortLink
      longLink
      failCode
    }
  }
`;

async function getShopeeCookie() {
  const localCookie = process.env.SHOPEE_COOKIE?.trim();
  let configuredCookie: unknown;

  try {
    configuredCookie = await get<unknown>(SHOPEE_COOKIE_CONFIG_KEY);
  } catch (error) {
    if (localCookie) return localCookie;
    throw error;
  }

  if (typeof configuredCookie === 'string' && configuredCookie.trim()) {
    return configuredCookie.trim();
  }
  if (localCookie) return localCookie;

  throw new Error(
    `Shopee cookie is missing from Global Config key "${SHOPEE_COOKIE_CONFIG_KEY}".`,
  );
}

function readCookie(cookie: string, name: string) {
  const prefix = `${name}=`;
  const entry = cookie
    .split(';')
    .find((part) => part.trim().startsWith(prefix));
  return entry?.trim().slice(prefix.length) ?? '';
}

function requestHeaders(cookie: string, hasBody: boolean) {
  const headers = new Headers({
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    'Affiliate-Program-Type': '1',
    Cookie: cookie,
    Origin: SHOPEE_AFFILIATE_ORIGIN,
    Referer: `${SHOPEE_AFFILIATE_ORIGIN}/`,
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
  });

  if (hasBody) {
    headers.set('Content-Type', 'application/json');
    const csrfToken = readCookie(cookie, 'csrftoken');
    if (csrfToken) headers.set('CSRF-token', csrfToken);
  }

  return headers;
}

function looksLikeAuthenticationFailure(value: string) {
  return /(?:auth|cookie|credential|login|log in|session|token).{0,40}(?:expired|invalid|missing|required)|(?:expired|invalid).{0,40}(?:auth|cookie|credential|login|session|token)/i.test(
    value,
  );
}

export async function verifyShopeeAffiliateSession(
  cookie: string,
): Promise<ShopeeSessionCheck> {
  let response: Response;
  try {
    response = await fetch(`${SHOPEE_AFFILIATE_ORIGIN}${SESSION_CHECK_PATH}`, {
      headers: requestHeaders(cookie, false),
      cache: 'no-store',
      redirect: 'follow',
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });
  } catch {
    return {
      status: 'unknown',
      message: 'Could not reach Shopee to verify this session.',
    };
  }

  const finalUrl = new URL(response.url);
  if (
    finalUrl.origin !== SHOPEE_AFFILIATE_ORIGIN ||
    /\/(?:login|signin)(?:\/|$)/i.test(finalUrl.pathname)
  ) {
    return {
      status: 'expired',
      message: 'Shopee redirected this session to sign in again.',
    };
  }

  const body = await response.text();
  if (response.status === 401 || looksLikeAuthenticationFailure(body)) {
    return {
      status: 'expired',
      message: 'Shopee no longer accepts this session. Sign in again.',
    };
  }

  if (response.status === 403) {
    return {
      status: 'unknown',
      message:
        'Shopee returned 403. The session may be blocked or lack permission.',
    };
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (response.ok && contentType.includes('application/json')) {
    try {
      const payload = JSON.parse(body) as { code?: unknown };
      if (payload.code === 0) {
        return {
          status: 'valid',
          message: 'Shopee accepted this session.',
        };
      }
    } catch {
      // A malformed response cannot prove whether the session is valid.
    }
  }

  return {
    status: 'unknown',
    message: `Shopee could not confirm this session (HTTP ${response.status}).`,
  };
}

export async function fetchShopeeAffiliate(
  path: `/api/${string}`,
  init: RequestInit = {},
) {
  const cookie = await getShopeeCookie();
  const response = await fetch(`${SHOPEE_AFFILIATE_ORIGIN}${path}`, {
    ...init,
    headers: requestHeaders(cookie, init.body !== undefined),
    cache: 'no-store',
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type':
        response.headers.get('content-type') ??
        'application/json; charset=utf-8',
    },
  });
}

export async function createShopeeCustomLinks(
  links: string[],
  subIds: string[] = [],
) {
  const advancedLinkParams = Object.fromEntries(
    subIds.slice(0, 5).map((subId, index) => [`subId${index + 1}`, subId]),
  );
  const response = await fetchShopeeAffiliate('/api/v3/gql?q=batchCustomLink', {
    method: 'POST',
    body: JSON.stringify({
      operationName: 'batchGetCustomLink',
      query: CUSTOM_LINK_QUERY,
      variables: {
        linkParams: links.map((originalLink) => ({
          originalLink,
          advancedLinkParams,
        })),
        sourceCaller: 'CUSTOM_LINK_CALLER',
      },
    }),
  });

  if (response.status === 403 && links.length === 1) {
    return fetchShopeeAffiliate('/api/v1/link/gen_by_custom', {
      method: 'POST',
      body: JSON.stringify({
        original_url: links[0],
        ...Object.fromEntries(
          subIds.map((subId, index) => [`sub_id${index + 1}`, subId]),
        ),
      }),
    });
  }

  return response;
}

export function forwardQuery(
  request: Request,
  defaults: Record<string, string | number> = {},
) {
  const incoming = new URL(request.url).searchParams;
  const outgoing = new URLSearchParams();

  for (const [key, value] of Object.entries(defaults)) {
    outgoing.set(key, String(value));
  }
  for (const [key, value] of incoming) {
    if (key.length <= 64 && value.length <= 2048) outgoing.set(key, value);
  }

  return outgoing;
}

export function defaultReportRange(days = 7) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000) - 1,
  };
}

export function shopeeRequestError(error: unknown) {
  if (error instanceof Error && error.name === 'TimeoutError') {
    return Response.json(
      { error: 'Shopee request timed out.' },
      { status: 504 },
    );
  }
  return Response.json(
    { error: 'Could not reach Shopee Affiliate.' },
    { status: 502 },
  );
}
