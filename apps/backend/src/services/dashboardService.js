import { AppError } from "../errors/AppError.js";
import {
  getDashboardSummary as getScanStoreDashboardSummary,
  getAllScanSessions,
  deleteScanSession,
  deleteAllScanSessions,
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

  const totalProfiles = session?.totalProfiles ?? null;
  const completedProfiles = session?.verifiedProfiles ?? null;
  const pendingProfileIndex = Number.isInteger(session?.pendingProfileIndex) ? session.pendingProfileIndex : (completedProfiles ?? null);

  // Determine current profile if available
  const currentProfile = (Array.isArray(profiles) && Number.isInteger(pendingProfileIndex) && profiles[pendingProfileIndex])
    ? profiles[pendingProfileIndex]
    : null;

  // progressPercentage and estimatedRemainingProfiles only when total and completed are available
  const progressPercentage = (typeof totalProfiles === 'number' && typeof completedProfiles === 'number' && totalProfiles > 0)
    ? Number(((completedProfiles / totalProfiles) * 100).toFixed(2))
    : null;

  const estimatedRemainingProfiles = (typeof totalProfiles === 'number' && typeof completedProfiles === 'number')
    ? Math.max(totalProfiles - completedProfiles, 0)
    : null;

  // Derive updatedAt from latest completed profile or session completedAt when available
  let updatedAt = null;
  try {
    const timestamps = [];
    if (session?.completedAt) {
      const ms = Date.parse(session.completedAt);
      if (!Number.isNaN(ms)) timestamps.push(ms);
    }

    for (const p of profiles) {
      if (p?.verifiedAt) {
        const ms = Date.parse(p.verifiedAt);
        if (!Number.isNaN(ms)) timestamps.push(ms);
      }
    }

    if (timestamps.length > 0) {
      updatedAt = new Date(Math.max(...timestamps)).toISOString();
    }
  } catch (e) {
    updatedAt = null;
  }

  const live = {
    status: session?.status ?? null,
    totalProfiles,
    completedProfiles,
    progressPercentage,
    currentProfile: currentProfile ? {
      name: currentProfile.name ?? null,
      profileUrl: currentProfile.profileUrl ?? null,
      headline: currentProfile.headline ?? null,
      verificationStatus: currentProfile.verificationStatus ?? null,
      currentlyWorksHere: currentProfile.currentlyWorksHere ?? null,
    } : null,
    currentStage: currentProfile?.verificationStatus ?? null,
    estimatedRemainingProfiles,
    startedAt: session?.startedAt ?? null,
    updatedAt,
  };

  return {
    ...session,
    pendingProfiles: verificationSummary.pending,
    failedProfiles: verificationSummary.failed,
    verificationRate: getVerificationRate(verificationSummary),
    ...(includeVerificationSummary ? { verificationSummary } : {}),
    // backward compatible: add live info under `live`
    live,
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
  if (!scanId || !scanId.toString().trim()) {
    throw new AppError("scanId is required", 400);
  }

  const sessions = await getAllScanSessions();
  const session = sessions.find((item) => item.scanId === scanId);

  if (!session) {
    throw new AppError("Scan not found", 404);
  }

  return enrichDashboardScan(session, true);
}

export async function deleteDashboardScan(scanId) {
  if (!scanId || !scanId.toString().trim()) {
    throw new AppError("scanId is required", 400);
  }

  const result = await deleteScanSession(scanId);

  if (!result) {
    throw new AppError("Scan not found", 404);
  }

  return {
    deletedScans: result.deletedScans || 0,
    deletedProfiles: result.deletedProfiles || 0,
  };
}

export async function deleteAllDashboardScans() {
  const result = await deleteAllScanSessions();

  return {
    deletedScans: result.deletedScans || 0,
    deletedProfiles: result.deletedProfiles || 0,
  };
}
