import { getNextProfileForVerification } from "../services/backendApi.js";
import { MESSAGE_TYPES } from "../shared/messageTypes.js";

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

export async function startVerificationLifecycle() {
  console.log("Starting verification lifecycle...");

  const profile = await requestNextProfile();

  const tab = await openVerificationTab(profile);

  await waitForProfileReady(tab.id);

  console.log("Profile page ready");

  // Start listening BEFORE sending the verification request.
  const verificationPromise = waitForVerificationResult(tab.id);

  await requestProfileVerification(tab.id, profile.profileUrl);

  console.log("Verification requested");

  const verificationResult = await verificationPromise;

  console.log("Verification completed", verificationResult);
}
