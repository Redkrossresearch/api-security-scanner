import React, { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

let mermaidLoaded = false;
let mermaidInstance = null;

async function getMermaid() {
  if (mermaidInstance) return mermaidInstance;
  const mod = await import("mermaid");
  mermaidInstance = mod.default;
  if (!mermaidLoaded) {
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#0d0d1a",
        primaryColor: "#8B5CF6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#8B5CF6",
        lineColor: "#6366F1",
        secondaryColor: "#1e1b4b",
        tertiaryColor: "#1a1a2e",
        edgeLabelBackground: "#0d0d1a",
        clusterBkg: "#1e1b4b",
        titleColor: "#c4b5fd",
        nodeBorder: "#8B5CF6",
        mainBkg: "#1e1b4b",
        nodeTextColor: "#ffffff",
        textColor: "#e2e8f0",
        fontSize: "14px",
      },
      flowchart: { curve: "basis", htmlLabels: true, padding: 20 },
      sequence: { actorFontFamily: "Inter, sans-serif", messageFontFamily: "Inter, sans-serif" },
      er: { useMaxWidth: true },
      gantt: { useWidth: 900 },
    });
    mermaidLoaded = true;
  }
  return mermaidInstance;
}

let diagramCounter = 0;

export default function MermaidDiagram({ code }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const idRef = useRef(`mermaid-${++diagramCounter}-${Date.now()}`);

  const render = async () => {
    if (!code?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const mermaid = await getMermaid();
      const { svg: renderedSvg } = await mermaid.render(idRef.current, code.trim());
      setSvg(renderedSvg);
    } catch (err) {
      console.error("Mermaid render error:", err);
      setError(err.message || "Failed to render diagram");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    render();
  }, [code]);

  const handleDownload = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: "rgba(13,13,26,0.8)",
      border: "1px solid rgba(139,92,246,0.2)",
      borderRadius: "12px",
      overflow: "hidden",
      margin: "8px 0",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px",
        background: "rgba(139,92,246,0.06)",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
      }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(139,92,246,0.9)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          📊 Diagram
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} title="Zoom out"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "3px 7px", display: "flex", alignItems: "center" }}>
            <ZoomOut size={11} />
          </button>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} title="Zoom in"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "3px 7px", display: "flex", alignItems: "center" }}>
            <ZoomIn size={11} />
          </button>
          <button onClick={render} title="Refresh diagram"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "3px 7px", display: "flex", alignItems: "center" }}>
            <RefreshCw size={11} />
          </button>
          <button onClick={handleDownload} title="Download SVG"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "6px", color: "#c4b5fd", cursor: "pointer", padding: "3px 7px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Download size={11} /> <span style={{ fontSize: "10px" }}>SVG</span>
          </button>
        </div>
      </div>

      {/* Diagram Content */}
      <div style={{ padding: "16px", overflowX: "auto", overflowY: "auto", maxHeight: "500px" }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(255,255,255,0.4)", fontSize: "13px", padding: "20px" }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.4)", borderTopColor: "#8B5CF6", animation: "spin 0.8s linear infinite" }} />
            Rendering diagram...
          </div>
        )}
        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#fca5a5", fontSize: "12px" }}>
            ⚠️ Diagram syntax error: {error}
            <pre style={{ marginTop: "8px", color: "rgba(255,255,255,0.5)", fontSize: "11px", overflow: "auto" }}>{code}</pre>
          </div>
        )}
        {!loading && !error && svg && (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s ease" }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
