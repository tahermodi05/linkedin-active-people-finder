import {
  completeCurrentVerification,
  getCurrentScanId,
  getNextProfileForVerification,
} from "../services/backendApi.js";
import { MESSAGE_TYPES } from "../shared/messageTypes.js";
import { calculateVerificationConfidence } from "../verification/confidenceEngine.js";

let currentActivityIntelligence = null;

export async function startVerificationWorker() {
  console.log("Verification Worker initialized");
}

async function requestNextProfile() {
  return getNextProfileForVerification(getCurrentScanId());
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

  while (true) {
    currentActivityIntelligence = null;

    const profile = await requestNextProfile();

    if (!profile) {
      break;
    }

    const tab = await openVerificationTab(profile);

    console.log("Opened verification tab", tab.id, profile.profileUrl);

    const verificationPromise = waitForVerificationResult(tab.id);

    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "Waiting for PROFILE_PAGE_READY"
    );
    await waitForProfileReady(tab.id);
    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "PROFILE_PAGE_READY received"
    );

    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "Waiting for PROFILE_VERIFIED"
    );
    console.log("Sending VERIFY_PROFILE");
    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "Calling requestProfileVerification()"
    );
    await requestProfileVerification(tab.id, profile.profileUrl);
    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "requestProfileVerification() completed"
    );

    console.log("VERIFY_PROFILE sent");

    console.log(
      "[Verification]",
      tab.id,
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
      tab.id,
      profile.profileUrl,
      "PROFILE_VERIFIED received"
    );

    console.log("Verification completed", verifiedProfileWithConfidence);

    const activityUrl = buildRecentActivityUrl(profile.profileUrl);

    const activityReadyPromise = waitForActivityPageReady(tab.id);

    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "Calling chrome.tabs.update() for activity page"
    );
    await chrome.tabs.update(tab.id, {
      url: activityUrl,
    });
    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "chrome.tabs.update() completed"
    );

    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "Waiting for ACTIVITY_PAGE_READY"
    );
    await activityReadyPromise;
    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "ACTIVITY_PAGE_READY received"
    );

    console.log("Activity page ready");

    const activityIntelligencePromise = waitForActivityIntelligenceExtracted(
      tab.id
    );

    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "Calling requestActivityIntelligence()"
    );
    await requestActivityIntelligence(tab.id);
    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "requestActivityIntelligence() completed"
    );

    console.log("Activity extraction requested");

    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "Waiting for ACTIVITY_INTELLIGENCE_EXTRACTED"
    );
    currentActivityIntelligence = await activityIntelligencePromise;
    console.log(
      "[Verification]",
      tab.id,
      profile.profileUrl,
      "ACTIVITY_INTELLIGENCE_EXTRACTED received"
    );

    console.log("Activity intelligence extracted", currentActivityIntelligence);

    console.log(
      "[Verification]",
      tab.id,
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
      tab.id,
      profile.profileUrl,
      "completeCurrentVerification() completed"
    );

    console.log("Verification lifecycle completed");
  }
}
