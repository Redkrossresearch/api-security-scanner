// ✅ Design Tokens - Colors
export const COLORS = {
  white: "#FFFFFF",
  muted: "#94A3B8",
  critical: "#EF4444",
  warning: "#F97316",
  success: "#22C55E",
  successLight: "#4ADE80",
  yellow: "#FACC15",
  dark: "#0F172A",
  darkAlt: "#071126",
  darker: "#020617",
  darkGray: "#111827",
  textSecondary: "#64748B",
  purple: "#8B5CF6",
  purpleGradient: "#7C3AED",
  skeleton: "#1e293b",
  skeletonHighlight: "#334155",
  borderButton: "#334155",
};

// ✅ Design Tokens - RGBA Backgrounds
export const BACKGROUNDS = {
  critical: "rgba(239,68,68,.15)",
  warning: "rgba(249,115,22,.15)",
  overlay: "rgba(255,255,255,.04)",
  overlayLight: "rgba(255,255,255,.05)",
  border: "rgba(255,255,255,.08)",
};

// ✅ Design Tokens - Borders
export const BORDER = {
  default: `1px solid ${BACKGROUNDS.border}`,
  light: `1px solid ${BACKGROUNDS.overlayLight}`,
  lighter: `1px solid ${BACKGROUNDS.overlay}`,
  button: `1px solid ${COLORS.borderButton}`,
};

// ✅ Design Tokens - Radius
export const RADIUS = {
  card: "20px",
  button: "12px",
  badge: "8px",
  pill: "999px",
};

// ✅ Design Tokens - Spacing
export const SPACING = {
  xs: "8px",
  sm: "10px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  badgeX: "10px",
};

// ✅ Design Tokens - Font Sizes
export const FONT_SIZE = {
  display: "52px",
  title: "42px",
  icon: "48px",
  heading: "20px",
  body: "16px",
  md: "13px",
  small: "14px",
  xs: "12px",
};

// ✅ Design Tokens - Sizes (Heights & Widths)
export const SIZE = {
  chartCard: "340px",
  compliance: "260px",
  skeletonCard: "120px",
  skeletonButton: "48px",
  skeletonTitleWidth: "300px",
  skeletonSubtitleWidth: "400px",
  skeletonButtonWidth: "140px",
  radarChartHeight: 220, // ✅ Magic number removed
};

// ✅ Design Tokens - Chart Specific Constants
export const CHART = {
  fillOpacity: 0.35,
  polarGridStroke: "rgba(255,255,255,.12)",
  axisTick: {
    fill: COLORS.muted,
    fontSize: 11,
  },
};

// ✅ Base Styles - Reusable foundations
const cardBase = {
  border: BORDER.default,
  borderRadius: RADIUS.card,
  padding: SPACING.xl,
  color: COLORS.white,
};

const badgeBase = {
  padding: `${SPACING.xs} ${SPACING.badgeX}`,
  borderRadius: RADIUS.badge,
};

const skeletonBase = {
  borderRadius: RADIUS.card,
  border: BORDER.default,
};

