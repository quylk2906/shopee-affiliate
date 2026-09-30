const SHOPEE_URL = "https://affiliate.shopee.vn/api/";
const SUPPORTED_HOST = "affiliate.shopee.vn";
const statusDot = document.querySelector("#status-dot");
const statusText = document.querySelector("#status-text");
const syncButton = document.querySelector("#sync-button");
const checkButton = document.querySelector("#check-button");
const settingsButton = document.querySelector("#settings-button");
const resultMessage = document.querySelector("#result-message");
const resultIcon = document.querySelector("#result-icon");
const resultTitle = document.querySelector("#result-title");
const resultDetail = document.querySelector("#result-detail");
const lastSync = document.querySelector("#last-sync");
const lastSyncTime = document.querySelector("#last-sync-time");
const browserExpiry = document.querySelector("#browser-expiry");
const sessionStatus = document.querySelector("#session-status");
const lastChecked = document.querySelector("#last-checked");
const lastCheckedTime = document.querySelector("#last-checked-time");

class UnsupportedSiteError extends Error {
  constructor() {
    super(
      `Open ${SUPPORTED_HOST} in the active tab, then reopen this extension.`,
    );
    this.name = "UnsupportedSiteError";
  }
}

class TikTokComingSoonError extends Error {
  constructor() {
    super("TikTok support is coming soon.");
    this.name = "TikTokComingSoonError";
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
  let activeUrl;

  try {
    activeUrl = new URL(tab?.url ?? "");
  } catch {
    // Restricted pages may not expose a URL. Treat them as unsupported.
  }

  if (
    activeUrl?.protocol === "https:" &&
    activeUrl.hostname === SUPPORTED_HOST
  ) {
    return;
  }
  if (
    activeUrl?.hostname === "tiktok.com" ||
    activeUrl?.hostname.endsWith(".tiktok.com")
  ) {
    throw new TikTokComingSoonError();
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

function formatExpiryTime(value) {
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

function showSessionStatus(status = "", checkedAt, message) {
  const labels = {
    valid: "Valid",
    expired: "Expired — sign in again",
    unknown: "Unable to verify",
  };
  sessionStatus.textContent = labels[status] ?? "Not checked";
  sessionStatus.className = labels[status] ? status : "";
  sessionStatus.title = message ?? "";

  const formatted = formatSyncTime(checkedAt);
  lastChecked.hidden = !formatted;
  lastCheckedTime.textContent = formatted;
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

async function captureCookies() {
  const storeId = await activeCookieStoreId();
  const details = storeId ? { url: SHOPEE_URL, storeId } : { url: SHOPEE_URL };
  const cookies = await chrome.cookies.getAll(details);

  if (cookies.length === 0) {
    throw new Error("No Shopee cookies found. Sign in, then try again.");
  }

  return {
    count: cookies.length,
    header: cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
    cookies,
  };
}

function showBrowserExpiry(cookies) {
  const persistentExpiries = cookies
    .map((cookie) => cookie.expirationDate)
    .filter((value) => Number.isFinite(value))
    .map((value) => value * 1000)
    .sort((left, right) => left - right);
  const sessionCount = cookies.filter((cookie) => cookie.session).length;
  const parts = [];

  if (persistentExpiries.length > 0) {
    parts.push(`Next cookie: ${formatExpiryTime(persistentExpiries[0])}`);
  }
  if (sessionCount > 0) {
    parts.push(
      `${sessionCount} session cookie${sessionCount === 1 ? "" : "s"}`,
    );
  }

  browserExpiry.textContent =
    parts.join(" · ") || "Session cookies — no fixed expiry";
}

async function loadBrowserExpiry() {
  try {
    const captured = await captureCookies();
    showBrowserExpiry(captured.cookies);
    return captured;
  } catch (error) {
    browserExpiry.textContent =
      error instanceof Error ? error.message : "No Shopee cookies found.";
    return null;
  }
}

async function postCookie(endpoint, syncSecret, captured, action) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${syncSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cookie: captured.header, action }),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : `Request failed (${response.status}).`,
    );
  }
  return result;
}

async function saveAndShowSessionCheck(result) {
  const status = result.session?.status ?? "unknown";
  const checkedAt = result.checkedAt ?? new Date().toISOString();
  const message = result.session?.message ?? "Shopee did not return a result.";
  await chrome.storage.local.set({
    lastSessionStatus: status,
    lastSessionCheckedAt: checkedAt,
    lastSessionMessage: message,
  });
  showSessionStatus(status, checkedAt, message);
  return { status, message };
}

async function syncCookies() {
  syncButton.disabled = true;
  checkButton.disabled = true;
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

    const captured = await captureCookies();
    showBrowserExpiry(captured.cookies);
    setStatus(`Syncing ${captured.count} cookies…`, "working");
    const result = await postCookie(
      endpoint,
      settings.syncSecret,
      captured,
      "sync",
    );
    const session = await saveAndShowSessionCheck(result);

    const syncedAt = new Date().toISOString();
    await chrome.storage.local.set({ lastSyncedAt: syncedAt });
    showLastSync(syncedAt);
    if (session.status === "valid") {
      setStatus("Cookie synced and verified", "success");
      showResult(
        "success",
        "Sync successful",
        `Updated ${result.key ?? "Global Config"} with ${captured.count} cookies. Shopee accepted the session.`,
      );
    } else {
      setStatus("Cookie synced; check session", "warning");
      showResult(
        "warning",
        session.status === "expired"
          ? "Synced, but session expired"
          : "Synced; verification unavailable",
        session.message,
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not sync cookies.";
    const unsupported = error instanceof UnsupportedSiteError;
    const tiktokComingSoon = error instanceof TikTokComingSoonError;
    canRetry = !unsupported && !tiktokComingSoon;
    const type = unsupported || tiktokComingSoon ? "warning" : "error";
    const title = tiktokComingSoon
      ? "TikTok is coming"
      : unsupported
        ? "Unsupported site"
        : "Sync failed";
    setStatus(title, type);
    showResult(type, title, message);
  } finally {
    syncButton.disabled = !canRetry;
    checkButton.disabled = !canRetry;
  }
}

async function checkSession() {
  checkButton.disabled = true;
  syncButton.disabled = true;
  hideResult();
  setStatus("Checking Shopee session…", "working");

  try {
    await ensureSupportedSite();
    const settings = await chrome.storage.local.get([
      "endpointUrl",
      "syncSecret",
    ]);
    const endpoint = validateSettings(settings);
    await ensureEndpointPermission(endpoint);
    const captured = await captureCookies();
    showBrowserExpiry(captured.cookies);
    const result = await postCookie(
      endpoint,
      settings.syncSecret,
      captured,
      "verify",
    );
    const session = await saveAndShowSessionCheck(result);

    if (session.status === "valid") {
      setStatus("Shopee session is valid", "success");
      showResult("success", "Session valid", session.message);
    } else {
      const title =
        session.status === "expired" ? "Session expired" : "Unable to verify";
      setStatus(title, "warning");
      showResult("warning", title, session.message);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not check the session.";
    const unsupported = error instanceof UnsupportedSiteError;
    const tiktokComingSoon = error instanceof TikTokComingSoonError;
    const type = unsupported || tiktokComingSoon ? "warning" : "error";
    const title = tiktokComingSoon
      ? "TikTok is coming"
      : unsupported
        ? "Unsupported site"
        : "Check failed";
    setStatus(title, type);
    showResult(type, title, message);
  } finally {
    try {
      await ensureSupportedSite();
      const settings = await chrome.storage.local.get([
        "endpointUrl",
        "syncSecret",
      ]);
      validateSettings(settings);
      syncButton.disabled = false;
      checkButton.disabled = false;
    } catch {
      syncButton.disabled = true;
      checkButton.disabled = true;
    }
  }
}

async function initialize() {
  const settings = await chrome.storage.local.get([
    "endpointUrl",
    "syncSecret",
    "lastSyncedAt",
    "lastSessionStatus",
    "lastSessionCheckedAt",
    "lastSessionMessage",
  ]);

  showLastSync(settings.lastSyncedAt);
  showSessionStatus(
    settings.lastSessionStatus,
    settings.lastSessionCheckedAt,
    settings.lastSessionMessage,
  );
  try {
    await ensureSupportedSite();
    validateSettings(settings);
    const captured = await loadBrowserExpiry();
    if (!captured) {
      setStatus("Sign in required", "warning");
      showResult(
        "warning",
        "No Shopee cookies",
        "Sign in to Shopee Affiliate, then reopen this extension.",
      );
      return;
    }
    setStatus("Ready to capture", "ready");
    syncButton.disabled = false;
    checkButton.disabled = false;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Settings required.";
    const unsupported = error instanceof UnsupportedSiteError;
    const tiktokComingSoon = error instanceof TikTokComingSoonError;
    const type = unsupported || tiktokComingSoon ? "warning" : "error";
    const title = tiktokComingSoon
      ? "TikTok is coming"
      : unsupported
        ? "Unsupported site"
        : "Setup required";
    setStatus(title, type);
    showResult(type, title, message);
  }
}

syncButton.addEventListener("click", syncCookies);
checkButton.addEventListener("click", checkSession);
settingsButton.addEventListener("click", () =>
  chrome.runtime.openOptionsPage(),
);
initialize();
