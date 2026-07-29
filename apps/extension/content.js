console.log("content.js loaded");

function extractVisibleProfiles() {
  const profiles = [];
  const seenProfileUrls = new Set();
  const profileLinks = document.querySelectorAll('a[href*="/in/"]');

  console.log(`Found ${profileLinks.length} candidate profile links`);

  for (const profileLink of profileLinks) {
    const linkStyle = window.getComputedStyle(profileLink);
    const isVisible = linkStyle.display !== "none"
      && linkStyle.visibility !== "hidden"
      && profileLink.getClientRects().length > 0;
    const name = profileLink.textContent.replace(/\s+/g, " ").trim();

    if (!isVisible || !name) {
      continue;
    }

    const profileUrl = new URL(profileLink.href, window.location.origin);
    profileUrl.search = "";
    profileUrl.hash = "";

    if (!profileUrl.pathname.startsWith("/in/") || seenProfileUrls.has(profileUrl.href)) {
      continue;
    }

    seenProfileUrls.add(profileUrl.href);
    profiles.push({ name, profileUrl: profileUrl.href });
  }

  console.log("Final profiles array", profiles);
  return profiles;
}

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

  if (message.type === "SCAN_SEARCH_RESULTS") {
    console.log("Received SCAN_SEARCH_RESULTS from popup");
    const profiles = extractVisibleProfiles();

    console.log("Extracted visible LinkedIn profiles", profiles);
    sendResponse({ success: true, profiles });
  }
});
