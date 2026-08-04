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
};