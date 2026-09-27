module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/app/api/affiliate-links/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$affiliate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/affiliate.ts [app-route] (ecmascript)");
;
async function POST(request) {
    let payload;
    try {
        payload = await request.json();
    } catch  {
        return Response.json({
            error: "Dữ liệu gửi lên không hợp lệ."
        }, {
            status: 400
        });
    }
    const productUrl = typeof payload === "object" && payload !== null && "productUrl" in payload ? String(payload.productUrl).trim() : "";
    if (!productUrl || productUrl.length > 2048) {
        return Response.json({
            error: "Link sản phẩm không hợp lệ."
        }, {
            status: 400
        });
    }
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$affiliate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectProvider"])(productUrl);
    if (!provider) {
        return Response.json({
            error: "Chỉ hỗ trợ link sản phẩm Shopee và TikTok Shop."
        }, {
            status: 400
        });
    }
    try {
        const affiliateUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$affiliate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAffiliateLink"])(provider, productUrl);
        return Response.json({
            affiliateUrl,
            provider
        });
    } catch (error) {
        if (error instanceof Error && error.message === "API_CONFIG_MISSING") {
            return Response.json({
                error: "API affiliate chưa được cấu hình. Hãy cập nhật khóa Shopee/TikTok trong tệp môi trường."
            }, {
                status: 503
            });
        }
        return Response.json({
            error: "Nhà cung cấp chưa thể tạo link. Vui lòng thử lại sau."
        }, {
            status: 502
        });
    }
}
}),
"[project]/lib/affiliate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAffiliateLink",
    ()=>createAffiliateLink,
    "detectProvider",
    ()=>detectProvider
]);
function getProviderConfig(provider) {
    if (provider === "shopee") {
        return {
            endpoint: process.env.SHOPEE_AFFILIATE_API_URL,
            clientId: process.env.SHOPEE_AFFILIATE_APP_ID,
            secret: process.env.SHOPEE_AFFILIATE_SECRET
        };
    }
    return {
        endpoint: process.env.TIKTOK_AFFILIATE_API_URL,
        clientId: process.env.TIKTOK_AFFILIATE_APP_KEY,
        secret: process.env.TIKTOK_AFFILIATE_SECRET
    };
}
function detectProvider(productUrl) {
    try {
        const host = new URL(productUrl).hostname.toLowerCase();
        if (host === "shopee.vn" || host.endsWith(".shopee.vn")) return "shopee";
        if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
        return null;
    } catch  {
        return null;
    }
}
function readAffiliateUrl(payload) {
    if (!payload || typeof payload !== "object") return null;
    const data = payload;
    const nested = data.data && typeof data.data === "object" ? data.data : null;
    const candidate = data.affiliateUrl ?? data.affiliate_url ?? data.shortLink ?? data.short_link ?? nested?.affiliateUrl ?? nested?.affiliate_url ?? nested?.shortLink ?? nested?.short_link;
    return typeof candidate === "string" && candidate.startsWith("http") ? candidate : null;
}
async function createAffiliateLink(provider, productUrl) {
    if (process.env.AFFILIATE_API_MOCK === "true") {
        const encoded = Buffer.from(productUrl).toString("base64url").slice(0, 14);
        return `https://affiliate.local/${provider}/${encoded}`;
    }
    const config = getProviderConfig(provider);
    if (!config.endpoint || !config.clientId || !config.secret) {
        throw new Error("API_CONFIG_MISSING");
    }
    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Affiliate-Client-Id": config.clientId,
            "X-Affiliate-Secret": config.secret
        },
        body: JSON.stringify({
            productUrl,
            provider
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) throw new Error("PROVIDER_REQUEST_FAILED");
    const affiliateUrl = readAffiliateUrl(await response.json());
    if (!affiliateUrl) throw new Error("PROVIDER_RESPONSE_INVALID");
    return affiliateUrl;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0dtez3p._.js.map