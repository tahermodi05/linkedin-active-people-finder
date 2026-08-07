import { useEffect, useState, useRef } from "react";

export default function LiveScan({ backendUrl }) {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  async function fetchLatestScans() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${backendUrl}/api/dashboard/scans`);
      if (!res.ok) throw new Error("Failed to fetch scans");
      const payload = await res.json();
      const scans = payload?.data?.scans || payload?.scans || [];
      // prefer a running scan, otherwise the latest one
      let target = scans.find((s) => s.status === "running") || scans[0] || null;
      setScan(target);
    } catch (err) {
      setError(err.message || "Unable to fetch scans");
    } finally {
      setLoading(false);
    }
  }

  async function fetchScanById(scanId) {
    try {
      const res = await fetch(`${backendUrl}/api/dashboard/scans/${encodeURIComponent(scanId)}`);
      if (!res.ok) throw new Error("Failed to fetch scan");
      const payload = await res.json();
      const s = payload?.data || payload || null;
      setScan(s);
      return s;
    } catch (err) {
      setError(err.message || "Unable to fetch scan");
      return null;
    }
  }

  useEffect(() => {
    // initial load
    fetchLatestScans();
  }, []);

  useEffect(() => {
    // setup polling when a running scan exists
    if (!scan || !scan.scanId) return;

    // stop any previous poll
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (scan.status === "running") {
      // poll every 1s
      pollRef.current = setInterval(async () => {
        const updated = await fetchScanById(scan.scanId);
        if (updated && updated.status && updated.status !== "running") {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, 1000);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [scan?.scanId]);

  if (loading) return <p>Loading live scan...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!scan) return <p>No scans available.</p>;

  const total = scan.totalProfiles || 0;
  const completed = scan.verifiedProfiles || 0;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const pendingIndex = Number.isInteger(scan.pendingProfileIndex) ? scan.pendingProfileIndex : completed;
  const currentProfile = (Array.isArray(scan.profiles) && scan.profiles[pendingIndex]) || null;
  const pipelineStage = currentProfile ? (currentProfile.verificationStatus || "pending") : "idle";

  return (
    <section>
      <h2>Live Scan</h2>

      <div className="data-panel">
        <div style={{ marginBottom: 12 }}>Status: <strong>{scan.status}</strong></div>

        <div style={{ marginBottom: 12 }}>Overall progress: <strong>{percent}%</strong></div>

        <div style={{ marginBottom: 12 }}>
          Profiles completed: <strong>{completed}</strong> / <strong>{total}</strong>
        </div>

        <div style={{ marginBottom: 12 }}>
          Current profile: <strong>{currentProfile ? (currentProfile.name || currentProfile.profileUrl || "Unnamed") : "—"}</strong>
        </div>

        <div style={{ marginBottom: 12 }}>
          Current pipeline stage: <strong>{pipelineStage}</strong>
        </div>
      </div>

      {/* Optional: show a small timeline or details */}
    </section>
  );
}
