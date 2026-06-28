import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./latestScans.css";

export default function LatestScansTable({
  scans = [],
  page,
  setPage,
  pagination,
}) {
  const navigate = useNavigate();

  // ✅ Issue 4 Fix: Empty state handling
  if (scans.length === 0) {
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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "#94A3B8",
            fontSize: "15px",
          }}
        >
          No scans available.
        </div>
      </div>
    );
  }

  // ✅ Issue 3 Fix: Security score color ranges
  const getScoreColor = (score) => {
    if (score >= 90) return { bg: "rgba(34,197,94,.15)", text: "#22C55E" };
    if (score >= 70) return { bg: "rgba(234,179,8,.15)", text: "#F59E0B" };
    if (score >= 40) return { bg: "rgba(249,115,22,.15)", text: "#F97316" };
    return { bg: "rgba(239,68,68,.15)", text: "#EF4444" };
  };

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

        {/* ✅ Sprint 1.2: View All navigation added */}
        <span
          onClick={() => navigate("/history")}
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
        className="latest-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          paddingRight: "6px",
        }}
      >
        {scans.map((scan) => (
          <div
            // ✅ Issue 1 Fix: key={index} se key={scan._id}
            key={scan._id}
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
                  // ✅ Issue 3 Fix: Score ranges ke basis par color
                  background: getScoreColor(scan.securityScore).bg,
                  color: getScoreColor(scan.securityScore).text,
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
                  // ✅ Issue 2 Fix: Critical risk level ka color add kiya
                  color:
                    scan.riskLevel === "Critical"
                      ? "#DC2626"
                      : scan.riskLevel === "High"
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

      {/* ✅ Sprint 3.4.5: Pagination Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "15px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          paddingTop: "12px",
        }}
      >
        <button
          disabled={!pagination?.hasPrevious}
          onClick={() => setPage(page - 1)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            cursor: pagination?.hasPrevious ? "pointer" : "not-allowed",
            opacity: pagination?.hasPrevious ? 1 : 0.5,
          }}
        >
          Previous
        </button>

        <span
          style={{
            color: "#CBD5E1",
            fontSize: "14px",
          }}
        >
          Page {pagination?.page || 1} of {pagination?.totalPages || 1}
        </span>

        <button
          disabled={!pagination?.hasNext}
          onClick={() => setPage(page + 1)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            cursor: pagination?.hasNext ? "pointer" : "not-allowed",
            opacity: pagination?.hasNext ? 1 : 0.5,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}