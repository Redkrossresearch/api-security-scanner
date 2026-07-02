import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";

const nodeBase = {
  color: "#fff",
  borderRadius: "14px",
  textAlign: "center",
  fontWeight: 600,
};

const nodes = [
  {
    id: "internet",
    position: { x: 50, y: 140 },
    data: { label: "Internet" },
    style: {
      ...nodeBase,
      background: "#111827",
      border: "1px solid #475569",
      width: 120,
      boxShadow: "0 0 15px rgba(148,163,184,.15)",
    },
  },

  {
    id: "gateway",
    position: { x: 260, y: 140 },
    data: { label: "API Gateway" },
    style: {
      ...nodeBase,
      background: "linear-gradient(135deg,#1D4ED8,#2563EB)",
      border: "2px solid #60A5FA",
      width: 210,
      height: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 25px rgba(59,130,246,.6),0 0 60px rgba(59,130,246,.25)",
    },
  },

  {
    id: "auth",
    position: { x: 520, y: 20 },
    data: { label: "Auth API" },
    style: {
      ...nodeBase,
      background: "#14532D",
      border: "1px solid #22C55E",
      width: 130,
      boxShadow: "0 0 18px rgba(34,197,94,.35)",
    },
  },

  {
    id: "users",
    position: { x: 520, y: 100 },
    data: { label: "User API" },
    style: {
      ...nodeBase,
      background: "#78350F",
      border: "1px solid #F97316",
      width: 130,
      boxShadow: "0 0 18px rgba(249,115,22,.35)",
    },
  },

  {
    id: "orders",
    position: { x: 520, y: 180 },
    data: { label: "Orders API" },
    style: {
      ...nodeBase,
      background: "#581C87",
      border: "1px solid #A855F7",
      width: 130,
      boxShadow: "0 0 18px rgba(168,85,247,.35)",
    },
  },

  {
    id: "payments",
    position: { x: 520, y: 260 },
    data: { label: "Payments API" },
    style: {
      ...nodeBase,
      background: "#7F1D1D",
      border: "1px solid #EF4444",
      width: 130,
      boxShadow: "0 0 18px rgba(239,68,68,.35)",
    },
  },
];

const edges = [
  {
    id: "e0",
    source: "internet",
    target: "gateway",
    animated: true,
    style: { stroke: "#3B82F6", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#3B82F6",
    },
  },

  {
    id: "e1",
    source: "gateway",
    target: "auth",
    animated: true,
    style: { stroke: "#22C55E", strokeWidth: 2 },
  },

  {
    id: "e2",
    source: "gateway",
    target: "users",
    animated: true,
    style: { stroke: "#F97316", strokeWidth: 2 },
  },

  {
    id: "e3",
    source: "gateway",
    target: "orders",
    animated: true,
    style: { stroke: "#A855F7", strokeWidth: 2 },
  },

  {
    id: "e4",
    source: "gateway",
    target: "payments",
    animated: true,
    style: { stroke: "#EF4444", strokeWidth: 2 },
  },
];

export default function AttackSurfaceMap({ scan, scanStatus }) {
  const stats = [
    { label: scan ? `${scan.totalFindings} Issues` : "5 APIs", color: "#3B82F6" },
    { label: scan ? `${scan.criticalCount} Critical` : "1 Critical", color: "#EF4444" },
    { label: scan ? `${scan.securityScore}% Secure` : "67% Secure", color: "#22C55E" },
  ];

  const legend = [
    { label: "Discovered", color: "#3B82F6" },
    { label: "In Progress", color: "#F97316" },
    { label: "Vulnerable", color: "#EF4444" },
    { label: "Protected", color: "#22C55E" },
  ];

  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: "24px",
        overflow: "hidden",
        height: "560px",
        width: "100%",
        minWidth: "300px",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "20px",
            }}
          >
            Attack Surface Map
          </h3>

          <div
            style={{
              color: "#64748B",
              fontSize: "12px",
              marginTop: "4px",
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
                padding: "6px 10px",
                borderRadius: "999px",
                background: `${item.color}15`,
                border: `1px solid ${item.color}40`,
                color: item.color,
                fontSize: "12px",
                fontWeight: 600,
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
          <Background gap={24} size={1} color="#1E293B" />

          <Controls showInteractive={false} />
        </ReactFlow>

        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            width: "220px",
            padding: "12px",
            borderRadius: "14px",
            background: "rgba(8,17,31,.92)",
            border: "1px solid rgba(255,255,255,.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontWeight: 600,
              marginBottom: "10px",
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
              fontSize: "12px",
            }}
          >
            <span>Gateway Endpoints: 24</span>
            <span>External APIs: 5</span>
            <span>Protected APIs: 3</span>

            <span
              style={{
                color: "#EF4444",
              }}
            >
              Vulnerable APIs: 2
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "14px",
            left: "14px",
            display: "flex",
            gap: "18px",
            background: "rgba(8,17,31,.9)",
            padding: "8px 12px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,.06)",
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
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "3px",
                  borderRadius: "999px",
                  background: item.color,
                  boxShadow: `0 0 10px ${item.color}`,
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
