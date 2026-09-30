# Privacy Policy — Shopee Cookie Sync

> Replace the bracketed developer information and publish this policy at a
> public HTTPS URL before submitting the extension to the Chrome Web Store.

**Effective date:** [DATE]

**Developer:** [DEVELOPER OR COMPANY NAME]  
**Contact:** [SUPPORT EMAIL]

Shopee Cookie Sync has one purpose: when the user explicitly clicks
**Capture & sync**, it reads authentication cookies applicable to
`affiliate.shopee.vn` and sends them to the Vercel endpoint configured by that
user. The endpoint updates the user's selected Vercel Global Config so their
own application can make Shopee Affiliate API requests.

## Data handled

- Shopee authentication cookies for `affiliate.shopee.vn`.
- The configured Vercel endpoint URL and sync secret.
- The timestamp of the last successful sync.
- The active tab URL, used only to confirm the extension is running on the
  supported Shopee Affiliate website.

## Use, storage, and sharing

- Cookies are accessed only after the user clicks **Capture & sync**.
- Cookie values are not displayed or saved in extension storage.
- Cookies are sent only to the endpoint configured by the user and are used
  only to update the configured Global Config value.
- The endpoint URL, sync secret, and last-sync timestamp are stored locally in
  the user's Chrome extension storage.
- Data is not sold, used for advertising, or shared with unrelated third
  parties.
- The extension does not perform analytics or background browsing collection.

The operator of the configured Vercel endpoint is responsible for that
endpoint's server logs, retention, access controls, and Global Config security.
Production endpoints must use HTTPS.

## User control and deletion

Users can replace the endpoint or secret on the extension's Settings page.
Uninstalling the extension removes its local extension storage. Users must
delete or rotate the cookie stored in Vercel Global Config separately.

## Limited Use

Information handled by this extension is limited to providing its single
user-facing cookie-sync feature. It is not used for advertising, profiling, or
any unrelated purpose, and humans are not permitted to read authentication
cookie values except where required by law, necessary for security, or with the
user's explicit consent for support.

## Changes

Material changes to this policy or the extension's data practices will be
disclosed before the changed practices take effect.
