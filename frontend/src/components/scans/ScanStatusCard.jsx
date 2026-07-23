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

  const stageDefinitions = [
    { name: "Recon", label: "Reconnaissance", scanners: ["security-header", "ssl", "server", "technology"] },
    { name: "Discovery", label: "Endpoint Discovery", scanners: ["api-inventory", "openapi"] },
    { name: "Authentication", label: "Auth Audit", scanners: ["jwt", "cookie"] },
    { name: "Authorization", label: "BOLA & CORS", scanners: ["cors"] },
    { name: "Testing", label: "Vulnerability Testing", scanners: ["rate-limit", "attack-surface"] },
    { name: "Reporting", label: "AI Threat Report", scanners: ["endpoint-risk"] },
  ];

  const totalStages = stageDefinitions.length;
  const isCompleted = scan?.status === "completed" || progress >= 100;
  const isFailed = scan?.status === "failed";
  const isRunning = (scanStatus?.status === "running" || scan?.status === "running") && progress < 100;

  const stages = stageDefinitions.map((stageDef, index) => {
    let stageStatus = "pending";

    // Priority 1: Check live scanner map if provided by socket
    if (scanStatus && scanStatus.scanners) {
      const states = stageDef.scanners.map(s => scanStatus.scanners[s] || "pending");
      if (states.every(s => s === "completed")) stageStatus = "completed";
      else if (states.some(s => s === "running")) stageStatus = "running";
      else if (states.some(s => s === "failed")) stageStatus = "failed";
    }

    // Priority 2: If scanner map wasn't specific, derive from sequential progress %
    if (stageStatus === "pending") {
      if (isCompleted) {
        stageStatus = "completed";
      } else if (isFailed) {
        const threshold = ((index + 1) / totalStages) * 100;
        stageStatus = progress >= threshold ? "completed" : (progress >= (index / totalStages) * 100 ? "failed" : "pending");
      } else if (isRunning || progress > 0) {
        const stageStart = (index / totalStages) * 100;
        const stageEnd = ((index + 1) / totalStages) * 100;

        if (progress >= stageEnd) {
          stageStatus = "completed";
        } else if (progress >= stageStart) {
          stageStatus = "running";
        } else {
          stageStatus = "pending";
        }
      } else {
        // Idle unstarted state
        if (scan && scan.status === "completed") stageStatus = "completed";
        else stageStatus = "pending";
      }
    }

    return {
      ...stageDef,
      status: stageStatus,
    };
  });

  const getStageIcon = (name, color) => {
    switch (name) {
      case "Recon":
        return <FolderSearch size={18} color={color} />;
      case "Discovery":
        return <Zap size={18} color={color} />;
      case "Authentication":
        return <KeyRound size={18} color={color} />;
      case "Authorization":
        return <Fingerprint size={18} color={color} />;
      case "Testing":
        return <ShieldCheck size={18} color={color} />;
      default:
        return <FileBadge2 size={18} color={color} />;
    }
  };

  const getStageColors = (status) => {
    if (status === "completed") {
      return {
        color: "#10B981",
        labelColor: "#059669",
        bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.05))",
        border: "1px solid rgba(16, 185, 129, 0.35)",
        iconBg: "rgba(16, 185, 129, 0.15)",
        glow: "rgba(16, 185, 129, 0.12)",
        badgeText: "✓ DONE",
        badgeBg: "rgba(16, 185, 129, 0.18)",
        badgeColor: "#34D399",
        class: "completed-stage-glow",
      };
    }
    if (status === "running") {
      return {
        color: "#F97316",
        labelColor: "#FB923C",
        bg: "linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(124, 58, 237, 0.12))",
        border: "1px solid rgba(249, 115, 22, 0.6)",
        iconBg: "rgba(249, 115, 22, 0.25)",
        glow: "rgba(249, 115, 22, 0.35)",
        badgeText: "● RUNNING",
        badgeBg: "rgba(249, 115, 22, 0.25)",
        badgeColor: "#FDBA74",
        class: "running-glow-pulse",
      };
    }
    if (status === "failed") {
      return {
        color: "#EF4444",
        labelColor: "#F87171",
        bg: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.35)",
        iconBg: "rgba(239, 68, 68, 0.15)",
        glow: "rgba(239, 68, 68, 0.15)",
        badgeText: "✕ FAILED",
        badgeBg: "rgba(239, 68, 68, 0.2)",
        badgeColor: "#FCA5A5",
        class: "",
      };
    }
    return {
      color: "#475569",
      labelColor: "#334155",
      bg: "rgba(10, 16, 28, 0.4)",
      border: "1px solid rgba(255, 255, 255, 0.04)",
      iconBg: "rgba(255, 255, 255, 0.02)",
      glow: "none",
      badgeText: "⏳ QUEUED",
      badgeBg: "rgba(255, 255, 255, 0.04)",
      badgeColor: "#64748B",
      class: "pending-stage",
    };
  };

  const status = scanStatus?.status || scan?.status || "idle";

  const activeStageItem = stages.find((s) => s.status === "running") ||
                         (stages.every((s) => s.status === "completed") ? null : stages.find((s) => s.status === "pending"));


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

          {/* Dynamic Header Badge */}
          {isCompleted ? (
            <div style={{ color: "#10B981", fontWeight: "800", fontSize: "12px", background: "rgba(16, 185, 129, 0.12)", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} color="#10B981" />
              <span>Assessment Completed</span>
            </div>
          ) : activeStageItem ? (
            <div style={{ color: "#F97316", fontWeight: "800", fontSize: "12px", background: "linear-gradient(90deg, rgba(249, 115, 22, 0.15), rgba(6, 182, 212, 0.15))", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(249, 115, 22, 0.4)", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 0 12px rgba(249, 115, 22, 0.15)" }}>
              <span className="pipeline-running-dot" />
              <span>{activeStageItem.label} {activeStageItem.status === "running" ? "Active" : "Queued"}</span>
            </div>
          ) : (
            <div style={{ color: "#94A3B8", fontWeight: "700", fontSize: "12px", background: "rgba(255, 255, 255, 0.05)", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Idle</span>
            </div>
          )}
        </div>

        {/* Sequential Step Cards + Laser Connectors */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            width: "100%",
            overflowX: "auto",
            paddingBottom: "4px"
          }}
        >
          {stages.map((stage, idx) => {
            const styles = getStageColors(stage.status);
            const isLast = idx === stages.length - 1;
            const nextStage = !isLast ? stages[idx + 1] : null;
            const isLaserActive = stage.status === "completed" || stage.status === "running";

            return (
              <React.Fragment key={stage.name}>
                <div
                  className={`pipeline-stage-card ${styles.class || ""}`}
                  style={{
                    flex: "1 1 0",
                    minWidth: "120px",
                    background: styles.bg,
                    border: styles.border,
                    boxShadow: styles.glow !== "none" ? `0 0 15px ${styles.glow}` : "none",
                    borderRadius: "14px",
                    padding: "16px 10px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: "absolute", top: "6px", right: "6px",
                    fontSize: "8.5px", fontWeight: "800",
                    padding: "2px 6px", borderRadius: "4px",
                    background: styles.badgeBg, color: styles.badgeColor,
                    letterSpacing: "0.4px"
                  }}>
                    {styles.badgeText}
                  </div>

                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      margin: "6px auto 10px",
                      background: styles.iconBg,
                      border: stage.status === "pending" ? "1px solid rgba(255,255,255,0.03)" : styles.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {getStageIcon(stage.name, stage.status === "pending" ? "#475569" : styles.color)}
                  </div>

                  <div
                    style={{
                      color: stage.status === "pending" ? "#64748B" : "#FFFFFF",
                      fontWeight: "800",
                      fontSize: "12.5px",
                    }}
                  >
                    {stage.name}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      color: styles.labelColor,
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {stage.label}
                  </div>
                </div>

                {/* Laser flow connector between cards */}
                {!isLast && (
                  <div
                    className={`pipeline-laser-connector ${isLaserActive ? "active-laser" : ""}`}
                  />
                )}
              </React.Fragment>
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
          transition: all 0.3s ease;
        }

        .pipeline-stage-card.completed-stage-glow {
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
        }

        .pipeline-stage-card.running-glow-pulse {
          animation: runningBorderPulse 1.8s ease-in-out infinite alternate;
        }

        @keyframes runningBorderPulse {
          0% {
            border-color: rgba(249, 115, 22, 0.5);
            box-shadow: 0 0 18px rgba(249, 115, 22, 0.3), inset 0 0 10px rgba(249, 115, 22, 0.15);
          }
          100% {
            border-color: rgba(6, 182, 212, 0.8);
            box-shadow: 0 0 28px rgba(6, 182, 212, 0.45), inset 0 0 15px rgba(6, 182, 212, 0.25);
          }
        }

        .pipeline-laser-connector {
          width: 16px;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .pipeline-laser-connector.active-laser {
          background: linear-gradient(90deg, #10B981, #06B6D4, #3B82F6, #10B981);
          background-size: 200% 100%;
          animation: laserEnergyFlow 1.8s linear infinite;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
        }

        @keyframes laserEnergyFlow {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

