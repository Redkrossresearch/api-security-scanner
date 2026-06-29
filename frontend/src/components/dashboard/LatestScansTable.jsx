import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import "./latestScans.css";

export default function LatestScansTable({
  scans = [],
  page,
  setPage,
  pagination,
}) {
  const navigate = useNavigate();

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

  const getScoreColor = (score) => {
    if (score >= 90) return { bg: "rgba(34,197,94,.15)", text: "#22C55E" };
    if (score >= 70) return { bg: "rgba(234,179,8,.15)", text: "#F59E0B" };
    if (score >= 40) return { bg: "rgba(249,115,22,.15)", text: "#F97316" };
    return { bg: "rgba(239,68,68,.15)", text: "#EF4444" };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: {
        bg: "rgba(34,197,94,.15)",
        color: "#22C55E",
        label: "Completed",
      },
      running: {
        bg: "rgba(234,179,8,.15)",
        color: "#F59E0B",
        label: "Running",
      },
      failed: {
        bg: "rgba(239,68,68,.15)",
        color: "#EF4444",
        label: "Failed",
      },
    };
    return statusMap[status?.toLowerCase()] || statusMap.completed;
  };

  const handleScanClick = (scan) => {
    navigate("/history", {
      state: {
        scanId: scan._id,
        scan: scan,
      },
    });
  };

  const handleKeyDown = (e, scan) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleScanClick(scan);
    }
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
        {scans.map((scan) => {
          const statusBadge = getStatusBadge(scan.status);

          return (
            <div
              key={scan._id}
              role="button"
              tabIndex={0}
              onClick={() => handleScanClick(scan)}
              onKeyDown={(e) => handleKeyDown(e, scan)}
              title={`View details for ${scan.targetUrl}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 12px",
                borderBottom: "1px solid rgba(255,255,255,.05)",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,.03)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,.03)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px rgba(139,92,246,.3)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 0,
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
                    flexShrink: 0,
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
                    title={scan.targetUrl}
                  >
                    {scan.targetUrl}
                  </div>

                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: "13px",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>
                      {formatDistanceToNow(new Date(scan.createdAt), {
                        addSuffix: true,
                      })}
                    </span>

                    <span
                      style={{
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {statusBadge.label}
                    </span>
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
          );
        })}
      </div>

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