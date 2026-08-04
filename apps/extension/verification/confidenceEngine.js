/**
 * Calculates an overall verification confidence score.
 *
 * @param {Object} profile
 * @returns {{ score: number, level: string }}
 */
export function calculateVerificationConfidence(profile) {
  const score = profile.employmentConfidence ?? 0;

  let level = "Low";

  if (score >= 90) {
    level = "High";
  } else if (score >= 70) {
    level = "Medium";
  }

  return {
    score,
    level,
  };
}