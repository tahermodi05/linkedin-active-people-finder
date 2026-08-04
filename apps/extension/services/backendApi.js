const API_BASE_URL = "http://localhost:3000";

let currentScanId = null;

export function setCurrentScanId(scanId) {
  currentScanId = scanId;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  return response;
}

export async function getNextProfileForVerification() {
  const response = await apiRequest("/api/search/next");

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