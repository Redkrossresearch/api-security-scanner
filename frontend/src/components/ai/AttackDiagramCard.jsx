import { useState } from "react";
import { motion } from "framer-motion";
import { GitCommit, ShieldAlert, Server, Database, ArrowRight, Activity, Info } from "lucide-react";

export default function AttackDiagramCard({ vulnerability }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const endpoint = vulnerability?.endpoint || vulnerability?.url || "/api/v1/resource";
  const vulnTitle = vulnerability?.title || "Security Vulnerability";
  const severity = (vulnerability?.severity || "HIGH").toUpperCase();

  const nodes = [
    {
      id: "attacker",
      title: "Adversary Recon",
      subtitle: "Payload Transmission",
      status: "Threat Source",
      color: "#EF4444",
      icon: ShieldAlert,
      details: `Attacker crafts targeted requests containing specialized headers or payloads targeting ${endpoint}.`,
    },
    {
      id: "gateway",
      title: "API Gateway / WAF",
      subtitle: "Filter Inspection",
      status: severity === "CRITICAL" || severity === "HIGH" ? "Filter Bypass" : "Header Misconfig",
      color: "#F59E0B",
      icon: GitCommit,
      details: "Edge Gateway fails to enforce strict validation filters or missing security response headers.",
    },
    {
      id: "target",
      title: "Target Endpoint",
      subtitle: endpoint,
      status: "Vulnerable State",
      color: "#EC4899",
      icon: Server,
      details: `Endpoint executes request without required token checks or input sanitization. Vulnerability: ${vulnTitle}.`,
    },
    {
      id: "asset",
      title: "Internal Assets",
      subtitle: "Database & User Data",
      status: "Potential Exposure",
      color: "#A855F7",
      icon: Database,
      details: "Database or internal service layer exposed to unauthorized read/write parameter tampering.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 20, 36, 0.95) 100%)",
        border: "1px solid rgba(236, 72, 153, 0.35)",
        borderRadius: "20px",
        padding: "26px 30px",
        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 30px rgba(236, 72, 153, 0.12)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "14px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(236, 72, 153, 0.15)",
              border: "1px solid rgba(236, 72, 153, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#EC4899",
              boxShadow: "0 0 15px rgba(236, 72, 153, 0.3)",
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#FFFFFF" }}>
              Interactive Threat Execution Diagram
            </h3>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>
              Visual adversary propagation flow & system component status
            </span>
          </div>
        </div>

        <span
          style={{
            background: "rgba(236, 72, 153, 0.1)",
            border: "1px solid rgba(236, 72, 153, 0.3)",
            color: "#F472B6",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.8px",
          }}
        >
          LIVE ATTACK GRAPH
        </span>
      </div>

      {/* Visual Diagram Pipeline */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          position: "relative",
          marginBottom: "20px",
        }}
      >
        {nodes.map((node, index) => {
          const IconComp = node.icon;
          const isSelected = selectedNode?.id === node.id;

          return (
            <div key={node.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedNode(node)}
                style={{
                  flex: 1,
                  background: isSelected ? `rgba(15, 23, 42, 1)` : "rgba(255, 255, 255, 0.03)",
                  border: `1.5px solid ${isSelected ? node.color : "rgba(255, 255, 255, 0.08)"}`,
                  borderRadius: "16px",
                  padding: "18px",
                  cursor: "pointer",
                  boxShadow: isSelected ? `0 0 25px ${node.color}33` : "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: `${node.color}20`,
                      border: `1px solid ${node.color}50`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: node.color,
                    }}
                  >
                    <IconComp size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      color: node.color,
                      background: `${node.color}15`,
                      padding: "2px 8px",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                    }}
                  >
                    {node.status}
                  </span>
                </div>

                <div style={{ fontSize: "15px", fontWeight: "700", color: "#FFFFFF", marginBottom: "2px" }}>
                  {node.title}
                </div>
                <div style={{ fontSize: "12px", color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {node.subtitle}
                </div>
              </motion.div>

              {index < nodes.length - 1 && (
                <div style={{ color: "rgba(255,255,255,0.2)", display: "none" }}>
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Box */}
      {selectedNode ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{
            background: "#030712",
            border: `1px solid ${selectedNode.color}40`,
            borderLeft: `4px solid ${selectedNode.color}`,
            borderRadius: "14px",
            padding: "16px 20px",
            marginTop: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: selectedNode.color, fontWeight: "700", marginBottom: "6px", fontSize: "14px" }}>
            <Info size={16} /> {selectedNode.title} Details:
          </div>
          <div style={{ fontSize: "13px", color: "#CBD5E1", lineHeight: "1.6" }}>
            {selectedNode.details}
          </div>
        </motion.div>
      ) : (
        <div style={{ fontSize: "12px", color: "#64748B", textAlign: "center", fontStyle: "italic" }}>
          💡 Click on any pipeline stage above to inspect threat mechanics & component state
        </div>
      )}
    </motion.div>
  );
}
