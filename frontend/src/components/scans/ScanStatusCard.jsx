import React from "react";
import {
  Activity,
  Clock3,
  CalendarDays,
  FileText,
  ShieldCheck,
  Zap,
  Fingerprint,
  FolderSearch,
  KeyRound,
  FileBadge2,
} from "lucide-react";

export default function ScanStatusCard({ scan, scanStatus }) {
  const progress = scanStatus
    ? scanStatus.progress
    : scan
    ? (scan.status === "completed" ? 100 : 0)
    : 67;

  const startedAtString = scan?.startedAt
    ? new Date(scan.startedAt).toLocaleString()
    : "Jun 14, 2026 · 02:30 PM";

  const durationString = scan?.duration
    ? `${Math.floor(scan.duration / 60)}m ${scan.duration % 60}s`
    : scanStatus
    ? "Running..."
    : "12m 35s";

  const scanIdString = scan?.scanId || "SCAN-2026-001";

  const stats = [
    {
      icon: <Clock3 size={16} />,
      label: "Duration",
      value: durationString,
      accent: "#3B82F6",
    },
    {
      icon: <CalendarDays size={16} />,
      label: "Started At",
      value: startedAtString,
      accent: "#10B981",
    },
    {
      icon: <Activity size={16} />,
      label: "Estimated",
      value: scanStatus ? "1m 30s" : "18m 45s",
      accent: "#F97316",
    },
    {
      icon: <FileText size={16} />,
      label: "Scan ID",
      value: scanIdString,
      accent: "#A855F7",
    },
  ];

  const getStageStatus = (scannersList) => {
    if (!scanStatus || !scanStatus.scanners) {
      if (scan && scan.status === "completed") return "completed";
      if (scan && scan.status === "failed") return "failed";
      return "pending";
    }
    const states = scannersList.map(s => scanStatus.scanners[s] || "pending");
    if (states.every(s => s === "completed")) return "completed";
    if (states.some(s => s === "running")) return "running";
    if (states.some(s => s === "failed")) return "failed";
    return "pending";
  };

  const getStageIcon = (name, color) => {
    switch (name) {
      case "Recon":
        return <FolderSearch size={20} color={color} />;
      case "Discovery":
        return <Zap size={20} color={color} />;
      case "Authentication":
        return <KeyRound size={20} color={color} />;
      case "Authorization":
        return <Fingerprint size={20} color={color} />;
      case "Testing":
        return <ShieldCheck size={20} color={color} />;
      default:
        return <FileBadge2 size={20} color={color} />;
    }
  };

  const stages = [
    {
      name: "Recon",
      status: scanStatus ? getStageStatus(["security-header", "ssl", "server", "technology"]) : "completed"
    },
    {
      name: "Discovery",
      status: scanStatus ? getStageStatus(["api-inventory", "openapi"]) : "completed"
    },
    {
      name: "Authentication",
      status: scanStatus ? getStageStatus(["jwt", "cookie"]) : "running"
    },
    {
      name: "Authorization",
      status: scanStatus ? getStageStatus(["cors"]) : "pending"
    },
    {
      name: "Testing",
      status: scanStatus ? getStageStatus(["rate-limit", "attack-surface"]) : "pending"
    },
    {
      name: "Reporting",
      status: scanStatus ? getStageStatus(["endpoint-risk"]) : "pending"
    },
  ];

  const getStageColors = (status) => {
    if (status === "completed") {
      return {
        color: "#10B981",
        bg: "rgba(16, 185, 129, 0.08)",
        border: "1px solid rgba(16, 185, 129, 0.25)",
        glow: "rgba(16, 185, 129, 0.08)",
      };
    }
    if (status === "running") {
      return {
        color: "#F97316",
        bg: "rgba(249, 115, 22, 0.1)",
        border: "1px solid rgba(249, 115, 22, 0.35)",
        glow: "rgba(249, 115, 22, 0.15)",
        class: "running-glow-pulse",
      };
    }
    return {
      color: "#475569",
      bg: "rgba(1, 2, 5, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.03)",
      glow: "none",
    };
  };

  const status = scanStatus?.status || scan?.status || "idle";

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #070D1A 0%, #03070E 100%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "22px",
        padding: "26px",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "23px",
              fontWeight: "900",
              letterSpacing: "0.5px",
            }}
          >
            Scan Execution Status
          </h2>

          <div
            style={{
              color: "#64748B",
              marginTop: "5px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            Running active API security assessment
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                background:
                  status === "completed"
                    ? "rgba(16,185,129,.12)"
                    : status === "failed"
                    ? "rgba(239,68,68,.12)"
                    : "rgba(249,115,22,.12)",
                color:
                  status === "completed"
                    ? "#10B981"
                    : status === "failed"
                    ? "#EF4444"
                    : "#F97316",
                fontWeight: "800",
                fontSize: "11px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                border: `1px solid ${
                  status === "completed"
                    ? "#10B98135"
                    : status === "failed"
                    ? "#EF444435"
                    : "#F9731635"
                }`,
              }}
            >
              ● {status}
            </div>

            <div
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                background: "rgba(59,130,246,.12)",
                color: "#3B82F6",
                fontWeight: "800",
                fontSize: "11px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                border: "1px solid rgba(59,130,246,.25)",
              }}
            >
              {scan ? `${scan.totalFindings} FINDINGS` : "127 ENDPOINTS"}
            </div>

            <div
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                background: "rgba(239,68,68,.12)",
                color: "#EF4444",
                fontWeight: "800",
                fontSize: "11px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                border: "1px solid rgba(239,68,68,.25)",
              }}
            >
              {scan ? `${scan.criticalCount} CRITICAL` : "1 CRITICAL"}
            </div>
          </div>
        </div>

        {/* PROGRESS RING */}
        <div className="progress-ring-outer">
          <div
            className="progress-ring-conic"
            style={{
              background: `conic-gradient(#10B981 ${progress}%, rgba(255,255,255,.05) ${progress}%)`,
            }}
          >
            <div className="progress-ring-inner">
              <span className="progress-value-label">{progress}%</span>
              <span className="progress-status-sub">COMPLETED</span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {stats.map((item) => (
          <div key={item.label} className="stats-metric-box">
            <div
              style={{
                color: item.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: `${item.accent}12`,
                border: `1px solid ${item.accent}25`,
                marginBottom: "8px",
              }}
            >
              {item.icon}
            </div>

            <div
              style={{
                color: "#64748B",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                color: "#FFFFFF",
                marginTop: "4px",
                fontWeight: "800",
                fontSize: "13.5px",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* PIPELINE SECTION */}
      <div
        style={{
          background: "rgba(1, 2, 5, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          borderRadius: "18px",
          padding: "22px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "900",
              letterSpacing: "0.5px",
            }}
          >
            Security Assessment Pipeline
          </h3>

          <div
            style={{
              color: "#F97316",
              fontWeight: "800",
              fontSize: "12px",
              background: "rgba(249, 115, 22, 0.1)",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid rgba(249, 115, 22, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span className="pipeline-running-dot" />
            Authentication Running
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          {stages.map((stage) => {
            const styles = getStageColors(stage.status);
            return (
              <div
                key={stage.name}
                className={`pipeline-stage-card ${styles.class || ""}`}
                style={{
                  background: styles.bg,
                  border: styles.border,
                  boxShadow: styles.glow !== "none" ? `0 0 15px ${styles.glow}` : "none",
                  borderRadius: "14px",
                  padding: "16px 12px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    margin: "0 auto 12px",
                    background: stage.status === "pending" ? "rgba(255,255,255,0.015)" : styles.bg,
                    border: stage.status === "pending" ? "1px solid rgba(255,255,255,0.03)" : styles.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getStageIcon(stage.name, stage.status === "pending" ? "#475569" : styles.color)}
                </div>

                <div
                  style={{
                    color: stage.status === "pending" ? "#475569" : "#FFFFFF",
                    fontWeight: "800",
                    fontSize: "12.5px",
                  }}
                >
                  {stage.name}
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    color: styles.color,
                    fontSize: "10px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {stage.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Styled CRT/High-Tech CSS classes */}
      <style>{`
        .progress-ring-outer {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 1px solid rgba(16, 185, 129, 0.15);
          padding: 4px;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.08);
        }

        .progress-ring-conic {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-ring-inner {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: #040810;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
        }

        .progress-value-label {
          color: #FFFFFF;
          font-size: 20px;
          font-weight: 900;
          line-height: 1.1;
        }

        .progress-status-sub {
          color: #64748B;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        .stats-metric-box {
          background: rgba(3, 6, 14, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 14px;
          padding: 14px;
          transition: all 0.22s ease;
        }

        .stats-metric-box:hover {
          background: rgba(3, 6, 14, 0.6);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 0 15px rgba(255,255,255,0.01);
        }

        .pipeline-running-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #F97316;
          box-shadow: 0 0 8px #F97316;
          animation: pulseDot 1.4s infinite ease-in-out;
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.4; }
        }

        .pipeline-stage-card {
          transition: all 0.25s ease;
        }

        .pipeline-stage-card.running-glow-pulse {
          animation: runningBorderPulse 2s infinite ease-in-out;
        }

        @keyframes runningBorderPulse {
          0%, 100% { border-color: rgba(249, 115, 22, 0.25); box-shadow: 0 0 12px rgba(249, 115, 22, 0.08); }
          50% { border-color: rgba(249, 115, 22, 0.5); box-shadow: 0 0 20px rgba(249, 115, 22, 0.22); }
        }
      `}</style>
    </div>
  );
}
