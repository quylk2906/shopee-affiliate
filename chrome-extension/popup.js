const SHOPEE_URL = "https://affiliate.shopee.vn/api/";
const SUPPORTED_HOST = "affiliate.shopee.vn";
const statusDot = document.querySelector("#status-dot");
const statusText = document.querySelector("#status-text");
const syncButton = document.querySelector("#sync-button");
const settingsButton = document.querySelector("#settings-button");
const resultMessage = document.querySelector("#result-message");
const resultIcon = document.querySelector("#result-icon");
const resultTitle = document.querySelector("#result-title");
const resultDetail = document.querySelector("#result-detail");
const lastSync = document.querySelector("#last-sync");
const lastSyncTime = document.querySelector("#last-sync-time");

class UnsupportedSiteError extends Error {
  constructor() {
    super(
      `Open ${SUPPORTED_HOST} in the active tab, then reopen this extension.`,
    );
    this.name = "UnsupportedSiteError";
  }
}

function setStatus(message, state = "") {
  statusText.textContent = message;
  statusDot.className = `status-dot ${state}`.trim();
}

function hideResult() {
  resultMessage.hidden = true;
  resultMessage.className = "result-message";
  resultMessage.setAttribute("role", "status");
}

function showResult(type, title, detail) {
  resultMessage.hidden = false;
  resultMessage.className = `result-message ${type}`;
  resultMessage.setAttribute("role", type === "success" ? "status" : "alert");
  resultIcon.textContent = type === "success" ? "✓" : "!";
  resultTitle.textContent = title;
  resultDetail.textContent = detail;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function ensureSupportedSite() {
  const tab = await getActiveTab();

  try {
    const activeUrl = new URL(tab?.url ?? "");
    if (
      activeUrl.protocol === "https:" &&
      activeUrl.hostname === SUPPORTED_HOST
    ) {
      return;
    }
  } catch {
    // Restricted pages may not expose a URL. Treat them as unsupported.
  }

  throw new UnsupportedSiteError();
}

function formatSyncTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function showLastSync(value) {
  const formatted = formatSyncTime(value);
  lastSync.hidden = !formatted;
  lastSyncTime.textContent = formatted;
}

function validateSettings(settings) {
  if (!settings.endpointUrl || !settings.syncSecret) {
    throw new Error("Open Settings to connect your Vercel app.");
  }

  const endpoint = new URL(settings.endpointUrl);
  const isLocalhost =
    endpoint.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(endpoint.hostname);
  if (endpoint.protocol !== "https:" && !isLocalhost) {
    throw new Error("The endpoint must use HTTPS (or localhost).");
  }

  return endpoint;
}

function permissionPattern(endpoint) {
  return `${endpoint.protocol}//${endpoint.host}/*`;
}

async function ensureEndpointPermission(endpoint) {
  const origins = [permissionPattern(endpoint)];
  if (await chrome.permissions.contains({ origins })) return;

  const granted = await chrome.permissions.request({ origins });
  if (!granted) {
    throw new Error("Allow access to your Vercel app to continue.");
  }
}

async function activeCookieStoreId() {
  const tab = await getActiveTab();
  if (!tab?.id) return undefined;

  const stores = await chrome.cookies.getAllCookieStores();
  return stores.find((store) => store.tabIds.includes(tab.id))?.id;
}

async function captureCookieHeader() {
  const storeId = await activeCookieStoreId();
  const details = storeId ? { url: SHOPEE_URL, storeId } : { url: SHOPEE_URL };
  const cookies = await chrome.cookies.getAll(details);

  if (cookies.length === 0) {
    throw new Error("No Shopee cookies found. Sign in, then try again.");
  }

  return {
    count: cookies.length,
    header: cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
  };
}

async function syncCookies() {
  syncButton.disabled = true;
  let canRetry = true;
  hideResult();
  setStatus("Capturing cookies…", "working");

  try {
    await ensureSupportedSite();
    const settings = await chrome.storage.local.get([
      "endpointUrl",
      "syncSecret",
    ]);
    const endpoint = validateSettings(settings);
    await ensureEndpointPermission(endpoint);

    const captured = await captureCookieHeader();
    setStatus(`Syncing ${captured.count} cookies…`, "working");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.syncSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cookie: captured.header }),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        typeof result.error === "string"
          ? result.error
          : `Sync failed (${response.status}).`,
      );
    }

    const syncedAt = new Date().toISOString();
    await chrome.storage.local.set({ lastSyncedAt: syncedAt });
    showLastSync(syncedAt);
    setStatus("Cookie synced securely", "success");
    showResult(
      "success",
      "Sync successful",
      `Updated ${result.key ?? "Global Config"} with ${captured.count} cookies.`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not sync cookies.";
    const unsupported = error instanceof UnsupportedSiteError;
    canRetry = !unsupported;
    const type = unsupported ? "warning" : "error";
    const title = unsupported ? "Unsupported site" : "Sync failed";
    setStatus(title, type);
    showResult(type, title, message);
  } finally {
    syncButton.disabled = !canRetry;
  }
}

async function initialize() {
  const settings = await chrome.storage.local.get([
    "endpointUrl",
    "syncSecret",
    "lastSyncedAt",
  ]);

  showLastSync(settings.lastSyncedAt);
  try {
    await ensureSupportedSite();
    validateSettings(settings);
    setStatus("Ready to capture", "ready");
    syncButton.disabled = false;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Settings required.";
    const unsupported = error instanceof UnsupportedSiteError;
    const type = unsupported ? "warning" : "error";
    const title = unsupported ? "Unsupported site" : "Setup required";
    setStatus(title, type);
    showResult(type, title, message);
  }
}

syncButton.addEventListener("click", syncCookies);
settingsButton.addEventListener("click", () =>
  chrome.runtime.openOptionsPage(),
);
initialize();
