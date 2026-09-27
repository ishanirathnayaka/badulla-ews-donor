import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import RiskMap from "./RiskMap";
import AlertPanel from "./AlertPanel";
import AllocationPanel from "./AllocationPanel";
import Analytics from "./Analytics";
import Login from "./Login";
import { Toaster } from "react-hot-toast";

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || "http://localhost:4000";

const NAV = [
  ["/", "Risk Map"],
  ["/alerts", "Alert Dispatch"],
  ["/allocation", "AI Allocation"],
  ["/analytics", "Analytics"],
];

function StatusBar() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    const poll = () => fetch(`${GATEWAY}/api/health`).then(r => r.json()).then(setHealth).catch(() => setHealth(null));
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ padding: "4px 16px", background: health ? "#0a3d2e" : "#5c1a1a", color: "#fff", fontSize: 13 }}>
      Gateway: {health ? "CONNECTED" : "OFFLINE"} {health && `| ${health.ts}`}
    </div>
  );
}

function AuthedApp({ user, onLogout }) {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#0f1720", color: "#e6edf3" }}>
        <header style={{ padding: "12px 16px", borderBottom: "1px solid #253041", display: "flex", gap: 24, alignItems: "center" }}>
          <strong>Badulla Disaster Management — Admin</strong>
          <nav style={{ display: "flex", gap: 16 }}>
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({ color: isActive ? "#4da3ff" : "#9fb0c3", textDecoration: "none" })}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
            <span style={{ color: "#9fb0c3" }}>
              {user.username} · <span style={{ color: "#4da3ff" }}>{user.role}</span>
            </span>
            <button
              onClick={onLogout}
              style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #253041", background: "transparent", color: "#e6edf3", cursor: "pointer", fontSize: 13 }}
            >
              Logout
            </button>
          </div>
          <Toaster position="top-right" toastOptions={{ style: { background: "#16202b", color: "#e6edf3", border: "1px solid #253041" } }} />
        </header>
        <StatusBar />
        <Routes>
          <Route path="/" element={<RiskMap />} />
          <Route path="/alerts" element={<AlertPanel />} />
          <Route path="/allocation" element={<AllocationPanel />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ews_user");
    return saved ? JSON.parse(saved) : null;
  });

  const logout = () => {
    localStorage.removeItem("ews_token");
    localStorage.removeItem("ews_user");
    setUser(null);
  };

  if (!user) return <Login onLogin={setUser} />;

  return <AuthedApp user={user} onLogout={logout} />;
}