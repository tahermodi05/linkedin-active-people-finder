import { useEffect, useState } from "react";

export default function ScanDetails({ backendUrl, scanId, onBack }) {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!scanId) return;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${backendUrl}/api/dashboard/scans/${encodeURIComponent(scanId)}`);
        if (!res.ok) throw new Error("Failed to load scan details");
        const payload = await res.json();
        const s = payload?.data || payload || null;
        setScan(s);
      } catch (err) {
        setError(err.message || "Unable to load scan details");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [backendUrl, scanId]);

  if (loading) return <p>Loading scan details...</p>;
  if (error) return (
    <div>
      <p className="error-message">{error}</p>
      <button className="primary-button" onClick={() => onBack && onBack()}>Back</button>
    </div>
  );

  if (!scan) return (
    <div>
      <p>No scan found.</p>
      <button className="primary-button" onClick={() => onBack && onBack()}>Back</button>
    </div>
  );

  const profiles = Array.isArray(scan.profiles) ? scan.profiles : [];

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Scan Details — {scan.scanId}</h2>
        <div>
          <button className="primary-button" onClick={() => onBack && onBack()}>Back</button>
        </div>
      </div>

      <div className="data-panel">
        <div>Scan status: <strong>{scan.status ?? '—'}</strong></div>
        <div>Started at: <strong>{scan.startedAt ?? '—'}</strong></div>
        <div>Completed at: <strong>{scan.completedAt ?? '—'}</strong></div>
        <div>Total profiles: <strong>{scan.totalProfiles ?? '—'}</strong></div>
      </div>

      <section className="data-panel">
        <h3>Profiles ({profiles.length})</h3>

        {profiles.length === 0 ? (
          <p>No profiles in this scan.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {profiles.map((p, idx) => {
              const activityScore = p?.activityIntelligence?.score ?? p?.verificationConfidence?.score ?? null;
              const recentPosts = p?.activityIntelligence?.recentPostsCount ?? p?.activityIntelligence?.recent_posts_count ?? null;
              const signalsCount = Array.isArray(p?.activityIntelligence?.signals) ? p.activityIntelligence.signals.length : (p?.activityIntelligence?.signals_count ?? null);

              return (
                <li key={`${p.profileUrl || p.name || idx}`} className="profile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{p.name || 'Unnamed profile'}</strong>
                      <div>Headline: {p.headline || '—'}</div>
                      <div>Company: {p.currentCompany ?? p.currentEmployer ?? '—'}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div>Verification status: <strong>{p.verificationStatus ?? '—'}</strong></div>
                      <div>Currently works here: <strong>{p.currentlyWorksHere === null || p.currentlyWorksHere === undefined ? '—' : String(p.currentlyWorksHere)}</strong></div>
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div>Activity score: <strong>{activityScore ?? '—'}</strong></div>
                    <div>Recent posts: <strong>{recentPosts ?? '—'}</strong></div>
                    <div>Signals: <strong>{signalsCount ?? '—'}</strong></div>
                    <div style={{ color: '#b91c1c' }}>Error: <strong>{p.errorMessage ?? p.error ?? '—'}</strong></div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}
