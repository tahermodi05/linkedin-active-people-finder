import dotenv from 'dotenv';

dotenv.config();

const { default: repository } = await import('../src/repositories/postgres/scanRepository.js');
const { default: pool } = await import('../src/database/client.js');

const verificationProfile = {
  name: 'Postgres Verification Profile',
  profileUrl: 'https://www.linkedin.com/in/postgres-verification',
  headline: 'Verification Test',
  connectionDegree: '2nd',
  mutualConnections: 3,
  verificationStatus: 'pending',
  currentlyWorksHere: true,
  verifiedAt: null,
  activityIntelligence: { source: 'manual-verification' },
  verificationConfidence: { score: 0.95 },
};

async function main() {
  const scanId = '550e8400-e29b-41d4-a716-446655440000';

  console.log('Starting PostgreSQL repository verification...');

  try {
    await pool.query('DELETE FROM scan_profiles WHERE scan_id = $1', [scanId]);
    await pool.query('DELETE FROM scan_sessions WHERE scan_id = $1', [scanId]);
  } catch (error) {
    console.warn('Cleanup warning:', error.message);
  }

  const createdSession = await repository.createScanSession(scanId, [verificationProfile]);
  console.log('createScanSession ->', JSON.stringify(createdSession));

  const fetchedSession = await repository.getScanSession(scanId);
  console.log('getScanSession ->', JSON.stringify(fetchedSession));

  await repository.setLatestScan([verificationProfile]);
  const latestScan = await repository.getLatestScan();
  console.log('getLatestScan/setLatestScan ->', JSON.stringify(latestScan));

  const dashboardSummary = await repository.getDashboardSummary();
  console.log('getDashboardSummary ->', JSON.stringify(dashboardSummary));

  console.log('Verification completed successfully.');
}

main().catch((error) => {
  console.error('Verification failed:', error);
  process.exitCode = 1;
}).finally(async () => {
  await pool.end();
});
