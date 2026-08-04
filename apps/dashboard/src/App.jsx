import { useEffect, useState } from "react";

function App() {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileFilter, setProfileFilter] = useState("all");
  const [profileSort, setProfileSort] = useState("confidence");

  useEffect(() => {
    async function loadScans() {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const response = await fetch(`${backendUrl}/api/dashboard/scans`);

        if (!response.ok) {
          throw new Error("Failed to load scans");
        }

        const payload = await response.json();
        setScans(payload?.data?.scans || []);
      } catch (err) {
        setError(err.message || "Unable to load scans");
      }
    }

    loadScans();
  }, []);

  async function handleSelectScan(scanId) {
    try {
      setLoading(true);
      setError("");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/dashboard/scans/${scanId}`);

      if (!response.ok) {
        throw new Error("Failed to load scan details");
      }

      const payload = await response.json();
      setSelectedScan(payload?.data || null);
    } catch (err) {
      setError(err.message || "Unable to load scan details");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToScans() {
    setSelectedScan(null);
    setError("");
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Veriq Dashboard</h1>
      <p>Viewing existing Veriq scans from the backend.</p>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {selectedScan ? (
        <>
          <button onClick={handleBackToScans} style={{ marginBottom: "1rem" }}>
            Back to scans
          </button>

          <section style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <h2>Scan</h2>
            <div>Scan ID: {selectedScan.scanId}</div>
            <div>Status: {selectedScan.status}</div>
            <div>Total profiles: {selectedScan.totalProfiles}</div>
            <div>Verified profiles: {selectedScan.verifiedProfiles}</div>
            <div>Verification rate: {selectedScan.verificationRate ?? 0}%</div>
          </section>

          <section style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
            <h2>Profiles</h2>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <label>
                Filter:
                <select value={profileFilter} onChange={(event) => setProfileFilter(event.target.value)} style={{ marginLeft: "0.5rem" }}>
                  <option value="all">All profiles</option>
                  <option value="verified">Verified profiles</option>
                  <option value="pending">Pending profiles</option>
                  <option value="failed">Failed profiles</option>
                </select>
              </label>

              <label>
                Sort:
                <select value={profileSort} onChange={(event) => setProfileSort(event.target.value)} style={{ marginLeft: "0.5rem" }}>
                  <option value="confidence">Highest confidence first</option>
                  <option value="name">Name alphabetically</option>
                </select>
              </label>
            </div>

            {selectedScan.profiles && selectedScan.profiles.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
                {selectedScan.profiles
                  .filter((profile) => {
                    const status = String(profile.verificationStatus || "pending").toLowerCase();

                    if (profileFilter === "verified") {
                      return status === "verified" || Boolean(profile.verifiedAt);
                    }

                    if (profileFilter === "pending") {
                      return status === "pending" || status === "" || !profile.verifiedAt;
                    }

                    if (profileFilter === "failed") {
                      return status === "failed" || status === "rejected" || status === "error" || profile.currentlyWorksHere === false;
                    }

                    return true;
                  })
                  .sort((a, b) => {
                    if (profileSort === "name") {
                      return (a.name || "").localeCompare(b.name || "");
                    }

                    const confidenceA = a.verificationConfidence?.score ?? 0;
                    const confidenceB = b.verificationConfidence?.score ?? 0;
                    return confidenceB - confidenceA;
                  })
                  .map((profile, index) => {
                    const intelligence = profile.activityIntelligence;
                    const intelligenceText = intelligence
                      ? typeof intelligence === "string"
                        ? intelligence
                        : JSON.stringify(intelligence, null, 2)
                      : "No activity intelligence available.";

                    return (
                      <li key={`${profile.profileUrl || profile.name || index}`} style={{ border: "1px solid #eee", padding: "0.75rem", borderRadius: "6px" }}>
                        <div style={{ marginBottom: "0.5rem" }}>
                          <strong>{profile.name || "Unnamed profile"}</strong>
                        </div>

                        <div style={{ marginBottom: "0.5rem" }}>
                          <div><strong>Identity</strong></div>
                          <div>Headline: {profile.headline || "—"}</div>
                          <div>Profile URL: {profile.profileUrl || "—"}</div>
                        </div>

                        <div style={{ marginBottom: "0.5rem" }}>
                          <div><strong>Verification</strong></div>
                          <div>Verification status: {profile.verificationStatus || "pending"}</div>
                          <div>Verification confidence: {profile.verificationConfidence ? JSON.stringify(profile.verificationConfidence) : "—"}</div>
                          <div>Currently works here: {profile.currentlyWorksHere === null ? "—" : String(profile.currentlyWorksHere)}</div>
                          <div>Verified at: {profile.verifiedAt || "—"}</div>
                        </div>

                        <div>
                          <div><strong>Activity</strong></div>
                          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                            {intelligenceText}
                          </pre>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p>No profiles found for this scan.</p>
            )}
          </section>
        </>
      ) : (
        <>
          {!error && scans.length === 0 ? <p>No scans available yet.</p> : null}

          {scans.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
              {scans.map((scan) => (
                <li
                  key={scan.scanId}
                  onClick={() => handleSelectScan(scan.scanId)}
                  style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", cursor: "pointer" }}
                >
                  <strong>{scan.scanId}</strong>
                  <div>Status: {scan.status}</div>
                  <div>Total profiles: {scan.totalProfiles}</div>
                  <div>Verified profiles: {scan.verifiedProfiles}</div>
                  <div>Verification rate: {scan.verificationRate ?? 0}%</div>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}

      {loading ? <p>Loading scan details...</p> : null}
    </main>
  );
}

export default App;
