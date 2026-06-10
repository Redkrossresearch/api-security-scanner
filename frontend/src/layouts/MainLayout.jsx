import Sidebar from "../components/layouts/Sidebar";
import TopNavbar from "../components/layouts/TopNavbar";
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

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minWidth: 0,
        }}
      >
        <TopNavbar />

        <main
          style={{
            flex: 1,
            width: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "24px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}