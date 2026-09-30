const form = document.querySelector("#settings-form");
const endpointInput = document.querySelector("#endpoint-url");
const secretInput = document.querySelector("#sync-secret");
const saveStatus = document.querySelector("#save-status");

function validateEndpoint(value) {
  const endpoint = new URL(value);
  const isLocalhost =
    endpoint.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(endpoint.hostname);

  if (endpoint.protocol !== "https:" && !isLocalhost) {
    throw new Error("Use an HTTPS endpoint (or localhost for development).");
  }

  return endpoint;
}

function permissionPattern(endpoint) {
  return `${endpoint.protocol}//${endpoint.host}/*`;
}

async function loadSettings() {
  const settings = await chrome.storage.local.get([
    "endpointUrl",
    "syncSecret",
  ]);
  endpointInput.value = settings.endpointUrl ?? "";
  secretInput.value = settings.syncSecret ?? "";
}

async function saveSettings(event) {
  event.preventDefault();
  saveStatus.className = "save-status";
  saveStatus.textContent = "Saving…";

  try {
    const endpoint = validateEndpoint(endpointInput.value.trim());
    const syncSecret = secretInput.value.trim();
    if (syncSecret.length < 16) {
      throw new Error("Use a sync secret with at least 16 characters.");
    }

    const granted = await chrome.permissions.request({
      origins: [permissionPattern(endpoint)],
    });
    if (!granted) {
      throw new Error("Host access is required to contact this endpoint.");
    }

    await chrome.storage.local.set({
      endpointUrl: endpoint.toString(),
      syncSecret,
    });
    saveStatus.textContent = "Connection saved.";
  } catch (error) {
    saveStatus.classList.add("error");
    saveStatus.textContent =
      error instanceof Error ? error.message : "Could not save settings.";
  }
}

form.addEventListener("submit", saveSettings);
loadSettings();
