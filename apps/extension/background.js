import {
  apiRequest,
  getNextProfileForVerification,
} from "./services/backendApi.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_SCAN") {
    handleStartScan(sendResponse);
    return true;
  }
});

async function openProfileForVerification(profile) {
  if (!profile?.profileUrl) {
    throw new Error("Profile URL is missing.");
  }

  const tab = await chrome.tabs.create({
    url: profile.profileUrl,
    active: false,
  });

  return tab;
}

async function handleStartScan(sendResponse) {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      throw new Error("No active tab found");
    }

    const pageResponse = await chrome.tabs.sendMessage(activeTab.id, {
      type: "DETECT_PAGE",
    });

    if (!pageResponse?.success) {
      throw new Error("Failed to detect page");
    }

    const supportedPages = ["search", "company-people"];

    if (!supportedPages.includes(pageResponse.pageType)) {
      sendResponse({
        success: false,
        message:
          "Please open a LinkedIn Company → People page before scanning.",
      });
      return;
    }

    const scanResponse = await chrome.tabs.sendMessage(activeTab.id, {
      type: "SCAN_SEARCH_RESULTS",
    });

    if (!scanResponse?.success) {
      throw new Error("Failed to scan profiles");
    }

    const profiles = scanResponse.profiles ?? [];

    const backendResponse = await apiRequest("/api/search", {
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

    const nextProfile = await getNextProfileForVerification();

    console.log("Next profile for verification:", nextProfile);

    await openProfileForVerification(nextProfile);

    sendResponse({
      success: true,
      message: `Sent ${profiles.length} profiles`,
    });
  } catch (error) {
    console.error(error);

    sendResponse({
      success: false,
      message: error.message,
    });
  }
}