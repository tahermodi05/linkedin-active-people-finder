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

const boundRepository = {
  createScanSession: (...args) => repository.createScanSession(...args),
  setLatestScan: (...args) => repository.setLatestScan(...args),
  getLatestScan: (...args) => repository.getLatestScan(...args),
  getNextPendingProfile: (...args) => repository.getNextPendingProfile(...args),
  getScanSession: (...args) => repository.getScanSession(...args),
  getAllScanSessions: (...args) => repository.getAllScanSessions(...args),
  getDashboardSummary: (...args) => repository.getDashboardSummary(...args),
  updateCurrentProfileVerification: (...args) => repository.updateCurrentProfileVerification(...args),
  markCurrentProfileProcessed: (...args) => repository.markCurrentProfileProcessed(...args),
};

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
} = boundRepository;