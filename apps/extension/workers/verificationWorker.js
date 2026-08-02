import {
  completeCurrentVerification,
  getNextProfileForVerification,
} from "../services/backendApi.js";
import { MESSAGE_TYPES } from "../shared/messageTypes.js";

let currentActivityIntelligence = null;

export async function startVerificationWorker() {
  console.log("Verification Worker initialized");
}

async function requestNextProfile() {
  return getNextProfileForVerification();
}

async function openVerificationTab(profile) {
  if (!profile?.profileUrl) {
    throw new Error("Profile URL is missing.");
  }

  return chrome.tabs.create({
    url: profile.profileUrl,
    active: false,
  });
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
  if (verificationResult?.company) {
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

  while (true) {
    currentActivityIntelligence = null;

    const profile = await requestNextProfile();

    if (!profile) {
      break;
    }

    const tab = await openVerificationTab(profile);

    console.log("Opened verification tab", tab.id, profile.profileUrl);

    await waitForProfileReady(tab.id);

    console.log("Profile ready received");

    console.log("Profile page ready");

    // Start listening BEFORE sending the verification request.
    const verificationPromise = waitForVerificationResult(tab.id);

    console.log("Sending VERIFY_PROFILE");

    await requestProfileVerification(tab.id, profile.profileUrl);

    console.log("VERIFY_PROFILE sent");

    const verificationResult = await verificationPromise;

    console.log("Verification completed", verificationResult);

    const activityUrl = buildRecentActivityUrl(profile.profileUrl);

    const activityReadyPromise = waitForActivityPageReady(tab.id);

    await chrome.tabs.update(tab.id, {
      url: activityUrl,
    });

    await activityReadyPromise;

    console.log("Activity page ready");

    const activityIntelligencePromise = waitForActivityIntelligenceExtracted(
      tab.id
    );

    await requestActivityIntelligence(tab.id);

    console.log("Activity extraction requested");

    currentActivityIntelligence = await activityIntelligencePromise;

    console.log("Activity intelligence extracted", currentActivityIntelligence);

    await completeCurrentVerification({
      verificationStatus: "completed",
      currentlyWorksHere: determineCurrentlyWorksHere(verificationResult),
      activityIntelligence: currentActivityIntelligence,
    });

    console.log("Verification lifecycle completed");
  }
}
