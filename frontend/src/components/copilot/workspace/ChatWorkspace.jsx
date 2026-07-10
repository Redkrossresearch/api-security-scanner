import React from "react";

export default function ChatWorkspace({ chatWindow, promptInput }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      flex: 1,
      minWidth: 0,
      position: "relative"
    }}>
      {/* Cockpit HUD Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 18px",
        background: "rgba(10, 15, 30, 0.4)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Left indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              width: "6px",
              height: "6px",
              background: "#10B981",
              borderRadius: "50%",
              boxShadow: "0 0 8px #10B981",
              display: "inline-block"
            }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              AUDIT CORE: ONLINE
            </span>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "6px", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "16px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: "500" }}>
              Scanner Node:
            </span>
            <span style={{ fontSize: "11px", color: "#A78BFA", fontWeight: "700", fontFamily: "monospace" }}>
              v1.4-atlas
            </span>
          </div>
        </div>

        {/* Right stats indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "500" }}>
            Accuracy Rate: <span style={{ color: "#10B981", fontWeight: "700" }}>99.2%</span>
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "500", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "16px" }}>
            Response Integrity: <span style={{ color: "#8B5CF6", fontWeight: "700" }}>Zero-Trust</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {chatWindow}
      </div>
      <div style={{ flexShrink: 0 }}>
        {promptInput}
      </div>
    </div>
  );
}
