import { Globe } from "lucide-react";

import "./latestScans.css";

export default function LatestScansTable({ scans = [] }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg,#0F172A,#020617)",
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
              borderBottom: "1px solid rgba(255,255,255,.05)",
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
                  background: "rgba(255,255,255,.05)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Globe size={18} />
              </div>

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "320px",
                  }}
                >
                  {scan.targetUrl}
                </div>

                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  {new Date(scan.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  minWidth: "42px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    scan.securityScore > 90
                      ? "rgba(34,197,94,.15)"
                      : "rgba(234,179,8,.15)",
                  color: scan.securityScore > 90 ? "#22C55E" : "#F59E0B",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "15px",
                }}
              >
                {scan.securityScore}
              </div>

              <div
                style={{
                  width: "55px",
                  textAlign: "right",
                  fontSize: "14px",
                  color:
                    scan.riskLevel === "High"
                      ? "#EF4444"
                      : scan.riskLevel === "Medium"
                        ? "#F59E0B"
                        : "#22C55E",
                  fontWeight: "600",
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
