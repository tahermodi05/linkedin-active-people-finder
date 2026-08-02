let latestScan = [];
let pendingProfileIndex = 0;

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

export function updateCurrentProfileVerification({
  verificationStatus,
  currentlyWorksHere,
  activityIntelligence,
  verifiedAt,
}) {
  if (pendingProfileIndex >= latestScan.length) {
    return null;
  }

  latestScan[pendingProfileIndex] = {
    ...latestScan[pendingProfileIndex],
    verificationStatus,
    currentlyWorksHere,
    activityIntelligence,
    verifiedAt,
  };

  return latestScan[pendingProfileIndex];
}

export function markCurrentProfileProcessed() {
  if (pendingProfileIndex < latestScan.length) {
    pendingProfileIndex++;
  }
}
