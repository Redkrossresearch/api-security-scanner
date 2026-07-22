/**
 * BlockRenderer.jsx (Sprint 19 & 24)
 * Enterprise-grade renderer for all structured block types returned by AI responses.
 * Block types: markdown, code, table, alert, card, json, tabs, accordion, chart
 */
import { useState, useRef } from "react";
import { Copy, Check, ChevronDown, ChevronRight, AlertTriangle, Info, CheckCircle, XCircle, Code2, Table2, FileJson } from "lucide-react";

// ─── Copy Button ─────────────────────────────────────────────────────────────
function CopyButton({ text, small = false }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} title="Copy" style={{
      background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
      border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
      color: copied ? "#22C55E" : "#94A3B8", borderRadius: "6px",
      padding: small ? "2px 6px" : "4px 10px", cursor: "pointer",
      fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px",
      transition: "all 0.2s ease",
    }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Download Button (Sprint 43) ──────────────────────────────────────────────
function DownloadButton({ content, filename = "snippet.txt", small = false }) {
  const download = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={download} title="Download File" style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#38BDF8", borderRadius: "6px",
      padding: small ? "2px 6px" : "4px 10px", cursor: "pointer",
      fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px",
      transition: "all 0.2s ease",
    }}>
      Download
    </button>
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────
function CodeBlock({ content, language = "text", meta = {} }) {
  const langColors = {
    javascript: "#F7DF1E", typescript: "#3178C6", python: "#3572A5",
    bash: "#89E051", sql: "#336791", json: "#F59E0B", yaml: "#CC1018",
    html: "#E34C26", css: "#563D7C", default: "#8B5CF6",
  };
  const langColor = langColors[language?.toLowerCase()] || langColors.default;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D1117 0%, #161B22 100%)",
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
      overflow: "hidden", margin: "4px 0",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", gap: "5px" }}>
            {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
              <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{
            fontSize: "11px", fontWeight: "700", color: langColor,
            background: `${langColor}20`, padding: "2px 8px", borderRadius: "4px",
            textTransform: "uppercase", letterSpacing: "0.5px",
          }}>{language || "code"}</span>
        </div>
        <CopyButton text={content} small />
      </div>
      {/* Code content */}
      <pre style={{
        margin: 0, padding: "16px", overflowX: "auto", fontSize: "13px",
        lineHeight: "1.65", color: "#E2E8F0",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      }}>
        <code>{content}</code>
      </pre>
    </div>
  );
}

