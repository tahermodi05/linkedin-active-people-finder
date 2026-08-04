import {
  getDashboardSummary as getScanStoreDashboardSummary,
  getAllScanSessions,
} from "../repositories/scanRepository.js";

function getVerificationSummary(profiles = []) {
  const total = profiles.length;
  let pending = 0;
  let verified = 0;
  let failed = 0;

  for (const profile of profiles) {
    const status = String(profile?.verificationStatus || "").trim().toLowerCase();
    const hasVerifiedAt = Boolean(profile?.verifiedAt);
    const currentlyWorksHere = profile?.currentlyWorksHere;

    if (status === "failed" || status === "rejected" || status === "error" || currentlyWorksHere === false) {
      failed += 1;
    } else if (status === "pending" || status === "" || !hasVerifiedAt) {
      pending += 1;
    } else {
      verified += 1;
    }
  }

  return { total, pending, verified, failed };
}

function getVerificationRate(verificationSummary) {
  if (!verificationSummary.total) {
    return 0;
  }

  return Number(((verificationSummary.verified / verificationSummary.total) * 100).toFixed(2));
}

function enrichDashboardScan(session, includeVerificationSummary = false) {
  const profiles = Array.isArray(session?.profiles) ? session.profiles : [];
  const verificationSummary = getVerificationSummary(profiles);

  return {
    ...session,
    pendingProfiles: verificationSummary.pending,
    failedProfiles: verificationSummary.failed,
    verificationRate: getVerificationRate(verificationSummary),
    ...(includeVerificationSummary ? { verificationSummary } : {}),
  };
}

export async function getDashboardSummary() {
  return getScanStoreDashboardSummary();
}

export async function getDashboardScans() {
  const sessions = await getAllScanSessions();
  const scans = sessions.map((session) => {
    const { profiles, pendingProfileIndex, ...metadata } = session;

    return enrichDashboardScan({ ...metadata, profiles });
  });

  return {
    scans,
  };
}

export async function getDashboardScan(scanId) {
  const sessions = await getAllScanSessions();
  const session = sessions.find((item) => item.scanId === scanId);

  if (!session) {
    return null;
  }

  return enrichDashboardScan(session, true);
}
