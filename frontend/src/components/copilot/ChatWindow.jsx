import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Shield, Lightbulb, Code, BookOpen, Cpu, Globe,
  ChevronDown, Sparkles, RefreshCw, Zap, Brain,
  MessageSquare, FileText, Database, Layers, Scan,
  ArrowRight, Star, Clock, TrendingUp, Target,
  ChevronRight, Plus, Search, Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";

// Design Tokens
const THEME = {
  colors: {
    primary: "#8B5CF6",
    primaryHover: "#7C3AED",
    secondary: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    surface: "rgba(255,255,255,0.03)",
    surfaceHover: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.5)",
    textSubtle: "rgba(255,255,255,0.3)",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    full: "9999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
  },
  shadows: {
    glow: "0 0 20px rgba(139,92,246,0.3)",
    glowStrong: "0 0 40px rgba(139,92,246,0.5)",
    elevated: "0 8px 32px rgba(0,0,0,0.4)",
    floating: "0 12px 48px rgba(0,0,0,0.5)",
  },
};

const SUGGESTIONS = [
  {
    text: "Analyze my latest scan results and prioritize critical findings",
    icon: Shield,
    color: "#EF4444",
    tag: "Security Audit",
    category: "Security",
  },
  {
    text: "Explain BOLA vulnerabilities and how to prevent them in Express.js",
    icon: Lightbulb,
    color: "#8B5CF6",
    tag: "Education",
    category: "Learning",
  },
  {
    text: "Generate a secure JWT authentication middleware with refresh tokens",
    icon: Code,
    color: "#10B981",
    tag: "Code Gen",
    category: "Development",
  },
  {
    text: "Design a zero-trust API architecture for a fintech application",
    icon: Cpu,
    color: "#3B82F6",
    tag: "Architecture",
    category: "Design",
  },
  {
    text: "Create a OWASP Top 10 compliance checklist for my API",
    icon: BookOpen,
    color: "#F59E0B",
    tag: "Compliance",
    category: "Audit",
  },
  {
    text: "Scan for SQL injection vulnerabilities and write a remediation patch",
    icon: Globe,
    color: "#06B6D4",
    tag: "Pentest",
    category: "Testing",
  },
];

const CAPABILITIES = [
  { icon: "🛡️", text: "Vulnerability Analysis", color: "#EF4444" },
  { icon: "💻", text: "Code Generation", color: "#10B981" },
  { icon: "🏗️", text: "Architecture Design", color: "#3B82F6" },
  { icon: "📋", text: "Compliance Audit", color: "#F59E0B" },
  { icon: "⚡", text: "DevOps & CI/CD", color: "#8B5CF6" },
  { icon: "🧠", text: "AI & ML Engineering", color: "#06B6D4" },
];

const QUICK_ACTIONS = [
  { icon: Plus, label: "New Project", color: "#8B5CF6" },
  { icon: Search, label: "Search History", color: "#3B82F6" },
  { icon: FileText, label: "View Reports", color: "#10B981" },
  { icon: Database, label: "Manage Memory", color: "#F59E0B" },
];

