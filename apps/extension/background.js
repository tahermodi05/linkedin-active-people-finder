import { apiRequest, setCurrentScanId } from "./services/backendApi.js";
import { MESSAGE_TYPES } from "./shared/messageTypes.js";

import {
  startVerificationWorker,
  startVerificationLifecycle,
} from "./workers/verificationWorker.js";

let currentScanId = null;

startVerificationWorker();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.START_SCAN) {
    handleStartScan(sendResponse);
    return true;
  }

  if (message.type === MESSAGE_TYPES.CAPTURE_ACTIVITY_SNAPSHOT) {
    handleCaptureActivitySnapshot(sendResponse);
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

    console.log("Profiles being sent:", profiles);
    console.table(profiles);

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
    currentScanId = result?.data?.scanId ?? null;
    setCurrentScanId(currentScanId);

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

async function handleCaptureActivitySnapshot(sendResponse) {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      throw new Error("No active tab found");
    }

    const pageUrl = activeTab.url || "";

    if (!/^https:\/\/www\.linkedin\.com\//.test(pageUrl)) {
      sendResponse({
        success: false,
        message: "Please open a LinkedIn Activity page before capturing.",
      });
      return;
    }

    const [captureResult] = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {

        console.log("readyState:", document.readyState);
        console.log("articles:", document.querySelectorAll('[role="article"]').length);

        console.log("readyState:", document.readyState);
        console.log("articles:", document.querySelectorAll('[role="article"]').length);

        const html = document.documentElement.outerHTML
        .replace(/\r\n/g, "\n")
        .replace(/>\s+</g, "><")
        .replace(/></g, ">\n<");

        return {
          html,
          filename: "activity-page.html",
        };
      },
    });

    if (!captureResult?.result?.html) {
      throw new Error("Failed to capture snapshot");
    }

    sendResponse({
      success: true,
      message: "Activity snapshot captured.",
      html: captureResult.result.html,
      filename: captureResult.result.filename,
    });
  } catch (error) {
    console.error(error);

    sendResponse({
      success: false,
      message: error.message,
    });
  }
}
