import 'server-only';

import { get } from '@vercel/global-config';

const SHOPEE_AFFILIATE_ORIGIN = 'https://affiliate.shopee.vn';
const SHOPEE_COOKIE_CONFIG_KEY = 'shoppeCookie';
const DEFAULT_TIMEOUT_MS = 15_000;

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
