import Sidebar from "../components/layouts/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background: "#0B1220",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 20px",
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}