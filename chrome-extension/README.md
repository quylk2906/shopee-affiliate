# Shopee Cookie Sync extension

This Manifest V3 extension reads the cookies that Chrome would send to
`https://affiliate.shopee.vn/api/` and sends them to this app's protected
`POST /api/shopee/cookie-sync` route only when **Capture & sync** or
**Check session** is clicked.
The extension never displays or persists the captured cookie header.

The popup shows the next browser-managed cookie expiry, distinguishes session
cookies that have no fixed expiry, and stores only the time and outcome of the
latest server-side session check. **Capture & sync** verifies the session
automatically; **Check session** verifies without updating Global Config.

## Install locally

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this `chrome-extension` directory.
4. Open the extension's **Settings** page.
5. Enter your deployed endpoint, for example
   `https://your-app.vercel.app/api/shopee/cookie-sync`, and the same secret used
   for `COOKIE_SYNC_SECRET` in Vercel.
6. Sign in at `https://affiliate.shopee.vn`, open the extension, and click
   **Capture & sync**.

If the active tab is not `affiliate.shopee.vn`, the popup displays an
**Unsupported site** warning and disables cookie capture.

## Required Vercel environment variables

```env
COOKIE_SYNC_SECRET=replace-with-a-long-random-secret
VERCEL_API_TOKEN=replace-with-a-vercel-access-token
VERCEL_GLOBAL_CONFIG_ID=replace-with-your-global-config-id
SHOPEE_COOKIE_CONFIG_KEY=shoppeCookie
# Only for team-owned stores:
VERCEL_TEAM_ID=team_xxx
```

`VERCEL_GLOBAL_CONFIG_ID` is optional when the app already has a valid
`GLOBAL_CONFIG` connection string, because the route can derive the ID from it.
The Vercel access token must have permission to update the selected Global
Config. It stays on the server and is never stored in the extension.

Create `COOKIE_SYNC_SECRET` with a password manager or a cryptographically secure
random generator. Treat the extension's stored sync secret and the Shopee cookie
as credentials.

## Chrome Web Store release

The upload-ready package is generated at
`releases/shopee-cookie-sync-v1.1.0.zip`. Follow `STORE_RELEASE.md` for the
listing, permissions, privacy disclosures, assets, and review steps. Before
submission, replace the placeholders in `PRIVACY.md` and publish it at a public
HTTPS URL.
