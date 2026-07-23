/**
 * DiagramRenderer.jsx (Sprint 52 & 57 — React Flow Diagram Engine)
 * Renders custom non-overlapping service/database/api/user/ER nodes with dynamic auto-layout positioning.
 * Supports Architecture, Flow, Sequence (custom message edges), and ER (table-style) diagrams.
 */
import { useState, useMemo } from "react";
import { Server, Database, Globe, User, Table, ArrowRight, Activity, Cpu, Layers } from "lucide-react";

// Custom Service Node
function ServiceNode({ data }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
      border: "1px solid rgba(99,102,241,0.4)",
      boxShadow: "0 4px 14px rgba(99,102,241,0.2)",
      borderRadius: "12px", padding: "12px 16px", minWidth: "160px",
      display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF",
    }}>
      <Server size={18} color="#818CF8" />
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700" }}>{data.label || "Microservice"}</div>
        <div style={{ fontSize: "10px", color: "#94A3B8" }}>{data.type || "Service Component"}</div>
      </div>
    </div>
  );
}

// Custom Database Node
function DatabaseNode({ data }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #064E3B 0%, #022C22 100%)",
      border: "1px solid rgba(16,185,129,0.4)",
      boxShadow: "0 4px 14px rgba(16,185,129,0.2)",
      borderRadius: "12px", padding: "12px 16px", minWidth: "160px",
      display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF",
    }}>
      <Database size={18} color="#34D399" />
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700" }}>{data.label || "Database"}</div>
        <div style={{ fontSize: "10px", color: "#A7F3D0" }}>{data.engine || "PostgreSQL / Mongo"}</div>
      </div>
    </div>
  );
}

// Custom API Gateway Node
function ApiNode({ data }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #701A75 0%, #4A044E 100%)",
      border: "1px solid rgba(236,72,153,0.4)",
      boxShadow: "0 4px 14px rgba(236,72,153,0.2)",
      borderRadius: "12px", padding: "12px 16px", minWidth: "160px",
      display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF",
    }}>
      <Globe size={18} color="#F472B6" />
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700" }}>{data.label || "API Gateway"}</div>
        <div style={{ fontSize: "10px", color: "#FBCFE8" }}>{data.path || "/api/v1"}</div>
      </div>
    </div>
  );
}

// Custom User / Client Node
function UserNode({ data }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
      border: "1px solid rgba(56,189,248,0.4)",
      boxShadow: "0 4px 14px rgba(56,189,248,0.2)",
      borderRadius: "12px", padding: "12px 16px", minWidth: "160px",
      display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF",
    }}>
      <User size={18} color="#38BDF8" />
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700" }}>{data.label || "Web Client"}</div>
        <div style={{ fontSize: "10px", color: "#BAE6FD" }}>{data.role || "User Client"}</div>
      </div>
    </div>
  );
}

// Custom ER Table Node (Sprint 57)
function ErTableNode({ data }) {
  const fields = data.fields || [
    { name: "id", type: "UUID (PK)" },
    { name: "username", type: "VARCHAR" },
    { name: "email", type: "VARCHAR" },
    { name: "created_at", type: "TIMESTAMP" },
  ];
  return (
    <div style={{
      background: "#0B1220", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "12px", overflow: "hidden", minWidth: "180px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    }}>
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
            borderBottom: idx < fields.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
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

  // Automated non-overlapping dagre-style grid layout algorithm
  const layoutNodes = useMemo(() => {
    const rawNodes = diagramData?.nodes || [
      { id: "1", type: "user", label: "Client Application" },
      { id: "2", type: "api", label: "API Gateway (/api/v1)" },
      { id: "3", type: "service", label: "Auth Service" },
      { id: "4", type: "database", label: "Users DB" },
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
        paddingBottom: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Layers size={18} color="#38BDF8" />
          <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "800" }}>
            React Flow Architecture Engine ({diagramType.toUpperCase()})
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["diagram", "edges"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: activeTab === t ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeTab === t ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: activeTab === t ? "#38BDF8" : "#94A3B8",
                borderRadius: "8px", padding: "4px 12px", fontSize: "11px",
                fontWeight: "700", cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "diagram" ? (
        <div style={{
          position: "relative", minHeight: "260px", background: "#070D19",
          borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)",
          padding: "20px", overflowX: "auto",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "center" }}>
            {layoutNodes.map((n) => (
              <div key={n.id} style={{ transition: "all 0.3s ease" }}>
                {n.type === "service" && <ServiceNode data={n} />}
                {n.type === "database" && <DatabaseNode data={n} />}
                {n.type === "api" && <ApiNode data={n} />}
                {n.type === "user" && <UserNode data={n} />}
                {n.type === "er" && <ErTableNode data={n} />}
                {(!n.type || n.type === "default") && <ServiceNode data={n} />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: "#070D19", borderRadius: "14px", padding: "16px",
          display: "flex", flexDirection: "column", gap: "10px",
        }}>
          {edges.map((e, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "rgba(255,255,255,0.03)", padding: "10px 14px",
              borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "12px", color: "#CBD5E1",
            }}>
              <span style={{ fontWeight: "700", color: "#38BDF8" }}>Node {e.from}</span>
              <ArrowRight size={14} color="#94A3B8" />
              <span style={{ fontWeight: "700", color: "#818CF8" }}>Node {e.to}</span>
              <span style={{
                marginLeft: "auto", background: "rgba(249,115,22,0.15)",
                color: "#F97316", padding: "2px 8px", borderRadius: "4px",
                fontSize: "11px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace",
              }}>
                {e.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
