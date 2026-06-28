import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { styles, SIZE } from "../../styles/dashboardStyles";
import {
  formatDate,
  getSeverityStyle,
  getApiName,
  getStatus,
} from "../../utils/dashboardUtils";

function CriticalFindingsCard({
  criticalFindings,
  handleVulnerabilityClick,
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        ...styles.cardDarkAlt,
        height: SIZE.chartCard,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Critical Findings</h3>
        <span
          style={{
            ...styles.cardLink,
            cursor: "pointer",
          }}
          onClick={() => navigate("/vulnerabilities")}
        >
          View All
        </span>
      </div>

      <div style={styles.tableGrid}>
        <div>SEVERITY</div>
        <div>FINDING</div>
        <div>API</div>
        <div>STATUS</div>
        <div>TIME</div>
      </div>

      <div className="latest-scroll" style={styles.scrollContainer}>
        {criticalFindings.length > 0 ? (
          criticalFindings.map((item) => (
            <div
              key={item._id}
              onClick={() => handleVulnerabilityClick(item._id)}
              style={styles.tableRow}
            >
              <div>
                <span style={getSeverityStyle(item.severity, styles)}>
                  {item.severity}
                </span>
              </div>

              <div style={styles.textWhite}>{item.title}</div>

              <div style={styles.textMuted}>{getApiName(item)}</div>

              <div>
                <span style={styles.badgeCritical}>{getStatus(item)}</span>
              </div>

              <div style={styles.textMuted}>{formatDate(item.createdAt)}</div>
            </div>
          ))
        ) : (
          <div style={styles.emptyStateSimple}>No critical findings found.</div>
        )}
      </div>
    </div>
  );
}

export default memo(CriticalFindingsCard);