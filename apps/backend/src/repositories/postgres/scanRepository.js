import pool from "../../database/client.js";
import { scanQueries } from "../../database/queries/scanQueries.js";

class PostgresScanRepository {
  async createScanSession(scanId, profiles) {
    const startedAt = new Date().toISOString();

    const sessionResult = await pool.query(
      scanQueries.createScanSession,
      [
        scanId,
        "running",
        startedAt,
        null,
        profiles.length,
        0,
      ]
    );

    return sessionResult.rows[0];
  }

  async createScanProfiles(scanId, profiles) {
    const results = [];

    for (const profile of profiles) {
      const result = await pool.query(
        scanQueries.createScanProfile,
        [
          scanId,
          profile.name,
          profile.profileUrl,
          profile.headline || null,
          profile.connectionDegree || null,
          profile.mutualConnections || null,
          profile.verificationStatus || "pending",
          profile.currentlyWorksHere ?? null,
          profile.verifiedAt || null,
          profile.activityIntelligence || null,
          profile.verificationConfidence || null,
        ]
      );

      results.push(result.rows[0]);
    }

    return results;
  }

  async setLatestScan() {
    throw new Error("PostgreSQL scan repository not implemented yet");
  }

  async getLatestScan() {
    throw new Error("PostgreSQL scan repository not implemented yet");
  }

  async getNextPendingProfile() {
    throw new Error("PostgreSQL scan repository not implemented yet");
  }

  async getScanSession(scanId) {
    const result = await pool.query(
      scanQueries.getScanSession,
      [scanId]
    );

    return result.rows[0] || null;
  }

  async getAllScanSessions() {
    throw new Error("PostgreSQL scan repository not implemented yet");
  }

  async getDashboardSummary() {
    throw new Error("PostgreSQL scan repository not implemented yet");
  }

  async updateCurrentProfileVerification() {
    throw new Error("PostgreSQL scan repository not implemented yet");
  }

  async markCurrentProfileProcessed() {
    throw new Error("PostgreSQL scan repository not implemented yet");
  }
}

export default new PostgresScanRepository();