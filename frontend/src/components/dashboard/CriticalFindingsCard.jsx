import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { styles, SIZE } from "../../styles/dashboardStyles";
import { formatDate, getStatus } from "../../utils/dashboardUtils";

function CriticalFindingsCard({
  selectedScan,
  selectedSeverity,
  setSelectedSeverity,
  handleVulnerabilityClick,
}) {
  const navigate = useNavigate();

  // Findings Source
  const findings = selectedScan?.vulnerabilities || [];

  // Centralized Severity Colors (Single Source of Truth)
  const severityConfig = {
    all: {
      chip: "#8B5CF6",
      badge: {
        bg: "rgba(139,92,246,.15)",
        text: "#8B5CF6",
        border: "1px solid rgba(139,92,246,.3)",
        glow: "0 0 8px rgba(139,92,246,.4)",
      },
    },
    critical: {
      chip: "#EF4444",
      badge: {
        bg: "rgba(239,68,68,.15)",
        text: "#EF4444",
        border: "1px solid rgba(239,68,68,.3)",
        glow: "0 0 8px rgba(239,68,68,.4)",
      },
    },
    high: {
      chip: "#F97316",
      badge: {
        bg: "rgba(249,115,22,.15)",
        text: "#F97316",
        border: "1px solid rgba(249,115,22,.3)",
        glow: "0 0 8px rgba(249,115,22,.4)",
      },
    },
    medium: {
      chip: "#F59E0B",
      badge: {
        bg: "rgba(234,179,8,.15)",
        text: "#F59E0B",
        border: "1px solid rgba(234,179,8,.3)",
        glow: "0 0 8px rgba(234,179,8,.4)",
      },
    },
    low: {
      chip: "#22C55E",
      badge: {
        bg: "rgba(34,197,94,.15)",
        text: "#22C55E",
        border: "1px solid rgba(34,197,94,.3)",
        glow: "0 0 8px rgba(34,197,94,.4)",
      },
    },
    info: {
      chip: "#3B82F6",
      badge: {
        bg: "rgba(59,130,246,.15)",
        text: "#3B82F6",
        border: "1px solid rgba(59,130,246,.3)",
        glow: "0 0 8px rgba(59,130,246,.4)",
      },
    },
  };

  // Severity Labels
  const severityLabels = {
    all: "All",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    info: "Info",
  };

  // Severity Levels
  const severityLevels = [
    "all",
    "critical",
    "high",
    "medium",
    "low",
    "info",
  ];

  // Counts Calculation
  const counts = severityLevels.reduce((acc, severity) => {
    if (severity === "all") {
      acc.all = findings.length;
    } else {
      acc[severity] = findings.filter(
        (v) => v.severity?.toLowerCase() === severity
      ).length;
    }
    return acc;
  }, {});

  // Filtered Findings
  const filteredFindings =
    selectedSeverity === "all"
      ? findings
      : findings.filter(
          (v) => v.severity?.toLowerCase() === selectedSeverity
        );

  // Helper to get severity badge style
  const getSeverityBadgeStyle = (severity) => {
    const sev = severity?.toLowerCase() || "info";
    return severityConfig[sev]?.badge || severityConfig.info.badge;
  };

  // Truncate URL
  const truncateUrl = (url, maxLength = 30) => {
    if (!url) return "N/A";
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <div
      style={{
        background: "radial-gradient(130px circle at top left, rgba(245, 158, 11, 0.1), transparent 90%), linear-gradient(180deg, #090d16 0%, #030712 100%)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        height: "360px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          paddingBottom: "10px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "20px"
        }}
      >
        <div>
          <h3 
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: "800",
              background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Security Findings
          </h3>
          <div
            style={{
              color: "#64748B",
              fontSize: 10,
              fontWeight: "600",
              marginTop: 2,
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={selectedScan?.targetUrl}
          >
            Target: {truncateUrl(selectedScan?.targetUrl, 25)}
          </div>
        </div>
        
        <span
          style={{
            color: "#8B5CF6",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
          onClick={() => navigate("/vulnerabilities")}
        >
          View All
        </span>
      </div>

      {/* Severity Chips */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
          paddingLeft: 20, 
          paddingRight: 20,
        }}
      >
        {severityLevels.map((level) => {
          const isActive = selectedSeverity === level;
          const chipColor = severityConfig[level]?.chip || "#8B5CF6";

          return (
            <button
              key={level}
              onClick={() => setSelectedSeverity(level)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                background: isActive ? chipColor : "rgba(255,255,255,.06)",
                color: "white",
                fontWeight: isActive ? "600" : "400",
                boxShadow: isActive ? `0 0 12px ${chipColor}60` : "none",
                transition: "all 0.2s ease",
              }}
            >
              {severityLabels[level]} ({counts[level]})
            </button>
          );
        })}
      </div>

      <div style={{ ...styles.tableGrid, paddingLeft: "20px", paddingRight: "20px" }}>
        <div>SEVERITY</div>
        <div>FINDING</div>
        <div>TARGET</div>
        <div>STATUS</div>
        <div>TIME</div>
      </div>

      <div className="latest-scroll" style={{ ...styles.scrollContainer, paddingBottom: "20px" }}>
        {filteredFindings.length > 0 ? (
          filteredFindings.map((item) => {
            const badgeStyle = getSeverityBadgeStyle(item.severity);
            const status = item.status?.toLowerCase();
            
            return (
              <div
                key={item._id}
                onClick={() => handleVulnerabilityClick(item)}
                style={{
                  ...styles.tableRow,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: badgeStyle.bg,
                      color: badgeStyle.text,
                      border: badgeStyle.border,
                      boxShadow: badgeStyle.glow,
                      textTransform: "capitalize",
                    }}
                  >
                    {item.severity}
                  </span>
                </div>

                <div
                  style={{
                    ...styles.textWhite,
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={item.title}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    ...styles.textMuted,
                    fontSize: "12px",
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={selectedScan?.targetUrl}
                >
                  {truncateUrl(selectedScan?.targetUrl, 15)}
                </div>

                <div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: status === "open" 
                        ? "rgba(239,68,68,.15)" 
                        : "rgba(34,197,94,.15)",
                      color: status === "open" 
                        ? "#EF4444" 
                        : "#22C55E",
                      border: status === "open"
                        ? "1px solid rgba(239,68,68,.3)"
                        : "1px solid rgba(34,197,94,.3)",
                      boxShadow: status === "open"
                        ? "0 0 8px rgba(239,68,68,.4)"
                        : "0 0 8px rgba(34,197,94,.4)",
                    }}
                  >
                    {getStatus(item)}
                  </span>
                </div>

                <div
                  style={{
                    ...styles.textMuted,
                    fontSize: "12px",
                  }}
                >
                  {formatDate(item.detectedAt || item.createdAt)}
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              ...styles.emptyStateSimple,
              color: "#64748B",
              fontStyle: "italic",
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            {findings.length === 0
              ? "No vulnerabilities found in this scan"
              : "No findings for this severity"}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CriticalFindingsCard);