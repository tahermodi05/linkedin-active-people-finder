/**
 * Scan Repository
 *
 * This module defines the persistence boundary for scan data.
 *
 * Current implementation:
 * - In-memory repository (to be added next)
 *
 * Future implementation:
 * - PostgreSQL repository
 *
 * Services should import this module instead of depending directly
 * on a specific persistence implementation.
 */

export {
  createScanSession,
  setLatestScan,
  getLatestScan,
  getNextPendingProfile,
  getScanSession,
  getAllScanSessions,
  getDashboardSummary,
  updateCurrentProfileVerification,
  markCurrentProfileProcessed,
} from "../store/scanStore.js";