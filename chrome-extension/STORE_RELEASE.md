# Chrome Web Store release checklist

## Upload package

Upload `releases/shopee-cookie-sync-v1.0.0.zip` in the
[Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
using **Add new item → Choose file**. The ZIP contains `manifest.json` at its
root.

For later releases, increase `version` in `manifest.json`, rebuild the ZIP, and
upload it to the existing item. Chrome requires every uploaded version to be
higher than the previous version.

## Suggested listing

**Name:** Shopee Cookie Sync

**Category:** Shopping

**Summary:** Manually sync your Shopee Affiliate session cookie to your own Vercel application.

**Detailed description:**

Shopee Cookie Sync helps operators of a self-hosted Shopee Affiliate tool update
its server-side session cookie. Open affiliate.shopee.vn, click the extension,
review the cookie-use disclosure, and choose Capture & sync.

- Runs only on affiliate.shopee.vn.
- Syncs only after an explicit button click.
- Sends cookies only to the Vercel endpoint configured by the user.
- Never displays or stores captured cookie values in extension storage.
- Shows clear success, error, and unsupported-site messages.

## Permission justifications

- `activeTab`: checks that the active page is `affiliate.shopee.vn` after the
  user clicks the extension.
- `cookies`: reads the authentication cookies required by the extension's only
  sync function.
- `storage`: saves the user's endpoint, sync secret, and last-sync timestamp.
- `https://affiliate.shopee.vn/*`: limits cookie access to the supported site.
- Optional HTTPS/localhost hosts: requested only for the endpoint the user
  configures.

## Privacy tab

Declare that the extension handles **authentication information** and **website
activity**. State that both are used only for the cookie-sync feature, are not
sold or used for advertising, and are transmitted only to the endpoint selected
by the user. Certify the Chrome Web Store Limited Use requirements.

Replace the placeholders in `PRIVACY.md`, publish it at a public HTTPS URL, and
enter that URL in the dashboard's Privacy tab. Keep the dashboard disclosures,
the public policy, and actual extension behavior consistent.

## Listing assets and review

- Upload the 128×128 icon from `icons/icon-128.png`.
- Add at least one current 1280×800 or 640×400 screenshot showing the popup.
- Complete Store Listing, Privacy, Distribution, and Test instructions.
- For initial testing, choose **Private** or **Unlisted** distribution; these
  options still undergo policy review.
- Explain in Test instructions that reviewers need to open
  `https://affiliate.shopee.vn`, configure their own endpoint and secret, then
  click **Capture & sync**.

Do not provide reviewers with a real production Shopee cookie or Vercel access
token. Use a dedicated test account and endpoint if review credentials are
required.
