import {
  Search,
  Calendar,
  Download,
  Filter,
  GitCompare,
  Plus,
  ShieldAlert,
  Activity,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Clock,
  Command,
  ChevronDown,
  AlertCircle,
  X,
} from "lucide-react";

export default function HistoryHeader({ onCompare = () => {}, selectedCount = 0 }) {
  const quickFilters = [
    { label: "All", active: true },
    { label: "Critical", active: false },
    { label: "Open", active: false },
    { label: "Resolved", active: false },
    { label: "OWASP", active: false },
    { label: "Compliance", active: false },
  ];

  const timeRanges = ["Today", "7D", "30D", "90D", "1Y", "Custom"];
  const activeTimeRange = "30D";

  const kpiCards = [
    {
      label: "TOTAL SCANS",
      value: "245",
      trend: "+18 this month",
      trendColor: "#22C55E",
      color: "#60A5FA",
      bg: "rgba(96,165,250,.1)",
      border: "rgba(96,165,250,.25)",
      Icon: Activity,
    },
    {
      label: "CRITICAL FINDINGS",
      value: "78",
      trend: "↓ 22%",
      trendColor: "#22C55E",
      color: "#EF4444",
      bg: "rgba(239,68,68,.1)",
      border: "rgba(239,68,68,.25)",
      Icon: ShieldAlert,
    },
    {
      label: "REMEDIATION RATE",
      value: "92%",
      trend: "↑ 14%",
      trendColor: "#22C55E",
      color: "#22C55E",
      bg: "rgba(34,197,94,.1)",
      border: "rgba(34,197,94,.25)",
      Icon: CheckCircle2,
    },
    {
      label: "AVG MTTR",
      value: "4.2",
      sub: "Days",
      trend: "↓ 18%",
      trendColor: "#22C55E",
      color: "#A855F7",
      bg: "rgba(168,85,247,.1)",
      border: "rgba(168,85,247,.25)",
      Icon: Clock,
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(180deg,#071126,#020617)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
      }}
    >
      {/* ─── Top Row: Title + Security Grade ────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "24px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <div style={{ flex: 1, minWidth: "320px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1
              style={{
                margin: 0,
                color: "#FFFFFF",
                fontSize: "30px",
                fontWeight: "700",
              }}
            >
              Scan History
            </h1>

            {/* Security Posture Indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(34,197,94,.12)",
                border: "1px solid rgba(34,197,94,.3)",
                borderRadius: "999px",
                padding: "5px 12px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 8px rgba(34,197,94,.6)",
                }}
              />
              <span style={{ color: "#22C55E", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>
                HEALTHY
              </span>
            </div>
          </div>

          <p
            style={{
              marginTop: "8px",
              color: "#94A3B8",
              fontSize: "14px",
              maxWidth: "760px",
              lineHeight: "1.7",
              marginBottom: "12px",
            }}
          >
            Analyze historical API security assessments, vulnerability trends,
            remediation progress and long-term security posture evolution.
          </p>

          {/* Historical Trend Summary */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { label: "Risk Exposure", value: "↓ 34%", color: "#22C55E" },
              { label: "Critical Findings", value: "↓ 63%", color: "#22C55E" },
              { label: "MTTR", value: "↓ 18%", color: "#22C55E" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#CBD5E1",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#64748B" }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: "800" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Grade Badge */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,.15) 0%, rgba(34,197,94,.05) 100%)",
            border: "1px solid rgba(34,197,94,.3)",
            borderRadius: "14px",
            padding: "12px 18px",
            textAlign: "center",
            minWidth: "110px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              color: "#22C55E",
              fontSize: "28px",
              fontWeight: "800",
              lineHeight: 1,
              textShadow: "0 0 15px rgba(34,197,94,.5)",
            }}
          >
            A-
          </div>
          <div
            style={{
              color: "#64748B",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              marginTop: "4px",
            }}
          >
            SECURITY GRADE
          </div>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "11px",
              fontWeight: "700",
              marginTop: "2px",
            }}
          >
            72 / 100
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {kpiCards.map((item) => (
          <div
            key={item.label}
            style={{
              background: item.bg,
              border: `1px solid ${item.border}`,
              borderRadius: "14px",
              padding: "14px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                opacity: 0.3,
              }}
            >
              <item.Icon color={item.color} size={18} />
            </div>
            <div
              style={{
                color: "#94A3B8",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              {item.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span
                style={{
                  color: item.color,
                  fontSize: "26px",
                  fontWeight: "800",
                  lineHeight: 1,
                }}
              >
                {item.value}
              </span>
              {item.sub && (
                <span style={{ color: "#64748B", fontSize: "12px", fontWeight: "600" }}>
                  {item.sub}
                </span>
              )}
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

      {/* ─── Dataset Metadata Row ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          background: "rgba(255,255,255,.02)",
          border: "1px solid rgba(255,255,255,.05)",
          borderRadius: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {[
            { label: "Scans", value: "245", color: "#60A5FA" },
            { label: "Assets", value: "28", color: "#A855F7" },
            { label: "Endpoints", value: "820", color: "#EF4444" },
            { label: "History", value: "18 Months", color: "#22C55E" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#64748B", fontSize: "11px" }}>{item.label}:</span>
              <span style={{ color: item.color, fontSize: "11px", fontWeight: "700" }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={12} color="#64748B" />
          <span style={{ color: "#64748B", fontSize: "11px" }}>
            Last Scan: <span style={{ color: "#CBD5E1", fontWeight: "600" }}>14 Jun 2026</span>
          </span>
        </div>
      </div>

      {/* ─── Quick Filter Pills ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        {quickFilters.map((filter) => (
          <button
            key={filter.label}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              border: filter.active ? "1px solid rgba(168,85,247,.4)" : "1px solid rgba(255,255,255,.08)",
              background: filter.active ? "rgba(168,85,247,.15)" : "transparent",
              color: filter.active ? "#C084FC" : "#94A3B8",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* ─── Search + Filters Row ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Search Box */}
        <div
          style={{
            flex: 1,
            minWidth: "320px",
            height: "50px",
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            position: "relative",
          }}
        >
          <Search size={18} color="#94A3B8" />
          <input
            placeholder="Search scan ID, target, asset..."
            style={{
              flex: 1,
              marginLeft: "10px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#FFFFFF",
              fontSize: "14px",
            }}
          />
          {/* K Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "6px",
              padding: "3px 8px",
              color: "#64748B",
              fontSize: "10px",
              fontWeight: "600",
            }}
          >
            <Command size={10} />
            K
          </div>
        </div>

        {/* Time Range Selector */}
        <div
          style={{
            display: "flex",
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "14px",
            padding: "4px",
            gap: "4px",
          }}
        >
          {timeRanges.map((range) => (
            <button
              key={range}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                border: "none",
                background: range === activeTimeRange ? "rgba(168,85,247,.2)" : "transparent",
                color: range === activeTimeRange ? "#C084FC" : "#94A3B8",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Advanced Filters with Counter */}
        <button
          style={{
            height: "50px",
            padding: "0 16px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "#0F172A",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
          }}
        >
          <Filter size={16} />
          Filters
          <span
            style={{
              background: "rgba(168,85,247,.2)",
              color: "#C084FC",
              padding: "2px 7px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            3
          </span>
          <ChevronDown size={14} />
        </button>

        {/* Compare Scans */}
        <button
          onClick={onCompare}
          style={{
            height: "50px",
            padding: "0 16px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "#0F172A",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
          }}
        >
          <GitCompare size={16} />
          Compare Scans
          {selectedCount > 0 && (
            <span
              style={{
                background: "rgba(168,85,247,.25)",
                color: "#C084FC",
                padding: "2px 7px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              {selectedCount} Selected
            </span>
          )}
        </button>

        {/* Export Dropdown */}
        <button
          style={{
            height: "50px",
            padding: "0 18px",
            borderRadius: "14px",
            border: "1px solid rgba(168,85,247,.35)",
            background: "rgba(168,85,247,.12)",
            color: "#C084FC",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "13px",
          }}
        >
          <Download size={16} />
          Export
          <ChevronDown size={14} />
        </button>

        {/* New Scan CTA */}
        <button
          style={{
            height: "50px",
            padding: "0 18px",
            borderRadius: "14px",
            border: "none",
            background: "linear-gradient(90deg,#7C3AED,#EC4899)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "13px",
            boxShadow: "0 10px 25px rgba(124,58,237,.25)",
          }}
        >
          <Plus size={16} />
          New Scan
          <ChevronDown size={14} />
        </button>
      </div>

      {/* ─── AI Insight Strip ───────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(168,85,247,.12) 0%, rgba(59,130,246,.06) 100%)",
          border: "1px solid rgba(168,85,247,.3)",
          borderRadius: "14px",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "300px" }}>
          <div
            style={{
              background: "rgba(168,85,247,.2)",
              padding: "8px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(168,85,247,.25)",
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color="#A855F7" />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#A855F7",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}
            >
              AI INSIGHT
            </div>
            <div style={{ color: "#E2E8F0", fontSize: "12px", lineHeight: "1.5" }}>
              Authentication assessments account for{" "}
              <span style={{ color: "#C084FC", fontWeight: "700" }}>38%</span> of critical findings discovered during the last 90 days.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "10px",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: "600" }}>View Details</span>
          <ChevronDown size={14} color="#94A3B8" style={{ transform: "rotate(-90deg)" }} />
        </div>
      </div>
    </div>
  );
}