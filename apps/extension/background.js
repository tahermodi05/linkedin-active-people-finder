import { apiRequest } from "./services/backendApi.js";
import { MESSAGE_TYPES } from "./shared/messageTypes.js";

import {
  startVerificationWorker,
  startVerificationLifecycle,
} from "./workers/verificationWorker.js";

startVerificationWorker();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.START_SCAN) {
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

    const pageResponse = await chrome.tabs.sendMessage(activeTab.id, {
      type: MESSAGE_TYPES.DETECT_PAGE,
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
      type: MESSAGE_TYPES.SCAN_SEARCH_RESULTS,
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
    
    await startVerificationLifecycle();

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
