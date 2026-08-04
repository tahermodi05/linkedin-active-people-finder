export const scanQueries = {
  createScanSession: `
    INSERT INTO scan_sessions (
      scan_id,
      status,
      started_at,
      completed_at,
      total_profiles,
      verified_profiles
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `,

  createScanProfile: `
    INSERT INTO scan_profiles (
      scan_id,
      name,
      profile_url,
      headline,
      connection_degree,
      mutual_connections,
      verification_status,
      currently_works_here,
      verified_at,
      activity_intelligence,
      verification_confidence
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11
    )
    RETURNING *;
  `,

  getScanSession: `
    SELECT
      ss.*,
      COALESCE(
        json_agg(sp.*) FILTER (WHERE sp.id IS NOT NULL),
        '[]'
      ) AS profiles
    FROM scan_sessions ss
    LEFT JOIN scan_profiles sp
      ON ss.scan_id = sp.scan_id
    WHERE ss.scan_id = $1
    GROUP BY ss.id;
  `,
};