import { randomUUID } from "node:crypto";
import pool, { withTransaction } from "../../database/client.js";
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

  getVerificationSummary(profiles = []) {
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

  getVerificationRate(verificationSummary) {
    if (!verificationSummary.total) {
      return 0;
    }

    return Number(((verificationSummary.verified / verificationSummary.total) * 100).toFixed(2));
  }

  mapSessionRow(sessionRow, profiles = [], progress = {}) {
    if (!sessionRow) {
      return null;
    }

    const normalizedProfiles = profiles.map((profile) => this.normalizeProfile(profile));
    const verificationSummary = this.getVerificationSummary(normalizedProfiles);
    const totalProfiles = progress.totalProfiles ?? sessionRow.total_profiles;
    const verifiedProfiles = progress.verifiedProfiles ?? sessionRow.verified_profiles;
    const pendingProfileIndex = progress.pendingProfileIndex ?? 0;
    const status = progress.status ?? sessionRow.status;
    const completedAt = progress.completedAt ?? sessionRow.completed_at;

    return {
      scanId: sessionRow.scan_id,
      status,
      startedAt: sessionRow.started_at,
      completedAt,
      totalProfiles,
      verifiedProfiles,
      profiles: normalizedProfiles,
      pendingProfileIndex,
      pendingProfiles: verificationSummary.pending,
      failedProfiles: verificationSummary.failed,
      verificationRate: this.getVerificationRate(verificationSummary),
      verificationSummary,
    };
  }

  async getSessionProgress(scanId, sessionRow = null) {
    const currentSessionRow = sessionRow || (await pool.query(
      `
        SELECT scan_id, status, started_at, completed_at, total_profiles, verified_profiles
        FROM scan_sessions
        WHERE scan_id = $1
      `,
      [scanId]
    )).rows[0];

    if (!currentSessionRow) {
      return null;
    }

    const processedCountResult = await pool.query(
      `
        SELECT COUNT(*)::int AS processed_count
        FROM scan_profiles
        WHERE scan_id = $1
          AND verified_at IS NOT NULL
      `,
      [scanId]
    );

    const processedCount = processedCountResult.rows[0]?.processed_count || 0;
    const totalProfiles = currentSessionRow.total_profiles || 0;
    const verifiedProfiles = processedCount;
    const completedAt = verifiedProfiles >= totalProfiles
      ? currentSessionRow.completed_at ?? new Date().toISOString()
      : null;

    return {
      status: verifiedProfiles >= totalProfiles ? "completed" : currentSessionRow.status,
      completedAt,
      totalProfiles,
      verifiedProfiles,
      pendingProfileIndex: verifiedProfiles,
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

  async getCurrentPendingProfileRow(scanId, client = null) {
    const queryClient = client || pool;
    const result = await queryClient.query(
      `
        SELECT *
        FROM scan_profiles
        WHERE scan_id = $1
        ORDER BY id
      `,
      [scanId]
    );

    return result.rows.find((row) => row.verified_at === null) || null;
  }

  async createScanSession(scanId, profiles) {
    const startedAt = new Date().toISOString();
    const targetScanId = scanId || randomUUID();

    return withTransaction(async (client) => {
      const sessionResult = await client.query(
        scanQueries.createScanSession,
        [
          targetScanId,
          "running",
          startedAt,
          null,
          profiles.length,
          0,
        ]
      );

      await this.createScanProfiles(targetScanId, profiles, client);

      return this.mapSessionRow(sessionResult.rows[0], profiles);
    });
  }

  async createScanProfiles(scanId, profiles, client = null) {
    const queryClient = client || pool;
    const results = [];

    for (const profile of profiles) {
      const result = await queryClient.query(
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
    const scanId = randomUUID();
    return this.createScanSession(scanId, profiles);
  }

  async getLatestScan() {
    const sessionResult = await pool.query(
      `
        SELECT *
        FROM scan_sessions
        ORDER BY started_at DESC
        LIMIT 1
      `
    );

    const latestSession = sessionResult.rows[0];

    if (!latestSession) {
      return null;
    }

    const profiles = await this.getProfilesForScan(latestSession.scan_id);
    const progress = await this.getSessionProgress(latestSession.scan_id, latestSession);

    return this.mapSessionRow({ ...latestSession, ...progress }, profiles, progress);
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

    if (!result.rows[0]) {
      return null;
    }

    const profiles = await this.getProfilesForScan(scanId);
    const progress = await this.getSessionProgress(scanId, result.rows[0]);

    return this.mapSessionRow({ ...result.rows[0], ...progress }, profiles, progress);
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
      const progress = await this.getSessionProgress(sessionRow.scan_id, sessionRow);
      sessions.push(this.mapSessionRow({ ...sessionRow, ...progress }, profiles, progress));
    }

    return sessions;
  }

  async getDashboardSummary() {
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
      const progress = await this.getSessionProgress(sessionRow.scan_id, sessionRow);
      sessions.push(this.mapSessionRow({ ...sessionRow, ...progress }, profiles, progress));
    }

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
        summary.pendingProfiles += session.pendingProfiles || 0;
        summary.failedProfiles += session.failedProfiles || 0;

        return summary;
      },
      {
        totalScans: 0,
        runningScans: 0,
        completedScans: 0,
        totalProfiles: 0,
        verifiedProfiles: 0,
        pendingProfiles: 0,
        failedProfiles: 0,
        verificationRate: 0,
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
    return withTransaction(async (client) => {
      let targetScanId = scanId;

      if (!targetScanId) {
        const sessionResult = await client.query(
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

      const pendingProfile = await this.getCurrentPendingProfileRow(targetScanId, client);

      if (!pendingProfile) {
        return null;
      }

      const result = await client.query(
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
    });
  }

  async markCurrentProfileProcessed(scanId) {
    return withTransaction(async (client) => {
      let targetScanId = scanId;

      if (!targetScanId) {
        const sessionResult = await client.query(
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

      const pendingProfile = await this.getCurrentPendingProfileRow(targetScanId, client);

      if (!pendingProfile) {
        return;
      }

      await client.query(
  `
    UPDATE scan_profiles
    SET verified_at = COALESCE(verified_at, $2::timestamp)
    WHERE id = $1
  `,
  [pendingProfile.id, new Date().toISOString()]
);

      const processedCountResult = await client.query(
        `
          SELECT COUNT(*)::int AS processed_count
          FROM scan_profiles
          WHERE scan_id = $1
            AND verification_status = 'processed'
        `,
        [targetScanId]
      );

      const sessionResult = await client.query(
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

      await client.query(
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
    });
  }
}

export default new PostgresScanRepository();