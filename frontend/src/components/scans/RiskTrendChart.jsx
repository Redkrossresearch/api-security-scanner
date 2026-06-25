import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Inline Icon Components ─────────────────────────────────────────────────
const ShieldIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const AlertTriangleIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircleIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AwardIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Custom Tooltip (Glassmorphism) ─────────────────────────────────────────
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
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function RiskTrendChart() {
  const data = [
    { month: "Jan", risk: 9.1, critical: 48, fixed: 12 },
    { month: "Feb", risk: 8.7, critical: 44, fixed: 18 },
    { month: "Mar", risk: 8.4, critical: 38, fixed: 26 },
    { month: "Apr", risk: 7.9, critical: 31, fixed: 35 },
    { month: "May", risk: 7.5, critical: 24, fixed: 47 },
    { month: "Jun", risk: 7.2, critical: 19, fixed: 58 },
    { month: "Forecast", risk: 6.5, critical: 12, fixed: 72 },
  ];

  const kpiItems = [
    {
      label: "Current Risk",
      value: "7.2",
      trend: "↓ 1.9 vs Jan",
      color: "#22C55E",
      trendColor: "#22C55E",
      Icon: ShieldIcon,
    },
    {
      label: "Critical Open",
      value: "19",
      trend: "↓ 29 Findings",
      color: "#EF4444",
      trendColor: "#22C55E",
      Icon: AlertTriangleIcon,
    },
    {
      label: "Fixed Findings",
      value: "58",
      trend: "↑ 46 Resolved",
      color: "#8B5CF6",
      trendColor: "#22C55E",
      Icon: CheckCircleIcon,
    },
    {
      label: "Security Score",
      value: "84%",
      trend: "↑ 12%",
      color: "#3B82F6",
      trendColor: "#22C55E",
      Icon: AwardIcon,
    },
  ];

  const trendMetrics = [
    { label: "Risk", value: "↓ 21%", color: "#22C55E" },
    { label: "Critical", value: "↓ 60%", color: "#22C55E" },
    { label: "Fixed", value: "↑ 46", color: "#22C55E" },
    { label: "Security", value: "↑ 12%", color: "#22C55E" },
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "22px",
              fontWeight: "700",
            }}
          >
            Monthly Risk Intelligence
          </h3>
          <div
            style={{
              marginTop: "6px",
              color: "#94A3B8",
              fontSize: "13px",
            }}
          >
            Month-over-month risk reduction and remediation performance
          </div>
        </div>

        {/* Stacked Metrics (replacing old badges) */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#22C55E",
              fontSize: "28px",
              fontWeight: "800",
              textShadow: "0 0 20px rgba(34,197,94,0.4)",
            }}
          >
            +31%
          </div>
          <div style={{ color: "#64748B", fontSize: "12px" }}>Risk Reduction</div>
          <div
            style={{
              marginTop: "8px",
              color: "#8B5CF6",
              fontSize: "22px",
              fontWeight: "800",
              textShadow: "0 0 20px rgba(139,92,246,0.3)",
            }}
          >
            +46
          </div>
          <div style={{ color: "#64748B", fontSize: "12px" }}>Fixed Findings</div>
        </div>
      </div>

      {/* ─── Status Chips + Export Button Row ───────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "MONTHLY VERIFIED", color: "#A855F7", bg: "rgba(168,85,247,.1)" },
            { label: "RISK DECLINING", color: "#22C55E", bg: "rgba(34,197,94,.1)" },
            { label: "REMEDIATION ACTIVE", color: "#3B82F6", bg: "rgba(59,130,246,.1)" },
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

        {/* Export Button */}
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

      {/* ─── KPI Row (with icons) ───────────────────────────────────────── */}
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
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Icon top-right */}
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                opacity: 0.85,
              }}
            >
              <item.Icon color={item.color} />
            </div>

            <div
              style={{
                color: "#64748B",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingRight: "30px",
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

      {/* ── Chart Section Header with Legend ───────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ color: "#FFFFFF", fontSize: "16px", fontWeight: "700" }}>
          Monthly Trend Analysis
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { label: "Risk Score", color: "#22C55E" },
            { label: "Critical Findings", color: "#EF4444" },
            { label: "Fixed Findings", color: "#8B5CF6" },
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
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

      {/* ─── Chart (Dual Axis + Fixed Height) ───────────────────────────── */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 50, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="criticalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fixedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,.05)"
            vertical={false}
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="month"
            tick={{ fill: "#64748B", fontSize: 11, fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />

          {/* Left axis: Risk (0-10 scale) */}
          <YAxis
            yAxisId="left"
            domain={[0, 10]}
            tick={{ fill: "#22C55E", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toFixed(0)}
          />

          {/* Right axis: Critical + Fixed (0-80 scale) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 80]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Risk - Left Axis */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="risk"
            stroke="#22C55E"
            strokeWidth={3}
            fill="url(#riskFill)"
            name="Risk Score"
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

          {/* Critical - Right Axis */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="critical"
            stroke="#EF4444"
            strokeWidth={3}
            name="Critical Findings"
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

          {/* Fixed - Right Axis */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="fixed"
            stroke="#8B5CF6"
            strokeWidth={3}
            name="Fixed Findings"
            animationDuration={1500}
            animationEasing="ease-out"
            dot={{ r: 5, strokeWidth: 2, fill: "#08111F", stroke: "#8B5CF6" }}
            activeDot={{
              r: 8,
              strokeWidth: 3,
              fill: "#08111F",
              stroke: "#8B5CF6",
              filter: "url(#glow)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* ─── Section Divider ────────────────────────────────────────────── */}
      <div
        style={{
          margin: "28px 0",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "rgba(255,255,255,.08)",
          }}
        />
        <div
          style={{
            color: "#94A3B8",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1px",
          }}
        >
          MONTHLY INSIGHTS & BENCHMARKS
        </div>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "rgba(255,255,255,.08)",
          }}
        />
      </div>

      {/* ─── Bottom Insight Cards (Equal 3 columns) ─────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {/* AI Forecast Card (Purple) */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(168,85,247,.12) 0%, rgba(168,85,247,.04) 100%)",
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
              background:
                "radial-gradient(circle, rgba(168,85,247,.2) 0%, transparent 70%)",
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
            <div
              style={{
                color: "#E2E8F0",
                fontSize: "12px",
                lineHeight: "1.6",
                marginBottom: "6px",
              }}
            >
              Critical findings expected to reduce to{" "}
              <span
                style={{
                  color: "#EF4444",
                  fontWeight: "800",
                  fontSize: "14px",
                }}
              >
                12
              </span>
            </div>
            <div
              style={{
                color: "#94A3B8",
                fontSize: "11px",
                marginBottom: "12px",
              }}
            >
              Target:{" "}
              <span style={{ color: "#E2E8F0", fontWeight: "600" }}>
                Jul 2026
              </span>
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
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "9px",
                  fontWeight: "700",
                  marginBottom: "2px",
                }}
              >
                CONFIDENCE
              </div>
              <div
                style={{
                  color: "#A855F7",
                  fontSize: "16px",
                  fontWeight: "800",
                }}
              >
                95%
              </div>
            </div>
          </div>
        </div>

        {/* Benchmark Card (Blue) */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,.12) 0%, rgba(59,130,246,.04) 100%)",
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
             BENCHMARK
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: "11px" }}>
                Your Score
              </span>
              <span
                style={{
                  color: "#3B82F6",
                  fontSize: "14px",
                  fontWeight: "800",
                }}
              >
                84
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: "11px" }}>
                Industry Avg
              </span>
              <span
                style={{
                  color: "#64748B",
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                76
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: "11px" }}>
                Difference
              </span>
              <span
                style={{
                  color: "#22C55E",
                  fontSize: "14px",
                  fontWeight: "800",
                }}
              >
                +8
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              position: "relative",
              height: "8px",
              background: "rgba(255,255,255,.08)",
              borderRadius: "4px",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "76%",
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
                width: "84%",
                background:
                  "linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)",
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
            }}
          >
            <span style={{ color: "#475569", fontSize: "9px" }}>0</span>
            <span style={{ color: "#64748B", fontSize: "9px" }}>
              Industry: 76
            </span>
            <span style={{ color: "#475569", fontSize: "9px" }}>100</span>
          </div>
        </div>

        {/* Trend Summary Card (Green) */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(34,197,94,.12) 0%, rgba(34,197,94,.04) 100%)",
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
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
                <span
                  style={{
                    color: "#94A3B8",
                    fontSize: "10px",
                    fontWeight: "600",
                  }}
                >
                  {metric.label}
                </span>
                <span
                  style={{
                    color: metric.color,
                    fontWeight: "800",
                    fontSize: "12px",
                  }}
                >
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