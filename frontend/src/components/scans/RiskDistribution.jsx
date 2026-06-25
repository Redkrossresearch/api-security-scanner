import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Target,
  AlertTriangle,
  Zap,
  Brain,
  TrendingDown,
} from "lucide-react";

// ✅ STEP 1: Added imports
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function RiskDistribution() {
  // ✅ STEP 2: Added state variables
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ STEP 3: Replaced hardcoded data with API fetch
  useEffect(() => {
    const fetchRiskDistribution = async () => {
      try {
        const res = await api.get(
          "/scans/dashboard/risk-distribution"
        );

        setDistribution(res.data.distribution);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskDistribution();
  }, []);

  const data = [
    {
      name: "Critical",
      value: distribution?.critical || 0,
      color: "#EF4444",
    },
    {
      name: "High",
      value: distribution?.high || 0,
      color: "#F97316",
    },
    {
      name: "Medium",
      value: distribution?.medium || 0,
      color: "#FACC15",
    },
    {
      name: "Low",
      value: distribution?.low || 0,
      color: "#22C55E",
    },
  ];

  // ✅ STEP 4: Added loading check above total calculation
  if (loading) {
    return <div>Loading...</div>;
  }

  const total = data.reduce((a, b) => a + b.value, 0);

  const owaspData = [
    { name: "Broken Access Control", value: 34, color: "#EF4444" },
    { name: "Auth Failures", value: 27, color: "#F97316" },
    { name: "Security Misconfig", value: 21, color: "#FACC15" },
    { name: "Others", value: 18, color: "#64748B" },
  ];

  const attackSurfaceData = [
    { name: "APIs", value: 84, color: "#3B82F6" },
    { name: "Web Apps", value: 67, color: "#A855F7" },
    { name: "Authentication", value: 92, color: "#22C55E" },
    { name: "Admin Panels", value: 71, color: "#FACC15" },
  ];

  const priorityQueue = [
    { priority: "P1", label: "Critical Findings", value: 18, color: "#EF4444", bg: "rgba(239,68,68,.12)" },
    { priority: "P2", label: "Auth Weakness", value: 11, color: "#F97316", bg: "rgba(249,115,22,.12)" },
    { priority: "P3", label: "Security Misconfig", value: 8, color: "#FACC15", bg: "rgba(250,204,21,.12)" },
  ];

  const momentumData = [
    { name: "Critical", value: "↓ 25%", color: "#22C55E" },
    { name: "High", value: "↓ 18%", color: "#22C55E" },
    { name: "Medium", value: "↓ 11%", color: "#22C55E" },
    { name: "Low", value: "↑ 7%", color: "#EF4444" },
  ];

  const projection = {
    current: 7.2,
    thirtyDays: 6.8,
    sixtyDays: 6.1,
    ninetyDays: 5.4,
    confidence: 94,
  };

  const reductionPercent = (((projection.current - projection.ninetyDays) / projection.current) * 100).toFixed(0);

  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
        height: "auto",
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "20px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ShieldAlert size={20} color="#EF4444" />
            Risk Distribution
          </h3>
          <div
            style={{
              marginTop: "6px",
              color: "#94A3B8",
              fontSize: "13px",
            }}
          >
            Historical vulnerability severity breakdown
          </div>
        </div>

        {/* Risk Score Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,.15) 0%, rgba(249,115,22,.05) 100%)",
            border: "1px solid rgba(249,115,22,.3)",
            borderRadius: "12px",
            padding: "10px 16px",
            textAlign: "center",
            minWidth: "90px",
          }}
        >
          <div
            style={{
              color: "#F97316",
              fontSize: "22px",
              fontWeight: "800",
              lineHeight: 1,
              textShadow: "0 0 10px rgba(249,115,22,.4)",
            }}
          >
            7.2
          </div>
          <div
            style={{
              color: "#64748B",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              marginTop: "4px",
            }}
          >
            RISK SCORE
          </div>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "10px",
              marginTop: "2px",
              fontWeight: "600",
            }}
          >
            / 10.0
          </div>
        </div>
      </div>

      {/* ─── KPI Row ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Security Score", value: "72", sub: "/ 100", color: "#22C55E", Icon: Shield },
          { label: "Critical Open", value: "18", sub: "Findings", color: "#EF4444", Icon: AlertTriangle },
          { label: "Remediation", value: "84%", sub: "Rate", color: "#3B82F6", Icon: CheckCircle2 },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: "14px",
              padding: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: "14px", right: "14px", opacity: 0.2 }}>
              <item.Icon color={item.color} size={20} />
            </div>
            <div
              style={{
                color: "#64748B",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                marginTop: "8px",
                color: item.color,
                fontWeight: "800",
                fontSize: "24px",
                lineHeight: 1,
                display: "flex",
                alignItems: "baseline",
                gap: "4px",
              }}
            >
              {item.value}
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                {item.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Hero Section: Donut + Quick Stats ──────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "24px",
          alignItems: "stretch",
        }}
      >
        {/* Donut Chart */}
        <div
          style={{
            flex: 1,
            height: "260px",
            position: "relative",
            background: "#0B1220",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,.06)",
            padding: "10px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={data}
                innerRadius={80}
                outerRadius={110}
                dataKey="value"
                stroke="#08111F"
                strokeWidth={4}
                paddingAngle={2}
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} filter="url(#donutGlow)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(11, 18, 32, 0.98)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: "12px",
                  color: "#FFFFFF",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
                itemStyle={{ color: "#FFFFFF" }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ color: "#FFFFFF", fontSize: "36px", fontWeight: "800", lineHeight: 1 }}>
              {total}
            </div>
            <div style={{ color: "#64748B", fontSize: "12px", fontWeight: "600", marginTop: "4px" }}>
              Total Findings
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.map((item) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div
                key={item.name}
                style={{
                  background: "#0B1220",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: item.color,
                      boxShadow: `0 0 8px ${item.color}`,
                    }}
                  />
                  <span style={{ color: "#CBD5E1", fontSize: "14px", fontWeight: "600" }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: item.color, fontWeight: "800", fontSize: "18px" }}>
                    {item.value}
                  </span>
                  <span style={{ color: "#64748B", fontSize: "12px", marginLeft: "6px" }}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "12px",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#94A3B8", fontSize: "13px", fontWeight: "600" }}>
              Total Findings
            </span>
            <span style={{ color: "#FFFFFF", fontWeight: "800", fontSize: "22px" }}>
              {total}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Breakdown Grid ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {data.map((item) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          return (
            <div
              key={item.name}
              style={{
                background: "#0B1220",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: item.color,
                      boxShadow: `0 0 8px ${item.color}`,
                    }}
                  />
                  <span style={{ color: "#CBD5E1", fontSize: "12px", fontWeight: "600" }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: item.color, fontWeight: "800", fontSize: "14px" }}>
                    {item.value}
                  </span>
                  <span style={{ color: "#64748B", fontSize: "10px", marginLeft: "6px" }}>
                    {percentage}%
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: "6px",
                  background: "rgba(255,255,255,.05)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: item.color,
                    borderRadius: "3px",
                    boxShadow: `0 0 6px ${item.color}60`,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Risk Exposure Card ─────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(239,68,68,.12) 0%, rgba(239,68,68,.04) 100%)",
          border: "1px solid rgba(239,68,68,.3)",
          borderRadius: "14px",
          padding: "18px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              color: "#EF4444",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShieldAlert size={12} /> RISK EXPOSURE ANALYSIS
          </div>
          <div style={{ color: "#E2E8F0", fontSize: "13px", lineHeight: "1.5" }}>
            Critical + High = <span style={{ color: "#EF4444", fontWeight: "800" }}>
              {(distribution?.critical || 0) + (distribution?.high || 0)} Findings
            </span>
          </div>
          <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "2px" }}>
            {total > 0 
              ? `${((((distribution?.critical || 0) + (distribution?.high || 0)) / total) * 100).toFixed(1)}% of total vulnerabilities require immediate remediation.`
              : "No data available."
            }
          </div>
        </div>
        <div
          style={{
            background: "rgba(239,68,68,.2)",
            border: "1px solid rgba(239,68,68,.4)",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#EF4444", fontSize: "18px", fontWeight: "800", lineHeight: 1 }}>
            {total > 0 
              ? `${Math.round((((distribution?.critical || 0) + (distribution?.high || 0)) / total) * 100)}%`
              : "0%"
            }
          </div>
          <div style={{ color: "#94A3B8", fontSize: "9px", fontWeight: "600", marginTop: "2px" }}>
            HIGH RISK
          </div>
        </div>
      </div>

      {/* ─── Row 1: OWASP + Priority Queue ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* OWASP Mapping */}
        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#FACC15",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Target size={12} /> TOP RISK CATEGORIES (OWASP)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {owaspData.map((item) => (
              <div key={item.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#94A3B8", fontSize: "11px" }}>{item.name}</span>
                  <span style={{ color: item.color, fontSize: "11px", fontWeight: "700" }}>
                    {item.value}%
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    background: "rgba(255,255,255,.05)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${item.value}%`,
                      height: "100%",
                      background: item.color,
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remediation Priority Queue */}
        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#EF4444",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Zap size={12} /> REMEDIATION PRIORITY QUEUE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {priorityQueue.map((item) => (
              <div
                key={item.priority}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: item.bg,
                  border: `1px solid ${item.color}30`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      color: item.color,
                      fontSize: "11px",
                      fontWeight: "800",
                      background: "rgba(0,0,0,.3)",
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {item.priority}
                  </span>
                  <span style={{ color: "#E2E8F0", fontSize: "13px", fontWeight: "600" }}>
                    {item.label}
                  </span>
                </div>
                <span style={{ color: item.color, fontSize: "14px", fontWeight: "800" }}>
                  {item.value}{" "}
                  <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "600" }}>Open</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Row 2: Attack Surface + Severity Momentum ──────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Attack Surface Coverage */}
        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#3B82F6",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Shield size={12} /> ATTACK SURFACE COVERAGE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {attackSurfaceData.map((item) => (
              <div key={item.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: "600" }}>
                    {item.name}
                  </span>
                  <span style={{ color: item.color, fontSize: "12px", fontWeight: "800" }}>
                    {item.value}%
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "rgba(255,255,255,.05)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${item.value}%`,
                      height: "100%",
                      background: item.color,
                      borderRadius: "3px",
                      boxShadow: `0 0 6px ${item.color}60`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Momentum */}
        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                color: "#22C55E",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Activity size={12} /> SEVERITY MOMENTUM
            </div>
            <div
              style={{
                background: "rgba(34,197,94,.12)",
                border: "1px solid rgba(34,197,94,.3)",
                borderRadius: "8px",
                padding: "6px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ color: "#22C55E", fontSize: "14px", fontWeight: "800", lineHeight: 1 }}>
                82
              </div>
              <div style={{ color: "#94A3B8", fontSize: "8px", fontWeight: "700", marginTop: "2px" }}>
                VELOCITY
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {momentumData.map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(255,255,255,.03)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                }}
              >
                <span style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "600" }}>
                  {item.name}
                </span>
                <span style={{ color: item.color, fontSize: "13px", fontWeight: "800" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── AI Risk Projection (NEW) ───────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,.08) 0%, rgba(168,85,247,.05) 100%)",
          border: "1px solid rgba(59,130,246,.25)",
          borderRadius: "14px",
          padding: "22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Glow */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "150px",
            height: "150px",
            background: "radial-gradient(circle, rgba(168,85,247,.15) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "30%",
            width: "120px",
            height: "120px",
            background: "radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                background: "rgba(168,85,247,.2)",
                padding: "8px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(168,85,247,.25)",
              }}
            >
              <Brain size={18} color="#A855F7" />
            </div>
            <div>
              <div
                style={{
                  color: "#A855F7",
                  fontSize: "10px",
                  fontWeight: "800",
                  letterSpacing: "1px",
                }}
              >
                AI RISK PROJECTION
              </div>
              <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "2px" }}>
                Predictive analysis based on remediation velocity
              </div>
            </div>
          </div>

          {/* Confidence Badge */}
          <div
            style={{
              background: "rgba(168,85,247,.15)",
              border: "1px solid rgba(168,85,247,.35)",
              borderRadius: "10px",
              padding: "10px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#94A3B8", fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px" }}>
              CONFIDENCE
            </div>
            <div style={{ color: "#A855F7", fontSize: "22px", fontWeight: "800", lineHeight: 1, marginTop: "4px" }}>
              {projection.confidence}%
            </div>
          </div>
        </div>

        {/* Projection Timeline */}
        <div style={{ position: "relative", padding: "0 20px" }}>
          {/* Connecting Line */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "40px",
              right: "40px",
              height: "2px",
              background: "linear-gradient(90deg, rgba(239,68,68,.3) 0%, rgba(249,115,22,.3) 33%, rgba(250,204,21,.3) 66%, rgba(34,197,94,.3) 100%)",
              zIndex: 0,
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", position: "relative", zIndex: 1 }}>
            {/* Current */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#08111F",
                  border: "2px solid #EF4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(239,68,68,.4)",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#EF4444", fontSize: "15px", fontWeight: "800" }}>
                  {projection.current}
                </span>
              </div>
              <div style={{ color: "#94A3B8", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px" }}>
                CURRENT
              </div>
              <div style={{ color: "#64748B", fontSize: "9px", marginTop: "2px" }}>Risk Score</div>
            </div>

            {/* 30 Days */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#08111F",
                  border: "2px solid #F97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(249,115,22,.35)",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#F97316", fontSize: "15px", fontWeight: "800" }}>
                  {projection.thirtyDays}
                </span>
              </div>
              <div style={{ color: "#94A3B8", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px" }}>
                30 DAYS
              </div>
              <div style={{ color: "#64748B", fontSize: "9px", marginTop: "2px" }}>Projected</div>
            </div>

            {/* 60 Days */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#08111F",
                  border: "2px solid #FACC15",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(250,204,21,.35)",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#FACC15", fontSize: "15px", fontWeight: "800" }}>
                  {projection.sixtyDays}
                </span>
              </div>
              <div style={{ color: "#94A3B8", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px" }}>
                60 DAYS
              </div>
              <div style={{ color: "#64748B", fontSize: "9px", marginTop: "2px" }}>Projected</div>
            </div>

            {/* 90 Days */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#08111F",
                  border: "2px solid #22C55E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(34,197,94,.4)",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#22C55E", fontSize: "15px", fontWeight: "800" }}>
                  {projection.ninetyDays}
                </span>
              </div>
              <div style={{ color: "#94A3B8", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px" }}>
                90 DAYS
              </div>
              <div style={{ color: "#64748B", fontSize: "9px", marginTop: "2px" }}>Projected</div>
            </div>
          </div>
        </div>

        {/* Expected Reduction Footer */}
        <div
          style={{
            marginTop: "20px",
            background: "rgba(34,197,94,.1)",
            border: "1px solid rgba(34,197,94,.25)",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TrendingDown size={18} color="#22C55E" />
            <div>
              <div style={{ color: "#94A3B8", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px" }}>
                EXPECTED REDUCTION
              </div>
              <div style={{ color: "#E2E8F0", fontSize: "12px", marginTop: "2px" }}>
                If current remediation velocity is maintained
              </div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(34,197,94,.2)",
              border: "1px solid rgba(34,197,94,.4)",
              borderRadius: "8px",
              padding: "8px 14px",
            }}
          >
            <span style={{ color: "#22C55E", fontSize: "16px", fontWeight: "800" }}>▼ {reductionPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}