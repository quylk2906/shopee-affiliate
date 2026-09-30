const unsupportedPreview = new URLSearchParams(location.search).has(
  "unsupported",
);

window.chrome = {
  storage: {
    local: {
      get: async () => ({
        endpointUrl: "https://example.vercel.app/api/shopee/cookie-sync",
        syncSecret: "preview-secret-value",
      }),
      set: async () => {},
    },
  },
  permissions: { contains: async () => true, request: async () => true },
  tabs: {
    query: async () => [
      {
        id: 1,
        url: unsupportedPreview
          ? "https://example.com/"
          : "https://affiliate.shopee.vn/dashboard",
      },
    ],
  },
  cookies: {
    getAllCookieStores: async () => [{ id: "0", tabIds: [1] }],
    getAll: async () => [
      { name: "preview_session", value: "redacted" },
      { name: "csrftoken", value: "redacted" },
    ],
  },
  runtime: { openOptionsPage: () => {} },
};

window.fetch = async () =>
  new Response(JSON.stringify({ ok: true, key: "shoppeCookie" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
