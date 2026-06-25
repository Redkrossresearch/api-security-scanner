import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(11, 18, 32, 0.98)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: "12px",
          padding: "16px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          minWidth: "180px",
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
          {label}
        </div>
        {payload.map((entry, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: index < payload.length - 1 ? "8px" : "0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: entry.color,
                  boxShadow: `0 0 10px ${entry.color}`,
                }}
              />
              <span style={{ color: "#94A3B8", fontSize: "12px" }}>
                {entry.name}
              </span>
            </div>
            <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "700" }}>
              {entry.dataKey === "risk" ? entry.value.toFixed(1) : entry.value}
              {entry.dataKey === "remediation" ? "%" : ""}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
  </svg>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SecurityPostureEvolution() {
  const data = [
    { quarter: "Q1", risk: 9.1, security: 62, remediation: 58 },
    { quarter: "Q2", risk: 8.4, security: 71, remediation: 66 },
    { quarter: "Q3", risk: 7.8, security: 81, remediation: 79 },
    { quarter: "Q4", risk: 7.2, security: 92, remediation: 89 },
    { quarter: "FC", risk: 6.5, security: 96, remediation: 94 },
  ];

  const kpiItems = [
    {
      label: "Current Risk",
      value: "7.2",
      trend: "↓ 1.4 vs Q3",
      color: "#22C55E",
      trendColor: "#22C55E",
    },
    {
      label: "Critical Open",
      value: "8",
      trend: "↓ 3",
      color: "#EF4444",
      trendColor: "#22C55E",
    },
    {
      label: "Remediation",
      value: "92%",
      trend: "↑ 13%",
      color: "#3B82F6",
      trendColor: "#22C55E",
    },
    {
      label: "Security Score",
      value: "92",
      trend: "↑ 11",
      color: "#A855F7",
      trendColor: "#22C55E",
    },
  ];

  const trendMetrics = [
    { label: "Risk", value: "↓ 31%", color: "#22C55E" },
    { label: "Critical", value: "↓ 54%", color: "#22C55E" },
    { label: "Remediation", value: "↑ 22%", color: "#22C55E" },
    { label: "Security", value: "↑ 48%", color: "#22C55E" },
  ];

  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "28px",
        height: "auto",
        minHeight: "780px",
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "22px", fontWeight: "700" }}>
            Security Posture Evolution
          </h3>
          <div style={{ marginTop: "6px", color: "#94A3B8", fontSize: "13px" }}>
            Long-term security maturity progression
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#22C55E",
              fontSize: "28px",
              fontWeight: "800",
              textShadow: "0 0 20px rgba(34,197,94,0.4)",
            }}
          >
            +48%
          </div>
          <div style={{ color: "#64748B", fontSize: "12px" }}>Security Improvement</div>
          <div style={{ color: "#475569", fontSize: "11px", marginTop: "2px" }}>Last 12 Months</div>
        </div>
      </div>

      {/* ─── Status Chips + Export Button Row ───────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "AI VERIFIED", color: "#A855F7", bg: "rgba(168,85,247,.1)" },
            { label: "LOW RISK", color: "#22C55E", bg: "rgba(34,197,94,.1)" },
            { label: "TREND POSITIVE", color: "#3B82F6", bg: "rgba(59,130,246,.1)" },
          ].map((chip) => (
            <div
              key={chip.label}
              style={{
                background: chip.bg,
                border: `1px solid ${chip.color}40`,
                borderRadius: "8px",
                padding: "5px 12px",
                color: chip.color,
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              {chip.label}
            </div>
          ))}
        </div>

        {/* Export Button - now inline with chips */}
        <button
          style={{
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "10px",
            padding: "8px 16px",
            color: "#94A3B8",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,.1)";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,.05)";
            e.currentTarget.style.color = "#94A3B8";
          }}
        >
          <DownloadIcon />
          Export Report
        </button>
      </div>

      {/* ─── KPI Row ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {kpiItems.map((item) => (
          <div
            key={item.label}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "14px",
              padding: "16px",
            }}
          >
            <div
              style={{
                color: "#64748B",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                marginTop: "10px",
                color: item.color,
                fontSize: "32px",
                fontWeight: "800",
                lineHeight: "1",
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                marginTop: "8px",
                color: item.trendColor,
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              {item.trend}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Chart Section Header ───────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ color: "#FFFFFF", fontSize: "16px", fontWeight: "700" }}>
          Quarterly Trend Analysis
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { label: "Security Score", color: "#22C55E" },
            { label: "Remediation", color: "#A855F7" },
            { label: "Risk Score", color: "#EF4444" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}80`,
                }}
              />
              <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: "600" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Chart ──────────────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRemediation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="quarter"
            tick={{ fill: "#64748B", fontSize: 11, fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 10]}
            tick={{ fill: "#EF4444", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="risk"
            stroke="#EF4444"
            strokeWidth={3}
            fill="url(#colorRisk)"
            name="Risk Score"
            animationDuration={1500}
            animationEasing="ease-out"
            dot={{ r: 5, strokeWidth: 2, fill: "#08111F", stroke: "#EF4444" }}
            activeDot={{
              r: 8,
              strokeWidth: 3,
              fill: "#08111F",
              stroke: "#EF4444",
              filter: "url(#glow)",
            }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="security"
            stroke="#22C55E"
            strokeWidth={3}
            fill="url(#colorSecurity)"
            name="Security Score"
            animationDuration={1500}
            animationEasing="ease-out"
            dot={{ r: 5, strokeWidth: 2, fill: "#08111F", stroke: "#22C55E" }}
            activeDot={{
              r: 8,
              strokeWidth: 3,
              fill: "#08111F",
              stroke: "#22C55E",
              filter: "url(#glow)",
            }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="remediation"
            stroke="#A855F7"
            strokeWidth={3}
            fill="url(#colorRemediation)"
            name="Remediation"
            animationDuration={1500}
            animationEasing="ease-out"
            dot={{ r: 5, strokeWidth: 2, fill: "#08111F", stroke: "#A855F7" }}
            activeDot={{
              r: 8,
              strokeWidth: 3,
              fill: "#08111F",
              stroke: "#A855F7",
              filter: "url(#glow)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* ─── Section Divider ────────────────────────────────────────────── */}
      <div style={{ margin: "28px 0", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.08)" }} />
        <div style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "700", letterSpacing: "1px" }}>
          AI INSIGHTS & BENCHMARKS
        </div>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.08)" }} />
      </div>

      {/* ─── Bottom Section (Equal 3 columns) ───────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {/* AI Forecast */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,.12) 0%, rgba(168,85,247,.04) 100%)",
            border: "1px solid rgba(168,85,247,.3)",
            borderRadius: "14px",
            padding: "18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "100px",
              height: "100px",
              background: "radial-gradient(circle, rgba(168,85,247,.2) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              color: "#A855F7",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              position: "relative",
            }}
          >
            <SparkleIcon />
            AI FORECAST
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ color: "#E2E8F0", fontSize: "12px", lineHeight: "1.6", marginBottom: "6px" }}>
              Security score expected to reach{" "}
              <span style={{ color: "#22C55E", fontWeight: "800", fontSize: "14px" }}>96</span>
            </div>
            <div style={{ color: "#94A3B8", fontSize: "11px", marginBottom: "12px" }}>
              Target: <span style={{ color: "#E2E8F0", fontWeight: "600" }}>Q1 2027</span>
            </div>

            <div
              style={{
                background: "rgba(168,85,247,.15)",
                border: "1px solid rgba(168,85,247,.3)",
                borderRadius: "8px",
                padding: "8px 12px",
                display: "inline-block",
              }}
            >
              <div style={{ color: "#94A3B8", fontSize: "9px", fontWeight: "700", marginBottom: "2px" }}>
                CONFIDENCE
              </div>
              <div style={{ color: "#A855F7", fontSize: "16px", fontWeight: "800" }}>97%</div>
            </div>
          </div>
        </div>

        {/* Benchmark */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,.12) 0%, rgba(59,130,246,.04) 100%)",
            border: "1px solid rgba(59,130,246,.3)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#3B82F6",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📊 BENCHMARK
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#94A3B8", fontSize: "11px" }}>Your Score</span>
              <span style={{ color: "#22C55E", fontSize: "14px", fontWeight: "800" }}>92</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#94A3B8", fontSize: "11px" }}>Industry Avg</span>
              <span style={{ color: "#64748B", fontSize: "14px", fontWeight: "700" }}>81</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94A3B8", fontSize: "11px" }}>Difference</span>
              <span style={{ color: "#22C55E", fontSize: "14px", fontWeight: "800" }}>+11</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ position: "relative", height: "8px", background: "rgba(255,255,255,.08)", borderRadius: "4px" }}>
            <div
              style={{
                position: "absolute",
                left: "81%",
                top: "-2px",
                bottom: "-2px",
                width: "2px",
                background: "#64748B",
                borderRadius: "1px",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "92%",
                background: "linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ color: "#475569", fontSize: "9px" }}>0</span>
            <span style={{ color: "#64748B", fontSize: "9px" }}>Industry: 81</span>
            <span style={{ color: "#475569", fontSize: "9px" }}>100</span>
          </div>
        </div>

        {/* Trend Summary */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,.12) 0%, rgba(34,197,94,.04) 100%)",
            border: "1px solid rgba(34,197,94,.3)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#22C55E",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📈 TREND SUMMARY
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {trendMetrics.map((metric) => (
              <div
                key={metric.label}
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: "8px",
                  padding: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#94A3B8", fontSize: "10px", fontWeight: "600" }}>
                  {metric.label}
                </span>
                <span style={{ color: metric.color, fontWeight: "800", fontSize: "12px" }}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}