import { randomUUID } from "crypto";

import {
  createScanSession,
  setLatestScan,
  getLatestScan as getLatestScanFromStore,
  getNextPendingProfile,
  updateCurrentProfileVerification,
  markCurrentProfileProcessed,
  getScanSession,
} from "../store/scanStore.js";

export async function searchPeople(data) {
  const profiles = data.profiles.map((profile) => ({
    ...profile,
    verificationStatus: "pending",
    currentlyWorksHere: null,
    verifiedAt: null,
  }));

  const scanId = randomUUID();

  setLatestScan(profiles);
  createScanSession(scanId, profiles);

  return {
    scanId,
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

export async function getScanById(scanId) {
  return getScanSession(scanId);
}

export async function getNextProfileForVerification() {
  return getNextPendingProfile();
}

export async function completeCurrentVerification(data) {
  const updatedProfile = updateCurrentProfileVerification({
    scanId: data.scanId,
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

  markCurrentProfileProcessed(data.scanId);

  return {
    success: true,
    profile: updatedProfile,
  };
}
