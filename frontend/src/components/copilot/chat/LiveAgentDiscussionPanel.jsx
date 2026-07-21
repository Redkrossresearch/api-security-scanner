/**
 * LiveAgentDiscussionPanel.jsx (Sprint 20)
 * Real-time multi-agent discussion panel showing live agent status, thinking indicators,
 * agent avatars, role labels, and results in a threaded chat-like UI.
 */
import { useState, useEffect, useRef } from "react";
import { Brain, Zap, CheckCircle, XCircle, Clock, AlertTriangle, Cpu } from "lucide-react";

const AGENT_ROLES = {
  planner: { icon: "🗺️", color: "#8B5CF6", label: "Planner" },
  security: { icon: "🛡️", color: "#EF4444", label: "Security Expert" },
  research: { icon: "🔬", color: "#3B82F6", label: "Research Agent" },
  reviewer: { icon: "⚖️", color: "#F59E0B", label: "Reviewer" },
  cve_analyst: { icon: "🔍", color: "#EC4899", label: "CVE Analyst" },
  risk: { icon: "📊", color: "#F97316", label: "Risk Assessor" },
  documentation: { icon: "📝", color: "#22C55E", label: "Documentation" },
  developer: { icon: "💻", color: "#06B6D4", label: "Developer Agent" },
};

function AgentAvatar({ agent, isActive }) {
  const cfg = AGENT_ROLES[agent] || { icon: "🤖", color: "#8B5CF6", label: agent };
  return (
    <div style={{
      width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
      background: `${cfg.color}20`, border: `2px solid ${isActive ? cfg.color : `${cfg.color}40`}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "16px", position: "relative",
      boxShadow: isActive ? `0 0 14px ${cfg.color}60` : "none",
      transition: "all 0.3s ease",
    }}>
      {cfg.icon}
      {isActive && (
        <div style={{
          position: "absolute", bottom: "-2px", right: "-2px",
          width: "10px", height: "10px", borderRadius: "50%",
          background: "#22C55E", border: "2px solid #030712",
          animation: "agent-live-pulse 1.5s infinite ease",
        }} />
      )}
    </div>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: "4px", padding: "8px 12px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: "#8B5CF6", opacity: 0.6,
          animation: `thinking-dot 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  );
}

function AgentMessage({ event }) {
  const { agent, status, output, error, timestamp } = event;
  const cfg = AGENT_ROLES[agent] || { icon: "🤖", color: "#8B5CF6", label: agent };
  const time = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div style={{
      display: "flex", gap: "10px", padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)", animation: "agent-slide-in 0.3s ease-out",
    }}>
      <AgentAvatar agent={agent} isActive={status === "thinking"} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: cfg.color }}>{cfg.label}</span>
          <span style={{ fontSize: "10px", color: "#475569", fontWeight: "600" }}>{time}</span>
          {status === "done" && <CheckCircle size={11} color="#22C55E" />}
          {status === "error" && <XCircle size={11} color="#EF4444" />}
          {status === "thinking" && <Cpu size={11} color="#8B5CF6" style={{ animation: "spin 1s linear infinite" }} />}
        </div>

        {status === "thinking" && <ThinkingDots />}
        {status === "started" && (
          <div style={{ fontSize: "12px", color: "#64748B", fontStyle: "italic" }}>Initializing analysis pipeline...</div>
        )}
        {status === "done" && output && (
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderLeft: `3px solid ${cfg.color}`, borderRadius: "6px",
            padding: "8px 12px", fontSize: "12px", color: "#CBD5E1", lineHeight: 1.6,
            maxHeight: "120px", overflowY: "auto",
          }}>{output.length > 300 ? output.slice(0, 300) + "…" : output}</div>
        )}
        {status === "error" && error && (
          <div style={{
            fontSize: "12px", color: "#EF4444", background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "6px 10px",
          }}>❌ {error}</div>
        )}
      </div>
    </div>
  );
}

export default function LiveAgentDiscussionPanel({ events = [], isRunning = false, title = "Agent Discussion" }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const activeCount = events.filter((e) => e.status === "thinking").length;
  const doneCount = events.filter((e) => e.status === "done").length;
  const errorCount = events.filter((e) => e.status === "error").length;

  return (
    <div style={{
      background: "linear-gradient(180deg, #0A0F1E 0%, #050912 100%)",
      border: "1px solid rgba(139,92,246,0.2)", borderRadius: "16px",
      display: "flex", flexDirection: "column", overflow: "hidden",
      boxShadow: "0 8px 32px rgba(139,92,246,0.08)",
    }}>
      <style>{`
        @keyframes agent-live-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:0.6} }
        @keyframes agent-slide-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes thinking-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(139,92,246,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Brain size={16} color="#8B5CF6" />
          <span style={{ fontSize: "13px", fontWeight: "800", color: "#E2E8F0" }}>{title}</span>
          {isRunning && (
            <span style={{
              fontSize: "10px", fontWeight: "700", color: "#22C55E",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              padding: "2px 8px", borderRadius: "10px",
              animation: "agent-live-pulse 2s infinite",
            }}>LIVE</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontWeight: "700" }}>
          {activeCount > 0 && <span style={{ color: "#8B5CF6" }}>⚙️ {activeCount} active</span>}
          {doneCount > 0 && <span style={{ color: "#22C55E" }}>✅ {doneCount} done</span>}
          {errorCount > 0 && <span style={{ color: "#EF4444" }}>❌ {errorCount} failed</span>}
        </div>
      </div>

      {/* Messages scroll area */}
      <div ref={scrollRef} style={{
        padding: "8px 14px", overflowY: "auto", flex: 1,
        maxHeight: "400px", minHeight: "100px",
      }}>
        {events.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "32px", color: "#475569", fontSize: "12px", gap: "8px",
          }}>
            <Cpu size={24} color="#334155" />
            <span>No agents running. Start a scan or task to see live agent activity.</span>
          </div>
        ) : (
          events.map((event, i) => <AgentMessage key={i} event={event} />)
        )}
      </div>

      {/* Footer status bar */}
      {isRunning && (
        <div style={{
          padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "8px",
        }}>
          <ThinkingDots />
          <span style={{ fontSize: "11px", color: "#64748B" }}>Agents are analyzing your request...</span>
        </div>
      )}
    </div>
  );
}
