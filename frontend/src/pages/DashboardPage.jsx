import ScanTrendChart from "../components/dashboard/ScanTrendChart";
import SeverityChart from "../components/dashboard/SeverityChart";
import LatestScansTable from "../components/dashboard/LatestScansTable";
import StatCard from "../components/dashboard/StatCard";
import { useEffect, useState } from "react";
import api from "../services/api";
import { getVulnerability } from "../services/vulnerabilityService";
import VulnerabilityPanel from "../components/dashboard/VulnerabilityPanel";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

import { ShieldCheck, AlertTriangle, Activity, Globe } from "lucide-react";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState("7D");
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);

  const handleVulnerabilityClick = async (id) => {
    try {
      const data = await getVulnerability(id);

      console.log(data);

      setSelectedVulnerability(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/stats");

        setDashboardData(res.data.stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  if (!dashboardData) {
    return <h2>Failed to load dashboard</h2>;
  }

  const complianceData = [
    { subject: "A1", value: 85 },
    { subject: "A2", value: 90 },
    { subject: "A3", value: 82 },
    { subject: "A4", value: 88 },
    { subject: "A5", value: 76 },
    { subject: "A6", value: 80 },
    { subject: "A7", value: 72 },
    { subject: "A8", value: 84 },
    { subject: "A9", value: 79 },
    { subject: "A10", value: 86 },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <div>
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "42px",
              margin: 0,
              fontWeight: "700",
            }}
          >
            Good Evening, Atharv 👋
          </h1>

          <p
            style={{
              color: "#94A3B8",
              marginTop: "10px",
            }}
          >
            Here's what's happening with your API security posture today.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            style={{
              background: "#111827",
              color: "#FFFFFF",
              border: "1px solid #334155",
              padding: "12px 20px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Export Report
          </button>

          <button
            style={{
              background: "#F97316",
              color: "#FFFFFF",
              border: "none",
              padding: "12px 20px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            + New Scan
          </button>
        </div>
      </div>

      {/* KPI Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Security Score"
          value={dashboardData.averageScore}
          trend="+4% this week"
        />

        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Protected APIs"
          value={dashboardData.apiInventory?.totalApis || 0}
          trend="+8 this week"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Critical Issues"
          value={dashboardData.severityDistribution?.critical || 0}
          trend="-1 this week"
          trendColor="#EF4444"
        />

        <StatCard
          icon={<Activity size={20} />}
          title="Total Scans"
          value={dashboardData.totalScans}
          trend="+12% this month"
        />

        <StatCard
          icon={<Globe size={20} />}
          title="Endpoints Monitored"
          value={dashboardData.totalScans}
          trend="+24 this month"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Threat Exposure"
          value={dashboardData.riskMetrics?.total || 0}
          trend={`${(dashboardData.riskMetrics?.critical || 0) + (dashboardData.riskMetrics?.high || 0)} High/Critical`}
          trendColor="#EF4444"
        />
      </div>

      {/* Charts */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.15fr 1.15fr",
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        <ScanTrendChart
          data={dashboardData.securityTrend}
          range={trendRange}
          setRange={setTrendRange}
        />

        <SeverityChart data={dashboardData.severityDistribution} />

        <div
          style={{
            background: "linear-gradient(180deg,#0F172A,#020617)",
            height: "340px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "20px",
            padding: "20px",
            color: "white",
          }}
        >
          <h3
            style={{
              margin: 0,
              marginBottom: "16px",
            }}
          >
            AI Security Copilot
          </h3>

          <p
            style={{
              color: "#94A3B8",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            {dashboardData.criticalFindings?.filter(
              (item) => item.severity?.toLowerCase() === "critical",
            ).length || 0}
            critical vulnerabilities detected that need immediate attention.
          </p>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
              paddingRight: "4px",
            }}
          >
            {dashboardData.criticalFindings?.map((item, index) => (
              <div
                key={index}
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    {item.title}
                  </div>

                  <span
                    style={{
                      background:
                        item.severity?.toLowerCase() === "critical"
                          ? "rgba(239,68,68,.15)"
                          : "rgba(249,115,22,.15)",
                      color:
                        item.severity?.toLowerCase() === "critical"
                          ? "#EF4444"
                          : "#F97316",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  >
                    {item.severity}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    color: "#94A3B8",
                    fontSize: "12px",
                  }}
                >
                  Confidence: {95 - index * 3}%
                </div>
              </div>
            ))}
          </div>

          <button
            style={{
              marginTop: "20px",
              width: "100%",
              border: "none",
              borderRadius: "12px",
              padding: "16px",
              fontWeight: "700",
              color: "white",
              cursor: "pointer",
              background: "linear-gradient(90deg,#7C3AED,#F97316)",
            }}
          >
            Analyze Now
          </button>
          <div
            style={{
              textAlign: "center",
              marginTop: "14px",
              color: "#8B5CF6",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            View All Recommendations →
          </div>
        </div>
      </div>

      {/* Tables & Findings */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1.3fr 1fr",
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        <LatestScansTable scans={dashboardData.latestScans} />

        <div
          style={{
            background: "linear-gradient(180deg,#071126,#020617)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "20px",
            height: "340px",
            padding: "24px",
            color: "#FFFFFF",

            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0 }}>Critical Findings</h3>

            <span
              style={{
                color: "#8B5CF6",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              View All
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.8fr 2fr 1.5fr 1fr 1fr",
              fontSize: "12px",
              color: "#64748B",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <div>SEVERITY</div>
            <div>FINDING</div>
            <div>API</div>
            <div>STATUS</div>
            <div>TIME</div>
          </div>

          <div
            className="latest-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
              paddingRight: "6px",
            }}
          >
            {dashboardData.criticalFindings.map((item, index) => (
              <div
                key={index}
                onClick={() => handleVulnerabilityClick(item._id)}
                style={{
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "0.8fr 2fr 1.5fr 1fr 1fr",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(255,255,255,.04)",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      background:
                        item.severity === "Critical"
                          ? "rgba(239,68,68,.15)"
                          : "rgba(249,115,22,.15)",
                      color:
                        item.severity === "Critical" ? "#EF4444" : "#F97316",
                    }}
                  >
                    {item.severity}
                  </span>
                </div>

                <div
                  onClick={() => handleVulnerabilityClick(item._id)}
                  style={{
                    cursor: "pointer",
                    color: "#FFFFFF",
                    fontWeight: "600",
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    color: "#94A3B8",
                  }}
                >
                  N/A
                </div>

                <div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      background: "rgba(239,68,68,.15)",
                      color: "#EF4444",
                    }}
                  >
                    Open
                  </span>
                </div>

                <div
                  style={{
                    color: "#94A3B8",
                  }}
                >
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "20px",
            height: "340px",
            padding: "24px",
            color: "#FFFFFF",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Compliance Overview</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              alignItems: "center",
              height: "260px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#22C55E",
                  fontSize: "52px",
                  fontWeight: "700",
                }}
              >
                {dashboardData.complianceOverview?.score || 0}%
              </div>

              <div
                style={{
                  color: "#94A3B8",
                  marginBottom: "20px",
                }}
              >
                Compliant
              </div>

              <div
                style={{
                  height: "8px",
                  background: "rgba(255,255,255,.08)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: `${dashboardData.complianceOverview?.score || 0}%`,
                    height: "100%",
                    background: "linear-gradient(90deg,#22C55E,#4ADE80)",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#22C55E" }}>● Passed</span>
                  <span>{dashboardData.complianceOverview?.passed || 0}</span>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#FACC15" }}>● Warning</span>
                  <span>{dashboardData.complianceOverview?.warning || 0}</span>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#EF4444" }}>● Failed</span>
                  <span>{dashboardData.complianceOverview?.failed || 0}</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={complianceData}>
                <PolarGrid stroke="rgba(255,255,255,.12)" />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 11,
                  }}
                />

                <Radar
                  dataKey="value"
                  stroke="#22C55E"
                  fill="#22C55E"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <VulnerabilityPanel
        vulnerability={selectedVulnerability}
        onClose={() => setSelectedVulnerability(null)}
      />
    </div>
  );
}
