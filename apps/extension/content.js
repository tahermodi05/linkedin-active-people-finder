

const MESSAGE_TYPES = {
  START_SCAN: "START_SCAN",
  DETECT_PAGE: "DETECT_PAGE",
  SCAN_SEARCH_RESULTS: "SCAN_SEARCH_RESULTS",
  CAPTURE_ACTIVITY_SNAPSHOT: "CAPTURE_ACTIVITY_SNAPSHOT",
  PROFILE_PAGE_READY: "PROFILE_PAGE_READY",
  VERIFY_PROFILE: "VERIFY_PROFILE",
  PROFILE_VERIFIED: "PROFILE_VERIFIED",
  ACTIVITY_PAGE_READY: "ACTIVITY_PAGE_READY",
  EXTRACT_ACTIVITY_INTELLIGENCE: "EXTRACT_ACTIVITY_INTELLIGENCE",
  ACTIVITY_INTELLIGENCE_EXTRACTED: "ACTIVITY_INTELLIGENCE_EXTRACTED",
};

const SELECTORS = {
  profileLink:
    "a[href*='/in/']",
  loadMoreButton: ".scaffold-finite-scroll__load-button",
};

const activityIntelligenceModule = import(
  chrome.runtime.getURL("intelligence/activityIntelligence.js")
);

const searchScannerModule = import(
  chrome.runtime.getURL("scanners/searchScanner.js")
);

const profileExtractorModule = import(
  chrome.runtime.getURL("extractors/profileExtractor.js")
);

console.log("content.js loaded", window.location.href);

function getCompanyPeopleCards() {
  return document.querySelectorAll(
    ".org-people-profile-card__profile-card-spacing"
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
    const currentCount =
      detectPage() === "search"
        ? document.querySelectorAll("a[href*='/in/']").length
        : getCompanyPeopleCards().length;

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

    const previousCount =
      detectPage() === "search"
        ? document.querySelectorAll("a[href*='/in/']").length
        : getCompanyPeopleCards().length;

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

function normalizeProfileUrl(href) {
  if (!href) {
    return null;
  }

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

async function extractVisibleProfiles() {
  const searchScanner = await searchScannerModule;

  if (detectPage() === "search") {
    return searchScanner.extractVisibleProfiles(document);
  }

  return searchScanner.extractCompanyPeopleProfiles(document);
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
  try {
    await loadAllEmployees();

    const { extractVisibleProfiles, extractCompanyPeopleProfiles } =
      await searchScannerModule;

    const profiles =
      detectPage() === "search"
        ? extractVisibleProfiles(document)
        : extractCompanyPeopleProfiles(document);

    return {
      success: true,
      profiles,
    };
  } catch (error) {
    console.error("handleScanRequest failed:", error);

    return {
      success: false,
      message: error.message,
    };
  }
}

function notifyProfilePageReady() {
  console.log("notifyProfilePageReady() entered");
  const pageType = detectPage();
  console.log("after detectPage()", pageType);

  if (pageType !== "profile") {
    return;
  }

  console.log("before normalizeProfileUrl()");
  const profileUrl = normalizeProfileUrl(window.location.href);

  if (!profileUrl) {
    return;
  }

  console.log("before chrome.runtime.sendMessage()");
  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.PROFILE_PAGE_READY,
    profileUrl,
  });
  console.log("after chrome.runtime.sendMessage()");
}

function notifyActivityPageReady() {
  if (detectPage() !== "activity") {
    return;
  }

  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.ACTIVITY_PAGE_READY,
  });
}

function serializeActivityIntelligence(intelligence) {
  return {
    recentPosts: {
      postCount: intelligence?.recentPosts?.postCount ?? 0,
      posts: Array.isArray(intelligence?.recentPosts?.posts)
        ? intelligence.recentPosts.posts.map((post) => ({
            success: post?.success ?? null,
            urn: post?.urn ?? null,
            type: post?.type ?? null,
            author: post?.author ?? null,
            authorProfileUrl: post?.authorProfileUrl ?? null,
            text: post?.text ?? null,
            images: Array.isArray(post?.images) ? post.images : [],
            engagement: {
              reactions: post?.engagement?.reactions ?? null,
              comments: post?.engagement?.comments ?? null,
              reposts: post?.engagement?.reposts ?? null,
            },
            video: post?.video
              ? {
                  hasVideo: post.video.hasVideo ?? null,
                  src: post.video.src ?? null,
                  poster: post.video.poster ?? null,
                }
              : null,
            document: post?.document
              ? {
                  hasDocument: post.document.hasDocument ?? null,
                  title: post.document.title ?? null,
                  src: post.document.src ?? null,
                }
              : null,
            reason: post?.reason ?? null,
          }))
        : [],
    },
    signals: {
      totalPosts: intelligence?.signals?.totalPosts ?? 0,
      hasPosts: intelligence?.signals?.hasPosts ?? false,
      validPosts: intelligence?.signals?.validPosts ?? 0,
    },
    analysis: {
      totalPosts: intelligence?.analysis?.totalPosts ?? 0,
      mediaBreakdown: {
        text: intelligence?.analysis?.mediaBreakdown?.text ?? 0,
        image: intelligence?.analysis?.mediaBreakdown?.image ?? 0,
        video: intelligence?.analysis?.mediaBreakdown?.video ?? 0,
        document: intelligence?.analysis?.mediaBreakdown?.document ?? 0,
      },
    },
  };
}

async function waitForActivityPosts() {
  const timeout = 15000;
  const pollInterval = 500;
  const start = Date.now();

  console.log("Waiting for activity posts...");

  while (Date.now() - start < timeout) {
    const postCount = document.querySelectorAll(".feed-shared-update-v2").length;

    if (postCount > 0) {
      console.log("Activity posts found:", postCount);
      return postCount;
    }

    await wait(pollInterval);
  }

  console.log("Timed out waiting for activity posts.");

  return document.querySelectorAll(".feed-shared-update-v2").length;
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
      profileExtractorModule.then(({ extractProfileData }) => {
        try {
          const extractedProfile = extractProfileData(document);

          const profileUrl = message.payload.profileUrl;

          chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.PROFILE_VERIFIED,
            payload: {
              profileUrl,
              fullName: extractedProfile.fullName,
              verified: true,
              headline: extractedProfile.headline,
              currentCompany: extractedProfile.currentCompany,
              location: extractedProfile.location,
              currentRole: extractedProfile.currentRole,
              currentlyWorking: extractedProfile.currentlyWorking,
              employmentConfidence: extractedProfile.employmentConfidence,
              experience: extractedProfile.experience,
            },
          });
        } catch (error) {
          console.error("Profile verification failed:", error);
        }
      });

      return false;
    }
    if (message?.type === MESSAGE_TYPES.EXTRACT_ACTIVITY_INTELLIGENCE) {
      waitForActivityPosts().then(() => {
        activityIntelligenceModule.then(({ buildActivityIntelligence }) => {
          const intelligence = buildActivityIntelligence(document);
          const payload = serializeActivityIntelligence(intelligence);

          chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.ACTIVITY_INTELLIGENCE_EXTRACTED,
            payload,
          });

          sendResponse({
            success: true,
          });
        });
      });
      return true;
    }

    return false;
  });
}

registerMessageListener();
console.log("before notifyProfilePageReady()");
notifyProfilePageReady();
notifyActivityPageReady();
