import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import ConnectionStatus from "../../sockets/ConnectionStatus";
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
  LogOut,
  Server,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: <LayoutDashboard size={17} />,
  },
  {
    name: "Scans",
    path: "/scans",
    icon: <Search size={17} />,
  },
  {
    name: "Scan History",
    path: "/history",
    icon: <History size={17} />,
  },
  {
    name: "Vulnerabilities",
    path: "/vulnerabilities",
    icon: <ShieldAlert size={17} />,
  },
  {
    name: "API Inventory",
    path: "/inventory",
    icon: <Globe size={17} />,
    comingSoon: true,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FileText size={17} />,
  },
  {
    name: "AI Copilot",
    path: "/copilot",
    icon: <Bot size={17} />,
  },
  {
    name: "Queue Monitor",
    path: "/queue",
    icon: <Server size={17} />,
  },
  {
    name: "Workflow Builder",
    path: "/workflows",
    icon: <ClipboardList size={17} />,
  },

  {
    name: "Settings",
    path: "/settings",
    icon: <Settings size={17} />,
  },
];

function Sidebar({ isMobileOpen, onClose }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState("");

  // Real data states
  const [sidebarStats, setSidebarStats] = useState(null);
  const [threatFeed, setThreatFeed] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get("/teams");
        if (res.data?.success) {
          const list = res.data.teams || [];
          setTeams(list);
          const saved = localStorage.getItem("activeTeamId");
          if (saved && list.some((t) => t._id === saved)) {
            setActiveTeam(saved);
          } else if (list.length > 0) {
            setActiveTeam(list[0]._id);
            localStorage.setItem("activeTeamId", list[0]._id);
          }
        }
      } catch (err) {
        console.warn("Teams load warning (using default workspace):", err.message);
        setTeams([{ _id: "default", name: "Enterprise Workspace" }]);
        setActiveTeam("default");
      }
    };
    if (currentUser) {
      fetchTeams();
    }
  }, [currentUser]);

  // Fetch real dashboard stats
  useEffect(() => {
    if (!currentUser) return;
    const fetchStats = async () => {
      try {
        const dashRes = await api.get("/dashboard/stats");
        if (dashRes.data?.success) {
          const s = dashRes.data.stats;
          const sevDist = s.severityDistribution || {};
          const total = (sevDist.critical || 0) + (sevDist.high || 0) + (sevDist.medium || 0) + (sevDist.low || 0) + (sevDist.info || 0);
          setSidebarStats({
            totalScans: s.totalScans || 0,
            vulnerabilities: total,
            critical: sevDist.critical || 0,
            high: sevDist.high || 0,
            endpoints: s.apiInventory?.totalApis || 0,
          });

          // Build threat feed from real topFindings
          const findings = s.topFindings || [];
          const criticals = s.criticalFindings || [];

          const feed = [];

          // Add critical findings first
          criticals.slice(0, 2).forEach((f) => {
            feed.push({ type: "CRIT", label: f.title || "Critical Issue", color: "#EF4444" });
          });

          // Fill rest from topFindings
          findings.slice(0, 4 - feed.length).forEach((f) => {
            const title = f.title || "Security Issue";
            const isHigh = title.toLowerCase().includes("cors") || title.toLowerCase().includes("injection") || title.toLowerCase().includes("auth");
            feed.push({
              type: isHigh ? "HIGH" : "MED",
              label: title,
              color: isHigh ? "#F97316" : "#FBBF24",
            });
          });

          setThreatFeed(feed.slice(0, 4));
        }
      } catch (err) {
        console.error("Sidebar stats fetch failed:", err.message, err.response?.data);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleWorkspaceChange = (e) => {
    const val = e.target.value;
    setActiveTeam(val);
    localStorage.setItem("activeTeamId", val);
    window.location.reload();
  };

  const userName = currentUser?.displayName || "Authenticated User";
  const userEmail = currentUser?.email || "No Email";
  const userPhoto = currentUser?.photoURL || null;

  return (
    <aside
      className={`responsive-sidebar ${isMobileOpen ? "mobile-open" : ""}`}
      style={{
        width: "265px",
        minWidth: "265px",
        flexShrink: 0,
        background: "linear-gradient(180deg, #070D19 0%, #030710 100%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        minHeight: "100%",
        height: "100%",
        padding: "26px 20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        boxShadow: "10px 0 30px rgba(0,0,0,0.25)",
      }}
    >

      {/* Sidebar Header */}
      <div style={{ marginBottom: "34px", paddingLeft: "8px" }}>
        <h1
          style={{
            fontSize: "23px",
            fontWeight: "900",
            margin: 0,
            background: "linear-gradient(135deg, #FF7A1A 0%, #F97316 50%, #FB923C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 15px rgba(249,115,22,0.25))",
            letterSpacing: "0.5px",
          }}
        >
          ATHX Security
        </h1>
        <p
          style={{
            color: "#64748B",
            fontSize: "12px",
            fontWeight: "600",
            margin: "4px 0 0 0",
            letterSpacing: "0.2px",
          }}
        >
          Enterprise API Security
        </p>
        <div style={{ marginTop: "12px" }}>
          <ConnectionStatus />
        </div>
      </div>

      {/* Workspace Selector Dropdown */}
      <div style={{ marginBottom: "26px", padding: "0 8px" }}>
        <label style={{ color: "#64748B", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "6px" }}>
          Active Workspace
        </label>
        {teams.length === 0 ? (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#64748B",
            fontStyle: "italic"
          }}>
            No Workspaces Available
          </div>
        ) : (
          <select
            value={activeTeam}
            onChange={handleWorkspaceChange}
            style={{
              width: "100%",
              background: "#090F1B",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "12.5px",
              color: "#FFF",
              fontWeight: "600",
              outline: "none",
              cursor: "pointer",
              transition: "border 0.2s",
            }}
            onFocus={(e) => e.target.style.border = "1px solid #F97316"}
            onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
          >
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                💼 {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Scrollable middle: nav + widgets */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        marginRight: "-8px",
        paddingRight: "8px",
        scrollbarWidth: "none",
      }}>

      {/* Navigation List */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          if (item.comingSoon) {
            return (
              <div
                key={item.path}
                style={{
                  padding: "11px 14px",
                  borderRadius: "10px",
                  color: "#475569",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {item.icon}
                <span>{item.name}</span>
                <span className="coming-soon-pill">Soon</span>
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Security Stats Panel ── */}
      <div style={{ marginTop: "24px", padding: "0 2px" }}>
        <div style={{
          fontSize: "9.5px", fontWeight: "800", color: "#475569",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", paddingLeft: "4px"
        }}>
          Live Security Stats
        </div>

        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          {/* Total Scans */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#10B981", boxShadow: "0 0 6px #10B981",
                animation: "sidebarPulse 2s infinite"
              }} />
              <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "600" }}>Total Scans</span>
            </div>
            <span style={{ fontSize: "12px", color: "#10B981", fontWeight: "800", fontFamily: "monospace" }}>
              {sidebarStats ? sidebarStats.totalScans : "—"}
            </span>
          </div>

          {/* Critical + High */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: "600" }}>Critical / High</span>
              <span style={{ fontSize: "11.5px", color: "#F97316", fontWeight: "800", fontFamily: "monospace" }}>
                {sidebarStats ? `${sidebarStats.critical} / ${sidebarStats.high}` : "— / —"}
              </span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: sidebarStats && sidebarStats.vulnerabilities > 0
                  ? `${Math.min(100, Math.round(((sidebarStats.critical + sidebarStats.high) / sidebarStats.vulnerabilities) * 100))}%`
                  : "0%",
                background: "linear-gradient(90deg, #F97316, #FB923C)",
                borderRadius: "4px",
                transition: "width 0.8s ease",
                boxShadow: "0 0 8px rgba(249,115,22,0.4)"
              }} />
            </div>
          </div>

          {/* Total Vulnerabilities */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: "600" }}>Vulnerabilities</span>
              <span style={{ fontSize: "11.5px", color: "#EF4444", fontWeight: "800", fontFamily: "monospace" }}>
                {sidebarStats ? sidebarStats.vulnerabilities : "—"}
              </span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: sidebarStats && sidebarStats.vulnerabilities > 0 ? "100%" : "0%",
                background: "linear-gradient(90deg, #EF4444, #F87171)",
                borderRadius: "4px",
                transition: "width 0.8s ease",
                boxShadow: "0 0 8px rgba(239,68,68,0.35)"
              }} />
            </div>
          </div>

          {/* Endpoints */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: "600" }}>Endpoints</span>
              <span style={{ fontSize: "11.5px", color: "#818CF8", fontWeight: "800", fontFamily: "monospace" }}>
                {sidebarStats ? sidebarStats.endpoints : "—"}
              </span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: sidebarStats && sidebarStats.endpoints > 0 ? `${Math.min(100, sidebarStats.endpoints * 10)}%` : "0%",
                background: "linear-gradient(90deg, #818CF8, #A78BFA)",
                borderRadius: "4px",
                transition: "width 0.8s ease",
                boxShadow: "0 0 8px rgba(129,140,248,0.35)"
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Threat Intelligence Feed ── */}
      <div style={{ marginTop: "18px", padding: "0 2px" }}>
        <div style={{
          fontSize: "9.5px", fontWeight: "800", color: "#475569",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", paddingLeft: "4px"
        }}>
          Threat Intel Feed
        </div>
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "9px",
        }}>
          {threatFeed.length > 0 ? threatFeed.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "8px", fontWeight: "900", color: item.color,
                background: `${item.color}18`,
                border: `1px solid ${item.color}40`,
                borderRadius: "4px", padding: "1px 5px",
                letterSpacing: "0.5px", minWidth: "32px", textAlign: "center",
                boxShadow: `0 0 6px ${item.color}50`
              }}>
                {item.type}
              </span>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.label}
              </span>
            </div>
          )) : (
            <div style={{ fontSize: "11px", color: "#334155", textAlign: "center", padding: "8px 0", fontStyle: "italic" }}>
              No threats detected yet
            </div>
          )}
        </div>
      </div>

      </div> {/* end scrollable middle */}

      {/* User Profile Info Footer */}
      <div
        style={{
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "18px",
            paddingLeft: "4px",
          }}
        >
          {userPhoto ? (
            <img
              src={userPhoto}
              alt="Profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                objectFit: "cover",
                border: "1.5px solid rgba(249, 115, 22, 0.4)",
                boxShadow: "0 0 8px rgba(249, 115, 22, 0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #1E293B, #0F172A)",
                border: "1.5px solid rgba(249, 115, 22, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F97316",
                fontWeight: "800",
                fontSize: "15px",
                boxShadow: "0 0 8px rgba(249, 115, 22, 0.15)",
              }}
            >
              {userName.charAt(0)}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: "#F1F5F9",
                fontWeight: "700",
                fontSize: "13.5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </div>
            <div
              style={{
                color: "#64748B",
                fontSize: "11px",
                fontWeight: "500",
                marginTop: "1px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
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
          className="logout-btn"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {/* CSS Styling Injection */}
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          padding: 11px 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14.5px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
          color: #94A3B8;
        }
        
        .sidebar-link:hover {
          color: #F8FAFC;
          background: rgba(255, 255, 255, 0.025);
          border-color: rgba(255, 255, 255, 0.06);
          padding-left: 18px;
        }

        .sidebar-link.active {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.13) 0%, rgba(249, 115, 22, 0.02) 100%);
          color: #F97316;
          border-color: rgba(249, 115, 22, 0.32);
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.08);
        }

        .sidebar-link.active:hover {
          color: #FF8A2E;
          border-color: rgba(249, 115, 22, 0.5);
          padding-left: 18px;
        }

        .coming-soon-pill {
          margin-left: auto;
          font-size: 9px;
          background: rgba(255, 255, 255, 0.035);
          color: #475569;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .logout-btn {
          width: 100%;
          height: 38px;
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #EF4444;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.22s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .logout-btn:hover {
          background: #EF4444;
          color: #FFFFFF;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.35);
          border-color: #EF4444;
        }

        @keyframes sidebarPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #10B981; }
          50% { opacity: 0.4; box-shadow: 0 0 12px #10B981; }
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;