import React, { useEffect, useRef, useState } from "react";
import { Shield, Lightbulb, Code, BookOpen, Cpu, Globe, ChevronDown, Brain } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ThinkingIndicator from "./ThinkingIndicator";

const SUGGESTIONS = [
  {
    text: "Analyze my latest scan results and prioritize critical findings",
    icon: <Shield size={14} color="#EF4444" />,
    bg: "rgba(239, 68, 68, 0.12)",
    tag: "Security Audit",
  },
  {
    text: "Explain BOLA vulnerabilities and how to prevent them in Express.js",
    icon: <Lightbulb size={14} color="#8B5CF6" />,
    bg: "rgba(139, 92, 246, 0.12)",
    tag: "Education",
  },
  {
    text: "Generate a secure JWT authentication middleware with refresh tokens",
    icon: <Code size={14} color="#10B981" />,
    bg: "rgba(16, 185, 129, 0.12)",
    tag: "Code Gen",
  },
  {
    text: "Design a zero-trust API architecture for a fintech application",
    icon: <Cpu size={14} color="#3B82F6" />,
    bg: "rgba(59, 130, 246, 0.12)",
    tag: "Architecture",
  },
  {
    text: "Create a OWASP Top 10 compliance checklist for my API",
    icon: <BookOpen size={14} color="#F59E0B" />,
    bg: "rgba(245, 158, 11, 0.12)",
    tag: "Compliance",
  },
  {
    text: "Scan for SQL injection vulnerabilities and write a remediation patch",
    icon: <Globe size={14} color="#06B6D4" />,
    bg: "rgba(6, 182, 212, 0.12)",
    tag: "Pentest",
  },
];

