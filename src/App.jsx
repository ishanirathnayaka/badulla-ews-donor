import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || "http://localhost:4000";
const ETHERSCAN = "https://sepolia.etherscan.io";
const COLORS = ["#4da3ff","#22c55e","#eab308","#f97316","#ef4444","#a78bfa","#2dd4bf","#f472b6","#94a3b8","#facc15","#38bdf8","#4ade80","#fb923c","#e879f9","#64748b"];

export default function App() {
  const [chain, setChain] = useState(null);
  const [donations, setDonations] = useState(null);
  const [alloc, setAlloc] = useState(null);
  const [proposals, setProposals] = useState(null);

  useEffect(() => {
    fetch(`${GATEWAY}/api/chain/summary`).then(r => r.json()).then(setChain).catch(() => {});
    fetch(`${GATEWAY}/api/chain/donations`).then(r => r.json()).then(setDonations).catch(() => {});
    fetch(`${GATEWAY}/api/allocation`).then(r => r.json()).then(setAlloc).catch(() => {});
    fetch(`${GATEWAY}/api/chain/proposals`).then(r => r.json()).then(setProposals).catch(() => {});
  }, []);

  const pieData = alloc?.divisions?.map((d, i) => ({ name: d, value: alloc.weightsBps[i] / 100 }));
  const short = (a) => a ? `${a.slice(0, 6)}ΓÇª${a.slice(-4)}` : "";

  const Card = ({ children, ...p }) => (
    <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(15,23,42,.08)" }} {...p}>{children}</div>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f1f5f9", color: "#0f172a" }}>
      <header style={{ background: "#0f3d2e", color: "#fff", padding: "20px 24px" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Badulla Disaster Relief ΓÇö Donor Transparency Portal</h1>
        <p style={{ margin: "6px 0 0", opacity: .85, fontSize: 14 }}>
          Every donation and disbursement is recorded on the Ethereum Sepolia blockchain and publicly verifiable.
        </p>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <Card><div style={{ fontSize: 13, color: "#64748b" }}>Total donated</div><div style={{ fontSize: 30, fontWeight: 800 }}>{chain ? `${chain.totalDonatedEth} ETH` : "ΓÇª"}</div></Card>
          <Card><div style={{ fontSize: 13, color: "#64748b" }}>Donations recorded on-chain</div><div style={{ fontSize: 30, fontWeight: 800 }}>{chain?.donationCount ?? "ΓÇª"}</div></Card>
          <Card><div style={{ fontSize: 13, color: "#64748b" }}>Allocation equity (Gini)</div><div style={{ fontSize: 30, fontWeight: 800 }}>{alloc?.giniEquity ?? "ΓÇª"}</div><div style={{ fontSize: 12, color: "#64748b" }}>AI-optimised ┬╖ target ΓëÑ 0.80</div></Card>
          <Card><div style={{ fontSize: 13, color: "#64748b" }}>Disbursement rounds</div><div style={{ fontSize: 30, fontWeight: 800 }}>{proposals?.count ?? "ΓÇª"}</div></Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h3 style={{ marginTop: 0 }}>Where funds go ΓÇö division allocation</h3>
            {pieData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} label={(e) => `${e.name} ${e.value}%`} labelLine={false} fontSize={10}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            ) : "loadingΓÇª"}
            <p style={{ fontSize: 12, color: "#64748b" }}>
              Weights are computed by a linear-programming optimiser from live AI landslide-risk predictions for all 15 DS divisions, with a 2% minimum floor per division.
            </p>
          </Card>

          <Card>
            <h3 style={{ marginTop: 0 }}>Recent donations (live from Sepolia)</h3>
            {donations?.donations?.length ? (
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead><tr style={{ textAlign: "left", color: "#64748b" }}><th style={{ padding: 6 }}>Donor</th><th>Amount</th><th>When</th></tr></thead>
                <tbody>
                  {donations.donations.map((d) => (
                    <tr key={d.index} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td style={{ padding: 6 }}>
                        <a href={`${ETHERSCAN}/address/${d.donor}`} target="_blank" rel="noreferrer" style={{ color: "#0369a1", fontFamily: "monospace" }}>{short(d.donor)}</a>
                      </td>
                      <td>{d.amountEth} ETH</td>
                      <td>{new Date(d.timestamp * 1000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : "loadingΓÇª"}
          </Card>
        </div>

        <Card>
          <h3 style={{ marginTop: 0 }}>Disbursement audit trail</h3>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead><tr style={{ textAlign: "left", color: "#64748b" }}><th style={{ padding: 6 }}>Round</th><th>Amount</th><th>Multi-sig approvals</th><th>Status</th></tr></thead>
            <tbody>
              {proposals?.proposals?.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={{ padding: 6 }}>#{p.id}</td>
                  <td>{p.amountEth} ETH</td>
                  <td>{p.approvals}/3 (2 required)</td>
                  <td style={{ color: p.executed ? "#16a34a" : "#ca8a04", fontWeight: 700 }}>{p.executed ? "EXECUTED Γ£ô" : "PENDING"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: "#64748b" }}>
            Contracts: <a href={`${ETHERSCAN}/address/${chain?.contracts?.pool}#code`} target="_blank" rel="noreferrer">DonationPool</a> ┬╖{" "}
            <a href={`${ETHERSCAN}/address/${chain?.contracts?.engine}#code`} target="_blank" rel="noreferrer">AllocationEngine</a> ΓÇö source-verified, publicly auditable.
          </p>
        </Card>
      </main>
    </div>
  );
}

