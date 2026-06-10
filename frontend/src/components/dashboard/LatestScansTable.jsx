import { Globe } from "lucide-react";

import "./latestScans.css";

export default function LatestScansTable({
  scans = [],
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg,#0F172A,#020617)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "20px",
        padding: "24px",
        color: "white",
        height: "340px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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
            fontSize: "20px",
          }}
        >
          Recent Scans
        </h3>

        <span
          style={{
            color: "#8B5CF6",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          View All
        </span>
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
  {scans.map((scan, index) => (

        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 0",
            borderBottom:
              "1px solid rgba(255,255,255,.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,.05)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Globe size={18} />
            </div>

            <div>
              <div>
                {scan.targetUrl}
              </div>

              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {new Date(
                  scan.createdAt
                ).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background:
                  scan.securityScore > 90
                    ? "rgba(34,197,94,.15)"
                    : "rgba(234,179,8,.15)",
                color:
                  scan.securityScore > 90
                    ? "#22C55E"
                    : "#EAB308",
                padding: "6px 10px",
                borderRadius: "8px",
                fontWeight: "700",
              }}
            >
              {scan.securityScore}
            </div>

            <div
              style={{
                color: "#94A3B8",
                width: "60px",
              }}
            >
              {scan.riskLevel}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
}