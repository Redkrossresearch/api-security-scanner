import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { styles, COLORS, RADIUS, BACKGROUNDS } from "../../styles/dashboardStyles";
import { getSeverityBadgeStyle } from "../../utils/dashboardUtils";

function AISecurityCopilot({
  criticalCount,
  criticalFindings,
}) {
  const navigate = useNavigate();

  return (
    <div style={styles.copilotCard}>
      <h3 style={styles.copilotTitle}>AI Security Copilot</h3>

      <p style={styles.copilotText}>
        {criticalCount}{" "}
        critical vulnerabilities detected that need immediate attention.
      </p>

      <div style={styles.scrollContainerSmall}>
        {criticalFindings.length > 0 ? (
          criticalFindings.map((item) => (
            <div key={item._id} style={styles.copilotItem}>
              <div style={styles.copilotItemHeader}>
                <div style={styles.copilotItemTitle}>
                  {item.title}
                </div>

                {/* ✅ Task 1: Replaced inline styles with helper function */}
                <span style={getSeverityBadgeStyle(item.severity, COLORS, BACKGROUNDS, RADIUS)}>
                  {item.severity}
                </span>
              </div>

              <div style={styles.copilotItemMeta}>
                Confidence Unknown
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>🎉</div>

            <div>No critical vulnerabilities</div>

            <div style={styles.emptyStateText}>
              Your system is secure!
            </div>
          </div>
        )}
      </div>

<button
  style={styles.copilotButton}
  onClick={() => navigate("/vulnerabilities")}
>
  Analyze Now
</button>

      <div
        onClick={() => navigate("/vulnerabilities")}
        style={{
          ...styles.copilotLink,
          cursor: "pointer",
        }}
      >
        View All Recommendations →
      </div>
    </div>
  );
}

export default memo(AISecurityCopilot);