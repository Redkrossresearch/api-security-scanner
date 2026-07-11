import React, { useState, useEffect } from "react";

export default function ChatLayout({ children }) {
  // State for mouse position to handle subtle parallax/glow effects
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize coordinates for subtle parallax
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <style>{`
        :root {
          /* 23. Theme Variables */
          --surface: rgba(255, 255, 255, 0.03);
          --surface-hover: rgba(255, 255, 255, 0.06);
          --surface-active: rgba(255, 255, 255, 0.09);
          --accent: #8b5cf6;
          --success: #10b981;
          --danger: #ef4444;
          
          --radius-xl: 28px; /* 3. Softer corners */
          --glass-border-top: rgba(255, 255, 255, 0.08);
          --glass-border-side: rgba(255, 255, 255, 0.06);
          --glass-border-bottom: rgba(255, 255, 255, 0.03);
        }

        /* 16, 17. Layout Animation */
        @keyframes layoutEnter {
          0% { 
            opacity: 0; 
            transform: scale(0.96) translateY(12px); 
            filter: blur(12px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
            filter: blur(0); 
          }
        }

        .layout-container {
          animation: layoutEnter 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* 25. Selection Color */
        ::selection {
          background: rgba(139, 92, 246, 0.3);
          color: white;
        }

        /* 19. GPU Rendering & 20. Isolation */
        .gpu-layer {
          transform: translateZ(0);
          will-change: transform;
          isolation: isolate;
        }

        /* 12. Background Animation Keyframes */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .mesh-bg {
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }

        /* 14. Gradient Divider */
        .glass-divider {
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
          width: 1px;
        }

        /* 24. Global Cursor Smoothness */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
      `}</style>

      {/* 
        Main Container 
        1. height: 100% (Parent controlled)
        2. padding: 12px
        4. Layered Shadow
        5. Glass Blur/Saturate
        6. Variable Border
        21. overflow: clip
        22. Safe Area
      */}
      <div
        className="chat-layout-root layout-container gpu-layer"
        style={{
          display: "flex",
          flexDirection: "column", // Stack Chrome and Content
          height: "100%",
          minHeight: "100%",
          width: "100%",
          maxWidth: "1900px",
          margin: "0 auto",
          
          // 2. Padding 12px + Safe Area
          padding: "12px",
          paddingTop: "calc(12px + env(safe-area-inset-top))",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          paddingLeft: "calc(12px + env(safe-area-inset-left))",
          paddingRight: "calc(12px + env(safe-area-inset-right))",

          // 3. Radius 28px
          borderRadius: "var(--radius-xl)",
          overflow: "clip",

          // 4. Layered Shadow
          boxShadow: `
            0 40px 120px rgba(0,0,0,0.45),
            0 20px 40px rgba(0,0,0,0.35),
            0 0 1px rgba(255,255,255,0.08) inset
          `,

          // 5. Glass Effect
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          backgroundColor: "rgba(10, 10, 12, 0.6)", // Dark base

          // 6. Variable Border
          borderTop: `1px solid var(--glass-border-top)`,
          borderLeft: `1px solid var(--glass-border-side)`,
          borderRight: `1px solid var(--glass-border-side)`,
          borderBottom: `1px solid var(--glass-border-bottom)`,

          // 20. Isolation
          isolation: "isolate",
          position: "relative",
          zIndex: 0,
        }}
      >
        {/* 
          Background Layers (Mesh, Noise, Glows) 
          Placed absolutely behind content
        */}
        <div 
          className="mesh-bg"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -2,
            borderRadius: "var(--radius-xl)",
            // 7, 9, 10, 11, 12. Complex Mesh Gradient
            background: `
              radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.22) 0%, transparent 50%),
              radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.22) 0%, transparent 50%),
              radial-gradient(circle at 90% 10%, rgba(6, 182, 212, 0.15) 0%, transparent 40%),
              linear-gradient(135deg, #050505 0%, #0a0a0c 100%)
            `,
            // 13. Mouse Glow (Subtle radial following cursor)
            maskImage: `radial-gradient(circle 600px at ${50 + mousePos.x}% ${50 + mousePos.y}%, black, transparent)`,
            WebkitMaskImage: `radial-gradient(circle 600px at ${50 + mousePos.x}% ${50 + mousePos.y}%, black, transparent)`,
          }}
        />
        
        {/* 8. Noise Layer (2% opacity, 40px grid pattern simulated via SVG) */}
        <div 
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            opacity: 0.02,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            pointerEvents: "none",
          }} 
        />

        {/* 
          ⭐ Window Chrome (Top Shell) 
          Gives the "Desktop App" feel
        */}
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "48px",
            padding: "0 24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            backgroundColor: "rgba(0,0,0,0.2)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Traffic Lights / Window Controls Placeholder */}
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <span style={{ 
              fontSize: "13px", 
              fontWeight: 500, 
              color: "rgba(255,255,255,0.5)", 
              letterSpacing: "0.5px",
              marginLeft: "12px"
            }}>
              ATHX AI • Workspace
            </span>
          </div>
          
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            <span>Scanner</span>
            <span>Model</span>
            <span>Memory</span>
            <span>Settings</span>
          </div>
        </div>

        {/* 
          Main Content Area (Sidebar + Conversation) 
          Flex row, no gap (divider used instead)
        */}
        <div 
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {children}
        </div>

      </div>
    </>
  );
}