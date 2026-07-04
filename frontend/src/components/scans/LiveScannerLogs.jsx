import {
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Terminal,
} from "lucide-react";

export default function LiveScannerLogs({ scan, scanStatus }) {
  let logs = [];

  if (scanStatus && scanStatus.scanners) {
    logs.push({
      level: "INFO",
      time: "INIT",
      message: `Initializing security scan for ${scan?.targetUrl || "target"}...`,
    });
    Object.entries(scanStatus.scanners).forEach(([name, status]) => {
      if (status === "running") {
        logs.push({
          level: "WARN",
          time: "ACTIVE",
          message: `Scanner [${name}] is currently executing...`,
        });
      } else if (status === "completed") {
        logs.push({
          level: "INFO",
          time: "DONE",
          message: `Scanner [${name}] completed successfully.`,
        });
      } else if (status === "failed") {
        logs.push({
          level: "CRITICAL",
          time: "FAIL",
          message: `Scanner [${name}] failed.`,
        });
      }
    });
  } else if (scan && scan.status === "completed") {
    logs = [
      {
        level: "INFO",
        time: "COMPLETED",
        message: "Scan pipeline successfully finished all 12 modules.",
      },
      {
        level: "INFO",
        time: "SUMMARY",
        message: `Identified ${scan.totalFindings} vulnerabilities in total.`,
      },
      {
        level: "INFO",
        time: "SUMMARY",
        message: `Critical Count: ${scan.criticalCount} | High Count: ${scan.highCount}`,
      },
      {
        level: "INFO",
        time: "REPORT",
        message: "PDF Security Report compiled and generated.",
      },
    ];
  } else {
    logs = [
      {
        level: "INFO",
        time: "14:21:04",
        message: "Initializing API security scan",
      },
      {
        level: "INFO",
        time: "14:21:08",
        message: "OpenAPI specification detected",
      },
      {
        level: "INFO",
        time: "14:21:11",
        message: "127 endpoints discovered",
      },
      {
        level: "WARN",
        time: "14:21:16",
        message: "Swagger UI publicly accessible",
      },
      {
        level: "INFO",
        time: "14:21:19",
        message: "Authentication testing started",
      },
      {
        level: "CRITICAL",
        time: "14:21:24",
        message: "Potential BOLA vulnerability identified",
      },
      {
        level: "INFO",
        time: "14:21:30",
        message: "Authorization fuzzing in progress",
      },
      {
        level: "INFO",
        time: "14:21:36",
        message: "Security assessment running",
      },
    ];
  }

  const getColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "#EF4444";
      case "WARN":
        return "#F59E0B";
      default:
        return "#10B981";
    }
  };

  const getIcon = (level) => {
    switch (level) {
      case "CRITICAL":
        return <ShieldAlert size={12} />;
      case "WARN":
        return <AlertTriangle size={12} />;
      default:
        return <CheckCircle2 size={12} />;
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #070D1A 0%, #03070E 100%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "22px",
        padding: "22px",
        height: "560px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: "900",
              letterSpacing: "0.5px",
            }}
          >
            Live Scanner Logs
          </h3>

          <div
            style={{
              color: "#64748B",
              fontSize: "12px",
              marginTop: "4px",
              fontWeight: "500",
            }}
          >
            Real-time API security assessment activity
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px",
            borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#10B981",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.8px",
            boxShadow: "0 0 10px rgba(16, 185, 129, 0.15)",
          }}
        >
          <Activity size={12} className="pulse-activity-icon" />
          LIVE
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        {[
          { label: "127 Endpoints", color: "#3B82F6", glow: "rgba(59, 130, 246, 0.15)" },
          { label: "1 Critical", color: "#EF4444", glow: "rgba(239, 68, 68, 0.15)" },
          { label: "Running", color: "#10B981", glow: "rgba(16, 185, 129, 0.15)" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: "5px 12px",
              borderRadius: "999px",
              background: item.glow,
              border: `1px solid ${item.color}45`,
              color: item.color,
              fontSize: "10.5px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: `0 0 8px ${item.glow}`,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Terminal Display */}
      <div
        className="terminal-crt-container"
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#02050B",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          borderRadius: "14px",
          padding: "16px",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          boxShadow: "inset 0 0 35px rgba(0,0,0,0.85)",
          position: "relative",
        }}
      >
        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              marginBottom: "10px",
              fontSize: "12.5px",
              lineHeight: "1.5",
            }}
          >
            <span
              style={{
                color: "#475569",
                minWidth: "65px",
                fontWeight: "600",
              }}
            >
              {log.time}
            </span>

            <span
              style={{
                color: getColor(log.level),
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                minWidth: "90px",
                fontWeight: "800",
                fontSize: "11.5px",
              }}
            >
              {getIcon(log.level)}
              {log.level}
            </span>

            <span
              style={{
                color: "#E2E8F0",
                fontWeight: "500",
                wordBreak: "break-all",
              }}
            >
              {log.message}
            </span>
          </div>
        ))}
        {/* Terminal Blinking Cursor */}
        <div style={{ display: "inline-block", width: "7px", height: "13px", background: "#10B981", animation: "blinkCursor 1.1s step-end infinite", marginLeft: "2px" }} />
      </div>

      {/* Footer info row */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#64748B",
          fontSize: "11.5px",
          fontWeight: "600",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Terminal size={12} color="#F97316" />
          Events Processed: 1,248
        </div>

        <span>Last Update: 2 sec ago</span>
      </div>

      <style>{`
        .terminal-crt-container::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 10;
          background-size: 100% 3px, 6px 100%;
          pointer-events: none;
          opacity: 0.45;
        }

        @keyframes blinkCursor {
          from, to { background-color: transparent }
          50% { background-color: #10B981; box-shadow: 0 0 8px #10B981; }
        }

        .terminal-crt-container::-webkit-scrollbar {
          width: 4px;
        }

        .terminal-crt-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .terminal-crt-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 99px;
        }

        .terminal-crt-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
}
