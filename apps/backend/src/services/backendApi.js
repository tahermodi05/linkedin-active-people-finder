const API_BASE_URL = "http://localhost:3000";

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