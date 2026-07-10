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
      {/* 3D Robot Mascot Companion Styles */}
      <style>{`
        /* Global Floating container overlay - positioned at bottom right of chat log area */
        .global-mascot-container {
          position: absolute;
          bottom: 95px;
          right: 32px;
          z-index: 100;
          pointer-events: none;
        }

        .bot-3d-mascot {
          pointer-events: auto;
          width: 120px;
          height: 160px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
        }

        .bot-3d-mascot:hover {
          transform: scale(1.12) rotateX(12deg) rotateY(-12deg);
          filter: drop-shadow(0 15px 30px rgba(139, 92, 246, 0.3));
        }

        .bot-body-wrap {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-style: preserve-3d;
          animation: botHover 5s ease-in-out infinite;
        }

        @keyframes botHover {
          0% { transform: translate(0px, 0px) rotateY(8deg) rotateX(2deg); }
          25% { transform: translate(12px, -15px) rotateY(-4deg) rotateX(-2deg); }
          50% { transform: translate(4px, -5px) rotateY(12deg) rotateX(4deg); }
          75% { transform: translate(-10px, -18px) rotateY(-8deg) rotateX(-4deg); }
          100% { transform: translate(0px, 0px) rotateY(8deg) rotateX(2deg); }
        }

        .bot-shadow {
          position: absolute;
          bottom: -22px;
          width: 75px;
          height: 8px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          filter: blur(5px);
          animation: shadowScale 5s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shadowScale {
          0% { transform: scale(1) translate(0px, 0px); opacity: 0.7; }
          25% { transform: scale(0.8) translate(12px, 0px); opacity: 0.45; }
          50% { transform: scale(0.95) translate(4px, 0px); opacity: 0.6; }
          75% { transform: scale(0.75) translate(-10px, 0px); opacity: 0.35; }
          100% { transform: scale(1) translate(0px, 0px); opacity: 0.7; }
        }

        /* 3D Hologram Projection Base Platform */
        .bot-platform {
          position: absolute;
          bottom: -20px;
          width: 80px;
          height: 20px;
          perspective: 500px;
          transform-style: preserve-3d;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 1;
        }

        .bot-platform-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid var(--theme-accent, #8B5CF6);
          opacity: 0.45;
          filter: drop-shadow(0 0 8px var(--theme-accent, #8B5CF6));
          transform: rotateX(75deg);
        }

        .bot-platform-ring-1 {
          width: 80px;
          height: 80px;
          animation: spinPlatform1 12s linear infinite;
        }

        .bot-platform-ring-2 {
          width: 55px;
          height: 55px;
          border-color: #3B82F6;
          border-style: dashed;
          animation: spinPlatform2 7s linear infinite reverse;
        }

        @keyframes spinPlatform1 {
          0% { transform: rotateX(75deg) rotateZ(0deg); }
          100% { transform: rotateX(75deg) rotateZ(360deg); }
        }

        @keyframes spinPlatform2 {
          0% { transform: rotateX(75deg) rotateZ(0deg); }
          100% { transform: rotateX(75deg) rotateZ(360deg); }
        }

        /* Head - RADIAL SHADING FOR 3D SPHERICAL LOOK */
        .bot-head {
          width: 96px;
          height: 70px;
          background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f5f9 45%, #cbd5e1 75%, #94a3b8 100%);
          border-radius: 40px / 32px;
          border: 1.5px solid #F1F5F9;
          box-shadow: 
            inset 3px 3px 8px rgba(255,255,255,0.8),
            inset -3px -3px 8px rgba(148,163,184,0.35),
            0 8px 16px rgba(0, 0, 0, 0.35);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        /* 3D Side Ears/Nodes */
        .bot-ear-left, .bot-ear-right {
          width: 8px;
          height: 16px;
          background: linear-gradient(180deg, #cbd5e1, #94a3b8);
          border-radius: 4px;
          position: absolute;
          top: 27px;
          box-shadow: inset 1px 1px 2px rgba(255,255,255,0.8);
          border: 1px solid #cbd5e1;
        }
        .bot-ear-left { left: -5px; }
        .bot-ear-right { right: -5px; }

        /* Screen with glass glare */
        .bot-screen {
          width: 72px;
          height: 46px;
          background: #070a12;
          border-radius: 25px / 18px;
          border: 1.5px solid rgba(255,255,255,0.06);
          box-shadow: 
            0 0 8px rgba(0,0,0,0.85),
            inset 0 0 8px rgba(139, 92, 246, 0.2);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          overflow: hidden;
        }

        /* Eyes with blink animation */
        .bot-eye {
          width: 20px;
          height: 28px;
          background: radial-gradient(circle, var(--theme-accent, #8B5CF6) 0%, rgba(139, 92, 246, 0.35) 100%);
          border-radius: 50% / 40%;
          box-shadow: 
            0 0 10px var(--theme-accent, #8B5CF6),
            0 0 3px var(--theme-accent, #8B5CF6);
          position: relative;
          animation: eyeBlink 5s infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bot-eye-grid {
          width: 100%;
          height: 100%;
          background-image: linear-gradient(0deg, rgba(255,255,255,0.12) 1px, transparent 1px);
          background-size: 100% 3.5px;
          border-radius: 50%;
        }

        @keyframes eyeBlink {
          0%, 94%, 98%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.05); }
        }

        /* Neck */
        .bot-neck {
          width: 32px;
          height: 10px;
          background: linear-gradient(90deg, #94A3B8 0%, #475569 50%, #334155 100%);
          border-radius: 3px;
          margin-top: -5px;
          box-shadow: inset 0 2px 3px rgba(0,0,0,0.4);
          z-index: 5;
        }

        /* Torso - RADIAL SHADING FOR 3D SPHERICAL LOOK */
        .bot-torso {
          width: 82px;
          height: 74px;
          background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f5f9 45%, #cbd5e1 75%, #94a3b8 100%);
          border-radius: 50% / 44%;
          border: 1.5px solid #F1F5F9;
          box-shadow: 
            inset 3px 3px 8px rgba(255,255,255,0.8),
            inset -3px -3px 8px rgba(148,163,184,0.35),
            0 8px 16px rgba(0,0,0,0.25);
          margin-top: -3px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 8;
        }

        /* Arms & Shoulder Joints */
        .bot-shoulder-left, .bot-shoulder-right {
          width: 10px;
          height: 10px;
          background: #cbd5e1;
          border-radius: 50%;
          position: absolute;
          top: 20px;
          box-shadow: inset 1px 1px 2px #FFF;
          border: 1px solid #cbd5e1;
        }
        .bot-shoulder-left { left: -6px; }
        .bot-shoulder-right { right: -6px; }

        .bot-arm-left, .bot-arm-right {
          width: 15px;
          height: 46px;
          background: linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%);
          position: absolute;
          top: 24px;
          border-radius: 8px;
          border: 1.2px solid #F1F5F9;
          box-shadow: 
            0 4px 6px rgba(0,0,0,0.15),
            inset 1.5px 1.5px 3px rgba(255,255,255,0.6);
        }
        .bot-arm-left {
          left: -11px;
          transform: rotateZ(12deg);
          transform-origin: top center;
          animation: waveLeft 6s ease-in-out infinite alternate;
        }
        .bot-arm-right {
          right: -11px;
          transform: rotateZ(-12deg);
          transform-origin: top center;
          animation: waveRight 6s ease-in-out infinite alternate;
        }

        @keyframes waveLeft {
          0% { transform: rotateZ(12deg); }
          100% { transform: rotateZ(18deg); }
        }
        @keyframes waveRight {
          0% { transform: rotateZ(-12deg); }
          100% { transform: rotateZ(-18deg); }
        }

        /* Chest emblem screen with AI text */
        .bot-chest-plate {
          width: 38px;
          height: 38px;
          background: #070a12;
          border: 2px solid #CBD5E1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            inset 0 0 6px rgba(0,0,0,0.85),
            0 0 12px var(--theme-accent, #8B5CF6);
          position: relative;
        }

        .bot-ai-badge {
          font-size: 10px;
          font-weight: 900;
          color: #FFF;
          text-shadow: 0 0 6px var(--theme-accent, #8B5CF6);
          font-family: 'Outfit', 'Inter', sans-serif;
          letter-spacing: 0.5px;
          animation: glowCycle 2s ease-in-out infinite alternate;
        }

        /* Base */
        .bot-base {
          width: 44px;
          height: 14px;
          background: linear-gradient(90deg, #CBD5E1 0%, #94A3B8 50%, #475569 100%);
          border-radius: 50%;
          margin-top: -7px;
          border: 1.2px solid #E2E8F0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.25);
          z-index: 6;
        }
      `}</style>

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

      {/* Global 3D Floating Robot Mascot companion overlaid on entire chat workspace */}
      <div className="global-mascot-container">
        <div className="bot-3d-mascot">
          {/* Hologram Stand Platform */}
          <div className="bot-platform">
            <div className="bot-platform-ring bot-platform-ring-1"></div>
            <div className="bot-platform-ring bot-platform-ring-2"></div>
          </div>
          <div className="bot-shadow"></div>
          <div className="bot-body-wrap">
            <div className="bot-head">
              {/* High-end glossy reflection sheet overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)",
                pointerEvents: "none",
                zIndex: 11
              }} />
              {/* Side ears nodes */}
              <div className="bot-ear-left"></div>
              <div className="bot-ear-right"></div>
              <div className="bot-screen">
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
                  pointerEvents: "none",
                  zIndex: 5
                }} />
                <div className="bot-eye"><div className="bot-eye-grid"></div></div>
                <div className="bot-eye"><div className="bot-eye-grid"></div></div>
              </div>
            </div>
            <div className="bot-neck"></div>
            <div className="bot-torso">
              {/* Spherical glossy reflection sheet overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 65%)",
                pointerEvents: "none",
                zIndex: 9
              }} />
              {/* Shoulder joint connectors */}
              <div className="bot-shoulder-left"></div>
              <div className="bot-shoulder-right"></div>
              <div className="bot-arm-left"></div>
              <div className="bot-chest-plate">
                <div className="bot-ai-badge">AI</div>
              </div>
              <div className="bot-arm-right"></div>
            </div>
            <div className="bot-base"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
