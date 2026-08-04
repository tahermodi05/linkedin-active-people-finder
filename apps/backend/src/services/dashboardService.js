import {
  getDashboardSummary as getScanStoreDashboardSummary,
  getAllScanSessions,
} from "../store/scanStore.js";

export async function getDashboardSummary() {
  return getScanStoreDashboardSummary();
}

export async function getDashboardScans() {
  const scans = getAllScanSessions().map((session) => {
    const { profiles, pendingProfileIndex, ...metadata } = session;

    return metadata;
  });

  return {
    scans,
  };
}

export async function getDashboardScan(scanId) {
  const sessions = getAllScanSessions();
  const session = sessions.find((item) => item.scanId === scanId);

  if (!session) {
    return null;
  }

  return session;
}
