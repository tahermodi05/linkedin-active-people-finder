import {
  completeCurrentVerification,
  getCurrentScanId,
  getNextProfileForVerification,
} from "../services/backendApi.js";
import { MESSAGE_TYPES } from "../shared/messageTypes.js";
import { calculateVerificationConfidence } from "../verification/confidenceEngine.js";

let currentActivityIntelligence = null;
let verificationTabId = null;

export async function startVerificationWorker() {
  console.log("Verification Worker initialized");
}

async function ensureVerificationTabId() {
  if (verificationTabId) {
    try {
      const tab = await chrome.tabs.get(verificationTabId);

      if (tab?.id) {
        return tab.id;
      }
    } catch {
      // Fall through to create a replacement tab.
    }
  }

  const tab = await chrome.tabs.create({
    url: "https://www.linkedin.com/",
    active: false,
  });

  verificationTabId = tab.id;
  return tab.id;
}

async function navigateVerificationTab(url) {
  const tabId = await ensureVerificationTabId();

  try {
    await chrome.tabs.update(tabId, { url });
    return tabId;
  } catch (error) {
    verificationTabId = null;
    return ensureVerificationTabId();
  }
}

if (typeof chrome?.tabs?.onRemoved?.addListener === "function") {
  chrome.tabs.onRemoved.addListener((tabId) => {
    if (verificationTabId === tabId) {
      verificationTabId = null;
    }
  });
}

async function requestNextProfile() {
  return getNextProfileForVerification(getCurrentScanId());
}

async function openVerificationTab(profile) {
  if (!profile?.profileUrl) {
    throw new Error("Profile URL is missing.");
  }

  // If we already have a cached verification tab, try to reuse it by updating its URL.
  if (verificationTabId != null) {
    try {
      const updatedTab = await chrome.tabs.update(verificationTabId, {
        url: profile.profileUrl,
        active: false,
      });

      // Update succeeded — keep cached id and return the tab.
      verificationTabId = updatedTab.id;
      return updatedTab;
    } catch (err) {
      // The tab might have been closed or update failed; clear cache and create a new one below.
      verificationTabId = null;
    }
  }

  // Create a new tab and cache its id for reuse.
  const tab = await chrome.tabs.create({
    url: profile.profileUrl,
    active: false,
  });

  verificationTabId = tab.id;
  return tab;
}

function buildRecentActivityUrl(profileUrl) {
  const url = new URL(profileUrl);

  url.pathname = `${url.pathname.replace(/\/$/, "")}/recent-activity/all/`;
  url.search = "";
  url.hash = "";

  return url.toString();
}

function waitForProfileReady(tabId) {
  return new Promise((resolve) => {
    function onRuntimeMessage(message, sender) {
      if (
        message?.type !== MESSAGE_TYPES.PROFILE_PAGE_READY ||
        sender.tab?.id !== tabId
      ) {
        return;
      }

      chrome.runtime.onMessage.removeListener(onRuntimeMessage);
      resolve();
    }

    chrome.runtime.onMessage.addListener(onRuntimeMessage);
  });
}

function waitForActivityPageReady(tabId) {
  return new Promise((resolve) => {
    function onRuntimeMessage(message, sender) {
      if (
        message?.type !== MESSAGE_TYPES.ACTIVITY_PAGE_READY ||
        sender.tab?.id !== tabId
      ) {
        return;
      }

      chrome.runtime.onMessage.removeListener(onRuntimeMessage);
      resolve();
    }

    chrome.runtime.onMessage.addListener(onRuntimeMessage);
  });
}

function requestActivityIntelligence(tabId) {
  return chrome.tabs.sendMessage(tabId, {
    type: MESSAGE_TYPES.EXTRACT_ACTIVITY_INTELLIGENCE,
  });
}

function waitForActivityIntelligenceExtracted(tabId) {
  return new Promise((resolve) => {
    function onRuntimeMessage(message, sender) {
      if (
        message?.type !== MESSAGE_TYPES.ACTIVITY_INTELLIGENCE_EXTRACTED ||
        sender.tab?.id !== tabId
      ) {
        return;
      }

      chrome.runtime.onMessage.removeListener(onRuntimeMessage);
      resolve(message.payload);
    }

    chrome.runtime.onMessage.addListener(onRuntimeMessage);
  });
}

