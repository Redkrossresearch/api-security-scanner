/**
 * SecurityMetricsChart.jsx (Sprint 21 — Advanced Dashboard Metrics)
 * Multi-series chart showing vulnerability trends per severity,
 * provider response times, and security score deltas.
 */
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Legend, ReferenceLine,
} from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Activity, BarChart2, Zap } from "lucide-react";

const CHART_VIEWS = [
  { id: "severity", label: "By Severity", icon: "🔥" },
  { id: "providers", label: "Provider Perf", icon: "⚡" },
  { id: "score_delta", label: "Score Delta", icon: "📈" },
];

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(9,13,22,0.95)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(139,92,246,0.25)", borderRadius: "12px",
      padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", marginBottom: "6px", letterSpacing: "0.5px" }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", marginBottom: "3px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color }} />
          <span style={{ color: "#94A3B8" }}>{entry.name}:</span>
          <span style={{ color: "#E2E8F0", fontWeight: "700" }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// KPI Summary chip
function KPIChip({ label, value, delta, color }) {
  const isUp = delta > 0, isDown = delta < 0;
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "10px", padding: "10px 14px", minWidth: "90px",
    }}>
      <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "700", letterSpacing: "0.5px", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: "900", color: color || "#E2E8F0" }}>{value}</div>
      {delta !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", marginTop: "3px" }}>
          {isUp ? <TrendingUp size={11} color="#EF4444" /> : isDown ? <TrendingDown size={11} color="#22C55E" /> : <Minus size={11} color="#64748B" />}
          <span style={{ color: isUp ? "#EF4444" : isDown ? "#22C55E" : "#64748B", fontWeight: "700" }}>
            {Math.abs(delta)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function SecurityMetricsChart({ data = {}, providerData = [], kpis = {} }) {
  const [view, setView] = useState("severity");

  const severityData = data.severityTrend || [];
  const providerPerfData = providerData.length > 0 ? providerData : [];
  const scoreDeltaData = data.scoreDelta || [];

  return (
    <div style={{
      background: "radial-gradient(200px circle at top right, rgba(139,92,246,0.1), transparent 80%), linear-gradient(180deg, #090d16 0%, #030712 100%)",
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
      padding: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <style>{`
        .metric-tab { transition: all 0.2s ease; cursor: pointer; }
        .metric-tab:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
        <div>
          <h3 style={{
            margin: 0, fontSize: "15px", fontWeight: "800",
            background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Advanced Security Metrics</h3>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#475569" }}>Real-time vulnerability intelligence across all providers</p>
        </div>
        {/* View tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {CHART_VIEWS.map((v) => (
            <button key={v.id} className="metric-tab" onClick={() => setView(v.id)} style={{
              padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "700",
              background: view === v.id ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${view === v.id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: view === v.id ? "#C4B5FD" : "#64748B",
            }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
        <KPIChip label="SECURITY SCORE" value={kpis.score ?? "—"} delta={kpis.scoreDelta} color="#8B5CF6" />
        <KPIChip label="CRITICAL VULNS" value={kpis.critical ?? 0} delta={kpis.criticalDelta} color="#EF4444" />
        <KPIChip label="ACTIVE SCANS" value={kpis.scans ?? 0} color="#3B82F6" />
        <KPIChip label="AVG LATENCY" value={kpis.latency ? `${kpis.latency}ms` : "—"} delta={kpis.latencyDelta} color="#F59E0B" />
        <KPIChip label="AI CONSENSUS" value={kpis.consensus ? `${kpis.consensus}%` : "—"} color="#22C55E" />
      </div>

      {/* Chart view */}
      <ResponsiveContainer width="100%" height={230}>
        {view === "severity" ? (
          <AreaChart data={severityData}>
            <defs>
              {[
                { id: "g_critical", color: "#EF4444" },
                { id: "g_high", color: "#F97316" },
                { id: "g_medium", color: "#F59E0B" },
                { id: "g_low", color: "#22C55E" },
              ].map(({ id, color }) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={2} fill="url(#g_critical)" dot={false} />
            <Area type="monotone" dataKey="high" name="High" stroke="#F97316" strokeWidth={2} fill="url(#g_high)" dot={false} />
            <Area type="monotone" dataKey="medium" name="Medium" stroke="#F59E0B" strokeWidth={2} fill="url(#g_medium)" dot={false} />
            <Area type="monotone" dataKey="low" name="Low" stroke="#22C55E" strokeWidth={2} fill="url(#g_low)" dot={false} />
          </AreaChart>
        ) : view === "providers" ? (
          <BarChart data={providerPerfData} barGap={4}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="provider" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="latency" name="Latency (ms)" fill="#8B5CF6" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="accuracy" name="Accuracy %" fill="#22C55E" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        ) : (
          <LineChart data={scoreDeltaData}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="delta" name="Score Δ" stroke="#8B5CF6" strokeWidth={2.5}
              dot={{ r: 3, fill: "#8B5CF6", stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: "#8B5CF6" }} />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Bottom legend */}
      <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
        {view === "severity" && [
          { label: "Critical", color: "#EF4444" },
          { label: "High", color: "#F97316" },
          { label: "Medium", color: "#F59E0B" },
          { label: "Low", color: "#22C55E" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ color: "#64748B" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
