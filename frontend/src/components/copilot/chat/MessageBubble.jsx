import React from "react";
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RefreshCw, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import MarkdownRenderer from "../MarkdownRenderer";
import toast from "react-hot-toast";

export default function MessageBubble({ msg, onRegenerate, onEdit, isLatest }) {
  const isBot = msg.sender === "assistant";
  const [displayText, setDisplayText] = React.useState(isBot && isLatest ? "" : msg.text);

  React.useEffect(() => {
    if (isBot && isLatest && msg.text && displayText !== msg.text) {
      let currentIndex = 0;
      const fullText = msg.text;
      
      const interval = setInterval(() => {
        if (currentIndex < fullText.length) {
          currentIndex += 12; // Speed parameter: characters per interval tick
          setDisplayText(fullText.slice(0, currentIndex));
        } else {
          setDisplayText(fullText);
          clearInterval(interval);
        }
      }, 15);
      
      return () => clearInterval(interval);
    } else {
      setDisplayText(msg.text);
    }
  }, [msg.text, isLatest, isBot]);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    toast.success("Copied to clipboard", { duration: 1500 });
  };

  const timeStr = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isBot ? "flex-start" : "flex-end",
        width: "100%",
        padding: "4px 0",
        boxSizing: "border-box"
      }}
    >
      {/* Sender Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "6px",
        flexDirection: isBot ? "row" : "row-reverse",
      }}>
        {/* Avatar */}
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: isBot
            ? "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)"
            : "linear-gradient(135deg, #F97316 0%, #EF4444 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: isBot ? "0 0 10px rgba(124,58,237,0.3)" : "0 0 10px rgba(249,115,22,0.3)",
        }}>
          {isBot
            ? <Bot size={13} color="#FFF" />
            : <User size={13} color="#FFF" />
          }
        </div>
        <span style={{
          fontSize: "11.5px",
          fontWeight: "700",
          color: "rgba(255,255,255,0.4)",
        }}>
          {isBot ? "ATHX AI" : "You"}
        </span>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontWeight: "500" }}>
          {timeStr}
        </span>
      </div>

      {/* Bubble Container */}
      <div
        style={{
          maxWidth: isBot ? "90%" : "75%",
          background: isBot
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(139, 92, 246, 0.1)",
          border: `1px solid ${isBot ? "rgba(255,255,255,0.06)" : "rgba(139,92,246,0.22)"}`,
          borderRadius: "14px",
          borderTopLeftRadius: isBot ? "3px" : "14px",
          borderTopRightRadius: isBot ? "14px" : "3px",
          padding: isBot ? "16px 18px" : "12px 16px",
          position: "relative",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
        }}
      >
        {isBot ? (
          <MarkdownRenderer text={displayText} />
        ) : (
          <p style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "13.5px",
            margin: 0,
            lineHeight: "1.6",
            fontWeight: "400",
            whiteSpace: "pre-wrap",
          }}>
            {displayText}
          </p>
        )}

        {/* Web Search Sources and References */}
        {isBot && msg.metadata?.searchResults && msg.metadata.searchResults.length > 0 && (
          <div style={{
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px dashed rgba(255,255,255,0.06)",
          }}>
            <p style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.3)",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              🔍 Search Sources ({msg.metadata.searchResults.length})
            </p>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}>
              {msg.metadata.searchResults.map((source, sIdx) => {
                let iconUrl = "https://www.google.com/s2/favicons?sz=64&domain=wikipedia.org";
                if (source.url.includes("wikipedia.org")) {
                  iconUrl = "https://en.wikipedia.org/favicon.ico";
                } else if (source.url.includes("duckduckgo.com")) {
                  iconUrl = "https://duckduckgo.com/favicon.ico";
                } else {
                  try {
                    const domain = new URL(source.url).hostname;
                    iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
                  } catch (e) {
                    iconUrl = "https://duckduckgo.com/favicon.ico";
                  }
                }

                return (
                  <a
                    key={sIdx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={source.snippet}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "5px 10px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "11.5px",
                      fontWeight: "500",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)";
                      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.25)";
                      e.currentTarget.style.color = "#FFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }}
                  >
                    <img
                      src={iconUrl}
                      alt=""
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "2px",
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.src = "https://duckduckgo.com/favicon.ico";
                      }}
                    />
                    <span style={{
                      maxWidth: "130px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {source.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "12px",
          paddingTop: "10px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          {isBot && msg.metadata?.model && (
            <span style={{
              fontSize: "9.5px",
              color: "rgba(255,255,255,0.22)",
              fontWeight: "600",
              fontFamily: "monospace",
            }}>
              Model: {msg.metadata.model}
            </span>
          )}

          <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              title="Copy text"
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
            >
              <Copy size={12} />
            </button>

            {/* User Edit option */}
            {!isBot && onEdit && (
              <button
                onClick={() => onEdit(msg.text)}
                title="Edit prompt"
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <Edit2 size={12} />
              </button>
            )}

            {/* Regenerate option for Bot */}
            {isBot && onRegenerate && (
              <button
                onClick={() => onRegenerate(msg.text)}
                title="Regenerate reply"
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <RefreshCw size={12} />
              </button>
            )}

            {/* Feedback likes */}
            {isBot && (
              <>
                <button
                  onClick={() => toast.success("Feedback saved")}
                  title="Thumbs up"
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
                >
                  <ThumbsUp size={12} />
                </button>
                <button
                  onClick={() => toast.success("Feedback saved")}
                  title="Thumbs down"
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
                >
                  <ThumbsDown size={12} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
