const SELECTORS = {
  employeeCard: ".org-people-profile-card__profile-card-spacing",
  profileLink: ".artdeco-entity-lockup__title a[href*='/in/']",
  name: ".artdeco-entity-lockup__title .lt-line-clamp",
  headline: ".artdeco-entity-lockup__subtitle .lt-line-clamp",
  connectionDegree: ".artdeco-entity-lockup__degree",
  mutualConnections:
    ".org-people-profile-card__profile-info > .text-align-center > .lt-line-clamp",
};

function getText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || null;
}

function normalizeProfileUrl(href) {
  if (!href) return null;

  try {
    const url = new URL(href, window.location.origin);

    if (!url.pathname.startsWith("/in/")) {
      return null;
    }

    url.search = "";
    url.hash = "";

    return `https://www.linkedin.com${url.pathname.replace(/\/$/, "")}/`;
  } catch {
    return null;
  }
}

function getConnectionDegree(card) {
  const degree = getText(card.querySelector(SELECTORS.connectionDegree));

  return degree?.replace(/^·\s*/, "") || null;
}

function getProfileLink(card) {
  const links = card.querySelectorAll(SELECTORS.profileLink);

  for (const link of links) {
    const href = link.getAttribute("href") || "";

    if (!href.includes("/in/")) continue;

    const aria = (link.getAttribute("aria-label") || "").trim();
    const text = getText(link);

    // Ignore accessibility links like "View John's profile"

    const url = normalizeProfileUrl(link.href);

    if (url) {
      return url;
    }
  }

  return null;
}

function getMutualConnections(card) {
  const elements = card.querySelectorAll(SELECTORS.mutualConnections);

  for (const element of elements) {
    const text = getText(element);

    if (
      text &&
      /(mutual connection|mutual connections|connection)/i.test(text)
    ) {
      return text;
    }
  }

  return null;
}

function isVisible(element) {
  if (!element) return false;

  const style = window.getComputedStyle(element);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    element.getClientRects().length > 0
  );
}

function extractProfileFromCard(card) {
  const profileUrl = getProfileLink(card);
  const name = getText(card.querySelector(SELECTORS.name));

  if (!profileUrl || !name) {
    return null;
  }

  return {
    name,
    profileUrl,
    headline: getText(card.querySelector(SELECTORS.headline)),
    connectionDegree: getConnectionDegree(card),
    mutualConnections: getMutualConnections(card),
  };
}

function extractVisibleProfiles() {
  const profiles = [];
  const seenProfileUrls = new Set();

  const employeeCards = document.querySelectorAll(SELECTORS.employeeCard);

  for (const card of employeeCards) {
    if (!isVisible(card)) {
      continue;
    }

    const profile = extractProfileFromCard(card);

    if (!profile) {
      continue;
    }

    if (seenProfileUrls.has(profile.profileUrl)) {
      continue;
    }

    seenProfileUrls.add(profile.profileUrl);
    profiles.push(profile);
  }
  
  return profiles;
}

function detectPage() {
  const { pathname } = window.location;

  if (pathname.startsWith("/search/results/")) {
    return "search";
  }

  if (/^\/company\/[^/]+\/people\/?$/.test(pathname)) {
    return "company-people";
  }

  if (pathname.startsWith("/company/")) {
    return "company";
  }

  if (pathname.startsWith("/in/")) {
    return "profile";
  }

  if (pathname === "/") {
    return "feed";
  }

  return "unknown";
}

function handleScanRequest() {
  return {
    success: true,
    profiles: extractVisibleProfiles(),
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "DETECT_PAGE") {
    sendResponse({
      success: true,
      pageType: detectPage(),
    });
    return false;
  }

  if (message?.type === "SCAN_SEARCH_RESULTS") {
    sendResponse(handleScanRequest());
    return false;
  }

  return false;
});