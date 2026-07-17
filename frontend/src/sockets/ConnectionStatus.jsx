import React from "react";
import useSocket from "./useSocket";

export default function ConnectionStatus() {
  const { isConnected, latency } = useSocket();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        borderRadius: "20px",
        background: isConnected ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
        border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
        fontSize: "11px",
        fontWeight: "700",
        color: isConnected ? "#10b981" : "#ef4444",
        transition: "all 0.3s ease",
        letterSpacing: "0.5px",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: isConnected ? "#10b981" : "#ef4444",
          boxShadow: `0 0 8px ${isConnected ? "#10b981" : "#ef4444"}`,
          display: "inline-block",
          animation: isConnected ? "none" : "socket-pulse 1.5s infinite",
        }}
      />
      <span>{isConnected ? `REALTIME: ${latency}ms` : "OFFLINE"}</span>
      <style>{`
        @keyframes socket-pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
