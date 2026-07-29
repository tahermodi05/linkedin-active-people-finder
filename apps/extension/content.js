console.log("content.js loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DETECT_PAGE") {
    console.log("Received DETECT_PAGE from popup");

    const { pathname } = window.location;
    let pageType = "unknown";

    if (pathname.startsWith("/search/results/")) {
      pageType = "search";
    } else if (pathname.startsWith("/in/")) {
      pageType = "profile";
    } else if (pathname.startsWith("/company/")) {
      pageType = "company";
    } else if (pathname === "/") {
      pageType = "feed";
    }

    console.log("Detected LinkedIn page type", pageType);
    sendResponse({ success: true, pageType });
  }
});
