/**
 * Scan Repository
 *
 * This module defines the persistence boundary for scan data.
 *
 * Current implementation:
 * - In-memory repository
 *
 * Future implementation:
 * - PostgreSQL repository
 *
 * Services should import this module instead of depending directly
 * on a specific persistence implementation.
 */

import repository from "./repositorySelector.js";

export const {
  createScanSession,
  setLatestScan,
  getLatestScan,
  getNextPendingProfile,
  getScanSession,
  getAllScanSessions,
  getDashboardSummary,
  updateCurrentProfileVerification,
  markCurrentProfileProcessed,
} = repository;