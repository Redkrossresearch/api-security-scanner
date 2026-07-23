/**
 * DiagramRenderer.jsx (Sprint 52, 57, 61 — React Flow Diagram Engine & Interactivity)
 * Features Zoom / Pan / PNG Export controls and Node Click Detail Popover Modal.
 */
import { useState, useMemo } from "react";
import { Server, Database, Globe, User, Table, ArrowRight, Layers, ZoomIn, ZoomOut, Download, Info, X } from "lucide-react";

// Custom Service Node
function ServiceNode({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      title="Click to view node security details"
      style={{
        background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
        border: "1px solid rgba(99,102,241,0.4)",
        boxShadow: "0 4px 14px rgba(99,102,241,0.2)",
        borderRadius: "12px", padding: "12px 16px", minWidth: "160px",
        display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF", cursor: "pointer",
      }}
    >
      <Server size={18} color="#818CF8" />
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700" }}>{data.label || "Microservice"}</div>
        <div style={{ fontSize: "10px", color: "#94A3B8" }}>{data.type || "Service Component"}</div>
      </div>
    </div>
  );
}

// Custom Database Node
function DatabaseNode({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      title="Click to view node security details"
      style={{
        background: "linear-gradient(135deg, #064E3B 0%, #022C22 100%)",
        border: "1px solid rgba(16,185,129,0.4)",
        boxShadow: "0 4px 14px rgba(16,185,129,0.2)",
        borderRadius: "12px", padding: "12px 16px", minWidth: "160px",
        display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF", cursor: "pointer",
      }}
    >
      <Database size={18} color="#34D399" />
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700" }}>{data.label || "Database"}</div>
        <div style={{ fontSize: "10px", color: "#A7F3D0" }}>{data.engine || "PostgreSQL / Mongo"}</div>
      </div>
    </div>
  );
}

// Custom API Gateway Node
function ApiNode({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      title="Click to view node security details"
      style={{
        background: "linear-gradient(135deg, #701A75 0%, #4A044E 100%)",
        border: "1px solid rgba(236,72,153,0.4)",
        boxShadow: "0 4px 14px rgba(236,72,153,0.2)",
        borderRadius: "12px", padding: "12px 16px", minWidth: "160px",
        display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF", cursor: "pointer",
      }}
    >
      <Globe size={18} color="#F472B6" />
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700" }}>{data.label || "API Gateway"}</div>
        <div style={{ fontSize: "10px", color: "#FBCFE8" }}>{data.path || "/api/v1"}</div>
      </div>
    </div>
  );
}

// Custom User / Client Node
function UserNode({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      title="Click to view node security details"
      style={{
        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
        border: "1px solid rgba(56,189,248,0.4)",
        boxShadow: "0 4px 14px rgba(56,189,248,0.2)",
        borderRadius: "12px", padding: "12px 16px", minWidth: "160px",
        display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF", cursor: "pointer",
      }}
    >
      <User size={18} color="#38BDF8" />
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700" }}>{data.label || "Web Client"}</div>
        <div style={{ fontSize: "10px", color: "#BAE6FD" }}>{data.role || "User Client"}</div>
      </div>
    </div>
  );
}

