import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import {
  LayoutDashboard,
  Search,
  History,
  ShieldAlert,
  Globe,
  FileText,
  Bot,
  ShieldCheck,
  ClipboardList,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: <LayoutDashboard size={18} />,
  },
  {
    name: "Scans",
    path: "/scans",
    icon: <Search size={18} />,
  },
  {
    name: "Scan History",
    path: "/history",
    icon: <History size={18} />,
  },
  {
    name: "Vulnerabilities",
    path: "/vulnerabilities",
    icon: <ShieldAlert size={18} />,
  },
  {
    name: "API Inventory",
    path: "/inventory",
    icon: <Globe size={18} />,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FileText size={18} />,
  },
  {
    name: "AI Copilot",
    path: "/copilot",
    icon: <Bot size={18} />,
  },
  {
    name: "Compliance",
    path: "/compliance",
    icon: <ShieldCheck size={18} />,
  },
  {
    name: "Audit Logs",
    path: "/audit-logs",
    icon: <ClipboardList size={18} />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings size={18} />,
  },
];

function Sidebar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const userName =
    currentUser?.displayName || "Authenticated User";

  const userEmail =
    currentUser?.email || "No Email";

  const userPhoto =
    currentUser?.photoURL || null;

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        flexShrink: 0,
        background: "#0F172A",
        borderRight: "1px solid #1E293B",
        minHeight: "100vh",
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: "40px" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              color: "#F9FAFB",
              fontSize: "28px",
              fontWeight: "800",
              margin: 0,
            }}
          >
            ATHX Security
          </h1>

          <p
            style={{
              color: "#9CA3AF",
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            Enterprise API Security
          </p>
        </div>

        <p
          style={{
            color: "#9CA3AF",
            fontSize: "13px",
          }}
        >
          API Security Platform
        </p>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                padding: "14px 16px",
                borderRadius: "12px",
                background: active ? "#FFF7ED" : "transparent",

                color: active ? "#F97316" : "#E5E7EB",

                border: active ? "1px solid #FED7AA" : "1px solid transparent",
                fontWeight: 600,
                fontSize: "15px",
                transition: "all .2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "24px",
          borderTop: "1px solid #1F2937",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {userPhoto ? (
            <img
              src={userPhoto}
              alt="Profile"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#1E293B",
              }}
            />
          )}

          <div>
            <div
              style={{
                color: "#F9FAFB",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {userName}
            </div>

            <div
              style={{
                color: "#9CA3AF",
                fontSize: "12px",
                maxWidth: "160px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              await logout();
            } catch (error) {
              console.error(error);
            }
          }}
          style={{
            width: "100%",
            height: "42px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;