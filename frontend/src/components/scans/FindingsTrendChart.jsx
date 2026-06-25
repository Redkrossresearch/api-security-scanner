import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ShieldAlert,
  TrendingDown,
  Target,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from "lucide-react";

// ─── Custom Premium Tooltip ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const critical = payload.find((p) => p.dataKey === "critical")?.value || 0;
    const high = payload.find((p) => p.dataKey === "high")?.value || 0;
    const medium = payload.find((p) => p.dataKey === "medium")?.value || 0;
    const total = critical + high + medium;

    return (
      <div
        style={{
          background: "rgba(11, 18, 32, 0.98)",
          border: "1px solid rgba(239,68,68,.3)",
          borderRadius: "12px",
          padding: "16px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          minWidth: "200px",
        }}
      >
        <div
          style={{
            color: "#94A3B8",
            fontSize: "11px",
            fontWeight: "700",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: "1px solid rgba(255,255,255,.1)",
            paddingBottom: "8px",
          }}
        >
          {label} Analysis
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 8px #EF4444" }} />
              <span style={{ color: "#CBD5E1", fontSize: "12px" }}>Critical</span>
            </div>
            <span style={{ color: "#EF4444", fontSize: "14px", fontWeight: "800" }}>{critical}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F97316", boxShadow: "0 0 8px #F97316" }} />
              <span style={{ color: "#CBD5E1", fontSize: "12px" }}>High</span>
            </div>
            <span style={{ color: "#F97316", fontSize: "14px", fontWeight: "800" }}>{high}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FACC15", boxShadow: "0 0 8px #FACC15" }} />
              <span style={{ color: "#CBD5E1", fontSize: "12px" }}>Medium</span>
            </div>
            <span style={{ color: "#FACC15", fontSize: "14px", fontWeight: "800" }}>{medium}</span>
          </div>
        </div>

        <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "600" }}>Total Exposure</span>
          <span style={{ color: "#FFFFFF", fontSize: "13px", fontWeight: "800" }}>{total}</span>
        </div>
      </div>
    );
  }
  return null;
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function FindingsTrendChart() {
  const data = [
    { month: "Jan", critical: 12, high: 21, medium: 35 },
    { month: "Feb", critical: 10, high: 19, medium: 31 },
    { month: "Mar", critical: 8, high: 17, medium: 28 },
    { month: "Apr", critical: 7, high: 15, medium: 25 },
    { month: "May", critical: 5, high: 12, medium: 22 },
    { month: "Jun", critical: 3, high: 8, medium: 18 },
  ];

  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
        height: "auto",
      }}
    >
      {/* ── Header: Executive Style ────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldAlert size={20} color="#EF4444" />
            Vulnerability Trend
          </h3>
          <div style={{ color: "#94A3B8", fontSize: "13px", marginTop: "6px" }}>
            Historical reduction of discovered vulnerabilities
          </div>
          
          {/* Severity Trend Deltas */}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <span style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", color: "#EF4444", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
              Critical ↓75%
            </span>
            <span style={{ background: "rgba(249,115,22,.1)", border: "1px solid rgba(249,115,22,.2)", color: "#F97316", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
              High ↓62%
            </span>
            <span style={{ background: "rgba(250,204,21,.1)", border: "1px solid rgba(250,204,21,.2)", color: "#FACC15", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
              Medium ↓49%
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Remediation Stats (Replaces A- Grade) */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,.15) 0%, rgba(34,197,94,.05) 100%)",
              border: "1px solid rgba(34,197,94,.3)",
              borderRadius: "12px",
              padding: "10px 16px",
              textAlign: "center",
              minWidth: "100px",
            }}
          >
            <div style={{ color: "#22C55E", fontSize: "22px", fontWeight: "800", lineHeight: 1, textShadow: "0 0 10px rgba(34,197,94,.4)" }}>
              94%
            </div>
            <div style={{ color: "#64748B", fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px", marginTop: "4px" }}>
              REMEDIATED
            </div>
            <div style={{ color: "#94A3B8", fontSize: "10px", marginTop: "4px", fontWeight: "600" }}>
              58 Resolved
            </div>
          </div>

          {/* Overall Reduction */}
          <div
            style={{
              background: "rgba(34,197,94,.08)",
              border: "1px solid rgba(34,197,94,.2)",
              borderRadius: "12px",
              padding: "10px 16px",
              textAlign: "right",
            }}
          >
            <div style={{ color: "#22C55E", fontSize: "22px", fontWeight: "800", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
              <TrendingDown size={18} /> 63%
            </div>
            <div style={{ color: "#94A3B8", fontSize: "11px", fontWeight: "600", marginTop: "4px" }}>
              Overall Reduction
            </div>
          </div>
        </div>
      </div>

      {/* ─── Current State Metrics (Replaces Executive Cards) ──────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
        <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.06)", borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#64748B", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Current Critical</div>
            <div style={{ color: "#EF4444", fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>3</div>
          </div>
          <ShieldAlert size={20} color="#EF4444" opacity={0.5} />
        </div>
        <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.06)", borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#64748B", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>High Risk</div>
            <div style={{ color: "#F97316", fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>8</div>
          </div>
          <AlertTriangle size={20} color="#F97316" opacity={0.5} />
        </div>
        <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.06)", borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#64748B", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Medium Risk</div>
            <div style={{ color: "#FACC15", fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>18</div>
          </div>
          <Activity size={20} color="#FACC15" opacity={0.5} />
        </div>
      </div>

      {/* ─── Main Chart (Hero Section) ──────────────────────────────────── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "700" }}>
            Vulnerability Reduction Analysis
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            {[
              { label: "Critical", color: "#EF4444" },
              { label: "High", color: "#F97316" },
              { label: "Medium", color: "#FACC15" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "600" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="criticalFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="highFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mediumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FACC15" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#FACC15" stopOpacity={0} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              tick={{ fill: "#64748B", fontSize: 11, fontWeight: "600" }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />

            <YAxis
              tick={{ fill: "#64748B", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="critical"
              stroke="#EF4444"
              fill="url(#criticalFill)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#08111F", stroke: "#EF4444" }}
              activeDot={{ r: 6, strokeWidth: 3, fill: "#08111F", stroke: "#EF4444", filter: "url(#glow)" }}
              animationDuration={1500}
            />

            <Area
              type="monotone"
              dataKey="high"
              stroke="#F97316"
              fill="url(#highFill)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#08111F", stroke: "#F97316" }}
              activeDot={{ r: 6, strokeWidth: 3, fill: "#08111F", stroke: "#F97316", filter: "url(#glow)" }}
              animationDuration={1500}
            />

            <Area
              type="monotone"
              dataKey="medium"
              stroke="#FACC15"
              fill="url(#mediumFill)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#08111F", stroke: "#FACC15" }}
              activeDot={{ r: 6, strokeWidth: 3, fill: "#08111F", stroke: "#FACC15", filter: "url(#glow)" }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Bottom Insights (2fr 1fr Layout) ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        
        {/* Left Card: Vulnerability Insights (Top Improvement + Root Cause) */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(250,204,21,.08) 0%, rgba(250,204,21,.02) 100%)",
            border: "1px solid rgba(250,204,21,.2)",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ color: "#FACC15", fontSize: "10px", fontWeight: "800", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Bug size={12} /> VULNERABILITY INSIGHTS
            </div>
            <div style={{ color: "#22C55E", fontSize: "11px", fontWeight: "700", background: "rgba(34,197,94,.15)", padding: "4px 8px", borderRadius: "6px" }}>
              Best Month: June
            </div>
          </div>

          <div style={{ color: "#E2E8F0", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
            <span style={{ color: "#22C55E", fontWeight: "800" }}>Top Improvement:</span> Critical findings reduced by <span style={{ color: "#22C55E", fontWeight: "800" }}>75%</span>. Zero critical issues found in payment gateways this month.
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: "16px" }}>
            <div style={{ color: "#FACC15", fontSize: "10px", fontWeight: "800", letterSpacing: "1px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              ROOT CAUSE ANALYSIS (OWASP Top 10)
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#CBD5E1", fontSize: "11px", fontWeight: "600" }}>A07: Broken Authentication</span>
                  <span style={{ color: "#FACC15", fontSize: "12px", fontWeight: "800" }}>62%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,.08)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: "62%", height: "100%", background: "#FACC15", borderRadius: "3px", boxShadow: "0 0 6px rgba(250,204,21,.4)" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#CBD5E1", fontSize: "11px", fontWeight: "600" }}>A01: Broken Access Control</span>
                  <span style={{ color: "#F97316", fontSize: "12px", fontWeight: "800" }}>20%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,.08)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: "20%", height: "100%", background: "#F97316", borderRadius: "3px", boxShadow: "0 0 6px rgba(249,115,22,.4)" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#CBD5E1", fontSize: "11px", fontWeight: "600" }}>A05: Security Misconfiguration</span>
                  <span style={{ color: "#EF4444", fontSize: "12px", fontWeight: "800" }}>18%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,.08)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: "18%", height: "100%", background: "#EF4444", borderRadius: "3px", boxShadow: "0 0 6px rgba(239,68,68,.4)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Risk Benchmark */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,.08) 0%, rgba(249,115,22,.02) 100%)",
            border: "1px solid rgba(249,115,22,.2)",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <div style={{ color: "#F97316", fontSize: "10px", fontWeight: "800", letterSpacing: "1px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Target size={12} /> RISK INDEX BENCHMARK
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#94A3B8", fontSize: "11px" }}>Your Risk Index</span>
              <span style={{ color: "#22C55E", fontSize: "13px", fontWeight: "800" }}>3.2 (Low)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94A3B8", fontSize: "11px" }}>Industry Avg</span>
              <span style={{ color: "#F97316", fontSize: "13px", fontWeight: "800" }}>5.1 (Med)</span>
            </div>
          </div>

          {/* Comparison Bar */}
          <div style={{ position: "relative", height: "8px", background: "rgba(255,255,255,.08)", borderRadius: "4px", marginBottom: "8px" }}>
            <div style={{ position: "absolute", left: "51%", top: "-3px", bottom: "-3px", width: "2px", background: "#F97316" }} />
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "32%", background: "#22C55E", borderRadius: "4px", boxShadow: "0 0 8px rgba(34,197,94,.4)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#475569", fontSize: "9px" }}>0</span>
            <span style={{ color: "#64748B", fontSize: "9px" }}>Industry: 5.1</span>
            <span style={{ color: "#475569", fontSize: "9px" }}>10</span>
          </div>

          <div style={{ marginTop: "20px", background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
            <span style={{ color: "#22C55E", fontSize: "12px", fontWeight: "800" }}>40% Better</span>
            <span style={{ color: "#94A3B8", fontSize: "10px", display: "block", marginTop: "2px" }}>than industry average</span>
          </div>
        </div>

      </div>
    </div>
  );
}