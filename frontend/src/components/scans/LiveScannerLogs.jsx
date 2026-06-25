import {
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Terminal,
} from "lucide-react";

export default function LiveScannerLogs() {
  const logs = [
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

  const getColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "#EF4444";
      case "WARN":
        return "#F59E0B";
      default:
        return "#22C55E";
    }
  };

  const getIcon = (level) => {
    switch (level) {
      case "CRITICAL":
        return <ShieldAlert size={14} />;
      case "WARN":
        return <AlertTriangle size={14} />;
      default:
        return <CheckCircle2 size={14} />;
    }
  };

  return (
    <div
      style={{
        background: "#071126",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "20px",
        height: "560px",
        display: "flex",
        flexDirection: "column",
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
              fontSize: "20px",
            }}
          >
            Live Scanner Logs
          </h3>

          <div
            style={{
              color: "#64748B",
              fontSize: "12px",
              marginTop: "4px",
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
            padding: "6px 10px",
            borderRadius: "999px",
            background: "rgba(34,197,94,.12)",
            border: "1px solid rgba(34,197,94,.25)",
            color: "#22C55E",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          <Activity size={14} />
          LIVE
        </div>
      </div>

      {/* Stats */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        {[
          { label: "127 Endpoints", color: "#3B82F6" },
          { label: "1 Critical", color: "#EF4444" },
          { label: "Running", color: "#22C55E" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: `${item.color}15`,
              border: `1px solid ${item.color}40`,
              color: item.color,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Terminal */}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#050B16",
          border: "1px solid rgba(255,255,255,.05)",
          borderRadius: "16px",
          padding: "14px",
          fontFamily: "JetBrains Mono, monospace",
          boxShadow: "inset 0 0 25px rgba(0,0,0,.35)",
        }}
      >
        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
              fontSize: "12px",
            }}
          >
            <span
              style={{
                color: "#64748B",
                minWidth: "65px",
              }}
            >
              {log.time}
            </span>

            <span
              style={{
                color: getColor(log.level),
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minWidth: "95px",
                fontWeight: 700,
              }}
            >
              {getIcon(log.level)}
              {log.level}
            </span>

            <span
              style={{
                color: "#CBD5E1",
              }}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}

      <div
        style={{
          marginTop: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#64748B",
          fontSize: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Terminal size={13} />
          Events Processed: 1,248
        </div>

        <span>Last Update: 2 sec ago</span>
      </div>
    </div>
  );
}
