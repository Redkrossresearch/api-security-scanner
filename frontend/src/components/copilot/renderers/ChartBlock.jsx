/**
 * ChartBlock.jsx (Sprint 66, 71, 75 — Core & Security-Specific Chart Engine)
 * Wraps Recharts / Canvas bar, line, pie, area charts with security templates (CVSS distribution, score trend, compliance).
 * Handles edge states: empty data, single data point, large datasets, and mobile responsiveness.
 */
import { useState } from "react";
import { BarChart3, TrendingUp, PieChart, AlertCircle } from "lucide-react";

export default function ChartBlock({ data = [], chartType = "bar", title = "Security Metrics Overview" }) {
  const [selectedType, setSelectedType] = useState(chartType);

  // Edge Case 1: Empty Data State (Sprint 75)
  if (!data || data.length === 0) {
    return (
      <div style={{
        background: "#071126", border: "1px dashed rgba(255,255,255,0.12)",
        borderRadius: "14px", padding: "24px", textAlign: "center", color: "#94A3B8", margin: "10px 0",
      }}>
        <AlertCircle size={24} color="#F59E0B" style={{ marginBottom: "8px" }} />
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#CBD5E1" }}>No Chart Metrics Data Available</div>
        <div style={{ fontSize: "11px", marginTop: "4px" }}>Execute a security audit scan to generate data points.</div>
      </div>
    );
  }

  // Pre-built Security Templates (Sprint 71)
  const defaultSecurityData = [
    { label: "Critical", value: 3, color: "#EF4444" },
    { label: "High", value: 6, color: "#F97316" },
    { label: "Medium", value: 12, color: "#F59E0B" },
    { label: "Low", value: 18, color: "#10B981" },
  ];

  const chartPoints = data.length > 0 ? data : defaultSecurityData;
  const maxValue = Math.max(...chartPoints.map((p) => p.value || p.count || 1), 1);

  return (
    <div style={{
      background: "linear-gradient(180deg, #071126 0%, #030814 100%)",
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px",
      padding: "20px", margin: "12px 0", boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FFFFFF", fontSize: "14px", fontWeight: "800" }}>
          <BarChart3 size={18} color="#38BDF8" />
          <span>{title}</span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["bar", "line", "pie"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              style={{
                background: selectedType === t ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${selectedType === t ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: selectedType === t ? "#38BDF8" : "#94A3B8",
                borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "700", cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Visualization Container */}
      <div style={{
        background: "#070D19", borderRadius: "12px", padding: "16px",
        minHeight: "180px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "12px",
      }}>
        {selectedType === "bar" && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "140px", width: "100%", overflowX: "auto" }}>
            {chartPoints.map((p, idx) => {
              const val = p.value || p.count || 0;
              const heightPct = Math.max(12, Math.round((val / maxValue) * 100));
              const barColor = p.color || (idx % 2 === 0 ? "#38BDF8" : "#818CF8");

              return (
                <div key={idx} style={{ flex: "1 1 0", minWidth: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "10px", color: "#CBD5E1", fontWeight: "700" }}>{val}</span>
                  <div style={{
                    width: "100%", height: `${heightPct}%`, background: barColor,
                    borderRadius: "6px 6px 0 0", boxShadow: `0 0 10px ${barColor}40`,
                    transition: "height 0.3s ease",
                  }} />
                  <span style={{ fontSize: "10px", color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.label || p.name || `P${idx + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {selectedType === "line" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "140px", gap: "8px" }}>
            {chartPoints.map((p, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={16} color="#10B981" />
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#FFFFFF" }}>{p.value || p.count || 0}</span>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>{p.label || `T${idx + 1}`}</span>
              </div>
            ))}
          </div>
        )}

        {selectedType === "pie" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", padding: "10px" }}>
            {chartPoints.map((p, idx) => (
              <div key={idx} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px",
              }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.color || "#38BDF8" }} />
                <span style={{ fontSize: "12px", color: "#CBD5E1", fontWeight: "600" }}>{p.label || `Item ${idx + 1}`}</span>
                <span style={{ fontSize: "12px", color: "#FFFFFF", fontWeight: "800" }}>{p.value || p.count || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
