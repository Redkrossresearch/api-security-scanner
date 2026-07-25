import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/layouts/Sidebar";
import ParticleBackground from "../components/layouts/ParticleBackground";
import { Outlet, useLocation } from "react-router-dom";
import SocketProvider from "../sockets/SocketProvider";
import useSocketEvent from "../sockets/useSocketEvent";
import toast from "react-hot-toast";
import { Menu, X } from "lucide-react";

function GlobalSocketListener() {
  useSocketEvent("scan:completed", (data) => {
    toast.success(`Scan completed successfully! Security Score: ${data.summary?.securityScore || 0}% (${data.summary?.grade || "F"})`, {
      duration: 5000,
    });
  });

  useSocketEvent("scan:failed", (data) => {
    toast.error(`Scan failed: ${data.reason || "Internal Engine Error"}`, {
      duration: 6000,
    });
  });

  useSocketEvent("notification:new", (data) => {
    toast(data.message, {
      icon: "🔔",
      duration: 5000,
    });
  });

  return null;
}

export default function MainLayout() {
  const location = useLocation();
  const mainRef = useRef(null);
  const layoutRef = useRef(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const root = document.getElementById("root");
    if (root) root.scrollTop = 0;
    if (mainRef.current) mainRef.current.scrollTop = 0;
    if (layoutRef.current) layoutRef.current.scrollTop = 0;
  }, [location.pathname]);

  const getPageTitle = (path) => {
    switch (path) {
      case "/":
        return "Dashboard Console";
      case "/scans":
        return "Vulnerability Scanner";
      case "/history":
        return "Scan History Ledger";
      case "/vulnerabilities":
        return "Threat Intelligence Center";
      case "/reports":
        return "Compliance & Audit Reports";
      case "/settings":
        return "System Settings";
      case "/copilot":
        return "AI Security Copilot";
      case "/queue":
        return "Task Queue Monitor";
      default:
        return "API Security Console";
    }
  };

  return (
    <SocketProvider>
      <GlobalSocketListener />
      <ParticleBackground />
      <div
        ref={layoutRef}
        style={{
        height: "100%",
        display: "flex",
        background: "#030712",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Premium glowing background mesh spots */}
      <div
        style={{
          position: "fixed",
          top: "-15%",
          left: "15%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-10%",
          right: "5%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)",
          filter: "blur(70px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Right Column Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Top Navigation Bar Header */}
        <header
          style={{
            height: "70px",
            minHeight: "70px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            background: "linear-gradient(90deg, #070d19 0%, #030710 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Left: Hamburger & Dynamic Title */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              className="mobile-nav-toggle"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFF",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                marginRight: "12px",
              }}
              aria-label="Toggle Navigation"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <h2
              style={{
                fontSize: "18px",
                fontWeight: "900",
                margin: 0,
                color: "#FFF",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {getPageTitle(location.pathname)}
            </h2>
          </div>


          {/* Right: Security Status Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Status Indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                padding: "6px 12px",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#10B981",
                  fontFamily: "monospace",
                  letterSpacing: "0.5px",
                }}
              >
                SHIELD://SECURE_MODE
              </span>
            </div>

            {/* Engine version */}
            <div
              style={{
                fontSize: "11px",
                color: "#64748B",
                fontFamily: "monospace",
                fontWeight: "700",
              }}
            >
              ENGINE: v2.4.8_ACTIVE
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <main
          ref={mainRef}
          style={{
            flex: 1,
            boxSizing: "border-box",
            overflowY: location.pathname === "/copilot" ? "hidden" : "auto",
            overflowX: "hidden",
            padding: location.pathname === "/copilot" ? "0" : "16px 20px",
            minWidth: 0,
            position: "relative",
            background: "transparent",
            height: location.pathname === "/copilot" ? "calc(100vh - 70px)" : "auto",
            display: location.pathname === "/copilot" ? "flex" : "block",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </main>
      </div>
      </div>
    </SocketProvider>
  );
}