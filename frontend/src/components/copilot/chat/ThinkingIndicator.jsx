import React, { useState, useEffect } from "react";
import { Brain, Sparkles } from "lucide-react";

export default function ThinkingIndicator({ phaseIndex = 0 }) {
  const phases = [
    "Analyzing query intent...",
    "Searching knowledge base...",
    "Scanning workspace metrics...",
    "Formulating security patch...",
  ];

  return (
    <>
      <style>{`
        @keyframes pulse-thinking {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .thinking-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #3B82F6);
          animation: pulse-thinking 1.2s ease-in-out infinite;
        }
        .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0" }}>
        {/* Avatar */}
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 0 10px rgba(124,58,237,0.3)",
        }}>
          <Brain size={13} color="#FFF" />
        </div>

        {/* Message bubble context box */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px",
          borderTopLeftRadius: "3px",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          {/* Animated Dots & Label */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <div className="thinking-dot" />
              <div className="thinking-dot" />
              <div className="thinking-dot" />
            </div>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginLeft: "6px", fontWeight: "600" }}>
              {phases[phaseIndex]}
            </span>
          </div>

          {/* Shimmer/Pulse Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "180px" }}>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", width: "100%" }} />
            <div style={{ height: "6px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", width: "80%" }} />
          </div>
        </div>
      </div>
    </>
  );
}
