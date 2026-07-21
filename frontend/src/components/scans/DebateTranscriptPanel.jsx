/**
 * DebateTranscriptPanel.jsx (Sprint 15)
 * Production-grade debate transcript UI for multi-agent disagreement sessions.
 * Displays threaded AI model arguments, votes, and final consensus verdict.
 */
import { useState } from "react";
import { Scale, MessageSquare, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Trophy, Swords } from "lucide-react";

const MODEL_COLORS = {
  claude: { color: "#D97706", bg: "rgba(217,119,6,0.08)", label: "Claude", icon: "⚗️" },
  openai: { color: "#22C55E", bg: "rgba(34,197,94,0.08)", label: "GPT-4", icon: "🧠" },
  gemini: { color: "#3B82F6", bg: "rgba(59,130,246,0.08)", label: "Gemini", icon: "💎" },
  groq: { color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", label: "Groq", icon: "⚡" },
  deepseek: { color: "#EC4899", bg: "rgba(236,72,153,0.08)", label: "DeepSeek", icon: "🔍" },
  default: { color: "#94A3B8", bg: "rgba(148,163,184,0.08)", label: "AI Model", icon: "🤖" },
};

function ModelChip({ model, vote }) {
  const cfg = MODEL_COLORS[model?.toLowerCase()] || MODEL_COLORS.default;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "20px",
      background: cfg.bg, border: `1px solid ${cfg.color}30`,
    }}>
      <span style={{ fontSize: "12px" }}>{cfg.icon}</span>
      <span style={{ fontSize: "11px", fontWeight: "700", color: cfg.color }}>{cfg.label}</span>
      {vote !== undefined && (
        <span style={{
          fontSize: "10px", fontWeight: "800", color: "#030712",
          background: vote ? "#22C55E" : "#EF4444",
          padding: "1px 5px", borderRadius: "3px", marginLeft: "2px",
        }}>{vote ? "VULN" : "SAFE"}</span>
      )}
    </div>
  );
}

function DebateMessage({ message, index }) {
  const cfg = MODEL_COLORS[message.model?.toLowerCase()] || MODEL_COLORS.default;
  const isChallenge = message.type === "challenge";

  return (
    <div style={{
      display: "flex", gap: "10px", padding: "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      animation: "debate-slide 0.3s ease-out",
    }}>
      <div style={{
        width: "34px", height: "34px", flexShrink: 0, borderRadius: "50%",
        background: cfg.bg, border: `2px solid ${cfg.color}50`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
      }}>{cfg.icon}</div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: "800", color: cfg.color }}>{cfg.label}</span>
          {isChallenge && (
            <span style={{
              fontSize: "9px", fontWeight: "700", color: "#F59E0B",
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
              padding: "1px 6px", borderRadius: "3px", letterSpacing: "0.5px",
            }}>CHALLENGES</span>
          )}
          <span style={{ fontSize: "10px", color: "#475569" }}>{message.timestamp}</span>
        </div>
        <div style={{
          fontSize: "13px", color: "#CBD5E1", lineHeight: 1.65,
          background: isChallenge ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${isChallenge ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)"}`,
          borderLeft: `3px solid ${cfg.color}`,
          borderRadius: "6px", padding: "8px 12px",
        }}>{message.content}</div>
      </div>
    </div>
  );
}

export default function DebateTranscriptPanel({ debate = null }) {
  const [expanded, setExpanded] = useState(true);

  if (!debate) return null;

  const { topic = "Security Finding", messages = [], verdict = null, votes = [], confidence = null } = debate;

  const yesVotes = votes.filter((v) => v.vote === true).length;
  const noVotes = votes.filter((v) => v.vote === false).length;
  const totalVotes = votes.length;

  return (
    <div style={{
      background: "linear-gradient(180deg, #0A0D1A 0%, #050712 100%)",
      border: "1px solid rgba(245,158,11,0.2)", borderRadius: "16px",
      overflow: "hidden", fontFamily: "'Inter', sans-serif",
      boxShadow: "0 8px 32px rgba(245,158,11,0.06)",
    }}>
      <style>{`
        @keyframes debate-slide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(245,158,11,0.04)", borderBottom: "1px solid rgba(245,158,11,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Swords size={16} color="#F59E0B" />
          <span style={{ fontSize: "13px", fontWeight: "800", color: "#E2E8F0" }}>AI Debate Transcript</span>
          <span style={{
            fontSize: "10px", color: "#64748B", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px",
          }}>{topic}</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: "#64748B", display: "flex", alignItems: "center",
        }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <>
          {/* Vote breakdown */}
          {totalVotes > 0 && (
            <div style={{
              padding: "12px 18px", display: "flex", gap: "12px", alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(0,0,0,0.2)",
            }}>
              <Scale size={14} color="#8B5CF6" />
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Vote Breakdown:</span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {votes.map((v, i) => <ModelChip key={i} model={v.model} vote={v.vote} />)}
              </div>
              <div style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "700" }}>
                <span style={{ color: "#EF4444" }}>🚨 {yesVotes}</span>
                <span style={{ color: "#475569", margin: "0 6px" }}>vs</span>
                <span style={{ color: "#22C55E" }}>✅ {noVotes}</span>
              </div>
            </div>
          )}

          {/* Progress bar of votes */}
          {totalVotes > 0 && (
            <div style={{ padding: "0 18px 10px", paddingTop: "8px" }}>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  width: `${(yesVotes / totalVotes) * 100}%`, height: "100%",
                  background: "linear-gradient(90deg, #EF4444, #F97316)",
                  borderRadius: "4px", transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          )}

          {/* Transcript messages */}
          <div style={{ padding: "4px 18px 0", maxHeight: "360px", overflowY: "auto" }}>
            {messages.map((msg, i) => <DebateMessage key={i} message={msg} index={i} />)}
          </div>

          {/* Final Verdict */}
          {verdict && (
            <div style={{
              margin: "12px 18px", padding: "14px 16px",
              background: verdict.isVulnerable
                ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
              border: `1px solid ${verdict.isVulnerable ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
              borderRadius: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Trophy size={15} color={verdict.isVulnerable ? "#EF4444" : "#22C55E"} />
                <span style={{
                  fontSize: "13px", fontWeight: "800",
                  color: verdict.isVulnerable ? "#EF4444" : "#22C55E",
                }}>
                  {verdict.isVulnerable ? "🚨 VULNERABILITY CONFIRMED" : "✅ FALSE POSITIVE — NO THREAT"}
                </span>
                {confidence && (
                  <span style={{
                    fontSize: "10px", fontWeight: "700", color: "#64748B",
                    background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px",
                  }}>{confidence}% Confidence</span>
                )}
              </div>
              {verdict.reasoning && (
                <div style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: 1.6 }}>{verdict.reasoning}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
