import { useEffect, useState } from "react";
import "./App.css";
import LiveScan from "./components/LiveScan.jsx";
import ScanDetails from "./components/ScanDetails.jsx";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

if (!backendUrl) {
  console.error(
    "VITE_BACKEND_URL is not set. Please set VITE_BACKEND_URL in your environment or .env file. See apps/dashboard/.env.example for an example."
  );
}

const navigationItems = [
  { id: "overview", label: "Overview" },
  { id: "live-scan", label: "Live Scan" },
  { id: "scan-history", label: "Scan History" },
  { id: "qa-diagnostics", label: "QA & Diagnostics", devOnly: true },
  { id: "system-health", label: "System Health", devOnly: true },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
];

function StatusIndicator({ label, value, status = "online" }) {
  return (
    <div className="status-indicator">
      <span className={`status-dot status-${status}`} />
      <span className="status-label">{label}: <strong>{value}</strong></span>
    </div>
  );
}

function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder-panel">
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="placeholder-note">This area is reserved for Dashboard V2 features.</p>
    </section>
  );
}

function App() {
  const DEV_MODE_KEY = "veriq:devMode";
  const [activePage, setActivePage] = useState("overview");
  const [devMode, setDevMode] = useState(false);
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [deletingIds, setDeletingIds] = useState([]);
  const [deletingAll, setDeletingAll] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    try { const raw = localStorage.getItem(DEV_MODE_KEY); if (raw !== null) setDevMode(raw === 'true'); } catch (e) {}
  }, []);
  useEffect(() => { try { localStorage.setItem(DEV_MODE_KEY, devMode ? 'true' : 'false'); } catch (e) {} }, [devMode]);

  async function fetchScans() {
    try {
      setError("");
      const res = await fetch(`${backendUrl}/api/dashboard/scans`);
      if (!res.ok) throw new Error('Failed to fetch scans');
      const payload = await res.json();
      setScans(payload?.data?.scans || payload?.scans || []);
    } catch (err) { setError(err.message || 'Unable to load scans'); }
  }
  useEffect(() => { fetchScans(); }, []);

  function clearActionMessages(delay = 3000) { setTimeout(()=>{ setActionMessage(''); setActionError(''); }, delay); }

  async function handleDeleteScan(scanId) {
    if (!confirm(`Delete scan ${scanId}? This cannot be undone.`)) return;
    setActionMessage(''); setActionError(''); setDeletingIds(s=>[...s, scanId]);
    try {
      const res = await fetch(`${backendUrl}/api/dashboard/scans/${encodeURIComponent(scanId)}`, { method: 'DELETE' });
      if (res.ok) { setActionMessage('Scan deleted'); await fetchScans(); }
      else if (res.status === 404 || res.status === 405) setActionError('Backend does not support deleting individual scans.');
      else { const txt = await res.text().catch(()=>null); setActionError(`Failed to delete scan: ${res.status} ${txt || ''}`); }
    } catch (err) { setActionError(err.message || 'Failed to delete scan'); }
    finally { setDeletingIds(s=>s.filter(id=>id!==scanId)); clearActionMessages(); }
  }

  async function handleDeleteAll() {
    if (!confirm('Delete ALL scans? This cannot be undone.')) return;
    setActionMessage(''); setActionError(''); setDeletingAll(true);
    try {
      const res = await fetch(`${backendUrl}/api/dashboard/scans`, { method: 'DELETE' });
      if (res.ok) { setActionMessage('All scans deleted'); await fetchScans(); }
      else if (res.status === 404 || res.status === 405) setActionError('Backend does not support deleting all scans.');
      else { const txt = await res.text().catch(()=>null); setActionError(`Failed to delete all scans: ${res.status} ${txt || ''}`); }
    } catch (err) { setActionError(err.message || 'Failed to delete all scans'); }
    finally { setDeletingAll(false); clearActionMessages(); }
  }

  function renderOverview() {
    return (
      <>
        <div className="dashboard-intro">
          <h1>Veriq Dashboard</h1>
          <p>Viewing existing Veriq scans from the backend.</p>
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button className="primary-button" disabled={deletingAll} onClick={handleDeleteAll}>{deletingAll ? 'Deleting...' : 'Delete All Scans'}</button>
        </div>

        {actionMessage ? <p style={{ color: 'green' }}>{actionMessage}</p> : null}
        {actionError ? <p className="error-message">{actionError}</p> : null}

        {scans.length === 0 ? <p>No scans available yet.</p> : (
          <ul className="scan-list">
            {scans.map((scan) => (
              <li key={scan.scanId} className="scan-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div onClick={() => { setSelectedScanId(scan.scanId); setActivePage('scan-details'); }} style={{ cursor: 'pointer' }}>
                    <strong>{scan.scanId}</strong>
                    <div>Status: {scan.status}</div>
                    <div>Total profiles: {scan.totalProfiles}</div>
                    <div>Verified profiles: {scan.verifiedProfiles}</div>
                    <div>Verification rate: {scan.verificationRate ?? 0}%</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="primary-button" onClick={() => { setSelectedScanId(scan.scanId); setActivePage('scan-details'); }}>View Details</button>
                    <button className="primary-button" disabled={deletingIds.includes(scan.scanId)} onClick={() => handleDeleteScan(scan.scanId)}>{deletingIds.includes(scan.scanId) ? 'Deleting...' : 'Delete'}</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  function renderMainContent() {
    if (activePage === 'overview') return renderOverview();
    if (activePage === 'live-scan') return <LiveScan backendUrl={backendUrl} />;
    if (activePage === 'scan-details') return <ScanDetails backendUrl={backendUrl} scanId={selectedScanId} onBack={() => setActivePage('overview')} />;

    const pages = {
      'scan-history': { title: 'Scan History', description: 'Historical scan details and completed scan records will appear here.' },
      'qa-diagnostics': { title: 'QA & Diagnostics', description: 'Quality assurance reports and diagnostic tools will be available here.' },
      'system-health': { title: 'System Health', description: 'Backend and system health metrics will be displayed here.' },
      analytics: { title: 'Analytics', description: 'Analytics and usage insights will be available here.' },
      settings: { title: 'Settings', description: 'Dashboard and integration settings can be configured here.' },
    };

    return <PlaceholderPage {...pages[activePage]} />;
  }

  const visibleNavigationItems = navigationItems.filter((item) => (item.devOnly ? devMode : true));

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">Veriq</div>
        <nav className="sidebar-nav">
          {visibleNavigationItems.map((item) => (
            <button key={item.id} className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>{item.label}</button>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-status-group">
            <StatusIndicator label="Backend" value="Online" />
            <StatusIndicator label="Database" value="Online" />
            <StatusIndicator label="Extension" value="Connected" />
          </div>

          <div className="header-actions">
            <label className="dev-toggle">
              <input type="checkbox" checked={devMode} onChange={(e) => setDevMode(e.target.checked)} />
              <span>Developer mode</span>
            </label>
          </div>
        </header>

        <main className="dashboard-content">{renderMainContent()}</main>
      </div>
    </div>
  );
}

export default App;
