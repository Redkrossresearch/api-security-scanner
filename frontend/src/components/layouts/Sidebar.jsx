import { Link, useLocation } from "react-router-dom";

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
                                background: active
                                    ? "#FFF7ED"
                                    : "transparent",

                                color: active
                                    ? "#F97316"
                                    : "#E5E7EB",

                                border: active
                                    ? "1px solid #FED7AA"
                                    : "1px solid transparent",
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
                        background: "#FFF7ED",
                        border: "1px solid #FED7AA",
                        padding: "16px",
                        borderRadius: "14px",
                    }}
                >
                    <div
                        style={{
                            color: "#F97316",
                            fontWeight: "600",
                            marginBottom: "6px",
                        }}
                    >
                        Security Status
                    </div>

                    <div
                        style={{
                            color: "#10B981",
                            fontSize: "14px",
                        }}
                    >
                        System Operational
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;