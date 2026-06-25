import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  ShieldCheck,
  Activity,
  Download,
  Sparkles,
} from "lucide-react";

// ─── Custom Tooltip (Glassmorphism) ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isPeak = label === "Thu";
    const diff = ((value - 19.6) / 19.6 * 100).toFixed(0);

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
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: "1px solid rgba(255,255,255,.1)",
            paddingBottom: "8px",
          }}
        >
          {label}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: isPeak ? "#06B6D4" : "#3B82F6",
              boxShadow: `0 0 10px ${isPeak ? "#06B6D4" : "#3B82F6"}`,
            }}
          />
          <span style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: "800" }}>
            {value} Scans
          </span>
        </div>

        {isPeak && (
          <div style={{ color: "#06B6D4", fontSize: "11px", fontWeight: "700", marginBottom: "6px" }}>
            🏆 Peak Activity Day
          </div>
        )}

        <div style={{ color: "#94A3B8", fontSize: "11px" }}>
          {diff > 0 ? "↑" : "↓"} {Math.abs(diff)}% {diff > 0 ? "above" : "below"} average
        </div>
      </div>
    );
  }
  return null;
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ScanVolumeChart() {
  const data = [
    { day: "Mon", scans: 18 },
    { day: "Tue", scans: 25 },
    { day: "Wed", scans: 14 },
    { day: "Thu", scans: 31 },
    { day: "Fri", scans: 28 },
    { day: "Sat", scans: 12 },
    { day: "Sun", scans: 9 },
  ];

  const kpiItems = [
    { label: "Peak Day", value: "Thu", color: "#3B82F6", trend: "↑ 2 vs last week", trendColor: "#22C55E", Icon: Calendar },
    { label: "Average Daily", value: "19.6", color: "#22C55E", trend: "↑ 1.4%", trendColor: "#22C55E", Icon: Activity },
    { label: "Growth Rate", value: "+14%", color: "#8B5CF6", trend: "Stable", trendColor: "#94A3B8", Icon: TrendingUp },
    { label: "Success Rate", value: "98.7%", color: "#06B6D4", trend: "Excellent", trendColor: "#22C55E", Icon: ShieldCheck },
  ];

  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
        height: "auto",
        minHeight: "720px",
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "18px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "20px", fontWeight: "700" }}>
            Scan Activity
          </h3>
          <div style={{ marginTop: "6px", color: "#94A3B8", fontSize: "13px" }}>
            Historical scan execution volume
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
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
              marginTop: "4px",
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
            <Download size={14} />
            Export Activity
          </button>

          {/* Weekly Scans Box (Upgraded) */}
          <div
            style={{
              textAlign: "right",
              background: "rgba(59,130,246,.08)",
              border: "1px solid rgba(59,130,246,.3)",
              borderRadius: "14px",
              padding: "12px 20px",
              boxShadow: "0 0 24px rgba(59,130,246,.15)",
            }}
          >
            <div
              style={{
                color: "#3B82F6",
                fontSize: "28px",
                fontWeight: "800",
                textShadow: "0 0 15px rgba(59,130,246,.5)",
                lineHeight: 1,
              }}
            >
              137
            </div>
            <div style={{ color: "#64748B", fontSize: "12px", fontWeight: "600", marginTop: "4px" }}>
              Weekly Scans
            </div>
            <div style={{ color: "#22C55E", fontSize: "11px", fontWeight: "700", marginTop: "6px" }}>
              ↑ 14% <span style={{ color: "#475569", fontWeight: "500" }}>Last 7 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Status Chips ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[
          { label: "AI VERIFIED", color: "#A855F7", bg: "rgba(168,85,247,.1)" },
          { label: "HIGH CAPACITY", color: "#22C55E", bg: "rgba(34,197,94,.1)" },
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

      {/* ─── KPI Row (4 Cards with Icons) ───────────────────────────────── */}
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
            <div style={{ position: "absolute", top: "14px", right: "14px", opacity: 0.85 }}>
              <item.Icon color={item.color} size={20} />
            </div>
            <div
              style={{
                color: "#64748B",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingRight: "28px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                marginTop: "10px",
                color: item.color,
                fontSize: "26px",
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

      {/* ─── Chart Section Header (Legend) ──────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: "700" }}>
          Weekly Scan Volume
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: "linear-gradient(180deg, #3B82F6, #06B6D4)" }} />
            <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: "600" }}>Scan Volume</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "16px", height: "2px", background: "#F59E0B", borderTop: "2px dashed #F59E0B" }} />
            <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: "600" }}>Weekly Average</span>
          </div>
        </div>
      </div>

      {/* ─── Chart ──────────────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={1} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          
          <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} strokeDasharray="3 3" />
          
          <XAxis
            dataKey="day"
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
          
          <ReferenceLine 
            y={19.6} 
            stroke="#F59E0B" 
            strokeDasharray="3 3" 
            strokeWidth={2} 
            label={{ value: "Avg: 19.6", fill: "#F59E0B", fontSize: 10, position: "right" }} 
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,.03)" }} />
          
          <Bar dataKey="scans" radius={[8, 8, 0, 0]} animationDuration={1200}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.day === "Thu" ? "url(#peakGradient)" : "url(#scanGradient)"} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ─── Bottom Insight Cards (3 Columns) ───────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        {/* AI Insight (Purple) */}
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
              top: "-20px",
              right: "-20px",
              width: "80px",
              height: "80px",
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
            <Sparkles size={12} /> AI INSIGHT
          </div>
          <div style={{ color: "#E2E8F0", fontSize: "13px", lineHeight: "1.6", position: "relative" }}>
            Thursday accounts for <span style={{ color: "#A855F7", fontWeight: "800" }}>23%</span> of total weekly scans, indicating peak operational activity mid-week.
          </div>
        </div>

        {/* Capacity Utilization (Blue) */}
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
            <Activity size={12} /> CAPACITY
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
            <span style={{ color: "#FFFFFF", fontSize: "28px", fontWeight: "800", lineHeight: 1 }}>73%</span>
            <span
              style={{
                color: "#22C55E",
                fontSize: "11px",
                fontWeight: "700",
                background: "rgba(34,197,94,.15)",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              Optimal
            </span>
          </div>
          <div style={{ height: "8px", background: "rgba(255,255,255,.08)", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: "73%",
                height: "100%",
                background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                borderRadius: "4px",
                boxShadow: "0 0 8px rgba(6,182,212,.4)",
              }}
            />
          </div>
        </div>

        {/* Scan Distribution (Green/Orange) */}
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
            <Calendar size={12} /> DISTRIBUTION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: "600" }}>Business Days</span>
                <span style={{ color: "#22C55E", fontSize: "12px", fontWeight: "800" }}>84%</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "84%", height: "100%", background: "#22C55E", borderRadius: "3px" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: "600" }}>Weekend</span>
                <span style={{ color: "#F97316", fontSize: "12px", fontWeight: "800" }}>16%</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "16%", height: "100%", background: "#F97316", borderRadius: "3px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── AI Forecast Banner (Bottom) ────────────────────────────────── */}
      <div
        style={{
          marginTop: "16px",
          background: "linear-gradient(90deg, rgba(139,92,246,.15) 0%, rgba(59,130,246,.08) 100%)",
          border: "1px solid rgba(139,92,246,.3)",
          borderRadius: "14px",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              background: "rgba(139,92,246,.2)",
              padding: "10px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(139,92,246,.2)",
            }}
          >
            <Sparkles size={20} color="#A855F7" />
          </div>
          <div>
            <div style={{ color: "#A855F7", fontSize: "10px", fontWeight: "800", letterSpacing: "1px", marginBottom: "4px" }}>
              AI FORECAST
            </div>
            <div style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "600" }}>
              Next Week Forecast: <span style={{ color: "#FFFFFF", fontWeight: "800" }}>154 Scans Expected</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#94A3B8", fontSize: "11px", marginBottom: "2px" }}>Confidence</div>
          <div style={{ color: "#A855F7", fontSize: "24px", fontWeight: "800", lineHeight: 1, textShadow: "0 0 10px rgba(168,85,247,.4)" }}>
            96%
          </div>
        </div>
      </div>
    </div>
  );
}