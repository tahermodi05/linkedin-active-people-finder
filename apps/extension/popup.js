console.log("popup.js loaded");

const scanButton = document.getElementById("scanButton");
const status = document.getElementById("status");
const pageTypeLabels = {
  search: "Search Results",
  profile: "Profile",
  company: "Company",
  feed: "Home Feed",
  unknown: "Unknown",
};

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
    status.textContent = response?.success === true
      ? pageTypeLabels[response.pageType] ?? "Unknown"
      : "Unknown";
  } catch (error) {
    console.error("Failed to detect LinkedIn page type", error);
    status.textContent = "Unknown";
  }
});
