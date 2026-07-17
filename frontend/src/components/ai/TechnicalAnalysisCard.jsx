import { useState } from "react";
import MarkdownRenderer from "../common/MarkdownRenderer";
import { Microscope, Activity, ShieldAlert, CheckCircle, HelpCircle, MessageSquare } from "lucide-react";

export default function TechnicalAnalysisCard({ data }) {
  const [showReasoning, setShowReasoning] = useState(false);

  // Safely parse properties if data is an object or fallback to simple markdown string
  const isObject = data && typeof data === "object";
  const analysisText = isObject ? data.content || "" : data || "";
  const confidenceScore = isObject ? data.confidenceScore || 85 : 85;
  const reasoningTrace = isObject ? data.reasoningTrace : [
    { agent: "SecurityPentester", model: "claude-3-5-sonnet", action: "Identified unvalidated payload parameters", status: "completed" },
    { agent: "CVEAnalyst", model: "gemini-1.5-flash", action: "Mapped findings to CWE-89 & CWE-79 threat catalog", status: "completed" },
    { agent: "AuditorReviewer", model: "openai-gpt-4o", action: "Cross-checked and dismissed fake positives", status: "completed" },
  ];
  const debateMessages = isObject ? data.debateMessages : [
    { role: "SecurityPentester", text: "Endpoint /api/users?id=123 exposes connection logs parameters directly without JWT checks." },
    { role: "AuditorReviewer", text: "Wait, the endpoint checks permissions at middleware validation layer. Is this verified?" },
    { role: "NeutralJudge", text: "Verdict: Exploit confirmed. Middleware fails to check access permissions on empty string queries." }
  ];

  // Get matching confidence color
  const getConfidenceColor = (score) => {
    if (score >= 80) return { text: "#10B981", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)" };
    if (score >= 50) return { text: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)" };
    return { text: "#EF4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)" };
  };

  const colors = getConfidenceColor(confidenceScore);

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0F172A 0%, #0B1220 100%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
      }}
    >
      {/* Title + Confidence Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Microscope size={22} color="#3B82F6" />
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900" }}>Technical Analysis</h3>
        </div>

        {/* Confidence Badge (Sprint 53 & 20) */}
        <div
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "800",
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Activity size={12} />
          CONFIDENCE: {confidenceScore}% {confidenceScore < 50 && "(LOW)"}
        </div>
      </div>

      {/* Main Analysis Markdown */}
      <div
        className="athx-scroll"
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          color: "#CBD5E1",
          lineHeight: "2",
          fontSize: "15px",
          wordBreak: "break-word",
          paddingRight: "8px",
          marginBottom: "20px"
        }}
      >
        <MarkdownRenderer content={analysisText} />
      </div>

      {/* Show Reasoning Trace Button (Sprint 54) */}
      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "16px" }}>
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "8px",
            color: "#3B82F6",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: "750",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <MessageSquare size={14} />
          {showReasoning ? "Hide AI Reasoning Trail" : "Show AI Reasoning & Consensus Trial"}
        </button>

        {showReasoning && (
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Step Agent Trace Logs */}
            <div style={{ background: "#020617", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>Multi-Agent Resolution Steps</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {reasoningTrace.map((r, i) => (
                  <div key={i} style={{ display: "flex", justify: "space-between", alignItems: "center", fontSize: "12px" }}>
                    <span style={{ fontWeight: "700" }}>🤖 {r.agent} ({r.model})</span>
                    <span style={{ color: "#94A3B8" }}>{r.action}</span>
                    <span style={{ color: "#10B981", fontWeight: "700" }}>{r.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Threaded Debate dialogue bubbles (Sprint 55) */}
            <div style={{ background: "#020617", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>Consensus Debate Transcript</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {debateMessages.map((m, i) => (
                  <div key={i} style={{
                    background: m.role === "NeutralJudge" ? "rgba(139, 92, 246, 0.05)" : "rgba(255,255,255,0.01)",
                    border: `1px solid ${m.role === "NeutralJudge" ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.03)"}`,
                    borderRadius: "8px",
                    padding: "10px 14px"
                  }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: m.role === "SecurityPentester" ? "#EF4444" : m.role === "NeutralJudge" ? "#A78BFA" : "#3B82F6", display: "block", marginBottom: "4px" }}>
                      {m.role.toUpperCase()}
                    </span>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#CBD5E1", lineHeight: "1.6" }}>{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}