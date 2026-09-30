import "server-only";

import { timingSafeEqual } from "node:crypto";
import { parseConnectionString } from "@vercel/global-config";

export const runtime = "nodejs";

const MAX_COOKIE_LENGTH = 30_000;
const DEFAULT_CONFIG_KEY = "shoppeCookie";

function noStoreJson(body: object, init?: ResponseInit) {
  const response = Response.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function secretsMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
}

function resolveGlobalConfigId() {
  const explicitId = process.env.VERCEL_GLOBAL_CONFIG_ID?.trim();
  if (explicitId) return explicitId;

  const connectionString =
    process.env.GLOBAL_CONFIG?.trim() || process.env.EDGE_CONFIG?.trim();
  if (!connectionString) return "";

  return parseConnectionString(connectionString)?.id ?? "";
}

function hasControlCharacters(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.COOKIE_SYNC_SECRET?.trim();
  const suppliedSecret = readBearerToken(request);

  if (
    !expectedSecret ||
    !suppliedSecret ||
    !secretsMatch(suppliedSecret, expectedSecret)
  ) {
    return noStoreJson({ error: "Unauthorized." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_COOKIE_LENGTH + 1_000) {
    return noStoreJson({ error: "Request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const cookie =
    typeof body === "object" && body !== null && "cookie" in body
      ? (body as { cookie?: unknown }).cookie
      : undefined;

  if (
    typeof cookie !== "string" ||
    cookie.length === 0 ||
    cookie.length > MAX_COOKIE_LENGTH ||
    !cookie.includes("=") ||
    hasControlCharacters(cookie)
  ) {
    return noStoreJson({ error: "Invalid cookie payload." }, { status: 400 });
  }

  const vercelToken = process.env.VERCEL_API_TOKEN?.trim();
  const globalConfigId = resolveGlobalConfigId();
  const configKey =
    process.env.SHOPEE_COOKIE_CONFIG_KEY?.trim() || DEFAULT_CONFIG_KEY;

  if (!vercelToken || !globalConfigId) {
    return noStoreJson(
      { error: "Cookie sync is not configured on the server." },
      { status: 503 },
    );
  }

  const url = new URL(
    `https://api.vercel.com/v1/edge-config/${encodeURIComponent(globalConfigId)}/items`,
  );
  const teamId =
    process.env.VERCEL_TEAM_ID?.trim() || process.env.VERCEL_ORG_ID?.trim();
  if (teamId) url.searchParams.set("teamId", teamId);

  let vercelResponse: Response;
  try {
    vercelResponse = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: configKey, value: cookie }],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return noStoreJson(
      { error: "Could not reach Vercel Global Config." },
      { status: 502 },
    );
  }

  if (!vercelResponse.ok) {
    return noStoreJson(
      {
        error: "Vercel rejected the Global Config update.",
        status: vercelResponse.status,
      },
      { status: 502 },
    );
  }

  return noStoreJson({ ok: true, key: configKey });
}
