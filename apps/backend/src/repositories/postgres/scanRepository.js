import pool from "../../database/client.js";
import { scanQueries } from "../../database/queries/scanQueries.js";

class PostgresScanRepository {
  normalizeProfile(profile) {
    if (!profile) {
      return null;
    }

    return {
      name: profile.name || null,
      profileUrl: profile.profileUrl ?? profile.profile_url ?? null,
      headline: profile.headline ?? null,
      connectionDegree: profile.connectionDegree ?? profile.connection_degree ?? null,
      mutualConnections: profile.mutualConnections ?? profile.mutual_connections ?? null,
      verificationStatus: profile.verificationStatus ?? profile.verification_status ?? "pending",
      currentlyWorksHere: profile.currentlyWorksHere ?? profile.currently_works_here ?? null,
      verifiedAt: profile.verifiedAt ?? profile.verified_at ?? null,
      activityIntelligence: profile.activityIntelligence ?? profile.activity_intelligence ?? null,
      verificationConfidence: profile.verificationConfidence ?? profile.verification_confidence ?? null,
    };
  }

  mapSessionRow(sessionRow, profiles = []) {
    if (!sessionRow) {
      return null;
    }

    return {
      scanId: sessionRow.scan_id,
      status: sessionRow.status,
      startedAt: sessionRow.started_at,
      completedAt: sessionRow.completed_at,
      totalProfiles: sessionRow.total_profiles,
      verifiedProfiles: sessionRow.verified_profiles,
      profiles: profiles.map((profile) => this.normalizeProfile(profile)),
      pendingProfileIndex: 0,
    };
  }

  async getProfilesForScan(scanId) {
    const result = await pool.query(
      `
        SELECT *
        FROM scan_profiles
        WHERE scan_id = $1
        ORDER BY id
      `,
      [scanId]
    );

    return result.rows.map((row) => this.normalizeProfile(row));
  }

  async getCurrentPendingProfileRow(scanId) {
    const result = await pool.query(
      `
        SELECT *
        FROM scan_profiles
        WHERE scan_id = $1
        ORDER BY id
      `,
      [scanId]
    );

    return result.rows.find((row) => row.verification_status !== "processed") || null;
  }

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

    await this.createScanProfiles(scanId, profiles);

    return this.mapSessionRow(sessionResult.rows[0], profiles);
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

  async setLatestScan(profiles = []) {
    const scanId = `latest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await this.createScanSession(scanId, profiles);
  }

  async getLatestScan() {
    const sessionResult = await pool.query(
      `
        SELECT scan_id
        FROM scan_sessions
        ORDER BY started_at DESC
        LIMIT 1
      `
    );

    const latestSession = sessionResult.rows[0];

    if (!latestSession) {
      return [];
    }

    return await this.getProfilesForScan(latestSession.scan_id);
  }

  async getNextPendingProfile(scanId = null) {
    let targetScanId = scanId;

    if (!targetScanId) {
      const sessionResult = await pool.query(
        `
          SELECT scan_id
          FROM scan_sessions
          ORDER BY started_at DESC
          LIMIT 1
        `
      );

      targetScanId = sessionResult.rows[0]?.scan_id || null;
    }

    if (!targetScanId) {
      return null;
    }

    const pendingProfileRow = await this.getCurrentPendingProfileRow(targetScanId);

    return pendingProfileRow ? this.normalizeProfile(pendingProfileRow) : null;
  }

  async getScanSession(scanId) {
    const result = await pool.query(
      scanQueries.getScanSession,
      [scanId]
    );

    return result.rows[0] ? await this.getProfilesForScan(scanId) : null;
  }

  async getAllScanSessions() {
    const result = await pool.query(
      `
        SELECT *
        FROM scan_sessions
        ORDER BY started_at DESC
      `
    );

    const sessions = [];

    for (const sessionRow of result.rows) {
      const profiles = await this.getProfilesForScan(sessionRow.scan_id);
      sessions.push(this.mapSessionRow(sessionRow, profiles));
    }

    return sessions;
  }

  async getDashboardSummary() {
    const result = await pool.query(
      `
        SELECT status, total_profiles, verified_profiles
        FROM scan_sessions
      `
    );

    return result.rows.reduce(
      (summary, session) => {
        summary.totalScans += 1;

        if (session.status === "completed") {
          summary.completedScans += 1;
        } else {
          summary.runningScans += 1;
        }

        summary.totalProfiles += session.total_profiles || 0;
        summary.verifiedProfiles += session.verified_profiles || 0;

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

  async updateCurrentProfileVerification({
    scanId,
    verificationStatus,
    currentlyWorksHere,
    activityIntelligence,
    verificationConfidence,
    verifiedAt,
  }) {
    let targetScanId = scanId;

    if (!targetScanId) {
      const sessionResult = await pool.query(
        `
          SELECT scan_id
          FROM scan_sessions
          ORDER BY started_at DESC
          LIMIT 1
        `
      );

      targetScanId = sessionResult.rows[0]?.scan_id || null;
    }

    if (!targetScanId) {
      return null;
    }

    const pendingProfile = await this.getCurrentPendingProfileRow(targetScanId);

    if (!pendingProfile) {
      return null;
    }

    const result = await pool.query(
      `
        UPDATE scan_profiles
        SET verification_status = $2,
            currently_works_here = $3,
            activity_intelligence = $4,
            verification_confidence = $5,
            verified_at = $6
        WHERE id = $1
        RETURNING *
      `,
      [
        pendingProfile.id,
        verificationStatus,
        currentlyWorksHere ?? null,
        activityIntelligence || null,
        verificationConfidence || null,
        verifiedAt || null,
      ]
    );

    return this.normalizeProfile(result.rows[0]);
  }

  async markCurrentProfileProcessed(scanId) {
    let targetScanId = scanId;

    if (!targetScanId) {
      const sessionResult = await pool.query(
        `
          SELECT scan_id
          FROM scan_sessions
          ORDER BY started_at DESC
          LIMIT 1
        `
      );

      targetScanId = sessionResult.rows[0]?.scan_id || null;
    }

    if (!targetScanId) {
      return;
    }

    const pendingProfile = await this.getCurrentPendingProfileRow(targetScanId);

    if (!pendingProfile) {
      return;
    }

    await pool.query(
      `
        UPDATE scan_profiles
        SET verification_status = 'processed'
        WHERE id = $1
      `,
      [pendingProfile.id]
    );

    const processedCountResult = await pool.query(
      `
        SELECT COUNT(*)::int AS processed_count
        FROM scan_profiles
        WHERE scan_id = $1
          AND verification_status = 'processed'
      `,
      [targetScanId]
    );

    const sessionResult = await pool.query(
      `
        SELECT total_profiles, verified_profiles
        FROM scan_sessions
        WHERE scan_id = $1
      `,
      [targetScanId]
    );

    const session = sessionResult.rows[0];

    if (!session) {
      return;
    }

    const nextVerifiedProfiles = processedCountResult.rows[0].processed_count || 0;
    const completedAt = nextVerifiedProfiles >= (session.total_profiles || 0)
      ? new Date().toISOString()
      : null;

    await pool.query(
      `
        UPDATE scan_sessions
        SET verified_profiles = $2,
            status = CASE
              WHEN $2 >= $3 THEN 'completed'
              ELSE status
            END,
            completed_at = CASE
              WHEN $2 >= $3 THEN $4
              ELSE completed_at
            END
        WHERE scan_id = $1
      `,
      [targetScanId, nextVerifiedProfiles, session.total_profiles || 0, completedAt]
    );
  }
}

export default new PostgresScanRepository();