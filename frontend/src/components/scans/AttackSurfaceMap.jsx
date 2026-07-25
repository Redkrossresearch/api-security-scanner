import React, { useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Handle,
  Position,
  getBezierPath,
} from "reactflow";
import { motion, AnimatePresence } from "framer-motion";
import "reactflow/dist/style.css";

// Helper to extract clean resource names from path
const getResourceFromPath = (path) => {
  if (!path) return "general";
  const cleanPath = path.replace(/^\/+/, "");
  const segments = cleanPath.split("/").filter(
    (s) =>
      s &&
      s.toLowerCase() !== "api" &&
      s.toLowerCase() !== "v1" &&
      s.toLowerCase() !== "v2" &&
      s.toLowerCase() !== "v3"
  );
  if (segments.length === 0) return "root";
  return segments[0].toLowerCase();
};

// Custom SVG Edge with Moving Glowing Particle Orbs
const AnimatedCyberEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = style.stroke || "#38BDF8";

  return (
    <>
      {/* Background Glowing Cable */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={style.strokeWidth || 2}
        stroke={strokeColor}
        strokeOpacity={0.6}
        fill="none"
        style={{ strokeDasharray: "6 6" }}
        markerEnd={markerEnd}
      />

      {/* Travelling Glowing Particle Orb */}
      <circle r="4" fill={strokeColor} filter={`drop-shadow(0 0 6px ${strokeColor})`}>
        <animateMotion dur={data?.speed || "2.2s"} repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
};

// Custom Cyber Node Component with Status Pills & Pulse Rings
const CustomCyberNode = ({ data }) => {
  const isVulnerable = data.state === "vulnerable";
  const isWarning = data.state === "warning";
  const isProtected = data.state === "protected";
  const isGateway = data.nodeType === "gateway";
  const isInternet = data.nodeType === "internet";

  const glowColor = isVulnerable
    ? "#EF4444"
    : isWarning
      ? "#F59E0B"
      : isProtected
        ? "#10B981"
        : "#38BDF8";

  const bgStyle = isGateway
    ? "linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(15, 23, 42, 0.95) 100%)"
    : isVulnerable
      ? "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)"
      : isWarning
        ? "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)"
        : "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)";

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -3 }}
      onClick={() => data.onSelectNode && data.onSelectNode(data)}
      style={{
        padding: isGateway ? "14px 22px" : "11px 18px",
        borderRadius: "16px",
        background: bgStyle,
        border: `1.5px solid ${glowColor}`,
        boxShadow: `0 12px 30px ${glowColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        minWidth: isGateway ? "180px" : "155px",
        textAlign: "center",
        cursor: "pointer",
        position: "relative",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Ripple Ring for Gateway */}
      {isGateway && (
        <div
          style={{
            position: "absolute",
            inset: "-6px",
            borderRadius: "22px",
            border: "1.5px solid rgba(56, 189, 248, 0.5)",
            animation: "gatewayRipple 2.4s ease-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: glowColor, width: "9px", height: "9px", border: "2px solid #050B14" }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <span style={{ fontSize: isGateway ? "18px" : "15px" }}>{data.icon || "📁"}</span>
        <span style={{ fontWeight: "900", fontSize: isGateway ? "13px" : "12px", letterSpacing: "0.5px" }}>
          {data.label}
        </span>
      </div>

      {!isInternet && (
        <div
          style={{
            marginTop: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "6px",
            fontSize: "9px",
            fontWeight: "800",
          }}
        >
          <span
            style={{
              background: `${glowColor}20`,
              color: glowColor,
              border: `1px solid ${glowColor}40`,
              padding: "2px 8px",
              borderRadius: "999px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: glowColor, boxShadow: `0 0 6px ${glowColor}` }} />
            {isVulnerable ? "Vulnerable" : isWarning ? "Warning" : isProtected ? "Protected" : "Active"}
          </span>

          <span style={{ color: "#94A3B8", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>
            {data.endpointsCount || 1} Endpoints
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: glowColor, width: "9px", height: "9px", border: "2px solid #050B14" }}
      />
    </motion.div>
  );
};

const nodeTypes = { customCyber: CustomCyberNode };
const edgeTypes = { cyberEdge: AnimatedCyberEdge };

export default function AttackSurfaceMap({ scan, scanStatus }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterState, setFilterState] = useState("all");
  const [trafficRate, setTrafficRate] = useState(1420);

  // Dynamic Telemetry Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficRate((prev) => prev + Math.floor(Math.random() * 23) - 11);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const isCompleted = scan?.status === "completed";
  const rawFindings = (isCompleted && scan?.vulnerabilities) || [];
  const inventoryFinding = rawFindings.find(
    (f) => f.category === "API Inventory" || f.title === "API Inventory Analysis"
  );

  // Extracted Endpoints
  const endpoints = useMemo(() => {
    if (inventoryFinding?.inventory?.endpoints) {
      return inventoryFinding.inventory.endpoints.map((e) => e.path);
    }
    return [
      "/api/auth/login",
      "/api/auth/register",
      "/api/users/profile",
      "/api/orders/details",
      "/api/payments/checkout",
      "/api/feeds/stream",
    ];
  }, [inventoryFinding]);

  // Active Microservices
  const activeResources = useMemo(() => {
    const set = new Set();
    endpoints.forEach((p) => {
      set.add(getResourceFromPath(p));
    });
    return Array.from(set).slice(0, 6);
  }, [endpoints]);

  // Service Security States
  const serviceStates = useMemo(() => {
    const states = {};
    activeResources.forEach((res) => {
      states[res] = "protected";
    });

    if (isCompleted && rawFindings.length > 0) {
      rawFindings.forEach((vuln) => {
        if (vuln.category === "API Inventory" || vuln.title === "API Inventory Analysis") return;
        const vulnPath = vuln.endpoint || "";
        const res = getResourceFromPath(vulnPath);

        if (states[res] !== undefined) {
          const severity = vuln.severity?.toLowerCase();
          if (severity === "critical" || severity === "high") {
            states[res] = "vulnerable";
          } else if ((severity === "medium" || severity === "low") && states[res] !== "vulnerable") {
            states[res] = "warning";
          }
        }
      });
    } else if (scanStatus) {
      activeResources.forEach((res, idx) => {
        states[res] = idx % 2 === 0 ? "warning" : "protected";
      });
    } else {
      activeResources.forEach((res, idx) => {
        states[res] = idx === 1 ? "warning" : idx === 4 ? "vulnerable" : "protected";
      });
    }
    return states;
  }, [activeResources, isCompleted, rawFindings, scanStatus]);

  // Filtered Services
  const filteredResources = useMemo(() => {
    if (filterState === "vulnerable") {
      return activeResources.filter((res) => serviceStates[res] === "vulnerable" || serviceStates[res] === "warning");
    }
    if (filterState === "protected") {
      return activeResources.filter((res) => serviceStates[res] === "protected");
    }
    return activeResources;
  }, [activeResources, filterState, serviceStates]);

  // Nodes Positioning
  const nodes = useMemo(() => {
    const baseNodes = [
      {
        id: "internet",
        type: "customCyber",
        position: { x: 30, y: 210 },
        data: {
          label: "INTERNET",
          icon: "🌐",
          nodeType: "internet",
          state: "default",
          endpointsCount: endpoints.length,
          onSelectNode: setSelectedNode,
        },
      },
      {
        id: "gateway",
        type: "customCyber",
        position: { x: 250, y: 210 },
        data: {
          label: "API GATEWAY",
          icon: "⚡",
          nodeType: "gateway",
          state: "protected",
          endpointsCount: endpoints.length,
          onSelectNode: setSelectedNode,
        },
      },
    ];

    const startY = 10;
    const yGap = 76;

    filteredResources.forEach((res, idx) => {
      const state = serviceStates[res] || "protected";
      const icon =
        res === "auth"
          ? "🔒"
          : res === "user" || res === "users"
            ? "👤"
            : res === "orders" || res === "cart"
              ? "📦"
              : res === "payments" || res === "billing" || res === "checkout"
                ? "💳"
                : "📁";

      baseNodes.push({
        id: `res-${res}`,
        type: "customCyber",
        position: { x: 530, y: startY + idx * yGap },
        data: {
          label: `${res.toUpperCase()} API`,
          icon,
          nodeType: "service",
          state,
          resourceName: res,
          endpointsCount: endpoints.filter((p) => getResourceFromPath(p) === res).length || 4,
          onSelectNode: setSelectedNode,
        },
      });
    });

    return baseNodes;
  }, [filteredResources, serviceStates, endpoints]);

  // Edges with Traveling Orbs
  const edges = useMemo(() => {
    const baseEdges = [
      {
        id: "e0",
        type: "cyberEdge",
        source: "internet",
        target: "gateway",
        style: { stroke: "#38BDF8", strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#38BDF8" },
        data: { speed: "2.5s" },
      },
    ];

    filteredResources.forEach((res, idx) => {
      const state = serviceStates[res] || "protected";
      const edgeColor =
        state === "vulnerable"
          ? "#EF4444"
          : state === "warning"
            ? "#F59E0B"
            : "#10B981";

      baseEdges.push({
        id: `edge-${res}`,
        type: "cyberEdge",
        source: "gateway",
        target: `res-${res}`,
        style: { stroke: edgeColor, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
        data: { speed: `${2 + (idx % 3) * 0.4}s` },
      });
    });

    return baseEdges;
  }, [filteredResources, serviceStates]);

  const gatewayCount = endpoints.length;
  const externalApiCount = activeResources.length;
  const vulnerableCount = Object.values(serviceStates).filter((s) => s === "vulnerable" || s === "warning").length;
  const protectedCount = Object.values(serviceStates).filter((s) => s === "protected").length;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #050B14 0%, #03070E 100%)",
        border: "1px solid rgba(139, 92, 246, 0.25)",
        borderRadius: "24px",
        overflow: "hidden",
        height: "590px",
        width: "100%",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        position: "relative",
      }}
    >
      {/* Keyframe Animations */}
      <style>{`
        @keyframes gatewayRipple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>

      {/* Header Bar */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(10, 17, 34, 0.75)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "18px", fontWeight: "900", letterSpacing: "0.5px" }}>
              Attack Surface Map
            </h3>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10B981",
                fontSize: "9.5px",
                fontWeight: "800",
                padding: "3px 10px",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
              LIVE TELEMETRY
            </span>
          </div>

          <div style={{ color: "#64748B", fontSize: "12px", marginTop: "3px", fontWeight: "500" }}>
            Real-time visual topology of API routing gateways and endpoint threat boundaries
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "6px", background: "rgba(15, 23, 42, 0.8)", padding: "4px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          {["all", "vulnerable", "protected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterState(f)}
              style={{
                background: filterState === f ? "#8B5CF6" : "transparent",
                color: filterState === f ? "#FFFFFF" : "#94A3B8",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s ease",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div style={{ height: "518px", width: "100%", position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background gap={28} size={1.2} color="rgba(255,255,255,0.025)" />
          <Controls showInteractive={false} style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px" }} />
        </ReactFlow>

        {/* Surface Overview Panel Overlay */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            width: "230px",
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(5, 11, 20, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ color: "#8B5CF6", fontWeight: "800", fontSize: "11px", letterSpacing: "1px", marginBottom: "10px", textTransform: "uppercase" }}>
            SURFACE OVERVIEW
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#CBD5E1", fontSize: "12px", fontWeight: "500" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Gateway Endpoints:</span>
              <span style={{ fontWeight: "800", color: "#FFFFFF" }}>{gatewayCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Discovered Microservices:</span>
              <span style={{ fontWeight: "800", color: "#FFFFFF" }}>{externalApiCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Protected APIs:</span>
              <span style={{ fontWeight: "800", color: "#10B981" }}>{protectedCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "2px" }}>
              <span style={{ color: "#64748B" }}>Vulnerable Exposure:</span>
              <span style={{ fontWeight: "900", color: "#EF4444" }}>{vulnerableCount}</span>
            </div>
          </div>
        </div>

        {/* Live Network Telemetry Strip Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            background: "rgba(5, 11, 20, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "8px 16px",
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "11px",
            color: "#94A3B8",
            fontWeight: "600",
          }}
        >
          <div>
            Traffic: <strong style={{ color: "#38BDF8" }}>{trafficRate.toLocaleString()} req/s</strong>
          </div>
          <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)" }} />
          <div>
            Latency: <strong style={{ color: "#10B981" }}>14ms</strong>
          </div>
          <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)" }} />
          <div>
            WAF Filter: <strong style={{ color: "#C084FC" }}>Active</strong>
          </div>
        </div>

        {/* Node Inspection Modal Drawer */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "270px",
                background: "rgba(10, 17, 34, 0.95)",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                borderRadius: "16px",
                padding: "16px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                zIndex: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ color: "#FFFFFF", fontWeight: "900", fontSize: "13px" }}>
                  {selectedNode.icon} {selectedNode.label}
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "14px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: "11.5px", color: "#CBD5E1", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><strong>Node Type:</strong> {selectedNode.nodeType}</div>
                <div><strong>Registered Endpoints:</strong> {selectedNode.endpointsCount || 1}</div>
                <div>
                  <strong>Security Status:</strong>{" "}
                  <span style={{ color: selectedNode.state === "vulnerable" ? "#EF4444" : selectedNode.state === "warning" ? "#F59E0B" : "#10B981", fontWeight: "800" }}>
                    {(selectedNode.state || "Active").toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
