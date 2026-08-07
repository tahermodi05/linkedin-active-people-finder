const API_BASE_URL = (
  (typeof globalThis !== "undefined" && globalThis.VERIQ_BACKEND_URL)
    ? String(globalThis.VERIQ_BACKEND_URL)
    : "https://veriqbackend-xqxqkglu.b4a.run"
).replace(/\/$/, "");

let currentScanId = null;

export function setCurrentScanId(scanId) {
  currentScanId = scanId;
}

export function getCurrentScanId() {
  return currentScanId;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  return response;
}

export async function getNextProfileForVerification(scanId = currentScanId) {
  const query = scanId ? `?scanId=${encodeURIComponent(scanId)}` : "";

  const response = await apiRequest(`/api/search/next${query}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to get next profile");
  }

  return result.data;
}

export async function completeCurrentVerification(body) {
  const response = await apiRequest("/api/search/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...body,
      scanId: currentScanId,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to complete verification");
  }

  return result.data;
}