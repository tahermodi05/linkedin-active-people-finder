import { MESSAGE_TYPES } from "./shared/messageTypes.js";

const SELECTORS = {
  employeeCard: ".org-people-profile-card__profile-card-spacing",
  profileLink: ".artdeco-entity-lockup__title a[href*='/in/']",
  name: ".artdeco-entity-lockup__title .lt-line-clamp",
  headline: ".artdeco-entity-lockup__subtitle .lt-line-clamp",
  connectionDegree: ".artdeco-entity-lockup__degree",
  mutualConnections:
    ".org-people-profile-card__profile-info > .text-align-center > .lt-line-clamp",
  loadMoreButton: ".scaffold-finite-scroll__load-button",
};

const profileHeaderExtractor = import(
  chrome.runtime.getURL("extractors/profileHeader.js")
);

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

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function waitForEmployeeGrowth(previousCount) {
  const timeout = 10000;
  const pollInterval = 300;

  const start = Date.now();

  while (Date.now() - start < timeout) {
    const currentCount = document.querySelectorAll(
      SELECTORS.employeeCard
    ).length;

    if (currentCount > previousCount) {
      console.log(
        `Employees increased: ${previousCount} → ${currentCount}`
      );
      return currentCount;
    }

    const loadingButton = document.querySelector(
      SELECTORS.loadMoreButton
    );

    if (!loadingButton) {
      await wait(pollInterval);
      continue;
    }

    await wait(pollInterval);
  }

  console.log("Timed out waiting for more employees.");

  return previousCount;
}

async function loadAllEmployees() {
  const MAX_LOAD_CLICKS = 100;

  let loadClicks = 0;

  while (loadClicks < MAX_LOAD_CLICKS) {
    const button = getLoadMoreButton();

    if (!button) {
      console.log("No more employees to load.");
      break;
    }

    const previousCount = document.querySelectorAll(
      SELECTORS.employeeCard
    ).length;

    console.log(
      `Loading batch ${loadClicks + 1}... (${previousCount} employees loaded)`
    );

    button.click();

    await waitForEmployeeGrowth(previousCount);

    await wait(1000);

    loadClicks++;
  }

  console.log("Finished loading employees.");
}

function getLoadMoreButton() {
  const button = document.querySelector(SELECTORS.loadMoreButton);

  console.log("Load More Button:", button);

  if (!button || button.disabled) {
    return null;
  }

  return button;
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

  if (/recent-activity|activity/i.test(pathname)) {
    return "activity";
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

async function handleScanRequest() {
  await loadAllEmployees();

  return {
    success: true,
    profiles: extractVisibleProfiles(),
  };
}

function normalizeWhitespace(text) {
  return text.replace(/\r\n/g, "\n");
}

function formatCapturedHtml(html) {
  const normalized = normalizeWhitespace(html)
    .replace(/>\s+</g, "><")
    .replace(/></g, ">\n<");

  return normalized;
}

async function handleActivitySnapshotCapture() {
  const { pathname } = window.location;

  if (!/recent-activity|activity/i.test(pathname)) {
    return {
      success: false,
      message: "Open a LinkedIn Activity page before capturing a snapshot.",
    };
  }

  const html = formatCapturedHtml(document.documentElement.outerHTML);

  return {
    success: true,
    html,
    filename: "activity-page.html",
  };
}

function notifyProfilePageReady() {
  if (detectPage() !== "profile") {
    return;
  }

  const profileUrl = normalizeProfileUrl(window.location.href);

  if (!profileUrl) {
    return;
  }

  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.PROFILE_PAGE_READY,
    profileUrl,
  });
}

function registerMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === MESSAGE_TYPES.DETECT_PAGE) {
    sendResponse({
      success: true,
      pageType: detectPage(),
    });
    return false;
  }

    if (message?.type === MESSAGE_TYPES.SCAN_SEARCH_RESULTS) {
      handleScanRequest().then(sendResponse);
      return true;
    }

    if (message?.type === MESSAGE_TYPES.VERIFY_PROFILE) {
      console.log("Verification request received");

      profileHeaderExtractor.then(({ extractProfileHeader }) => {
        const extractedProfile = extractProfileHeader(document);
        const profileUrl = message.payload.profileUrl;

        if (!extractedProfile.name) {
          sendResponse({
            success: false,
          });
          return;
        }

        chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.PROFILE_VERIFIED,
          payload: {
            profileUrl,
            name: extractedProfile.name,
            verified: true,
            headline: extractedProfile.headline,
            company: extractedProfile.company,
            location: extractedProfile.location,
            followers: extractedProfile.followers,
            connections: extractedProfile.connections,
            mutualConnections: extractedProfile.mutualConnections,
          },
        });
        sendResponse({
          success: true,
        });
      });
      return true;
    }

    if (message?.type === MESSAGE_TYPES.CAPTURE_ACTIVITY_SNAPSHOT) {
      handleActivitySnapshotCapture().then(sendResponse);
      return true;
    }

    return false;
  });
}

registerMessageListener();
notifyProfilePageReady();
