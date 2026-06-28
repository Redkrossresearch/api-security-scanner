// ✅ Utility functions for Dashboard components

export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const getSeverityStyle = (severity, styles) => {
  return severity?.toLowerCase() === "critical"
    ? styles.badgeCritical
    : styles.badgeHigh;
};

export const getApiName = (item) => {
  return item.apiName || item.targetUrl || "N/A";
};

export const getStatus = (item) => {
  return item.status || "Open";
};

// ✅ Helper for severity badge inline styles (prevents object recreation on every render)
export const getSeverityBadgeStyle = (severity, COLORS, BACKGROUNDS, RADIUS) => ({
  background:
    severity?.toLowerCase() === "critical"
      ? BACKGROUNDS.critical
      : BACKGROUNDS.warning,
  color:
    severity?.toLowerCase() === "critical"
      ? COLORS.critical
      : COLORS.warning,
  padding: "4px 8px",
  borderRadius: RADIUS.badge,
  fontSize: "11px",
});