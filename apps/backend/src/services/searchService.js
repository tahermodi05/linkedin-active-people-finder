import { randomUUID } from "crypto";

import { AppError } from "../errors/AppError.js";
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
  if (!data || !Array.isArray(data.profiles) || data.profiles.length === 0) {
    throw new AppError("At least one profile is required", 400);
  }

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
  if (!scanId || !scanId.toString().trim()) {
    throw new AppError("scanId is required", 400);
  }

  const session = await getScanSession(scanId);

  if (!session) {
    return null;
  }

  return session.profiles || [];
}

export async function getNextProfileForVerification(scanId) {
  if (!scanId || !scanId.toString().trim()) {
    throw new AppError("scanId is required", 400);
  }

  return getNextPendingProfile(scanId);
}

export async function completeCurrentVerification(data) {
  if (!data || !data.scanId || !data.verificationStatus) {
    throw new AppError("scanId and verification status are required", 400);
  }

  const updatedProfile = await updateCurrentProfileVerification({
    scanId: data.scanId,
    verificationStatus: data.verificationStatus,
    currentlyWorksHere: data.currentlyWorksHere,
    activityIntelligence: data.activityIntelligence,
    verificationConfidence: data.verificationConfidence,
    verifiedAt: new Date().toISOString(),
    timings: data.timings,
  });

  if (!updatedProfile) {
    return {
      success: false,
      message: "No pending profile to verify.",
    };
  }

  await markCurrentProfileProcessed(data.scanId);
  const session = await getScanSession(data.scanId);

  const profileWithTimings = data.timings
    ? { ...updatedProfile, timings: data.timings }
    : updatedProfile;

  if (data.timings) {
    console.log(JSON.stringify({
      event: "profile_processing_timing",
      scanId: data.scanId,
      profileUrl: data.profileUrl || null,
      timings: data.timings,
    }));
  }

  return {
    success: true,
    profile: profileWithTimings,
    session,
  };
}
