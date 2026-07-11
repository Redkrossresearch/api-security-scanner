import React, { useState } from "react";
import { Code, Terminal, Copy, Download, WrapText, ChevronDown, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const getLanguageIcon = (lang) => {
  const cleanLang = lang ? lang.toLowerCase() : "";
  switch (cleanLang) {
    case "javascript":
    case "js":
    case "jsx":
      return <Code size={13} color="#F7DF1E" />;
    case "python":
    case "py":
      return <Code size={13} color="#3776AB" />;
    case "bash":
    case "sh":
    case "shell":
      return <Terminal size={13} color="#10B981" />;
    case "html":
      return <Code size={13} color="#E34F26" />;
    case "css":
      return <Code size={13} color="#1572B6" />;
    case "json":
      return <Code size={13} color="#A78BFA" />;
    default:
      return <Code size={13} color="#8B5CF6" />;
  }
};

export default function MarkdownRenderer({ text }) {
  const [wrapModes, setWrapModes] = useState({});
  const [collapsedBlocks, setCollapsedBlocks] = useState({});

  if (!text) return null;

  const toggleWrap = (idx) => {
    setWrapModes(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleCollapse = (idx) => {
    setCollapsedBlocks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const downloadCodeFile = (lang, content) => {
    const ext = lang === "javascript" || lang === "js" ? "js" : lang === "python" || lang === "py" ? "py" : "txt";
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `security_remediation.${ext}`;
    document.body.appendChild(element);
    element.click();
    toast.success("Remediation file downloaded!");
  };

  const parseInlineMarkdown = (rawText) => {
    if (!rawText) return "";
    const regex = /(\*\*.*?\*\*|`.*?`|\[[^\]]+\]\([^)]+\))/g;
    const parts = rawText.split(regex);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} style={{ color: "#FFF", fontWeight: "700" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            style={{
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              color: "#A78BFA",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "11px",
              fontFamily: "monospace",
              margin: "0 2px",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("[") && part.includes("](")) {
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const linkText = linkMatch[1];
          const linkUrl = linkMatch[2];
          return (
            <a
              key={idx}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#A78BFA",
                textDecoration: "none",
                borderBottom: "1px dashed rgba(167, 139, 250, 0.6)",
                fontWeight: "600",
                cursor: "pointer",
                padding: "0 2px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFF";
                e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                e.currentTarget.style.borderRadius = "3px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#A78BFA";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {linkText}
            </a>
          );
        }
      }
      return part;
    });
  };

  const lines = text.split("\n");
  const parsedParts = [];
  
  let currentTextLines = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = "";
  
  let inTable = false;
  let tableRows = [];

  const flushText = () => {
    if (currentTextLines.length > 0) {
      parsedParts.push({ type: "text", content: currentTextLines.join("\n") });
      currentTextLines = [];
    }
  };

  const flushCode = () => {
    if (codeLines.length > 0) {
      parsedParts.push({ type: "code", lang: codeLang, content: codeLines.join("\n") });
      codeLines = [];
      codeLang = "";
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      parsedParts.push({ type: "table", rows: [...tableRows] });
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushText();
        flushTable();
        inTable = false;
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("|")) {
      if (!inTable) {
        flushText();
        inTable = true;
      }
      tableRows.push(line);
      continue;
    } else {
      if (inTable) {
        flushTable();
        inTable = false;
      }
    }

    currentTextLines.push(line);
  }

  flushText();
  flushCode();
  flushTable();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
      {parsedParts.map((part, pIdx) => {
        if (part.type === "text") {
          return (
            <div key={pIdx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {part.content.split("\n").map((line, lIdx) => {
                // Success banner
                if (line.startsWith("> [!SUCCESS]")) {
                  return (
                    <div
                      key={lIdx}
                      style={{
                        background: "rgba(16, 185, 129, 0.05)",
                        borderLeft: "4px solid #10B981",
                        padding: "10px 14px",
                        borderRadius: "4px",
                        margin: "8px 0",
                        fontSize: "12.5px",
                        color: "#10B981",
                        fontWeight: "600"
                      }}
                    >
                      {parseInlineMarkdown(line.replace("> [!SUCCESS]", "").trim())}
                    </div>
                  );
                }
                if (line.startsWith("> [!NOTE]")) {
                  return (
                    <div
                      key={lIdx}
                      style={{
                        background: "rgba(59, 130, 246, 0.05)",
                        borderLeft: "4px solid #3B82F6",
                        padding: "10px 14px",
                        borderRadius: "4px",
                        margin: "8px 0",
                        fontSize: "12.5px",
                        color: "#94A3B8"
                      }}
                    >
                      {parseInlineMarkdown(line.replace("> [!NOTE]", "").trim())}
                    </div>
                  );
                }
                if (line.startsWith("> [!WARNING]")) {
                  return (
                    <div
                      key={lIdx}
                      style={{
                        background: "rgba(249, 115, 22, 0.05)",
                        borderLeft: "4px solid #F97316",
                        padding: "10px 14px",
                        borderRadius: "4px",
                        margin: "8px 0",
                        fontSize: "12.5px",
                        color: "#F59E0B"
                      }}
                    >
                      {parseInlineMarkdown(line.replace("> [!WARNING]", "").trim())}
                    </div>
                  );
                }
                if (line.startsWith("> ")) {
                  return (
                    <blockquote
                      key={lIdx}
                      style={{
                        borderLeft: "4px solid #8B5CF6",
                        paddingLeft: "12px",
                        margin: "8px 0",
                        color: "#94A3B8",
                        fontStyle: "italic"
                      }}
                    >
                      {parseInlineMarkdown(line.replace("> ", ""))}
                    </blockquote>
                  );
                }

                if (line.startsWith("### ")) {
                  return (
                    <h3 key={lIdx} style={{ margin: "14px 0 6px 0", color: "#FFF", fontSize: "14.5px", fontWeight: "900", background: "linear-gradient(90deg, #FFFFFF, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {parseInlineMarkdown(line.replace("### ", ""))}
                    </h3>
                  );
                }
                if (line.startsWith("#### ")) {
                  return (
                    <h4 key={lIdx} style={{ margin: "10px 0 4px 0", color: "#8B5CF6", fontSize: "12.5px", fontWeight: "800" }}>
                      {parseInlineMarkdown(line.replace("#### ", ""))}
                    </h4>
                  );
                }
                if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
                  const isChecked = line.startsWith("- [x] ");
                  return (
                    <div key={lIdx} style={{ display: "flex", alignItems: "center", gap: "8px", color: isChecked ? "#64748B" : "#94A3B8", fontSize: "12.5px", paddingLeft: "6px" }}>
                      <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: "#8B5CF6", pointerEvents: "none" }} />
                      <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>
                        {parseInlineMarkdown(line.slice(6))}
                      </span>
                    </div>
                  );
                }
                if (line.startsWith("- ")) {
                  return (
                    <div key={lIdx} style={{ display: "flex", alignItems: "flex-start", gap: "6px", color: "#94A3B8", fontSize: "12.5px", paddingLeft: "6px" }}>
                      <span style={{ color: "#8B5CF6" }}>•</span>
                      <span>{parseInlineMarkdown(line.replace("- ", ""))}</span>
                    </div>
                  );
                }
                if (line.match(/^\d+\./)) {
                  return (
                    <div key={lIdx} style={{ color: "#94A3B8", fontSize: "12.5px", paddingLeft: "6px" }}>
                      {parseInlineMarkdown(line)}
                    </div>
                  );
                }
                return <p key={lIdx} style={{ margin: "2px 0", color: "#D1D5DB", fontSize: "13px" }}>{parseInlineMarkdown(line)}</p>;
              })}
            </div>
          );
        }

        if (part.type === "code") {
          const isMermaidOrText = part.lang === "mermaid" || part.lang === "text";
          const isWrapped = wrapModes[pIdx] || false;
          const isCollapsed = collapsedBlocks[pIdx] || false;

          return (
            <div key={pIdx} style={{ position: "relative", marginTop: "12px", marginBottom: "12px", boxShadow: "0 0 20px rgba(139, 92, 246, 0.05)", borderRadius: "8px", overflow: "hidden" }}>
              {/* Codeblock Header controls */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderBottom: "none",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                padding: "8px 14px",
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#94A3B8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => toggleCollapse(pIdx)}>
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  {getLanguageIcon(part.lang)}
                  <span style={{ fontWeight: "700", letterSpacing: "0.5px" }}>{part.lang.toUpperCase() || "CODE"}</span>
                </div>
                {!isCollapsed && (
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <button onClick={() => toggleWrap(pIdx)} style={{ background: "transparent", border: "none", color: "#A78BFA", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: "700" }}>
                      <WrapText size={11} /> {isWrapped ? "No Wrap" : "Wrap"}
                    </button>
                    <button onClick={() => downloadCodeFile(part.lang, part.content)} style={{ background: "transparent", border: "none", color: "#A78BFA", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: "700" }}>
                      <Download size={11} /> Download
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(part.content);
                        toast.success("Code copied!");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#A78BFA",
                        fontSize: "10.5px",
                        cursor: "pointer",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div style={{ display: "flex", background: isMermaidOrText ? "#020617" : "#030712", border: `1px solid ${isMermaidOrText ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.05)"}`, borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}>
                  {/* Line Numbers column */}
                  <div style={{ padding: "14px 10px", textAlign: "right", color: "#475569", borderRight: "1px solid rgba(255,255,255,0.03)", userSelect: "none", fontSize: "12px", fontFamily: "monospace", lineHeight: "1.45" }}>
                    {part.content.split("\n").map((_, lineIdx) => (
                      <div key={lineIdx}>{lineIdx + 1}</div>
                    ))}
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      flex: 1,
                      padding: "14px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      color: isMermaidOrText ? "#38BDF8" : "#E2E8F0",
                      overflowX: "auto",
                      whiteSpace: isWrapped ? "pre-wrap" : "pre",
                      wordBreak: isWrapped ? "break-all" : "normal",
                      lineHeight: "1.45",
                      boxShadow: isMermaidOrText ? "inset 0 0 10px rgba(139,92,246,0.1)" : "none"
                    }}
                  >
                    <code>{part.content}</code>
                  </pre>
                </div>
              )}
            </div>
          );
        }

        if (part.type === "table") {
          const rowsData = part.rows.map(r => r.split("|").map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1));
          const headers = rowsData[0] || [];
          const bodyRows = rowsData.slice(2) || [];

          return (
            <div key={pIdx} style={{ overflowX: "auto", marginTop: "10px", marginBottom: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(3,6,14,0.3)" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} style={{ padding: "10px 12px", color: "#FFF", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", textAlign: "left" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: rIdx === bodyRows.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                      {row.map((cell, cIdx) => {
                        const isPass = cell.includes("PASSING");
                        const isFail = cell.includes("FAILING");
                        const isWarn = cell.includes("WARNING");
                        return (
                          <td key={cIdx} style={{ padding: "10px 12px", fontSize: "12px", color: isPass ? "#10B981" : isFail ? "#EF4444" : isWarn ? "#F59E0B" : "#94A3B8", fontWeight: (isPass || isFail || isWarn) ? "800" : "500" }}>
                            {parseInlineMarkdown(cell)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
