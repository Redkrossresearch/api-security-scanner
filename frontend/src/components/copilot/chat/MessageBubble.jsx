import React, { Suspense, lazy } from "react";
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RefreshCw, Edit2, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import MarkdownRenderer from "../MarkdownRenderer";
import toast from "react-hot-toast";
import api from "../../../services/api";

const MermaidDiagram = lazy(() => import("./MermaidDiagram"));

// Extract ```mermaid ... ``` blocks and ```image-gen ... ``` blocks from text
function parseBlocks(text) {
  if (!text) return [{ type: "text", content: "" }];

  const blocks = [];
  // Matches ```mermaid, ```image-gen, ```diagram
  const regex = /```(mermaid|image-gen|diagram)\n?([\s\S]*?)```/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) blocks.push({ type: "text", content: before });
    }
    const lang = match[1].toLowerCase();
    const code = match[2].trim();
    if (lang === "image-gen") {
      blocks.push({ type: "image-gen", content: code });
    } else {
      blocks.push({ type: "mermaid", content: code });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim()) blocks.push({ type: "text", content: remaining });
  }

  return blocks.length > 0 ? blocks : [{ type: "text", content: text }];
}

// Renders an AI-generated image via Pollinations
function GeneratedImage({ prompt }) {
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);
  const encoded = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 100000);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=500&seed=${seed}&model=flux&enhance=true&nologo=true`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-image.png";
    a.target = "_blank";
    a.click();
  };

  return (
    <div style={{
      background: "rgba(13,13,26,0.8)",
      border: "1px solid rgba(236,72,153,0.2)",
      borderRadius: "12px",
      overflow: "hidden",
      margin: "8px 0",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px",
        background: "rgba(236,72,153,0.06)",
        borderBottom: "1px solid rgba(236,72,153,0.12)",
      }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(236,72,153,0.9)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          🎨 Generated Image
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={handleDownload} title="Download image"
            style={{ background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: "6px", color: "#f9a8d4", cursor: "pointer", padding: "3px 8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }}>
            <Download size={11} /> Download
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "3px 7px", display: "flex", alignItems: "center" }}>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      <div style={{ padding: "12px", position: "relative", minHeight: "120px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Prompt label */}
        <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.3)", fontStyle: "italic", wordBreak: "break-word" }}>
          Prompt: {prompt}
        </p>

        {/* Loading skeleton */}
        {!loaded && !errored && (
          <div style={{
            width: "100%", height: "240px", borderRadius: "8px",
            background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>⏳ Generating image via Pollinations AI...</span>
          </div>
        )}

        {errored && (
          <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#fca5a5", fontSize: "12px" }}>
            ⚠️ Image generation failed. Try rephrasing the prompt.
          </div>
        )}

        <img
          src={url}
          alt={prompt}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{
            display: loaded ? "block" : "none",
            width: "100%", borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.06)",
            objectFit: "cover",
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}

export default function MessageBubble({ msg, onRegenerate, onEdit, isLatest }) {
  const isBot = msg.sender === "assistant";
  const [displayText, setDisplayText] = React.useState(isBot && isLatest && !msg.isStreaming ? "" : msg.text);

  React.useEffect(() => {
    if (msg.isStreaming) {
      setDisplayText(msg.text);
      return;
    }

    if (isBot && isLatest && msg.text && displayText !== msg.text) {
      // If we already have partial text (e.g. from streaming), do not typewriter from 0
      if (displayText && msg.text.startsWith(displayText) && displayText.length > 5) {
        setDisplayText(msg.text);
        return;
      }

      let currentIndex = 0;
      const fullText = msg.text;

      const interval = setInterval(() => {
        if (currentIndex < fullText.length) {
          currentIndex += 12; // Speed parameter
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
  }, [msg.text, isLatest, isBot, msg.isStreaming]);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    toast.success("Copied to clipboard", { duration: 1500 });
  };

  const handleFeedback = async (type) => {
    toast.success(type === "up" ? "Thanks for the feedback!" : "Feedback recorded", {
      duration: 1500,
    });
    try {
      await api.post("/copilot/feedback", {
        messageId: msg._id,
        correctness: type === "up" ? "correct" : "incorrect",
        reason: "User thumbs UI selection",
      });
    } catch (err) {
      console.warn("Failed to submit AI feedback to server:", err.message);
    }
  };

  const timeStr = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  // Parse display text into blocks (text, mermaid, image-gen)
  const blocks = isBot ? parseBlocks(displayText) : null;

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
          width: isBot ? "90%" : "auto",
          background: isBot
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(139, 92, 246, 0.1)",
          border: `1px solid ${isBot ? "rgba(255,255,255,0.06)" : "rgba(139,92,246,0.22)"}`,
          borderRadius: "14px",
          borderTopLeftRadius: isBot ? "3px" : "14px",
          borderTopRightRadius: isBot ? "14px" : "3px",
          padding: isBot ? "16px 18px" : "12px 16px",
          position: "relative",
        }}
      >
        {isBot ? (
          displayText ? (
            <div>
              {/* Render blocks: text, mermaid diagrams, generated images */}
              {parseBlocks(displayText).map((block, idx) => {
                if (block.type === "mermaid") {
                  return (
                    <Suspense key={idx} fallback={
                      <div style={{ padding: "16px", color: "rgba(139,92,246,0.6)", fontSize: "12px" }}>Loading diagram...</div>
                    }>
                      <MermaidDiagram code={block.content} />
                    </Suspense>
                  );
                }
                if (block.type === "image-gen") {
                  return <GeneratedImage key={idx} prompt={block.content} />;
                }
                return (
                  <MarkdownRenderer key={idx} text={block.content} />
                );
              })}

              {/* Inline image rendering from msg.metadata.imageUrl */}
              {msg.metadata?.imageUrl && (
                <GeneratedImage prompt={msg.metadata.imagePrompt || "Generated image"} />
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <style>{`
                @keyframes cursorBlink {
                  0%, 100% { opacity: 0; }
                  50% { opacity: 1; }
                }
                @keyframes scanLineShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "12.5px",
                fontFamily: "monospace",
                color: "rgba(255, 255, 255, 0.65)",
                fontWeight: "600",
                padding: "4px 8px"
              }}>
                <span style={{ 
                  color: "#8B5CF6", 
                  textShadow: "0 0 8px rgba(139, 92, 246, 0.4)",
                  animation: "cursorBlink 1s infinite" 
                }}>❯</span>
                <span style={{
                  background: "linear-gradient(90deg, #A78BFA, #60A5FA, #A78BFA)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "scanLineShift 3s linear infinite",
                }}>
                  Synthesizing intelligent security response...
                </span>
                <span style={{
                  width: "7px",
                  height: "14px",
                  backgroundColor: "#3B82F6",
                  boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
                  display: "inline-block",
                  animation: "cursorBlink 0.8s step-end infinite"
                }} />
              </div>
            </div>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
            {msg.metadata?.attachments && msg.metadata.attachments.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                {msg.metadata.attachments.map((att, idx) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px", fontSize: "11px", color: "rgba(255,255,255,0.8)",
                    fontWeight: "500"
                  }}>
                    <span style={{ fontSize: "8px", fontWeight: "800", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "3px", padding: "1px 3px", background: "rgba(139,92,246,0.08)" }}>
                      {att.name.split('.').pop().toUpperCase()}
                    </span>
                    <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {att.name}
                    </span>
                    <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.3)" }}>
                      ({(att.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Web Search Sources */}
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {msg.metadata.searchResults.map((source, sIdx) => {
                let iconUrl = "https://www.google.com/s2/favicons?sz=64&domain=wikipedia.org";
                try {
                  const domain = new URL(source.url).hostname;
                  iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
                } catch (e) {
                  iconUrl = "https://duckduckgo.com/favicon.ico";
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
                      style={{ width: "12px", height: "12px", borderRadius: "2px", flexShrink: 0 }}
                      onError={(e) => { e.target.src = "https://duckduckgo.com/favicon.ico"; }}
                    />
                    <span style={{ maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            <button
              onClick={handleCopy}
              title="Copy text"
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
            >
              <Copy size={12} />
            </button>

            {!isBot && onEdit && (
              <button
                onClick={() => onEdit(msg.text)}
                title="Edit prompt"
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <Edit2 size={12} />
              </button>
            )}

            {isBot && onRegenerate && (
              <button
                onClick={() => onRegenerate(msg.text)}
                title="Regenerate reply"
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <RefreshCw size={12} />
              </button>
            )}

            {isBot && (
              <>
                <button
                  onClick={() => handleFeedback("up")}
                  title="Thumbs up"
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
                >
                  <ThumbsUp size={12} />
                </button>
                <button
                  onClick={() => handleFeedback("down")}
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