async function requestProfileVerification(tabId, profileUrl) {
  return chrome.tabs.sendMessage(tabId, {
    type: MESSAGE_TYPES.VERIFY_PROFILE,
    payload: {
      profileUrl,
    },
  });
}

function waitForVerificationResult(tabId) {
  return new Promise((resolve) => {
    function onRuntimeMessage(message, sender) {
      if (
        message?.type !== MESSAGE_TYPES.PROFILE_VERIFIED ||
        sender.tab?.id !== tabId
      ) {
        return;
      }

      chrome.runtime.onMessage.removeListener(onRuntimeMessage);
      resolve(message.payload);
    }

    chrome.runtime.onMessage.addListener(onRuntimeMessage);
  });
}

function determineCurrentlyWorksHere(verificationResult) {
  if (verificationResult?.currentCompany) {
    return true;
  }

  const headline = verificationResult?.headline;

  if (!headline) {
    return false;
  }

  const employmentSignals = [
    "at ",
    "@",
    "working",
    "employee",
    "manager",
    "director",
    "founder",
    "ceo",
    "engineer",
    "developer",
    "designer",
    "consultant",
    "specialist",
    "analyst",
    "executive",
    "lead",
    "officer",
    "architect",
  ];

  return employmentSignals.some((signal) =>
    headline.toLowerCase().includes(signal)
  );
}

export async function startVerificationLifecycle() {
  console.log("Starting verification lifecycle...");

  currentActivityIntelligence = null;
  verificationTabId = null;

  const verificationTab = await ensureVerificationTabId();

  while (true) {
    currentActivityIntelligence = null;

    const profile = await requestNextProfile();

    if (!profile) {
      break;
    }

    const tabId = await navigateVerificationTab(profile.profileUrl);

    console.log("Using verification tab", tabId, profile.profileUrl);

    const verificationPromise = waitForVerificationResult(tabId);

    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Waiting for PROFILE_PAGE_READY"
    );
    await waitForProfileReady(tabId);
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "PROFILE_PAGE_READY received"
    );

    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Waiting for PROFILE_VERIFIED"
    );
    console.log("Sending VERIFY_PROFILE");
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Calling requestProfileVerification()"
    );
    await requestProfileVerification(tabId, profile.profileUrl);
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "requestProfileVerification() completed"
    );

    console.log("VERIFY_PROFILE sent");

    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Waiting for PROFILE_VERIFIED"
    );
    const verificationResult = await verificationPromise;
    const verifiedProfileWithConfidence = {
      ...verificationResult,
      verificationConfidence: calculateVerificationConfidence(verificationResult),
    };
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "PROFILE_VERIFIED received"
    );

    console.log("Verification completed", verifiedProfileWithConfidence);

    const activityUrl = buildRecentActivityUrl(profile.profileUrl);

    const activityReadyPromise = waitForActivityPageReady(tabId);

    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Calling chrome.tabs.update() for activity page"
    );
    await navigateVerificationTab(activityUrl);
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "chrome.tabs.update() completed"
    );

    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Waiting for ACTIVITY_PAGE_READY"
    );
    await activityReadyPromise;
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "ACTIVITY_PAGE_READY received"
    );

    console.log("Activity page ready");

    const activityIntelligencePromise = waitForActivityIntelligenceExtracted(
      tabId
    );

    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Calling requestActivityIntelligence()"
    );
    await requestActivityIntelligence(tabId);
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "requestActivityIntelligence() completed"
    );

    console.log("Activity extraction requested");

    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Waiting for ACTIVITY_INTELLIGENCE_EXTRACTED"
    );
    currentActivityIntelligence = await activityIntelligencePromise;
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "ACTIVITY_INTELLIGENCE_EXTRACTED received"
    );

    console.log("Activity intelligence extracted", currentActivityIntelligence);

    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "Calling completeCurrentVerification()"
    );
    await completeCurrentVerification({
      verificationStatus: "completed",
      currentlyWorksHere: determineCurrentlyWorksHere(verifiedProfileWithConfidence),
      activityIntelligence: currentActivityIntelligence,
    });
    console.log(
      "[Verification]",
      tabId,
      profile.profileUrl,
      "completeCurrentVerification() completed"
    );

    console.log("Verification lifecycle completed");
  }

  console.log("Verification lifecycle finished", verificationTab);
}
