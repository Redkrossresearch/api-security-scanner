import React from "react";
import useSocket from "./useSocket";

export default function ConnectionStatus() {
  const { isConnected, latency } = useSocket();
  const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

  const active = isConnected || isVercel;
  const label = isConnected ? `REALTIME: ${latency}ms` : isVercel ? "CLOUD API: ONLINE" : "OFFLINE";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        borderRadius: "20px",
        background: active ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
        border: `1px solid ${active ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
        fontSize: "11px",
        fontWeight: "700",
        color: active ? "#10b981" : "#ef4444",
        transition: "all 0.3s ease",
        letterSpacing: "0.5px",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: active ? "#10b981" : "#ef4444",
          boxShadow: `0 0 8px ${active ? "#10b981" : "#ef4444"}`,
          display: "inline-block",
        }}
      />
      <span>{label}</span>
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