export default function ChatWindow({ messages, loading, onSelectSuggestion, activeModel }) {
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Digital stopwatch timer for API latency tracking
  useEffect(() => {
    if (!loading) {
      setElapsedTime(0);
      return;
    }
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);
    return () => clearInterval(timer);
  }, [loading]);

  // Cycle loading phases dynamically
  useEffect(() => {
    if (!loading) {
      setLoadingPhase(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingPhase((p) => (p + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBtn(distFromBottom > 150);
    if (distFromBottom <= 150) setUnreadCount(0);
  };

  useEffect(() => {
    if (messages.length > lastCount) {
      if (showScrollBtn) {
        setUnreadCount((u) => u + (messages.length - lastCount));
      }
      setLastCount(messages.length);
    }
  }, [messages, showScrollBtn]);

  useEffect(() => {
    if (!showScrollBtn && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
    setUnreadCount(0);
  };

  return (
    <>
      <style>{`
        .chat-messages-scroll::-webkit-scrollbar { width: 5px; }
        .chat-messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-messages-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 999px;
        }
        .chat-messages-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.55);
        }
        .suggestion-card {
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.25s, background 0.25s;
          cursor: pointer;
          transform: perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px);
        }
        .suggestion-card:hover {
          border-color: rgba(139, 92, 246, 0.38) !important;
          background: rgba(139, 92, 246, 0.06) !important;
          transform: perspective(800px) rotateX(4deg) rotateY(-4deg) translateZ(8px);
          box-shadow: 0 10px 24px rgba(139, 92, 246, 0.12);
        }
        @keyframes pulseGlow {
          0% { opacity: 0.5; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.5; transform: scale(0.95); }
        }

        /* 3D Holographic Orb CSS */
        .holo-agent-orb {
          width: 70px;
          height: 70px;
          position: relative;
          perspective: 1000px;
          transform-style: preserve-3d;
          animation: floatingHolo 5s ease-in-out infinite;
        }
        @keyframes floatingHolo {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .holo-ring {
          position: absolute;
          inset: 0;
          border: 1.5px solid var(--theme-accent, #8B5CF6);
          border-radius: 50%;
          box-shadow: 0 0 15px var(--theme-accent, #8B5CF6), inset 0 0 15px var(--theme-accent, #8B5CF6);
          opacity: 0.65;
          pointer-events: none;
        }
        .holo-ring-1 {
          animation: spinRing1 7s linear infinite;
        }
        .holo-ring-2 {
          animation: spinRing2 7s linear infinite;
          border-color: #3B82F6;
          box-shadow: 0 0 15px #3B82F6, inset 0 0 15px #3B82F6;
        }
        .holo-ring-3 {
          animation: spinRing3 7s linear infinite;
          border-color: #10B981;
          box-shadow: 0 0 15px #10B981, inset 0 0 15px #10B981;
        }
        @keyframes spinRing1 {
          0% { transform: rotateX(35deg) rotateY(45deg) rotateZ(0deg); }
          100% { transform: rotateX(35deg) rotateY(45deg) rotateZ(360deg); }
        }
        @keyframes spinRing2 {
          0% { transform: rotateX(45deg) rotateY(-45deg) rotateZ(0deg); }
          100% { transform: rotateX(45deg) rotateY(-45deg) rotateZ(360deg); }
        }
        @keyframes spinRing3 {
          0% { transform: rotateX(-35deg) rotateY(0deg) rotateZ(360deg); }
          100% { transform: rotateX(-35deg) rotateY(0deg) rotateZ(0deg); }
        }
        .holo-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          background: #FFF;
          border-radius: 50%;
          box-shadow: 0 0 25px #FFF, 0 0 40px var(--theme-accent, #8B5CF6);
          animation: corePulse 2s ease-in-out infinite alternate;
        }
        @keyframes corePulse {
          0% { transform: translate(-50%, -50%) scale(0.85); filter: brightness(1); }
          100% { transform: translate(-50%, -50%) scale(1.15); filter: brightness(1.25); }
        }
      `}</style>

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="chat-messages-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {messages.length === 0 ? (
            /* Empty State Landing View */
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "800px",
              margin: "0 auto",
            }}>
              {/* Hero header */}
              <div style={{ marginBottom: "28px", marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 24px rgba(124, 58, 237, 0.35)",
                    }}>
                      <Brain size={22} color="#FFF" />
                    </div>
                    <div>
                      <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#FFF", margin: 0, letterSpacing: "-0.3px" }}>
                        ATHX AI Copilot
                      </h1>
                      <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontWeight: "500" }}>
                        {activeModel ? `Running on ${activeModel.split("/")[1] || activeModel}` : "Universal Security Engine"}
                      </p>
                    </div>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: "400", lineHeight: "1.6", marginTop: "12px", maxWidth: "580px" }}>
                    Ask me anything about API vulnerabilities, secure middleware configuration, threat modeling, compliance checks, or incident remediation workflows.
                  </p>
                </div>

                {/* 3D Holographic AI Agent Avatar */}
                <div className="holo-agent-orb" style={{ marginRight: "32px", flexShrink: 0 }}>
                  <div className="holo-ring holo-ring-1" />
                  <div className="holo-ring holo-ring-2" />
                  <div className="holo-ring holo-ring-3" />
                  <div className="holo-core" />
                </div>
              </div>

              {/* Badges list */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}>
                {[
                  { icon: "🛡️", text: "Vulnerability Auditing" },
                  { icon: "💻", text: "Remediation Codes" },
                  { icon: "🏗️", text: "Threat Modeling" },
                  { icon: "📋", text: "Compliance Mapping" },
                  { icon: "⚡", text: "CI/CD Gatekeeper" },
                ].map((cap, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "99px",
                    fontSize: "11.5px",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: "600",
                  }}>
                    <span>{cap.icon}</span>
                    {cap.text}
                  </div>
                ))}
              </div>

              {/* Suggestions Cards Grid */}
              <div style={{ marginTop: "auto" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
                  Suggested directives
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {SUGGESTIONS.map((item, idx) => (
                    <div
                      key={idx}
                      className="suggestion-card"
                      onClick={() => onSelectSuggestion(item.text)}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "12px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: item.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <span style={{ display: "inline-block", fontSize: "9px", fontWeight: "700", color: "rgba(139,92,246,0.8)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                          {item.tag}
                        </span>
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11.5px", margin: 0, fontWeight: "500", lineHeight: "1.45" }}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Chat Thread */
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
              maxWidth: "800px",
              margin: "0 auto",
            }}>
              {messages.map((msg, idx) => (
                <MessageBubble 
                  key={idx} 
                  msg={msg} 
                  isLatest={idx === messages.length - 1}
                />
              ))}

              {/* Waiting first-token loaders */}
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <ThinkingIndicator phaseIndex={loadingPhase} />
                  
                  {/* High-precision digital stopwatch timer */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.45)",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "99px",
                    padding: "4px 10px",
                    width: "fit-content",
                    fontFamily: "monospace",
                    boxShadow: "0 0 10px rgba(139,92,246,0.05)",
                    marginLeft: "36px",
                  }}>
                    <span style={{
                      display: "inline-block",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#10B981",
                      animation: "pulseGlow 1.2s infinite ease-in-out"
                    }} />
                    <span>Processing response... {elapsedTime}s</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating scroll action button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            style={{
              position: "absolute",
              bottom: "12px",
              right: "20px",
              background: "linear-gradient(135deg, #7C3AED, #2563EB)",
              border: "none",
              borderRadius: "999px",
              padding: "8px 14px",
              color: "#FFF",
              fontSize: "11.5px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
              zIndex: 10,
            }}
          >
            <ChevronDown size={14} />
            {unreadCount > 0 ? `${unreadCount} new` : "Scroll down"}
          </button>
        )}
      </div>
    </>
  );
}
