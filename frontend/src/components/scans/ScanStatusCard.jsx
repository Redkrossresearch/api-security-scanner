import React from "react";
import {
  Activity,
  Clock3,
  CalendarDays,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function ScanStatusCard() {
  const progress = 67;

  const stats = [
    {
      icon: <Clock3 size={18} />,
      label: "Duration",
      value: "12m 35s",
    },
    {
      icon: <CalendarDays size={18} />,
      label: "Started At",
      value: "Jun 14, 2026 · 02:30 PM",
    },
    {
      icon: <Activity size={18} />,
      label: "Estimated",
      value: "18m 45s",
    },
    {
      icon: <FileText size={18} />,
      label: "Scan ID",
      value: "SCAN-2026-001",
    },
  ];

  const stages = [
    { name: "Recon", status: "completed" },
    { name: "Discovery", status: "completed" },
    { name: "Authentication", status: "running" },
    { name: "Authorization", status: "pending" },
    { name: "Testing", status: "pending" },
    { name: "Reporting", status: "pending" },
  ];

  const getColor = (status) => {
    if (status === "completed") return "#22C55E";
    if (status === "running") return "#F97316";
    return "#334155";
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg,#08111F,#050B16)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "28px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            Scan Execution Status
          </h2>

          <div
            style={{
              color: "#94A3B8",
              marginTop: "8px",
              fontSize: "14px",
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
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(34,197,94,.15)",
                color: "#22C55E",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              ● RUNNING
            </div>

            <div
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(59,130,246,.15)",
                color: "#3B82F6",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              127 ENDPOINTS
            </div>

            <div
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(239,68,68,.15)",
                color: "#EF4444",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              1 CRITICAL
            </div>
          </div>
        </div>

        {/* PROGRESS RING */}
        <div
          style={{
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            background: `conic-gradient(#22C55E ${progress}%, rgba(255,255,255,.08) ${progress}%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px rgba(34,197,94,.25)",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "#08111F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            {progress}%
          </div>
        </div>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {stats.map((item) => (
          <div
            key={item.label}
            style={{
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: "18px",
              padding: "18px",
            }}
          >
            <div
              style={{
                color: "#3B82F6",
                marginBottom: "10px",
              }}
            >
              {item.icon}
            </div>

            <div
              style={{
                color: "#64748B",
                fontSize: "12px",
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                color: "#fff",
                marginTop: "6px",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* PIPELINE */}
      <div
        style={{
          background: "#0B1220",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#fff",
            }}
          >
            Security Assessment Pipeline
          </h3>

          <div
            style={{
              color: "#F97316",
              fontWeight: 700,
            }}
          >
            Authentication Running
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: "16px",
          }}
        >
          {stages.map((stage) => (
            <div
              key={stage.name}
              style={{
                background:
                  stage.status === "running"
                    ? "rgba(249,115,22,.12)"
                    : "#08111F",
                border: `1px solid ${getColor(stage.status)}40`,
                borderRadius: "16px",
                padding: "18px",
                textAlign: "center",
                boxShadow:
                  stage.status === "running"
                    ? "0 0 20px rgba(249,115,22,.15)"
                    : "none",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  margin: "0 auto 12px",
                  background: getColor(stage.status),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={22} color="#fff" />
              </div>

              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                {stage.name}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  color: getColor(stage.status),
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {stage.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
