/**
 * ConfidenceBadge.jsx (Sprint 16 — Confidence & Explainability Engine)
 * Displays AI response confidence score with animated indicator, level, and warning label.
 */
import { useState } from "react";
import { ShieldCheck, AlertTriangle, Info, ChevronDown, ChevronUp, Zap } from "lucide-react";

export default function ConfidenceBadge({ confidence = null, inline = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!confidence) return null;

  const { score = 0, level = "Medium", warningLabel = null, factors = {} } = confidence;

  const levelConfig = {
    High: {
      color: "#22C55E",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.25)",
      glow: "rgba(34,197,94,0.3)",
      icon: <ShieldCheck size={13} />,
      label: "High Confidence",
    },
    Medium: {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.25)",
      glow: "rgba(245,158,11,0.3)",
      icon: <Info size={13} />,
      label: "Moderate Confidence",
    },
    Low: {
      color: "#EF4444",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.25)",
      glow: "rgba(239,68,68,0.3)",
      icon: <AlertTriangle size={13} />,
      label: "Low Confidence",
    },
  };

  const cfg = levelConfig[level] || levelConfig.Medium;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: "6px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes conf-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes conf-fill { from{width:0} to{width:${score}%} }
        .conf-badge:hover { transform: translateY(-1px); }
      `}</style>

      {/* Badge Row */}
      <div
        className="conf-badge"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: "8px", padding: "5px 10px",
          cursor: "pointer", transition: "transform 0.2s ease",
          boxShadow: `0 0 10px ${cfg.glow}`,
        }}
      >
        <span style={{ color: cfg.color, display: "flex", alignItems: "center" }}>{cfg.icon}</span>
        <span style={{ fontSize: "12px", fontWeight: "700", color: cfg.color }}>{cfg.label}</span>
        <span style={{
          background: cfg.color, color: "#000", fontSize: "10px", fontWeight: "900",
          padding: "1px 6px", borderRadius: "4px",
        }}>{score}%</span>
        <span style={{ color: "#64748B", display: "flex" }}>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </div>

      {/* Score Bar */}
      <div style={{ width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "3px", overflow: "hidden" }}>
        <div style={{
          width: `${score}%`, height: "100%", background: cfg.color,
          borderRadius: "4px", boxShadow: `0 0 6px ${cfg.color}`,
          animation: "conf-fill 0.8s ease-out",
        }} />
      </div>

      {/* Warning Label */}
      {warningLabel && (
        <div style={{
          fontSize: "11px", color: cfg.color, padding: "4px 8px",
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: "6px", lineHeight: 1.4,
        }}>
          {warningLabel}
        </div>
      )}

      {/* Expanded Factors */}
      {expanded && (
        <div style={{
          background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px",
        }}>
          {[
            { label: "Consensus Agreement", value: `${factors.consensusAgreement || 0}%`, icon: "🤝" },
            { label: "Evidence Count", value: factors.evidenceCount || 0, icon: "📋" },
            { label: "Source Diversity", value: factors.sourceDiversity || 1, icon: "🌐" },
            { label: "Providers Used", value: factors.providerCount || 1, icon: "🧠" },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{ color: "#64748B" }}>{icon} {label}</span>
              <span style={{ color: "#E2E8F0", fontWeight: "700" }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
