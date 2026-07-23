/**
 * WorkspacePage.jsx (Sprint 85, 89, 90 — 3-Panel AI Workspace Shell & Live Artifact Inspector)
 * Features 3-Panel Layout (Left Sidebar, Middle Chat, Right Live Artifact Inspector: Files | Diagrams | Reasoning)
 * and Custom Agent Creation Form Modal.
 */
import { useState } from "react";
import { Layers, MessageSquare, FileText, Cpu, Plus, Sparkles, Send, ShieldCheck, Database } from "lucide-react";
import DiagramRenderer from "../components/copilot/renderers/DiagramRenderer";
import ChartBlock from "../components/copilot/renderers/ChartBlock";
import toast from "react-hot-toast";

export default function WorkspacePage() {
  const [activeRightTab, setActiveRightTab] = useState("diagrams");
  const [messages, setMessages] = useState([
    { id: "1", sender: "agent", text: "Welcome to the 3-Panel AI Security Workspace. Ask me to scan an endpoint or generate architecture diagrams." }
  ]);
  const [inputText, setInputText] = useState("");
  const [isCustomAgentModalOpen, setIsCustomAgentModalOpen] = useState(false);

  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [projects] = useState(["Production API Audit", "Payment Gateway Scan", "Internal Microservices"]);

  const togglePinMessage = (msgId) => {
    setPinnedMessages((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
    toast.success("Message pinned state updated!");
  };

  const handleSendMessage = () => {

    if (!inputText) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), sender: "user", text: inputText }]);
    setInputText("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), sender: "agent", text: "Analyzed request: Generating live system architecture and security threat matrix." }
      ]);
    }, 600);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)", background: "#030712", color: "#FFFFFF", overflow: "hidden" }}>
      {/* Panel 1: Left Navigation & Agents List */}
      <div style={{ width: "260px", background: "#070D19", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "800", color: "#38BDF8", textTransform: "uppercase" }}>AI Agent Roster</span>
          <button
            onClick={() => setIsCustomAgentModalOpen(true)}
            title="Create Custom Agent"
            style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.4)", color: "#38BDF8", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Plus size={12} />
            Agent
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {["Planner Agent", "Developer Agent", "Judge Agent", "Security Analyst", "Image Agent"].map((agent, i) => (
            <div key={agent} style={{ background: i === 0 ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === 0 ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "600", color: i === 0 ? "#38BDF8" : "#CBD5E1", display: "flex", alignItems: "center", gap: "8px" }}>
              <Cpu size={14} color={i === 0 ? "#38BDF8" : "#94A3B8"} />
              <span>{agent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel 2: Middle Chat Interface */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#071126", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "14px", fontWeight: "800", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageSquare size={16} color="#38BDF8" />
          <span>Interactive Chat Execution</span>
        </div>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
          {messages.map((m) => (
            <div key={m.id} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: "80%", background: m.sender === "user" ? "linear-gradient(135deg,#7C3AED,#EC4899)" : "#0B1220", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", borderRadius: "14px", color: "#FFFFFF", fontSize: "13px", lineHeight: "1.6" }}>
              {m.text}
            </div>
          ))}
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask AI Agents to analyze, generate diagrams, or execute workflows..."
            style={{ flex: 1, background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
          />
          <button onClick={handleSendMessage} style={{ background: "linear-gradient(135deg,#38BDF8,#818CF8)", border: "none", color: "#FFFFFF", padding: "10px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Panel 3: Right Live Artifact Inspector */}
      <div style={{ width: "440px", background: "#030814", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#070D19" }}>
          {["diagrams", "charts", "reasoning"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRightTab(tab)}
              style={{
                flex: 1, padding: "12px 0", background: activeRightTab === tab ? "rgba(56,189,248,0.12)" : "transparent",
                border: "none", borderBottom: activeRightTab === tab ? "2px solid #38BDF8" : "none",
                color: activeRightTab === tab ? "#38BDF8" : "#94A3B8", fontSize: "12px", fontWeight: "700",
                cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
          {activeRightTab === "diagrams" && <DiagramRenderer diagramType="flow" />}
          {activeRightTab === "charts" && <ChartBlock title="Vulnerability Severity Matrix" />}
          {activeRightTab === "reasoning" && (
            <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", color: "#CBD5E1", fontSize: "13px", lineHeight: "1.6" }}>
              <div style={{ fontWeight: "700", color: "#38BDF8", marginBottom: "8px" }}>🤖 Multi-Agent Consensus Reasoning</div>
              1. <strong>Planner Agent</strong> routed task to DeveloperAgent.<br />
              2. <strong>Developer Agent</strong> inspected API endpoints and identified SQLi vector.<br />
              3. <strong>Judge Agent</strong> arbitrated disagreement and confirmed High Risk verdict.
            </div>
          )}
        </div>
      </div>

      {/* Custom Agent Creation Modal (Sprint 90) */}
      {isCustomAgentModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#071126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "28px", width: "90%", maxWidth: "520px" }}>
            <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles color="#38BDF8" size={20} />
              <span>Create Custom Specialized AI Agent</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <input placeholder="Agent Name (e.g. Compliance Auditor)" style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "#FFFFFF", fontSize: "13px" }} />
              <input placeholder="Agent Role (e.g. Regulatory Specialist)" style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "#FFFFFF", fontSize: "13px" }} />
              <textarea placeholder="System Prompt Instructions..." rows={4} style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "#FFFFFF", fontSize: "13px" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setIsCustomAgentModalOpen(false)} style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setIsCustomAgentModalOpen(false); toast.success("Custom Agent created successfully!"); }} style={{ background: "linear-gradient(135deg,#38BDF8,#818CF8)", border: "none", color: "#FFFFFF", padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Save Custom Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
