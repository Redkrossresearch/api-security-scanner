import Sidebar from "../components/layouts/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background: "#030712",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Premium glowing background mesh spots */}
      <div
        style={{
          position: "absolute",
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
          position: "absolute",
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

      <Sidebar />

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 20px",
          minWidth: 0,
          position: "relative",
          zIndex: 1,
          background: "transparent",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}