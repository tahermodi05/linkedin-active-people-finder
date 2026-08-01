import { MESSAGE_TYPES } from "./shared/messageTypes.js";

if (!globalThis.__activitySnapshotCaptureListenerInstalled) {
  globalThis.__activitySnapshotCaptureListenerInstalled = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== MESSAGE_TYPES.CAPTURE_ACTIVITY_SNAPSHOT) {
      return false;
    }

    const html = document.documentElement.outerHTML
      .replace(/\r\n/g, "\n")
      .replace(/>\s+</g, "><")
      .replace(/></g, ">\n<");

    sendResponse({
      success: true,
      html,
      filename: "activity-page.html",
    });

    return false;
  });
}
