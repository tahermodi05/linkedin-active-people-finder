const statusElement = document.getElementById("status");
const scanButton = document.getElementById("scanButton");
const viewResultsButton = document.getElementById("viewResultsButton");
const captureActivityButton = document.getElementById("captureActivityButton");
const snapshotOutput = document.getElementById("snapshotOutput");

const BACKEND_BASE_URL = (
  (typeof globalThis !== "undefined" && globalThis.__VERIQ_BACKEND_URL__)
    ? String(globalThis.__VERIQ_BACKEND_URL__)
    : "http://localhost:3000"
).replace(/\/$/, "");

async function fetchScanResults() {
  const response = await fetch(`${BACKEND_BASE_URL}/api/search/results`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load results");
  }

  return result.data || [];
}

function summarizeActivityIntelligence(activityIntelligence) {
  const postCount = activityIntelligence?.recentPosts?.postCount ?? 0;
  const validPosts = activityIntelligence?.signals?.validPosts ?? 0;
  const totalPosts = activityIntelligence?.signals?.totalPosts ?? 0;

  return `posts: ${postCount}, valid: ${validPosts}, total: ${totalPosts}`;
}

function renderResults(results) {
  if (!results.length) {
    snapshotOutput.value = "No results yet.";
    statusElement.textContent = "No completed scans found.";
    return;
  }

  snapshotOutput.value = results
    .map((profile, index) => {
      return [
        `${index + 1}. ${profile.name || "Unknown"}`,
        `URL: ${profile.profileUrl || "N/A"}`,
        `currentlyWorksHere: ${String(Boolean(profile.currentlyWorksHere))}`,
        `verificationStatus: ${profile.verificationStatus || "N/A"}`,
        `activity: ${summarizeActivityIntelligence(
          profile.activityIntelligence
        )}`,
      ].join("\n");
    })
    .join("\n\n");

  statusElement.textContent = `Loaded ${results.length} result${
    results.length === 1 ? "" : "s"
  }.`;
}

scanButton.addEventListener("click", async () => {
  statusElement.textContent = "Scanning...";
  scanButton.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "START_SCAN",
    });

    statusElement.textContent = response.message;
  } catch (error) {
    console.error(error);

    statusElement.textContent = "Failed to contact background";
  } finally {
    scanButton.disabled = false;
  }
});

viewResultsButton.addEventListener("click", async () => {
  statusElement.textContent = "Loading results...";
  viewResultsButton.disabled = true;

  try {
    const results = await fetchScanResults();
    renderResults(results);
  } catch (error) {
    console.error(error);
    snapshotOutput.value = "";
    statusElement.textContent =
      error.message || "Failed to load scan results";
  } finally {
    viewResultsButton.disabled = false;
  }
});

captureActivityButton.addEventListener("click", async () => {
  statusElement.textContent = "Capturing...";
  captureActivityButton.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "CAPTURE_ACTIVITY_SNAPSHOT",
    });

    if (!response?.success) {
      throw new Error(response?.message || "Capture failed");
    }

    snapshotOutput.value = response.html || "";

    const blob = new Blob([response.html || ""], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = response.filename || "activity-page.html";
    anchor.click();
    URL.revokeObjectURL(url);

    statusElement.textContent = "Snapshot captured and download started.";
  } catch (error) {
    console.error(error);
    statusElement.textContent = error.message || "Failed to capture snapshot";
  } finally {
    captureActivityButton.disabled = false;
  }
});
