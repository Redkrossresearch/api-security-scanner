import { Shield, Activity, AlertTriangle, CheckCircle2, Target, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function HistoryKPICards() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/scans/dashboard/summary");
        // ✅ IMPROVEMENT 2: Safe API response validation
        setSummary(res.data?.summary || {});
      } catch (err) {
        console.error(err);
        setError("Failed to load KPI data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "#94A3B8" }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "#EF4444" }}>
        {error}
      </div>
    );
  }

  const cards = [
    {
      category: "OPERATIONS",
      title: "Total Scans",
      value: summary?.totalScans || 0,
      color: "#3B82F6",
      icon: <Activity size={18} />,
      status: "Total",
      progress: 100,
    },
    {
      category: "COMPLIANCE",
      title: "Completed Scans",
      value: summary?.completedScans || 0,
      color: "#22C55E",
      icon: <CheckCircle2 size={18} />,
      status: "Successful",
      progress: summary?.totalScans
        ? Math.round((summary.completedScans / summary.totalScans) * 100)
        : 0,
    },
    {
      category: "ERRORS",
      title: "Failed Scans",
      value: summary?.failedScans || 0,
      color: "#EF4444",
      icon: <XCircle size={18} />,
      status: "Failed",
      progress: summary?.totalScans
        ? Math.round((summary.failedScans / summary.totalScans) * 100)
        : 0,
    },
    {
      category: "SECURITY",
      title: "Average Score",
      value: `${summary?.averageScore || 0}/100`,
      color: "#F97316",
      icon: <Shield size={18} />,
      status: "Security Score",
      progress: summary?.averageScore || 0,
    },
    {
      category: "SECURITY",
      title: "Critical Findings",
      value: summary?.criticalFindings || 0,
      color: "#EF4444",
      icon: <AlertTriangle size={18} />,
      status: "High Priority",
      progress: Math.min((summary?.criticalFindings || 0) * 2, 100),
    },
    {
      category: "REMEDIATION",
      title: "Remediation Rate",
      value: `${summary?.remediatedRate || 0}%`,
      color: "#10B981",
      icon: <Target size={18} />,
      status: "Remediated",
      progress: summary?.remediatedRate || 0,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
      }}
    >
      {cards.map((card) => {
        return (
          <div
            key={card.title}
            style={{
              background: "#08111F",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "22px",
              position: "relative",
              overflow: "hidden",
              transition: "transform .25s ease, box-shadow .25s ease",
            }}
          >
            {/* Background Glow */}
            <div
              style={{
                position: "absolute",
                right: "-30px",
                top: "-30px",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: `${card.color}15`,
                filter: "blur(20px)",
                pointerEvents: "none",
              }}
            />

            {/* Gradient Strip */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "3px",
                background: `linear-gradient(90deg, ${card.color}, ${card.color}40)`,
              }}
            />

            {/* Category + Icon Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <div>
                <div
                  style={{
                    color: card.color,
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "1.2px",
                    marginBottom: "6px",
                  }}
                >
                  {card.category}
                </div>
                <div
                  style={{
                    color: "#64748B",
                    fontSize: "13px",
                  }}
                >
                  {card.title}
                </div>
              </div>

              {/* Icon */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  background: `${card.color}15`,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </div>
            </div>

            {/* Value */}
            <div
              style={{
                color: "#FFFFFF",
                fontSize: "34px",
                fontWeight: "800",
                lineHeight: 1,
              }}
            >
              {card.value}
            </div>

            {/* Status Label */}
            <div
              style={{
                marginTop: "8px",
                color: card.color,
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {card.status}
            </div>

            {/* Progress Bar */}
            <div
              style={{
                marginTop: "12px",
                height: "4px",
                background: "#1E293B",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  // ✅ IMPROVEMENT 1: Safe clamp (0-100)
                  width: `${Math.min(Math.max(card.progress, 0), 100)}%`,
                  height: "100%",
                  background: card.color,
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}