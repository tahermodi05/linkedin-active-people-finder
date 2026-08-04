const scanSessions = new Map();

let latestScan = [];
let pendingProfileIndex = 0;

export function createScanSession(scanId, profiles) {
  scanSessions.set(scanId, {
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

export function getNextPendingProfile() {
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
    }

    return;
  }

  if (pendingProfileIndex < latestScan.length) {
    pendingProfileIndex++;
  }
}
