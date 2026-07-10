import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, User, Copy, ThumbsUp, ThumbsDown, RefreshCw, 
  Check, ChevronDown, ChevronRight, Sparkles, Clock, 
  Cpu, Zap, Brain, Code, Image as ImageIcon, FileText,
  ExternalLink, MoreHorizontal, Edit2, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "./MarkdownRenderer";
import toast from "react-hot-toast";

// Design Tokens - Same as PromptInput for consistency
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

export default function MessageBubble({ msg, onRegenerate, index }) {
  const isBot = msg.sender === "assistant";
  const [isCopied, setIsCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' or 'down'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setIsCopied(true);
      toast.success("Copied to clipboard", { 
        duration: 1500,
        icon: "✓",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    toast.success(type === "up" ? "Thanks for the feedback!" : "Feedback recorded", {
      duration: 1500,
    });
    // Here you can call an API to record feedback
  };

  const timeStr = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit" 
      })
    : "";

  const dateStr = msg.timestamp
    ? new Date(msg.timestamp).toLocaleDateString([], { 
        month: "short", 
        day: "numeric" 
      })
    : "";

  // Calculate metadata
  const tokenCount = msg.metadata?.tokens || Math.floor(msg.text.length / 4);
  const generationTime = msg.metadata?.generationTime || null;
  const modelName = msg.metadata?.model?.split("/").pop() || null;

  // Extract thinking/reasoning if present (for AI messages)
  const hasThinking = isBot && msg.metadata?.thinking;
  const thinkingContent = msg.metadata?.thinking || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        delay: index * 0.05 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isBot ? "flex-start" : "flex-end",
        width: "100%",
        padding: `${THEME.spacing.sm} 0`,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .message-bubble {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .message-bubble:hover {
          transform: translateY(-1px);
        }
        .action-button {
          transition: all 0.15s ease;
        }
        .action-button:hover {
          background: rgba(139,92,246,0.15);
          color: #8B5CF6;
          transform: scale(1.1);
        }
        .action-button:active {
          transform: scale(0.95);
        }
        .thinking-header {
          transition: all 0.2s ease;
        }
        .thinking-header:hover {
          background: rgba(139,92,246,0.08);
        }
        .feedback-button.active {
          background: rgba(139,92,246,0.2);
          border-color: rgba(139,92,246,0.4);
        }
        .copy-button.copied {
          background: rgba(16,185,129,0.2);
          border-color: rgba(16,185,129,0.4);
        }
      `}</style>

      {/* Header: Avatar + Sender Info */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        flexDirection: isBot ? "row" : "row-reverse",
        width: "100%",
      }}>
        {/* Avatar */}
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: THEME.radius.md,
          background: isBot
            ? "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)"
            : "linear-gradient(135deg, #F97316 0%, #EF4444 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: isBot 
            ? "0 4px 12px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.2)" 
            : "0 4px 12px rgba(249,115,22,0.4), 0 0 0 1px rgba(249,115,22,0.2)",
          position: "relative",
        }}>
          {isBot ? <Bot size={18} color="#FFF" /> : <User size={18} color="#FFF" />}
          {isBot && (
            <div style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: THEME.colors.success,
              border: "2px solid #060B15",
              boxShadow: "0 0 8px rgba(16,185,129,0.6)",
            }} />
          )}
        </div>

        {/* Sender Details */}
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          gap: "2px",
          alignItems: isBot ? "flex-start" : "flex-end",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: THEME.spacing.sm,
          }}>
            <span style={{
              fontSize: "13px",
              fontWeight: "700",
              color: THEME.colors.text,
              letterSpacing: "-0.2px",
            }}>
              {isBot ? "ATHX AI" : "You"}
            </span>
            {isBot && modelName && (
              <span style={{
                fontSize: "10px",
                fontWeight: "600",
                color: THEME.colors.primary,
                background: `${THEME.colors.primary}15`,
                padding: `2px 8px`,
                borderRadius: THEME.radius.full,
                border: `1px solid ${THEME.colors.primary}30`,
                fontFamily: "monospace",
              }}>
                {modelName}
              </span>
            )}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: THEME.spacing.sm,
            fontSize: "11px",
            color: THEME.colors.textSubtle,
          }}>
            <Clock size={10} />
            <span>{timeStr}</span>
            <span>•</span>
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Thinking Block (AI only, collapsible) */}
      {hasThinking && (
        <div style={{
          width: "100%",
          maxWidth: isBot ? "85%" : "70%",
          marginBottom: THEME.spacing.md,
          marginLeft: isBot ? "52px" : "0",
          marginRight: isBot ? "0" : "52px",
        }}>
          <div
            className="thinking-header"
            onClick={() => setShowThinking(!showThinking)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: THEME.spacing.md,
              padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
              background: "rgba(139,92,246,0.05)",
              border: `1px solid ${THEME.colors.primary}20`,
              borderRadius: `${THEME.radius.lg} ${THEME.radius.lg} ${showThinking ? "0" : THEME.radius.lg} ${showThinking ? "0" : THEME.radius.lg}`,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: THEME.radius.sm,
              background: `${THEME.colors.primary}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Brain size={14} color={THEME.colors.primary} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "12px",
                fontWeight: "600",
                color: THEME.colors.text,
                marginBottom: "2px",
              }}>
                Thinking Process
              </div>
              <div style={{
                fontSize: "10.5px",
                color: THEME.colors.textSubtle,
              }}>
                {showThinking ? "Click to collapse" : "Click to expand reasoning"}
              </div>
            </div>
            <motion.div
              animate={{ rotate: showThinking ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} color={THEME.colors.textMuted} />
            </motion.div>
          </div>

          <AnimatePresence>
            {showThinking && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  overflow: "hidden",
                  background: "rgba(139,92,246,0.03)",
                  border: `1px solid ${THEME.colors.primary}20`,
                  borderTop: "none",
                  borderRadius: `0 0 ${THEME.radius.lg} ${THEME.radius.lg}`,
                }}
              >
                <div style={{
                  padding: THEME.spacing.lg,
                  fontSize: "12.5px",
                  color: THEME.colors.textMuted,
                  lineHeight: "1.7",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}>
                  {thinkingContent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className="message-bubble"
        style={{
          maxWidth: isBot ? "85%" : "70%",
          background: isBot
            ? "rgba(255,255,255,0.03)"
            : "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.12) 100%)",
          border: `1px solid ${isBot ? THEME.colors.border : "rgba(139,92,246,0.25)"}`,
          borderRadius: THEME.radius.xl,
          borderTopLeftRadius: isBot ? THEME.radius.sm : THEME.radius.xl,
          borderTopRightRadius: isBot ? THEME.radius.xl : THEME.radius.sm,
          padding: isBot ? `${THEME.spacing.xl} ${THEME.spacing["2xl"]}` : `${THEME.spacing.lg} ${THEME.spacing.xl}`,
          position: "relative",
          marginLeft: isBot ? "52px" : "0",
          marginRight: isBot ? "0" : "52px",
          boxShadow: isBot 
            ? "0 4px 16px rgba(0,0,0,0.2)" 
            : "0 4px 16px rgba(124,58,237,0.2)",
        }}
      >
        {/* Message Content */}
        {isBot ? (
          <div style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "14px",
            lineHeight: "1.7",
          }}>
            <MarkdownRenderer text={msg.text} />
          </div>
        ) : (
          <p style={{
            color: THEME.colors.text,
            fontSize: "14.5px",
            margin: 0,
            lineHeight: "1.7",
            fontWeight: "400",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {msg.text}
          </p>
        )}

        {/* Attachments (if any) */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div style={{
            display: "flex",
            gap: THEME.spacing.sm,
            marginTop: THEME.spacing.lg,
            flexWrap: "wrap",
          }}>
            {msg.attachments.map((att, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: THEME.spacing.sm,
                  padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
                  background: THEME.colors.surface,
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: THEME.radius.md,
                  fontSize: "11.5px",
                  color: THEME.colors.textMuted,
                }}
              >
                {att.type?.startsWith("image/") ? (
                  <ImageIcon size={12} />
                ) : att.type?.includes("code") || att.name?.match(/\.(js|ts|py|java|cpp)$/i) ? (
                  <Code size={12} />
                ) : (
                  <FileText size={12} />
                )}
                <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {att.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Metadata Bar (AI messages only) */}
        {isBot && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: THEME.spacing.lg,
            marginTop: THEME.spacing.lg,
            paddingTop: THEME.spacing.md,
            borderTop: `1px solid ${THEME.colors.border}`,
            fontSize: "10.5px",
            color: THEME.colors.textSubtle,
            fontFamily: "monospace",
            flexWrap: "wrap",
          }}>
            {tokenCount && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Cpu size={10} />
                <span>{tokenCount.toLocaleString()} tokens</span>
              </div>
            )}
            {generationTime && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Zap size={10} />
                <span>{generationTime}ms</span>
              </div>
            )}
            {modelName && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={10} />
                <span>{modelName}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar (AI messages only, visible on hover) */}
      {isBot && (
        <AnimatePresence>
          {(isHovered || true) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: THEME.spacing.sm,
                marginTop: THEME.spacing.sm,
                marginLeft: "52px",
              }}
            >
              {/* Copy Button */}
              <button
                className={`action-button copy-button ${isCopied ? "copied" : ""}`}
                onClick={handleCopy}
                title={isCopied ? "Copied!" : "Copy response"}
                style={{
                  background: isCopied ? "rgba(16,185,129,0.1)" : THEME.colors.surface,
                  border: `1px solid ${isCopied ? THEME.colors.success + "40" : THEME.colors.border}`,
                  borderRadius: THEME.radius.md,
                  padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
                  color: isCopied ? THEME.colors.success : THEME.colors.textMuted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: "500",
                }}
              >
                {isCopied ? <Check size={12} /> : <Copy size={12} />}
                {isCopied ? "Copied" : "Copy"}
              </button>

              {/* Regenerate Button */}
              {onRegenerate && (
                <button
                  className="action-button"
                  onClick={() => onRegenerate(msg)}
                  title="Regenerate response"
                  style={{
                    background: THEME.colors.surface,
                    border: `1px solid ${THEME.colors.border}`,
                    borderRadius: THEME.radius.md,
                    padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
                    color: THEME.colors.textMuted,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: "500",
                  }}
                >
                  <RefreshCw size={12} />
                  Regenerate
                </button>
              )}

              {/* Feedback Buttons */}
              <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
                <button
                  className={`action-button feedback-button ${feedback === "up" ? "active" : ""}`}
                  onClick={() => handleFeedback("up")}
                  title="Good response"
                  style={{
                    background: feedback === "up" ? "rgba(16,185,129,0.15)" : THEME.colors.surface,
                    border: `1px solid ${feedback === "up" ? THEME.colors.success + "40" : THEME.colors.border}`,
                    borderRadius: THEME.radius.md,
                    padding: THEME.spacing.sm,
                    color: feedback === "up" ? THEME.colors.success : THEME.colors.textMuted,
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <ThumbsUp size={12} />
                </button>
                <button
                  className={`action-button feedback-button ${feedback === "down" ? "active" : ""}`}
                  onClick={() => handleFeedback("down")}
                  title="Poor response"
                  style={{
                    background: feedback === "down" ? "rgba(239,68,68,0.15)" : THEME.colors.surface,
                    border: `1px solid ${feedback === "down" ? THEME.colors.danger + "40" : THEME.colors.border}`,
                    borderRadius: THEME.radius.md,
                    padding: THEME.spacing.sm,
                    color: feedback === "down" ? THEME.colors.danger : THEME.colors.textMuted,
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <ThumbsDown size={12} />
                </button>
              </div>

              {/* More Actions */}
              <button
                className="action-button"
                title="More actions"
                style={{
                  background: THEME.colors.surface,
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: THEME.radius.md,
                  padding: THEME.spacing.sm,
                  color: THEME.colors.textMuted,
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <MoreHorizontal size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* User Message Actions (minimal) */}
      {!isBot && isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            display: "flex",
            gap: THEME.spacing.sm,
            marginTop: THEME.spacing.sm,
            marginRight: "52px",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="action-button"
            onClick={handleCopy}
            title="Copy message"
            style={{
              background: THEME.colors.surface,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.radius.md,
              padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
              color: THEME.colors.textMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "10.5px",
            }}
          >
            {isCopied ? <Check size={10} /> : <Copy size={10} />}
            {isCopied ? "Copied" : "Copy"}
          </button>
          <button
            className="action-button"
            title="Edit message"
            style={{
              background: THEME.colors.surface,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.radius.md,
              padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
              color: THEME.colors.textMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "10.5px",
            }}
          >
            <Edit2 size={10} />
            Edit
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}