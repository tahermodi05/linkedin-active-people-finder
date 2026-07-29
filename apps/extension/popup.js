console.log("popup.js loaded");

const scanButton = document.getElementById("scanButton");
const status = document.getElementById("status");

scanButton.addEventListener("click", async () => {
  console.log("Scan Current Page clicked");

  try {
    console.log("Finding active tab");
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      throw new Error("No active tab found");
    }

    console.log("Sending DETECT_PAGE to content script", activeTab.id);
    const response = await chrome.tabs.sendMessage(activeTab.id, {
      type: "DETECT_PAGE",
    });

    console.log("Received response from content script", response);
    if (response?.success !== true || response.pageType !== "search") {
      console.log("Current page is not LinkedIn search results");
      status.textContent = "Not a Search Results page";
      return;
    }

    console.log("Sending SCAN_SEARCH_RESULTS to content script", activeTab.id);
    const scanResponse = await chrome.tabs.sendMessage(activeTab.id, {
      type: "SCAN_SEARCH_RESULTS",
    });

    const profiles = scanResponse?.success === true ? scanResponse.profiles ?? [] : [];
    console.log("Received profiles from content script", profiles);
    status.textContent = `Found ${profiles.length} profiles`;
  } catch (error) {
    console.error("Failed to detect LinkedIn page type", error);
    status.textContent = "Unknown";
  }
});
