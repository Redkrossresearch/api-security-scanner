import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";

// Helper to extract clean resource names from arbitrary crawled endpoints paths
const getResourceFromPath = (path) => {
  if (!path) return "general";
  
  // Strip leading slashes and extract first real folder resource segment
  const cleanPath = path.replace(/^\/+/, "");
  const segments = cleanPath.split("/").filter(
    (s) => s && s.toLowerCase() !== "api" && s.toLowerCase() !== "v1" && s.toLowerCase() !== "v2" && s.toLowerCase() !== "v3"
  );
  
  if (segments.length === 0) return "root";
  return segments[0].toLowerCase();
};

export default function AttackSurfaceMap({ scan, scanStatus }) {
  const isCompleted = scan?.status === "completed";
  const rawFindings = (isCompleted && scan?.vulnerabilities) || [];
  const inventoryFinding = rawFindings.find(
    (f) => f.category === "API Inventory" || f.title === "API Inventory Analysis"
  );

  // 1. Dynamic Endpoint extraction
  const endpoints = useMemo(() => {
    if (inventoryFinding?.inventory?.endpoints) {
      return inventoryFinding.inventory.endpoints.map((e) => e.path);
    }
    // Static fallback only when no scan execution has run yet
    return [
      "/api/auth/login",
      "/api/auth/register",
      "/api/users/profile",
      "/api/orders/details",
      "/api/payments/checkout",
    ];
  }, [inventoryFinding]);

  // 2. Parse resource groupings dynamically
  const activeResources = useMemo(() => {
    const set = new Set();
    endpoints.forEach((p) => {
      set.add(getResourceFromPath(p));
    });
    // Convert to array and limit to top 6 to prevent layout clutter
    return Array.from(set).slice(0, 6);
  }, [endpoints]);

  // 3. Compute dynamic states matching scanned vulnerabilities
  const serviceStates = useMemo(() => {
    const states = {};
    activeResources.forEach((res) => {
      states[res] = "protected"; // default state
    });

    if (isCompleted && rawFindings.length > 0) {
      rawFindings.forEach((vuln) => {
        if (vuln.category === "API Inventory" || vuln.title === "API Inventory Analysis") {
          return;
        }

        const vulnPath = vuln.endpoint || "";
        const res = getResourceFromPath(vulnPath);

        if (states[res] !== undefined) {
          const severity = vuln.severity?.toLowerCase();
          if (severity === "critical" || severity === "high") {
            states[res] = "vulnerable";
          } else if (
            (severity === "medium" || severity === "low") &&
            states[res] !== "vulnerable"
          ) {
            states[res] = "warning";
          }
        }
      });
    } else if (scanStatus) {
      // In-progress assessment mockup state shifts
      activeResources.forEach((res, idx) => {
        states[res] = idx % 2 === 0 ? "warning" : "protected";
      });
    } else {
      // Initial default layouts
      activeResources.forEach((res, idx) => {
        states[res] = idx === 1 ? "warning" : idx === 4 ? "vulnerable" : "protected";
      });
    }

    return states;
  }, [activeResources, isCompleted, rawFindings, scanStatus]);

  // 4. Node Style generators
  const getNodeStyle = (serviceId, state) => {
    const nodeBase = {
      color: "#fff",
      borderRadius: "12px",
      textAlign: "center",
      fontWeight: "800",
      fontSize: "11.5px",
      letterSpacing: "0.5px",
      padding: "10px 14px",
      transition: "all 0.3s ease",
    };

    if (state === "vulnerable") {
      return {
        ...nodeBase,
        background: "rgba(239, 68, 68, 0.15)",
        border: "1.5px solid #EF4444",
        width: 140,
        boxShadow: "0 0 18px rgba(239, 68, 68, 0.35)",
      };
    }
    if (state === "warning") {
      return {
        ...nodeBase,
        background: "rgba(249, 115, 22, 0.15)",
        border: "1.5px solid #F97316",
        width: 140,
        boxShadow: "0 0 18px rgba(249, 115, 22, 0.35)",
      };
    }
    if (state === "protected") {
      return {
        ...nodeBase,
        background: "rgba(16, 185, 129, 0.15)",
        border: "1.5px solid #10B981",
        width: 140,
        boxShadow: "0 0 18px rgba(16, 185, 129, 0.35)",
      };
    }
    return {
      ...nodeBase,
      background: "rgba(59, 130, 246, 0.15)",
      border: "1.5px solid #3B82F6",
      width: 140,
      boxShadow: "0 0 18px rgba(59, 130, 246, 0.35)",
    };
  };

  const getServiceColor = (state) => {
    if (state === "vulnerable") return "#EF4444";
    if (state === "warning") return "#F97316";
    if (state === "protected") return "#10B981";
    return "#3B82F6";
  };

  const nodes = useMemo(() => {
    const baseNodes = [
      {
        id: "internet",
        position: { x: 40, y: 150 },
        data: { label: "🌐 Internet" },
        style: {
          color: "#fff",
          borderRadius: "12px",
          textAlign: "center",
          fontWeight: "800",
          fontSize: "12px",
          letterSpacing: "0.5px",
          padding: "10px 14px",
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          width: 110,
          boxShadow: "0 0 15px rgba(255, 255, 255, 0.04)",
        },
      },
      {
        id: "gateway",
        position: { x: 210, y: 150 },
        data: { label: "⚡ API Gateway" },
        style: {
          color: "#fff",
          borderRadius: "12px",
          textAlign: "center",
          fontWeight: "800",
          fontSize: "12px",
          letterSpacing: "0.5px",
          padding: "10px 14px",
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(29, 78, 216, 0.05) 100%)",
          border: "2px solid #2563EB",
          width: 150,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px rgba(37, 99, 235, 0.35)",
        },
      },
    ];

    // Compute coordinate positions dynamically for discovered services
    const startY = 20;
    const yGap = 75;

    activeResources.forEach((res, idx) => {
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
        position: { x: 480, y: startY + idx * yGap },
        data: { label: `${icon} ${res.toUpperCase()} API` },
        style: getNodeStyle(res, state),
      });
    });

    return baseNodes;
  }, [activeResources, serviceStates]);

  const edges = useMemo(() => {
    const baseEdges = [
      {
        id: "e0",
        source: "internet",
        target: "gateway",
        animated: true,
        style: { stroke: "#3B82F6", strokeWidth: 2, strokeDasharray: "5 5" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3B82F6",
        },
      },
    ];

    activeResources.forEach((res) => {
      const state = serviceStates[res] || "protected";
      baseEdges.push({
        id: `edge-${res}`,
        source: "gateway",
        target: `res-${res}`,
        animated: true,
        style: { stroke: getServiceColor(state), strokeWidth: 2 },
      });
    });

    return baseEdges;
  }, [activeResources, serviceStates]);

  // Compute dynamic Overview counts
  const gatewayCount = endpoints.length;
  const externalApiCount = activeResources.length;
  const vulnerableCount = Object.values(serviceStates).filter((s) => s === "vulnerable" || s === "warning").length;
  const protectedCount = Object.values(serviceStates).filter((s) => s === "protected").length;

  const stats = [
    {
      label: scan ? `${scan.totalFindings} Issues` : "20 Issues",
      color: "#3B82F6",
      glow: "rgba(59, 130, 246, 0.15)",
    },
    {
      label: scan ? `${scan.criticalCount} Critical` : "1 Critical",
      color: "#EF4444",
      glow: "rgba(239, 68, 68, 0.15)",
    },
    {
      label: scan ? `${scan.securityScore}% Secure` : "33% Secure",
      color: "#10B981",
      glow: "rgba(16, 185, 129, 0.15)",
    },
  ];

  const legend = [
    { label: "Discovered", color: "#3B82F6" },
    { label: "In Progress", color: "#F97316" },
    { label: "Vulnerable", color: "#EF4444" },
    { label: "Protected", color: "#10B981" },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #070D1A 0%, #03070E 100%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "22px",
        overflow: "hidden",
        height: "560px",
        width: "100%",
        minWidth: "300px",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: "900",
              letterSpacing: "0.5px",
            }}
          >
            Attack Surface Map
          </h3>

          <div
            style={{
              color: "#64748B",
              fontSize: "12px",
              marginTop: "4px",
              fontWeight: "500",
            }}
          >
            Visual topology of discovered APIs and exposure paths
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                background: item.glow,
                border: `1px solid ${item.color}40`,
                color: item.color,
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: `0 0 8px ${item.glow}`,
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          height: "500px",
          width: "100%",
          position: "relative",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background gap={24} size={1} color="rgba(255,255,255,0.015)" />

          <Controls showInteractive={false} />
        </ReactFlow>

        {/* Dynamic Overview Panel Overlay */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            width: "220px",
            padding: "16px",
            borderRadius: "14px",
            background: "rgba(3, 6, 14, 0.88)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontWeight: "800",
              fontSize: "12px",
              letterSpacing: "0.5px",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            Surface Overview
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              color: "#CBD5E1",
              fontSize: "12.5px",
              fontWeight: "500",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Gateway Endpoints:</span>
              <span style={{ fontWeight: "700" }}>{gatewayCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>External APIs:</span>
              <span style={{ fontWeight: "700" }}>{externalApiCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Protected APIs:</span>
              <span style={{ fontWeight: "700", color: "#10B981" }}>{protectedCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px", marginTop: "4px" }}>
              <span style={{ color: "#64748B" }}>Vulnerable APIs:</span>
              <span style={{ fontWeight: "800", color: "#EF4444" }}>{vulnerableCount}</span>
            </div>
          </div>
        </div>

        {/* Legend status indicators overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "14px",
            left: "14px",
            display: "flex",
            gap: "18px",
            background: "rgba(3, 6, 14, 0.8)",
            padding: "8px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          {legend.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#CBD5E1",
                fontSize: "11.5px",
                fontWeight: "600",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "3px",
                  borderRadius: "999px",
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}`,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
