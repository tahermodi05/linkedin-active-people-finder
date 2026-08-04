import {
  setLatestScan,
  getLatestScan as getLatestScanFromStore,
  getNextPendingProfile,
  updateCurrentProfileVerification,
  markCurrentProfileProcessed,
} from "../store/scanStore.js";

export async function searchPeople(data) {
  const profiles = data.profiles.map((profile) => ({
    ...profile,
    verificationStatus: "pending",
    currentlyWorksHere: null,
    verifiedAt: null,
  }));

  setLatestScan(profiles);

  return {
    totalProfiles: profiles.length,
    profiles,
  };
}

export async function getLatestScan() {
  return {
    totalProfiles: getLatestScanFromStore().length,
    profiles: getLatestScanFromStore(),
  };
}

export async function getScanResults() {
  return getLatestScanFromStore();
}

export async function getNextProfileForVerification() {
  return getNextPendingProfile();
}

export async function completeCurrentVerification(data) {
  const updatedProfile = updateCurrentProfileVerification({
    verificationStatus: data.verificationStatus,
    currentlyWorksHere: data.currentlyWorksHere,
    activityIntelligence: data.activityIntelligence,
    verificationConfidence: data.verificationConfidence,
    verifiedAt: new Date().toISOString(),
  });

  if (!updatedProfile) {
    return {
      success: false,
      message: "No pending profile to verify.",
    };
  }

  markCurrentProfileProcessed();

  return {
    success: true,
    profile: updatedProfile,
  };
}