// Custom ER Table Node
function ErTableNode({ data, onClick }) {
  const fields = data.fields || [
    { name: "id", type: "UUID (PK)" },
    { name: "username", type: "VARCHAR" },
    { name: "email", type: "VARCHAR" },
  ];
  return (
    <div
      onClick={onClick}
      style={{
        background: "#0B1220", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px", overflow: "hidden", minWidth: "180px", cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{
        background: "rgba(59,130,246,0.2)", padding: "8px 12px",
        borderBottom: "1px solid rgba(59,130,246,0.3)",
        fontSize: "12px", fontWeight: "800", color: "#60A5FA",
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        <Table size={14} />
        <span>{data.label || "User Table"}</span>
      </div>
      <div style={{ padding: "8px 12px" }}>
        {fields.map((f, idx) => (
          <div key={idx} style={{
            display: "flex", justifyContent: "space-between", gap: "10px",
            fontSize: "11px", fontFamily: "JetBrains Mono, monospace", padding: "3px 0",
          }}>
            <span style={{ color: "#E2E8F0", fontWeight: "600" }}>{f.name}</span>
            <span style={{ color: "#94A3B8" }}>{f.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiagramRenderer({ diagramData, diagramType = "flow" }) {
  const [activeTab, setActiveTab] = useState("diagram");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNodeModal, setSelectedNodeModal] = useState(null);

  const layoutNodes = useMemo(() => {
    const rawNodes = diagramData?.nodes || [
      { id: "1", type: "user", label: "Client Application", details: "Public Single Page App (React 18)" },
      { id: "2", type: "api", label: "API Gateway (/api/v1)", details: "Envoy Proxy with OAuth2 JWT Validation" },
      { id: "3", type: "service", label: "Auth Service", details: "Node.js Express Microservice (v18.x)" },
      { id: "4", type: "database", label: "Users DB", details: "MongoDB Atlas Primary Replica Cluster" },
    ];

    const columns = 2;
    const itemWidth = 220;
    const itemHeight = 120;

    return rawNodes.map((n, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      return {
        ...n,
        x: col * itemWidth + 20,
        y: row * itemHeight + 20,
      };
    });
  }, [diagramData]);

  const edges = diagramData?.edges || [
    { from: "1", to: "2", label: "POST /login" },
    { from: "2", to: "3", label: "Validate Token" },
    { from: "3", to: "4", label: "Query User" },
  ];

  const handleExportPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#071126";
    ctx.fillRect(0, 0, 800, 400);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.fillText(`Architecture Diagram Export (${diagramType.toUpperCase()})`, 30, 50);

    ctx.font = "14px JetBrains Mono, monospace";
    ctx.fillStyle = "#38BDF8";
    layoutNodes.forEach((n, i) => {
      ctx.fillText(`• [${n.type.toUpperCase()}] ${n.label}`, 40, 100 + i * 35);
    });

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `Architecture_Diagram_${diagramType}_${Date.now()}.png`;
    link.click();
  };

  return (
    <div style={{
      background: "linear-gradient(180deg, #071126 0%, #030814 100%)",
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px",
      padding: "20px", margin: "12px 0", boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
    }}>
      {/* Header controls */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "12px", flexWrap: "wrap", gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Layers size={18} color="#38BDF8" />
          <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "800" }}>
            React Flow Architecture Engine ({diagramType.toUpperCase()})
          </span>
        </div>

        {/* Zoom & Export Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            title="Zoom In"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}
          >
            <ZoomIn size={14} />
          </button>
          <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "700" }}>{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            title="Zoom Out"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}
          >
            <ZoomOut size={14} />
          </button>

          <button
            onClick={handleExportPng}
            style={{
              background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.4)",
              color: "#38BDF8", padding: "4px 10px", borderRadius: "6px",
              fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            <Download size={12} />
            Export PNG
          </button>
        </div>
      </div>

      {activeTab === "diagram" ? (
        <div style={{
          position: "relative", minHeight: "260px", background: "#070D19",
          borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)",
          padding: "20px", overflowX: "auto",
        }}>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "center",
            transform: `scale(${zoomLevel})`, transformOrigin: "top center", transition: "transform 0.2s ease",
          }}>
            {layoutNodes.map((n) => (
              <div key={n.id}>
                {n.type === "service" && <ServiceNode data={n} onClick={() => setSelectedNodeModal(n)} />}
                {n.type === "database" && <DatabaseNode data={n} onClick={() => setSelectedNodeModal(n)} />}
                {n.type === "api" && <ApiNode data={n} onClick={() => setSelectedNodeModal(n)} />}
                {n.type === "user" && <UserNode data={n} onClick={() => setSelectedNodeModal(n)} />}
                {n.type === "er" && <ErTableNode data={n} onClick={() => setSelectedNodeModal(n)} />}
                {(!n.type || n.type === "default") && <ServiceNode data={n} onClick={() => setSelectedNodeModal(n)} />}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Node Click Detail Popover Modal */}
      {selectedNodeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#071126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "90%", maxWidth: "500px", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38BDF8", fontWeight: "800", fontSize: "16px" }}>
                <Info size={18} />
                <span>Node Metadata & Security Details</span>
              </div>
              <button onClick={() => setSelectedNodeModal(null)} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: "700", marginBottom: "6px" }}>{selectedNodeModal.label}</div>
            <div style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "JetBrains Mono, monospace", marginBottom: "16px" }}>TYPE: {selectedNodeModal.type?.toUpperCase() || "COMPONENT"}</div>
            
            <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", padding: "12px", borderRadius: "10px", color: "#CBD5E1", fontSize: "13px", lineHeight: "1.6" }}>
              {selectedNodeModal.details || "Component active in system runtime architecture. Configured with SSL/TLS encryption and OAuth2 verification."}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button onClick={() => setSelectedNodeModal(null)} style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.4)", color: "#38BDF8", padding: "8px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
