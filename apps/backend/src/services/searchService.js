import { randomUUID } from "crypto";

import {
  createScanSession,
  getLatestScan as getLatestScanFromStore,
  getNextPendingProfile,
  updateCurrentProfileVerification,
  markCurrentProfileProcessed,
  getScanSession,
} from "../repositories/scanRepository.js";

function normalizeProfiles(profiles) {
  return profiles.map((profile) => ({
    ...profile,
    verificationStatus: "pending",
    currentlyWorksHere: null,
    verifiedAt: null,
  }));
}

export async function searchPeople(data) {
  const profiles = normalizeProfiles(data.profiles);
  const scanId = randomUUID();
  const createdSession = await createScanSession(scanId, profiles);

  return {
    scanId: createdSession.scanId,
    totalProfiles: createdSession.totalProfiles,
    profiles: createdSession.profiles,
  };
}

export async function getLatestScan() {
  const latestSession = await getLatestScanFromStore();

  if (!latestSession) {
    return [];
  }

  return latestSession.profiles || [];
}

export async function getScanResults() {
  return getLatestScan();
}

export async function getScanById(scanId) {
  const session = await getScanSession(scanId);

  if (!session) {
    return null;
  }

  return session.profiles || [];
}

export async function getNextProfileForVerification(scanId) {
  return getNextPendingProfile(scanId);
}

export async function completeCurrentVerification(data) {
  const updatedProfile = await updateCurrentProfileVerification({
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

  await markCurrentProfileProcessed(data.scanId);
  const session = await getScanSession(data.scanId);

  return {
    success: true,
    profile: updatedProfile,
    session,
  };
}