// ✅ Centralized styles for Dashboard
export const styles = {
  // Layout containers
  container: {
    display: "flex",
    flexDirection: "column",
    gap: SPACING.xl,
    width: "100%",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.title,
    margin: 0,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: COLORS.muted,
    marginTop: SPACING.sm,
  },
  headerButtons: {
    display: "flex",
    gap: SPACING.sm,
  },

  // Buttons
  buttonPrimary: {
    background: COLORS.warning,
    color: COLORS.white,
    border: "none",
    padding: `${SPACING.sm} ${SPACING.lg}`,
    borderRadius: RADIUS.button,
    cursor: "pointer",
    fontWeight: "600",
    fontSize: FONT_SIZE.body,
  },
  buttonSecondary: {
    background: COLORS.darkGray,
    color: COLORS.white,
    border: BORDER.button,
    padding: `${SPACING.sm} ${SPACING.lg}`,
    borderRadius: RADIUS.button,
    cursor: "pointer",
  },

  // Grid layouts
  gridKPI: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: SPACING.lg,
    alignItems: "stretch",
  },
  gridCharts: {
    display: "grid",
    gridTemplateColumns: "2fr 1.15fr 1.15fr",
    gap: SPACING.xl,
    alignItems: "stretch",
  },
  gridTables: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.3fr 1fr",
    gap: SPACING.xl,
    alignItems: "stretch",
  },

  // Cards (derived from cardBase)
  cardDark: {
    ...cardBase,
    background: `linear-gradient(180deg, ${COLORS.dark}, ${COLORS.darker})`,
  },
  cardDarkAlt: {
    ...cardBase,
    background: `linear-gradient(180deg, ${COLORS.darkAlt}, ${COLORS.darker})`,
  },
  cardSolid: {
    ...cardBase,
    background: COLORS.dark,
  },

  // Card headers
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    margin: 0,
    fontSize: FONT_SIZE.heading,
  },
  cardLink: {
    color: COLORS.purple,
    fontSize: FONT_SIZE.small,
    cursor: "pointer",
  },

  // ✅ Heading without margin (replaces inline marginTop: 0)
  headingNoMargin: {
    margin: 0,
  },

  // Scrollable containers
  scrollContainer: {
    flex: 1,
    overflowY: "auto",
    minHeight: 0,
    paddingRight: "6px",
  },
  scrollContainerSmall: {
    flex: 1,
    overflowY: "auto",
    minHeight: 0,
    paddingRight: "4px",
  },

  // Table grid
  tableGrid: {
    display: "grid",
    gridTemplateColumns: "0.8fr 2fr 1.5fr 1fr 1fr",
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    paddingBottom: SPACING.sm,
    borderBottom: BORDER.default,
  },
  tableRow: {
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "0.8fr 2fr 1.5fr 1fr 1fr",
    padding: `${SPACING.sm} 0`,
    borderBottom: BORDER.lighter,
    alignItems: "center",
    fontSize: FONT_SIZE.md,
  },

  // Text styles
  textMuted: {
    color: COLORS.muted,
  },
  textWhite: {
    color: COLORS.white,
    fontWeight: "600",
  },

  // Badge styles (derived from badgeBase)
  badge: badgeBase,
  badgeCritical: {
    ...badgeBase,
    background: BACKGROUNDS.critical,
    color: COLORS.critical,
  },
  badgeHigh: {
    ...badgeBase,
    background: BACKGROUNDS.warning,
    color: COLORS.warning,
  },

  // Copilot card
  copilotCard: {
    ...cardBase,
    background: `linear-gradient(180deg, ${COLORS.dark}, ${COLORS.darker})`,
    height: SIZE.chartCard,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: SPACING.lg,
  },
  copilotTitle: {
    margin: 0,
    marginBottom: SPACING.md,
  },
  copilotText: {
    color: COLORS.muted,
    fontSize: FONT_SIZE.small,
    lineHeight: "1.6",
  },
  copilotItem: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.button,
    background: BACKGROUNDS.overlay,
  },
  copilotItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copilotItemTitle: {
    fontWeight: "600",
    color: COLORS.white,
  },
  copilotItemMeta: {
    marginTop: SPACING.xs,
    color: COLORS.muted,
    fontSize: FONT_SIZE.xs,
  },
  copilotButton: {
    marginTop: SPACING.lg,
    width: "100%",
    border: "none",
    borderRadius: RADIUS.button,
    padding: SPACING.md,
    fontWeight: "700",
    color: COLORS.white,
    cursor: "pointer",
    background: `linear-gradient(90deg, ${COLORS.purpleGradient}, ${COLORS.warning})`,
  },
  copilotLink: {
    textAlign: "center",
    marginTop: SPACING.sm,
    color: COLORS.purple,
    fontSize: FONT_SIZE.md,
    cursor: "pointer",
    fontWeight: "500",
  },

  // Empty states
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: COLORS.success,
    fontSize: FONT_SIZE.body,
    textAlign: "center",
  },
  emptyStateIcon: {
    fontSize: FONT_SIZE.icon,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    color: COLORS.muted,
    fontSize: FONT_SIZE.small,
    marginTop: SPACING.xs,
  },
  emptyStateSimple: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: "40px",
  },

  // Compliance section
  complianceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: SPACING.lg,
    alignItems: "center",
    height: SIZE.compliance,
  },
  complianceScore: {
    color: COLORS.success,
    fontSize: FONT_SIZE.display,
    fontWeight: "700",
  },
  complianceLabel: {
    color: COLORS.muted,
    marginBottom: SPACING.lg,
  },
  complianceBar: {
    height: SPACING.xs,
    background: BACKGROUNDS.border,
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    marginBottom: SPACING.lg,
  },
  complianceBarFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${COLORS.success}, ${COLORS.successLight})`,
  },
  complianceStats: {
    display: "flex",
    flexDirection: "column",
    gap: SPACING.sm,
  },
  complianceStatRow: {
    display: "flex",
    justifyContent: "space-between",
  },

  // Loading skeleton (derived from skeletonBase)
  skeletonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: SPACING.xl,
    width: "100%",
    padding: SPACING.lg,
  },
  skeletonHeader: {
    display: "flex",
    justifyContent: "space-between",
  },
  skeletonTitle: {
    width: SIZE.skeletonTitleWidth,
    height: FONT_SIZE.title,
    background: `linear-gradient(90deg, ${COLORS.skeleton} 25%, ${COLORS.skeletonHighlight} 50%, ${COLORS.skeleton} 75%)`,
    borderRadius: RADIUS.badge,
    animation: "pulse 2s infinite",
  },
  skeletonSubtitle: {
    width: SIZE.skeletonSubtitleWidth,
    height: SPACING.lg,
    background: COLORS.skeleton,
    borderRadius: RADIUS.badge,
    marginTop: SPACING.sm,
  },
  skeletonButton: {
    width: SIZE.skeletonButtonWidth,
    height: SIZE.skeletonButton,
    background: COLORS.skeleton,
    borderRadius: RADIUS.button,
  },
  skeletonCard: {
    ...skeletonBase,
    height: SIZE.skeletonCard,
    background: `linear-gradient(180deg, ${COLORS.dark}, ${COLORS.darker})`,
  },
  skeletonChart: {
    ...skeletonBase,
    height: SIZE.chartCard,
    background: COLORS.dark,
  },

  // Error state
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
    gap: SPACING.lg,
  },
  errorTitle: {
    color: COLORS.white,
    margin: 0,
  },
  errorText: {
    color: COLORS.muted,
  },
};