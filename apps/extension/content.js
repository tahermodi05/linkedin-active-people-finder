function extractVisibleProfiles() {
  const profiles = [];
  const seenProfileUrls = new Set();
  const profileLinks = document.querySelectorAll('a[href*="/in/"]');

  for (const profileLink of profileLinks) {
    const linkStyle = window.getComputedStyle(profileLink);

    const isVisible =
      linkStyle.display !== "none" &&
      linkStyle.visibility !== "hidden" &&
      profileLink.getClientRects().length > 0;

    const name = profileLink.textContent.replace(/\s+/g, " ").trim();

    if (!isVisible || !name) {
      continue;
    }

    const profileUrl = new URL(profileLink.href, window.location.origin);

    profileUrl.search = "";
    profileUrl.hash = "";

    if (
      !profileUrl.pathname.startsWith("/in/") ||
      seenProfileUrls.has(profileUrl.href)
    ) {
      continue;
    }

    seenProfileUrls.add(profileUrl.href);

    profiles.push({
      name,
      profileUrl: profileUrl.href,
    });
  }

  return profiles;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DETECT_PAGE") {
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

    sendResponse({
      success: true,
      pageType,
    });

    return true;
  }

  if (message.type === "SCAN_SEARCH_RESULTS") {
    const profiles = extractVisibleProfiles();

    sendResponse({
      success: true,
      profiles,
    });

    return true;
  }

  return false;
});