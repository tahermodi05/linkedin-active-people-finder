import { getNextProfileForVerification } from "../services/backendApi.js";

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
    function onTabUpdated(updatedTabId, changeInfo) {
      if (updatedTabId !== tabId || changeInfo.status !== "complete") {
        return;
      }

      chrome.tabs.onUpdated.removeListener(onTabUpdated);
      resolve();
    }

    chrome.tabs.onUpdated.addListener(onTabUpdated);
  });
}

export async function startVerificationLifecycle() {
  console.log("Starting verification lifecycle...");

  const profile = await requestNextProfile();

  const tab = await openVerificationTab(profile);

  await waitForProfileReady(tab.id);

  console.log("Profile page ready");
}