// ─── Table Block ─────────────────────────────────────────────────────────────
function TableBlock({ content, meta = {} }) {
  const [hovered, setHovered] = useState(null);
  const lines = (content || "").split("\n").filter(Boolean);
  if (lines.length < 2) return <div style={{ color: "#64748B" }}>Empty table</div>;

  const parseRow = (line) => line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow); // skip separator row

  const tableText = content;

  return (
    <div style={{ overflowX: "auto", margin: "4px 0" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "6px" }}>
        <CopyButton text={tableText} />
      </div>
      <table style={{
        width: "100%", borderCollapse: "collapse",
        fontFamily: "'Inter', sans-serif", fontSize: "13px",
      }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "10px 14px", textAlign: "left", fontWeight: "700",
                color: "#C4B5FD", fontSize: "12px", letterSpacing: "0.5px",
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.15)",
                textTransform: "uppercase",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}
              onMouseEnter={() => setHovered(ri)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === ri ? "rgba(139,92,246,0.06)" : (ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"),
                transition: "background 0.15s ease",
              }}
            >
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "9px 14px", color: "#E2E8F0",
                  border: "1px solid rgba(255,255,255,0.05)", verticalAlign: "top",
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Alert Block ─────────────────────────────────────────────────────────────
function AlertBlock({ content, meta = {} }) {
  const type = meta.alertType || "info";
  const configs = {
    info: { icon: <Info size={16} />, color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", label: "Info" },
    success: { icon: <CheckCircle size={16} />, color: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", label: "Success" },
    warning: { icon: <AlertTriangle size={16} />, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "Warning" },
    critical: { icon: <XCircle size={16} />, color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", label: "Critical" },
  };
  const cfg = configs[type] || configs.info;
  return (
    <div style={{
      display: "flex", gap: "12px", padding: "12px 16px", margin: "4px 0",
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.color}`, borderRadius: "8px",
      boxShadow: `0 0 12px ${cfg.border}`,
    }}>
      <span style={{ color: cfg.color, flexShrink: 0, marginTop: "1px" }}>{cfg.icon}</span>
      <div>
        <div style={{ fontSize: "11px", fontWeight: "800", color: cfg.color, letterSpacing: "0.6px", marginBottom: "4px", textTransform: "uppercase" }}>{cfg.label}</div>
        <div style={{ fontSize: "13px", color: "#E2E8F0", lineHeight: 1.6 }}>{content}</div>
      </div>
    </div>
  );
}

// ─── JSON Viewer Block ────────────────────────────────────────────────────────
function JsonBlock({ content, meta = {} }) {
  const [collapsed, setCollapsed] = useState(false);
  let parsed = null, displayText = content;
  try { parsed = JSON.parse(content); displayText = JSON.stringify(parsed, null, 2); } catch {}
  return (
    <div style={{
      background: "rgba(0,0,0,0.4)", border: "1px solid rgba(245,158,11,0.2)",
      borderRadius: "10px", overflow: "hidden", margin: "4px 0",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "7px 12px", background: "rgba(245,158,11,0.06)",
        borderBottom: "1px solid rgba(245,158,11,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F59E0B", fontSize: "11px", fontWeight: "700" }}>
          <FileJson size={13} /> JSON Data
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#94A3B8", borderRadius: "5px", padding: "2px 8px",
            cursor: "pointer", fontSize: "11px", fontWeight: "700",
          }}>{collapsed ? "Expand" : "Collapse"}</button>
          <CopyButton text={displayText} small />
        </div>
      </div>
      {!collapsed && (
        <pre style={{
          margin: 0, padding: "12px 16px", overflowX: "auto", fontSize: "12px",
          lineHeight: "1.7", color: "#E2E8F0",
          fontFamily: "'JetBrains Mono', monospace", maxHeight: "400px", overflowY: "auto",
        }}><code>{displayText}</code></pre>
      )}
    </div>
  );
}

// ─── Accordion Block ─────────────────────────────────────────────────────────
function AccordionBlock({ content, meta = {} }) {
  const [open, setOpen] = useState(false);
  const title = meta.title || "Details";
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden", margin: "4px 0" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", background: open ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
        border: "none", cursor: "pointer", color: "#E2E8F0", fontSize: "14px", fontWeight: "700",
        transition: "background 0.2s ease",
      }}>
        <span>{title}</span>
        {open ? <ChevronDown size={15} color="#8B5CF6" /> : <ChevronRight size={15} color="#64748B" />}
      </button>
      {open && (
        <div style={{ padding: "14px 16px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)", color: "#CBD5E1", fontSize: "13px", lineHeight: 1.65 }}>
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Tabs Block ───────────────────────────────────────────────────────────────
function TabsBlock({ content, meta = {} }) {
  const tabs = meta.tabs || [{ label: "Output", content }];
  const [active, setActive] = useState(0);
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden", margin: "4px 0" }}>
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: "9px 18px", border: "none", cursor: "pointer",
            background: active === i ? "rgba(139,92,246,0.15)" : "transparent",
            color: active === i ? "#C4B5FD" : "#64748B",
            fontWeight: active === i ? "700" : "600",
            fontSize: "12px", borderBottom: active === i ? "2px solid #8B5CF6" : "2px solid transparent",
            transition: "all 0.2s ease",
          }}>{tab.label}</button>
        ))}
      </div>
      <div style={{ padding: "14px 16px", color: "#CBD5E1", fontSize: "13px", lineHeight: 1.65 }}>
        {tabs[active]?.content || ""}
      </div>
    </div>
  );
}

// ─── Card Block ───────────────────────────────────────────────────────────────
function CardBlock({ content, meta = {} }) {
  const { title, subtitle, badge, badgeColor = "#8B5CF6" } = meta;
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(0,0,0,0.3) 100%)",
      border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px",
      padding: "16px 18px", margin: "4px 0",
      boxShadow: "0 4px 16px rgba(139,92,246,0.08)",
    }}>
      {(title || badge) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            {title && <div style={{ fontSize: "15px", fontWeight: "800", color: "#E2E8F0" }}>{title}</div>}
            {subtitle && <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>{subtitle}</div>}
          </div>
          {badge && (
            <span style={{
              background: `${badgeColor}20`, border: `1px solid ${badgeColor}40`,
              color: badgeColor, fontSize: "10px", fontWeight: "700",
              padding: "2px 10px", borderRadius: "20px", letterSpacing: "0.5px",
            }}>{badge}</span>
          )}
        </div>
      )}
      <div style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: 1.65 }}>{content}</div>
    </div>
  );
}

// ─── Command Block (Sprint 29) ─────────────────────────────────────────────
function CommandBlock({ content, language = "bash", meta = {} }) {
  const shellType = language.toLowerCase();
  const isPowerShell = shellType.includes("ps") || shellType.includes("powershell");
  const isCmd = shellType.includes("cmd") || shellType.includes("bat");
  
  const badgeColor = isPowerShell ? "#3B82F6" : isCmd ? "#EC4899" : "#10B981";
  const promptChar = isPowerShell ? "PS >" : isCmd ? "C:\\>" : "$";

  return (
    <div style={{
      background: "linear-gradient(135deg, #0B0F19 0%, #111827 100%)",
      border: `1px solid ${badgeColor}40`, borderRadius: "12px",
      overflow: "hidden", margin: "6px 0", boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Code2 size={13} color={badgeColor} />
          <span style={{
            fontSize: "11px", fontWeight: "800", color: badgeColor,
            background: `${badgeColor}20`, padding: "2px 8px", borderRadius: "4px",
            textTransform: "uppercase", letterSpacing: "0.5px"
          }}>
            {language || "terminal"}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B" }}>— Command Shell</span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <CopyButton text={content} small />
        </div>
      </div>
      <pre style={{
        margin: 0, padding: "14px 16px", overflowX: "auto", fontSize: "13px",
        lineHeight: "1.65", color: "#F3F4F6",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        display: "flex", gap: "10px"
      }}>
        <span style={{ color: badgeColor, fontWeight: "700", userSelect: "none" }}>{promptChar}</span>
        <code style={{ flex: 1 }}>{content}</code>
      </pre>
    </div>
  );
}

// ─── HTML/CSS/JS Live Preview (Sprint 33) ────────────────────────────────────
function HtmlPreviewBlock({ content, meta = {} }) {
  const [activeTab, setActiveTab] = useState("preview"); // 'preview' | 'code'

  return (
    <div style={{
      border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px",
      overflow: "hidden", margin: "6px 0", background: "#0F172A"
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 14px", background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setActiveTab("preview")} style={{
            padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            background: activeTab === "preview" ? "#8B5CF6" : "rgba(255,255,255,0.06)",
            color: activeTab === "preview" ? "#FFF" : "#94A3B8",
            fontSize: "11px", fontWeight: "700", transition: "all 0.2s ease"
          }}>
            ▶ Live Preview
          </button>
          <button onClick={() => setActiveTab("code")} style={{
            padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            background: activeTab === "code" ? "#8B5CF6" : "rgba(255,255,255,0.06)",
            color: activeTab === "code" ? "#FFF" : "#94A3B8",
            fontSize: "11px", fontWeight: "700", transition: "all 0.2s ease"
          }}>
            &lt;/&gt; Code
          </button>
        </div>
        <CopyButton text={content} small />
      </div>

      {activeTab === "preview" ? (
        <div style={{ padding: "12px", background: "#FFF", minHeight: "180px", borderRadius: "0 0 12px 12px" }}>
          <iframe
            srcDoc={content}
            title="HTML Live Preview"
            sandbox="allow-scripts"
            style={{ width: "100%", height: "200px", border: "none" }}
          />
        </div>
      ) : (
        <CodeBlock content={content} language="html" meta={meta} />
      )}
    </div>
  );
}

// ─── Main BlockRenderer ───────────────────────────────────────────────────────
// ─── SQL Preview & Syntax Validation Block (Sprint 38) ────────────────────────
function SqlBlock({ content, meta = {} }) {
  const isBasicValid = !/(\bSELECT\b.*\bSELECT\b|;\s*[^;\s]+)/i.test(content) || /SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER/i.test(content);
  return (
    <div style={{
      background: "linear-gradient(135deg, #0B132B 0%, #1C2541 100%)",
      border: `1px solid ${isBasicValid ? "rgba(56,189,248,0.3)" : "rgba(239,68,68,0.4)"}`,
      borderRadius: "12px", overflow: "hidden", margin: "6px 0"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#38BDF8", textTransform: "uppercase" }}>SQL QUERY</span>
          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: isBasicValid ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: isBasicValid ? "#4ADE80" : "#F87171" }}>
            {isBasicValid ? "Syntax OK" : "Syntax Flagged"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <CopyButton text={content} small />
          <DownloadButton content={content} filename="query.sql" small />
        </div>
      </div>
      <pre style={{ margin: 0, padding: "12px 16px", color: "#F1F5F9", fontSize: "13px", fontFamily: "'Fira Code', monospace", overflowX: "auto" }}>
        <code>{content}</code>
      </pre>
    </div>
  );
}

export default function BlockRenderer({ block }) {
  if (!block) return null;
  const { type = "markdown", content = "", meta = {} } = block;

  switch (type) {
    case "sql":
      return <SqlBlock content={content} meta={meta} />;
    case "command":
    case "cmd":
    case "bash":
    case "powershell":
    case "terminal":
      return <CommandBlock content={content} language={meta.language || type} meta={meta} />;
    case "html_preview":
    case "preview":
      return <HtmlPreviewBlock content={content} meta={meta} />;
    case "code":
      return <CodeBlock content={content} language={meta.language || "text"} meta={meta} />;
    case "table":
      return <TableBlock content={content} meta={meta} />;
    case "alert":
      return <AlertBlock content={content} meta={meta} />;
    case "json":
    case "yaml":
      return <JsonBlock content={content} meta={meta} />;
    case "accordion":
      return <AccordionBlock content={content} meta={meta} />;
    case "tabs":
      return <TabsBlock content={content} meta={meta} />;
    case "card":
      return <CardBlock content={content} meta={meta} />;
    case "markdown":
    default:
      return (
        <div style={{
          color: "#CBD5E1", fontSize: "14px", lineHeight: "1.7",
          fontFamily: "'Inter', sans-serif",
        }}>
          {content}
        </div>
      );
  }
}


