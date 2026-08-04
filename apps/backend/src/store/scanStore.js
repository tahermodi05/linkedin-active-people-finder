const scanSessions = new Map();

let latestScan = [];
let pendingProfileIndex = 0;

export function createScanSession(scanId, profiles) {
  scanSessions.set(scanId, {
    scanId,
    status: "running",
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalProfiles: profiles.length,
    verifiedProfiles: 0,
    profiles: [...profiles],
    pendingProfileIndex: 0,
  });
}

export function setLatestScan(profiles) {
  latestScan = [...profiles];
  pendingProfileIndex = 0;
}

export function getLatestScan() {
  return latestScan;
}

export function getNextPendingProfile(scanId) {
  if (scanId) {
    const session = scanSessions.get(scanId);

    if (!session) {
      return null;
    }

    if (session.pendingProfileIndex >= session.profiles.length) {
      return null;
    }

    return session.profiles[session.pendingProfileIndex];
  }

  if (pendingProfileIndex >= latestScan.length) {
    return null;
  }

  return latestScan[pendingProfileIndex];
}

export function getScanSession(scanId) {
  const session = scanSessions.get(scanId);

  if (!session) {
    return null;
  }

  return session.profiles;
}

export function getAllScanSessions() {
  return Array.from(scanSessions.values());
}

export function getDashboardSummary() {
  const sessions = Array.from(scanSessions.values());

  return sessions.reduce(
    (summary, session) => {
      summary.totalScans += 1;

      if (session.status === "completed") {
        summary.completedScans += 1;
      } else {
        summary.runningScans += 1;
      }

      summary.totalProfiles += session.totalProfiles || 0;
      summary.verifiedProfiles += session.verifiedProfiles || 0;

      return summary;
    },
    {
      totalScans: 0,
      runningScans: 0,
      completedScans: 0,
      totalProfiles: 0,
      verifiedProfiles: 0,
    }
  );
}

export function updateCurrentProfileVerification({
  scanId,
  verificationStatus,
  currentlyWorksHere,
  activityIntelligence,
  verificationConfidence,
  verifiedAt,
}) {
  if (scanId) {
    const session = scanSessions.get(scanId);

    if (!session) {
      return null;
    }

    if (session.pendingProfileIndex >= session.profiles.length) {
      return null;
    }

    session.profiles[session.pendingProfileIndex] = {
      ...session.profiles[session.pendingProfileIndex],
      verificationStatus,
      currentlyWorksHere,
      activityIntelligence,
      verificationConfidence,
      verifiedAt,
    };

    return session.profiles[session.pendingProfileIndex];
  }

  if (pendingProfileIndex >= latestScan.length) {
    return null;
  }

  latestScan[pendingProfileIndex] = {
    ...latestScan[pendingProfileIndex],
    verificationStatus,
    currentlyWorksHere,
    activityIntelligence,
    verificationConfidence,
    verifiedAt,
  };

  return latestScan[pendingProfileIndex];
}

export function markCurrentProfileProcessed(scanId) {
  if (scanId) {
    const session = scanSessions.get(scanId);

    if (session && session.pendingProfileIndex < session.profiles.length) {
      session.pendingProfileIndex += 1;
      session.verifiedProfiles += 1;

      if (session.verifiedProfiles === session.totalProfiles) {
        session.status = "completed";
        session.completedAt = new Date().toISOString();
      }
    }

    return;
  }

  if (pendingProfileIndex < latestScan.length) {
    pendingProfileIndex++;
  }
}