export default function ChatWindow({ 
  messages, 
  loading, 
  onSelectSuggestion, 
  messagesEndRef, 
  activeModel,
  onRegenerate 
}) {
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const LOADING_PHASES = [
    { text: "Analyzing query intent...", icon: Brain },
    { text: "Searching knowledge base...", icon: Search },
    { text: "Generating response...", icon: Sparkles },
    { text: "Formatting output...", icon: Layers },
  ];

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  // Cycle through loading phases
  useEffect(() => {
    if (!loading) { 
      setLoadingPhase(0); 
      return; 
    }
    const interval = setInterval(() => {
      setLoadingPhase((p) => (p + 1) % LOADING_PHASES.length);
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
      if (showScrollBtn) setUnreadCount((u) => u + (messages.length - lastCount));
      setLastCount(messages.length);
    }
  }, [messages, showScrollBtn]);

  // Auto scroll to bottom on new messages
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

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes orb-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes thinking-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .chat-messages-scroll::-webkit-scrollbar { width: 6px; }
        .chat-messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-messages-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 999px;
        }
        .chat-messages-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.55);
        }
        .suggestion-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .suggestion-card:hover {
          border-color: rgba(139, 92, 246, 0.4) !important;
          background: rgba(139, 92, 246, 0.08) !important;
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(139, 92, 246, 0.2);
        }
        .capability-badge {
          transition: all 0.2s ease;
        }
        .capability-badge:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.08) !important;
        }
        .quick-action {
          transition: all 0.2s ease;
        }
        .quick-action:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.08) !important;
        }
        .thinking-dot { animation: thinking-pulse 1.2s ease-in-out infinite; }
        .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dot:nth-child(3) { animation-delay: 0.4s; }
        .msg-fade-in { animation: fade-slide-up 0.4s ease forwards; }
        .orb-container {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .orb-core {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #06B6D4 100%);
          animation: orb-rotate 20s linear infinite;
          filter: blur(0px);
        }
        .orb-ring {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 2px solid rgba(139, 92, 246, 0.3);
          animation: pulse-ring 3s ease-out infinite;
        }
        .orb-ring:nth-child(2) { animation-delay: 1s; }
        .orb-ring:nth-child(3) { animation-delay: 2s; }
        .orb-glow {
          position: absolute;
          inset: -40px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
          filter: blur(40px);
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Messages Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="chat-messages-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minHeight: 0,
            position: "relative",
          }}
        >
          {messages.length === 0 ? (
            /* Empty State — Premium Landing Screen */
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              width: "100%",
              maxWidth: "1000px",
              margin: "0 auto",
              position: "relative",
            }}>
              {/* Interactive Background Glow */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(139,92,246,0.15) 0%, transparent 70%)`,
                pointerEvents: "none",
                transition: "background 0.3s ease",
                zIndex: 0,
              }} />

              {/* Hero Section with AI Orb */}
              <div style={{ 
                marginBottom: "48px",
                textAlign: "center",
                position: "relative",
                zIndex: 1,
              }}>
                {/* Animated AI Orb */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center",
                  marginBottom: "32px",
                }}>
                  <div className="orb-container">
                    <div className="orb-glow" />
                    <div className="orb-ring" />
                    <div className="orb-ring" />
                    <div className="orb-ring" />
                    <div className="orb-core" />
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}>
                      <Brain size={48} color="#FFF" style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))" }} />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 style={{ 
                  fontSize: "32px", 
                  fontWeight: "800", 
                  color: THEME.colors.text, 
                  margin: "0 0 12px",
                  letterSpacing: "-0.5px",
                  background: "linear-gradient(135deg, #FFF 0%, rgba(255,255,255,0.7) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  ATHX AI Copilot
                </h1>
                <p style={{ 
                  fontSize: "15px", 
                  color: THEME.colors.textMuted, 
                  margin: "0 0 8px",
                  fontWeight: "400",
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: "1.6",
                }}>
                  {activeModel ? `Running on ${activeModel}` : "Universal Intelligence Engine"}
                </p>
                <p style={{ 
                  color: THEME.colors.textSubtle, 
                  fontSize: "13.5px", 
                  fontWeight: "400", 
                  lineHeight: "1.7", 
                  maxWidth: "650px",
                  margin: "0 auto",
                }}>
                  Your AI-powered security assistant. Ask me anything about vulnerability analysis, code review, architecture design, compliance, or any technical challenge.
                </p>
              </div>

              {/* Capabilities Grid */}
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "10px", 
                marginBottom: "40px",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
              }}>
                {CAPABILITIES.map((cap, i) => (
                  <div 
                    key={i}
                    className="capability-badge"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      background: THEME.colors.surface,
                      border: `1px solid ${THEME.colors.border}`,
                      borderRadius: THEME.radius.full,
                      fontSize: "12.5px",
                      color: THEME.colors.textMuted,
                      fontWeight: "500",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{cap.icon}</span>
                    <span>{cap.text}</span>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: "12px", 
                marginBottom: "40px",
                position: "relative",
                zIndex: 1,
              }}>
                {QUICK_ACTIONS.map((action, i) => (
                  <div
                    key={i}
                    className="quick-action"
                    style={{
                      padding: "16px",
                      background: THEME.colors.surface,
                      border: `1px solid ${THEME.colors.border}`,
                      borderRadius: THEME.radius.lg,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: THEME.radius.md,
                      background: `${action.color}20`,
                      border: `1px solid ${action.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <action.icon size={18} color={action.color} />
                    </div>
                    <span style={{ 
                      fontSize: "12px", 
                      color: THEME.colors.textMuted,
                      fontWeight: "500",
                      textAlign: "center",
                    }}>
                      {action.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Suggestions Grid */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}>
                  <Command size={14} color={THEME.colors.textSubtle} />
                  <p style={{ 
                    fontSize: "11px", 
                    fontWeight: "700", 
                    color: THEME.colors.textSubtle, 
                    letterSpacing: "1.2px", 
                    textTransform: "uppercase", 
                    margin: 0,
                  }}>
                    Suggested Prompts
                  </p>
                </div>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(3, 1fr)", 
                  gap: "12px",
                }}>
                  {SUGGESTIONS.map((item, idx) => (
                    <div
                      key={idx}
                      className="suggestion-card"
                      onClick={() => onSelectSuggestion(item.text)}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${THEME.colors.border}`,
                        borderRadius: THEME.radius.lg,
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        backdropFilter: "blur(12px)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Background gradient on hover */}
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, ${item.color}10 0%, transparent 100%)`,
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      }} />
                      
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: THEME.radius.md,
                        background: `${item.color}20`,
                        border: `1px solid ${item.color}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        position: "relative",
                        zIndex: 1,
                      }}>
                        <item.icon size={18} color={item.color} />
                      </div>
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <span style={{ 
                          display: "inline-block", 
                          fontSize: "9.5px", 
                          fontWeight: "700", 
                          color: item.color,
                          textTransform: "uppercase", 
                          letterSpacing: "0.8px", 
                          marginBottom: "6px",
                          background: `${item.color}15`,
                          padding: "2px 8px",
                          borderRadius: THEME.radius.full,
                        }}>
                          {item.tag}
                        </span>
                        <p style={{ 
                          color: "rgba(255,255,255,0.8)", 
                          fontSize: "12.5px", 
                          margin: 0, 
                          fontWeight: "500", 
                          lineHeight: "1.5",
                        }}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div style={{
                marginTop: "40px",
                padding: "16px",
                background: THEME.colors.surface,
                border: `1px solid ${THEME.colors.border}`,
                borderRadius: THEME.radius.lg,
                display: "flex",
                justifyContent: "center",
                gap: "32px",
                backdropFilter: "blur(12px)",
                position: "relative",
                zIndex: 1,
              }}>
                {[
                  { keys: ["Ctrl", "/"], action: "Focus input" },
                  { keys: ["Ctrl", "K"], action: "Search" },
                  { keys: ["/"], action: "Commands" },
                  { keys: ["Esc"], action: "Cancel" },
                ].map((shortcut, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {shortcut.keys.map((key, j) => (
                        <kbd key={j} style={{
                          padding: "3px 8px",
                          background: THEME.colors.surfaceHover,
                          border: `1px solid ${THEME.colors.border}`,
                          borderRadius: THEME.radius.sm,
                          fontSize: "10.5px",
                          fontWeight: "600",
                          fontFamily: "monospace",
                          color: THEME.colors.textMuted,
                        }}>
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span style={{ fontSize: "11px", color: THEME.colors.textSubtle }}>
                      {shortcut.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Chat */
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              width: "100%",
              maxWidth: "900px",
              margin: "0 auto",
            }}>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                    padding: "0 8px",
                  }}>
                    <div style={{
                      flex: 1,
                      height: "1px",
                      background: `linear-gradient(to right, transparent, ${THEME.colors.border}, transparent)`,
                    }} />
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 12px",
                      background: THEME.colors.surface,
                      border: `1px solid ${THEME.colors.border}`,
                      borderRadius: THEME.radius.full,
                      fontSize: "10.5px",
                      color: THEME.colors.textSubtle,
                      fontWeight: "600",
                      backdropFilter: "blur(12px)",
                    }}>
                      <Clock size={10} />
                      {date}
                    </div>
                    <div style={{
                      flex: 1,
                      height: "1px",
                      background: `linear-gradient(to right, transparent, ${THEME.colors.border}, transparent)`,
                    }} />
                  </div>

                  {/* Messages */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {msgs.map((msg, idx) => (
                      <MessageBubble 
                        key={msg._id || idx} 
                        msg={msg} 
                        index={idx}
                        onRegenerate={onRegenerate}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {loading && (
                <div className="msg-fade-in" style={{ 
                  display: "flex", 
                  gap: "16px", 
                  alignItems: "flex-start", 
                  padding: "12px 0",
                  marginTop: "8px",
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: THEME.radius.md,
                    background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 20px rgba(124,58,237,0.5), 0 0 0 1px rgba(124,58,237,0.3)",
                    position: "relative",
                  }}>
                    <Brain size={18} color="#FFF" />
                    <div style={{
                      position: "absolute",
                      inset: "-4px",
                      borderRadius: THEME.radius.md,
                      border: "2px solid rgba(124,58,237,0.3)",
                      animation: "pulse-ring 2s ease-out infinite",
                    }} />
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${THEME.colors.border}`,
                    borderRadius: THEME.radius.xl,
                    borderTopLeftRadius: THEME.radius.sm,
                    padding: "18px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    flex: 1,
                    maxWidth: "600px",
                  }}>
                    {/* Status */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="thinking-dot"
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12.5px",
                        color: THEME.colors.textMuted,
                        fontWeight: "500",
                      }}>
                        {React.createElement(LOADING_PHASES[loadingPhase].icon, { 
                          size: 14, 
                          color: THEME.colors.primary 
                        })}
                        <span>{LOADING_PHASES[loadingPhase].text}</span>
                      </div>
                    </div>

                    {/* Shimmer bars */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[100, 75, 88].map((w, i) => (
                        <div
                          key={i}
                          style={{
                            height: "10px",
                            width: `${w}%`,
                            background: "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)",
                            borderRadius: THEME.radius.full,
                            animation: `shimmer 1.5s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                            backgroundSize: "200% 100%",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToBottom}
              style={{
                position: "absolute",
                bottom: "20px",
                right: "24px",
                background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                border: "none",
                borderRadius: THEME.radius.full,
                padding: "10px 18px",
                color: "#FFF",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 32px rgba(124,58,237,0.5), 0 0 0 1px rgba(124,58,237,0.3)",
                zIndex: 10,
                backdropFilter: "blur(12px)",
              }}
            >
              <ChevronDown size={16} />
              {unreadCount > 0 ? `${unreadCount} new` : "Scroll down"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}