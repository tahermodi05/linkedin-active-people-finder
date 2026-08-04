import { randomUUID } from "crypto";

import {
  createScanSession,
  setLatestScan,
  getLatestScan as getLatestScanFromStore,
  getNextPendingProfile,
  updateCurrentProfileVerification,
  markCurrentProfileProcessed,
  getScanSession,
} from "../repositories/scanRepository.js";

const scanSessionMetadata = new Map();

function syncSessionMetadata(scanId) {
  const session = scanSessionMetadata.get(scanId);

  if (!session) {
    return null;
  }

  const profiles = getScanSession(scanId);

  if (!profiles) {
    return null;
  }

  session.profiles = profiles;
  session.totalProfiles = profiles.length;
  session.pendingProfileIndex = profiles.filter(
    (profile) => profile.verificationStatus !== "pending"
  ).length;
  session.verifiedProfiles = session.pendingProfileIndex;

  if (session.verifiedProfiles === session.totalProfiles) {
    session.status = "completed";
    session.completedAt = session.completedAt ?? new Date().toISOString();
  } else {
    session.status = "running";
  }

  return session;
}

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

  scanSessionMetadata.set(scanId, {
    scanId,
    status: "running",
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalProfiles: profiles.length,
    verifiedProfiles: 0,
    profiles,
    pendingProfileIndex: 0,
  });

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
  return syncSessionMetadata(scanId);
}

export async function getNextProfileForVerification(scanId) {
  return getNextPendingProfile(scanId);
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
  syncSessionMetadata(data.scanId);

  return {
    success: true,
    profile: updatedProfile,
  };
}
