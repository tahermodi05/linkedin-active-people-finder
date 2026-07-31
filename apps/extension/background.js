chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_SCAN") {
    handleStartScan(sendResponse);
    return true;
  }
});

async function handleStartScan(sendResponse) {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      throw new Error("No active tab found");
    }

    // Detect page
    const pageResponse = await chrome.tabs.sendMessage(activeTab.id, {
      type: "DETECT_PAGE",
    });

    if (!pageResponse?.success) {
      throw new Error("Failed to detect page");
    }

    if (pageResponse.pageType !== "search") {
      sendResponse({
        success: false,
        message: `Current page is ${pageResponse.pageType}`,
      });
      return;
    }

    // Scan profiles
    const scanResponse = await chrome.tabs.sendMessage(activeTab.id, {
      type: "SCAN_SEARCH_RESULTS",
    });

    if (!scanResponse?.success) {
      throw new Error("Failed to scan search results");
    }

    const profiles = scanResponse.profiles ?? [];

    // Send to backend
    const backendResponse = await fetch("http://localhost:3000/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profiles,
      }),
    });

    const result = await backendResponse.json();

    if (!backendResponse.ok) {
      throw new Error(result.message || "Backend request failed");
    }

    sendResponse({
      success: true,
      message: `Sent ${profiles.length} profiles`,
    });
  } catch (error) {
    console.error("START_SCAN failed:", error);

    sendResponse({
      success: false,
      message: error.message,
    });
  }
}