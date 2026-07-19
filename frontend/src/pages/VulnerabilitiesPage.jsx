import { useState, useEffect } from "react";
import { 
  getVulnerabilities, 
  getVulnerabilityIntelligence, 
  updateVulnerabilityStatus 
} from "../services/vulnerabilityService";
import VulnerabilityPanel from "../components/dashboard/VulnerabilityPanel";
import FeatureGuide from "../components/common/FeatureGuide";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { 
  Shield, 
  Zap, 
  Filter, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  Brain,
  Sliders,
  Check,
  Eye,
  FileSpreadsheet
} from "lucide-react";
import toast from "react-hot-toast";

// Design Token Colors
const COLORS = {
  white: "#FFFFFF",
  muted: "#94A3B8",
  critical: "#EF4444",
  warning: "#F97316",
  success: "#22C55E",
  yellow: "#FACC15",
  dark: "#0F172A",
  darkAlt: "#071126",
  darkGray: "#090d16",
  textSecondary: "#64748B",
  purple: "#8B5CF6",
  purpleGradient: "#7C3AED",
  border: "rgba(255,255,255,.08)",
  background: "#030712"
};

const styles = {
  container: {
    position: "relative",
    padding: "24px",
    background: COLORS.background,
    minHeight: "100%",
    color: COLORS.white,
    fontFamily: "Inter, sans-serif",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    background: "rgba(34,197,94,.1)",
    color: COLORS.success,
    border: "1px solid rgba(34,197,94,.2)",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: COLORS.success,
  },
  headerSubtitle: {
    fontSize: "13px",
    color: COLORS.muted,
    marginTop: "6px",
    fontWeight: "500",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  aiButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid rgba(139,92,246,.25)",
    background: "linear-gradient(90deg, rgba(124,58,237,.15), rgba(99,102,241,.15))",
    color: "#C084FC",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  timeButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    background: "#111827",
    border: `1px solid ${COLORS.border}`,
    color: "#E2E8F0",
    cursor: "pointer",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  kpiCard: {
    background: COLORS.darkGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "120px",
  },
  kpiTitle: {
    fontSize: "10px",
    fontWeight: "700",
    color: COLORS.muted,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
  },
  kpiBodyRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: "8px",
  },
  kpiCount: {
    fontSize: "32px",
    fontWeight: "800",
  },
  kpiDiff: {
    fontSize: "12px",
    fontWeight: "700",
  },
  kpiFooter: {
    fontSize: "10px",
    color: COLORS.muted,
    marginTop: "8px",
  },
  scoreCard: {
    background: COLORS.darkGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "8px",
  },
  scoreDialContainer: {
    position: "relative",
    width: "64px",
    height: "64px",
  },
  scoreInfo: {
    display: "flex",
    flexDirection: "column",
  },
  scoreLabel: {
    fontSize: "16px",
    fontWeight: "800",
    color: COLORS.critical,
  },
  scoreSub: {
    fontSize: "10px",
    color: COLORS.muted,
  },
  filterBar: {
    background: COLORS.darkGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  filterRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  filterGroups: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px",
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
  },
  filterLabel: {
    fontSize: "9px",
    fontWeight: "700",
    color: COLORS.muted,
    marginBottom: "4px",
    marginLeft: "4px",
  },
  select: {
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "6px 12px",
    fontSize: "12px",
    color: "#D1D5DB",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    width: "14px",
    height: "14px",
    color: COLORS.muted,
  },
  searchInput: {
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "6px 12px 6px 34px",
    fontSize: "12px",
    color: "#E5E7EB",
    outline: "none",
    width: "220px",
  },
  advancedBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    border: `1px solid ${COLORS.border}`,
    background: "#0c1220",
    color: "#D1D5DB",
    cursor: "pointer",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  dashboardCard: {
    background: COLORS.darkGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "20px",
    minHeight: "360px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#E2E8F0",
    margin: 0,
  },
  cardSub: {
    fontSize: "11px",
    color: COLORS.muted,
    marginTop: "4px",
  },
  matrixContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    marginTop: "16px",
  },
  matrixRow: {
    display: "grid",
    gridTemplateColumns: "50px repeat(3, 1fr)",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },
  matrixLabelY: {
    fontSize: "11px",
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "right",
    paddingRight: "8px",
  },
  matrixCell: {
    border: `1px solid rgba(255,255,255,0.06)`,
    borderRadius: "12px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  matrixBadge: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
  },
  matrixLabelsX: {
    display: "grid",
    gridTemplateColumns: "50px repeat(3, 1fr)",
    gap: "8px",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: COLORS.muted,
    marginTop: "4px",
  },
  topFindingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
    marginTop: "16px",
    overflowY: "auto",
  },
  topFindingItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: "12px",
    background: "rgba(3,7,18,0.4)",
    border: `1px solid rgba(255,255,255,0.04)`,
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  topFindingLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  topFindingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: COLORS.critical,
    marginTop: "6px",
  },
  topFindingCve: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#F87171",
  },
  topFindingTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#E2E8F0",
    marginTop: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "160px",
  },
  topFindingSub: {
    fontSize: "9px",
    color: COLORS.muted,
    marginTop: "2px",
    fontWeight: "600",
  },
  topFindingBadge: {
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "700",
    background: "rgba(239,68,68,.1)",
    color: "#F87171",
    border: "1px solid rgba(239,68,68,.2)",
  },
  secondRowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  trendCard: {
    background: COLORS.darkGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "20px",
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  predictionCard: {
    background: COLORS.darkGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "20px",
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  predSpeedoWrapper: {
    position: "relative",
    width: "96px",
    height: "48px",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: "16px",
  },
  predSpeedoArc: {
    position: "absolute",
    width: "96px",
    height: "96px",
    borderRadius: "50%",
    border: "8px solid #1e293b",
    borderTopColor: COLORS.critical,
    borderRightColor: COLORS.critical,
    transform: "rotate(45deg)",
  },
  predSpeedoLabel: {
    position: "absolute",
    fontSize: "18px",
    fontWeight: "900",
    color: COLORS.critical,
    bottom: 0,
  },
  predStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    width: "100%",
    marginTop: "20px",
    textAlign: "center",
  },
  predStatTitle: {
    fontSize: "9px",
    fontWeight: "700",
    color: COLORS.muted,
  },
  predStatVal: {
    fontSize: "18px",
    fontWeight: "900",
    marginTop: "2px",
  },
  progressList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    marginTop: "16px",
  },
  progressRow: {
    display: "flex",
    flexDirection: "column",
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  progressBarBg: {
    width: "100%",
    height: "8px",
    background: "#1e293b",
    borderRadius: "999px",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "999px",
  },
  roadmapBtn: {
    width: "100%",
    background: "#111827",
    border: `1px solid ${COLORS.border}`,
    color: "#E2E8F0",
    padding: "8px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "750",
    cursor: "pointer",
    marginTop: "16px",
  },
  insightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  insightCard: {
    background: COLORS.darkGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  insightHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  insightTag: {
    fontSize: "9px",
    fontWeight: "800",
    color: "#C084FC",
    letterSpacing: "1px",
  },
  insightBody: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#E2E8F0",
    marginTop: "10px",
    lineHeight: "1.6",
  },
  insightLink: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#C084FC",
    marginTop: "12px",
    cursor: "pointer",
  },
  insightMiniTitle: {
    fontSize: "9px",
    fontWeight: "700",
    color: COLORS.muted,
  },
  insightMiniVal: {
    fontSize: "15px",
    fontWeight: "800",
    marginTop: "8px",
  },
  insightMiniLabel: {
    fontSize: "10px",
    color: COLORS.muted,
    marginTop: "6px",
  },
  tableContainer: {
    background: COLORS.darkGray,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "20px",
  },
  tableHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  tableTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#E2E8F0",
    margin: 0,
  },
  tableSub: {
    fontSize: "12px",
    color: COLORS.muted,
    marginTop: "4px",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    border: `1px solid ${COLORS.border}`,
    background: "#0c1220",
    color: "#D1D5DB",
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "13px",
  },
  th: {
    borderBottom: `1px solid ${COLORS.border}`,
    padding: "12px 10px",
    color: COLORS.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: "10px",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid rgba(255,255,255,.04)",
  },
  vulnBtn: {
    background: "transparent",
    border: "none",
    color: "#F1F5F9",
    fontWeight: "600",
    fontSize: "13px",
    textAlign: "left",
    cursor: "pointer",
    outline: "none",
  },
  vulnCwe: {
    fontSize: "10px",
    color: COLORS.muted,
    marginTop: "2px",
  },
  endpointCell: {
    color: COLORS.muted,
    fontFamily: "monospace",
  },
  actionBtn: {
    background: "transparent",
    border: "none",
    color: COLORS.muted,
    cursor: "pointer",
    padding: "4px",
  },
  paginationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: "16px",
    fontSize: "12px",
    color: COLORS.muted,
  },
  paginationBtns: {
    display: "flex",
    gap: "8px",
  },
  pageBtn: {
    padding: "6px 10px",
    background: "#111827",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    color: COLORS.muted,
    cursor: "pointer",
  }
};

export default function VulnerabilitiesPage() {
  // Filter States
  const [scanProfile, setScanProfile] = useState("all");
  const [targetAsset, setTargetAsset] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState(null); // { exp, imp }

  // Data States
  const [intelligence, setIntelligence] = useState({
    total: 0, counts: { critical: 0, high: 0, medium: 0, low: 0 },
    riskExposureScore: 0, riskExposureText: "Loading",
    heatmapData: [], matrix: {}, remediation: { resolved: 0, inProgress: 0, pending: 0 },
    topFindings: [], trends: [],
    insights: { aiSuggestion: "Loading AI suggestions...", attackTrend: "—", mostAffectedAsset: "—", complianceImpact: "Loading..." }
  });

  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [totalVulns, setTotalVulns] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [uniqueAssets, setUniqueAssets] = useState([]);

  // Detail Panel State
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isPatching, setIsPatching] = useState(false);

  // Search Debouncer (1.5 seconds)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch unique targets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await getVulnerabilities({ limit: 100 });
        if (res.vulnerabilities) {
          const assets = [...new Set(res.vulnerabilities.map(v => {
            try {
              return v.inventory?.endpoint ? new URL(v.inventory.endpoint).hostname : "api.example.com";
            } catch {
              return "api.example.com";
            }
          }))];
          setUniqueAssets(assets.length > 0 ? assets : ["api.example.com", "billing-service.io", "gateway.auth.net"]);
        }
      } catch (err) {
        setUniqueAssets(["api.example.com", "billing-service.io", "gateway.auth.net"]);
      }
    };
    fetchAssets();
  }, []);

  // Fetch Intelligence Analytics (non-blocking - independent load)
  const fetchIntelligence = async () => {
    try {
      const data = await getVulnerabilityIntelligence();
      setIntelligence(data);
    } catch (err) {
      // Set a fallback so the page doesn't stay blocked
      setIntelligence({ total: 0, counts: { critical: 0, high: 0, medium: 0, low: 0 }, riskExposureScore: 0, riskExposureText: "N/A", heatmapData: [], matrix: {}, remediation: { resolved: 0, inProgress: 0, pending: 0 }, topFindings: [], trends: [], insights: {} });
    }
  };

  // Fetch Vulnerability list with filters (blocks page load - keep fast)
  const fetchVulnerabilityList = async () => {
    setLoadingList(true);
    try {
      const params = {
        page,
        limit: 8,
        search: debouncedSearch || undefined,
        severity: severity !== "all" ? severity : undefined,
        status: status !== "all" ? status : undefined,
      };

      const res = await getVulnerabilities(params);
      
      let filteredVulns = res.vulnerabilities || [];

      // Apply Matrix filter on frontend
      if (matrixFilter) {
        filteredVulns = filteredVulns.filter((v) => {
          const score = v.cvss || 5.0;
          let exp = "Medium";
          let imp = "Medium";
          if (score >= 8.5) { exp = "High"; imp = "High"; }
          else if (score >= 7.0) { exp = "Medium"; imp = "High"; }
          else if (score >= 4.0) { exp = "Medium"; imp = "Medium"; }
          else { exp = "Low"; imp = "Low"; }
          return exp === matrixFilter.exp && imp === matrixFilter.imp;
        });
      }

      setVulnerabilities(filteredVulns);
      setTotalVulns(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch vulnerability records");
    } finally {
      setLoadingList(false);
    }
  };

  // Load: show page fast via vulnerability list, load intelligence separately in background
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      // Fetch vulnerability list first (fast query), don't await intelligence (slow)
      await fetchVulnerabilityList();
      setLoading(false);
      // Intelligence loads in background independently - no page blocking
      fetchIntelligence();
    };
    loadAll();
  }, [page, debouncedSearch, severity, status, matrixFilter]);

  // Handle status change
  const handleStatusChange = async (vulnId, newStatus) => {
    try {
      await updateVulnerabilityStatus(vulnId, newStatus);
      toast.success(`Vulnerability status marked as ${newStatus.replace("_", " ")}`);
      setVulnerabilities(prev => prev.map(v => v._id === vulnId ? { ...v, status: newStatus } : v));
      fetchIntelligence();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Simulate AI remediation
  const triggerAiRemediation = () => {
    setIsPatching(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: "AI Engine generating secure validation interceptor code...",
        success: "AI Secure Patch proposal generated! Review inside settings page.",
        error: "AI Engine error."
      }
    ).then(() => {
      setIsPatching(false);
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", background: COLORS.background, color: COLORS.white }}>
        <RefreshCw style={{ width: "48px", height: "48px", color: COLORS.purple, margin: "0 auto 16px auto", animation: "spin 1s linear infinite" }} />
        <p style={{ textAlign: "center", color: COLORS.muted, fontWeight: "500" }}>Loading vulnerability records...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Get severity badge colors
  const getSeverityStyles = (sev) => {
    const s = sev.toLowerCase();
    if (s === "critical") return { background: "rgba(239,68,68,.15)", color: COLORS.critical, border: `1px solid rgba(239,68,68,.25)` };
    if (s === "high") return { background: "rgba(249,115,22,.15)", color: COLORS.warning, border: `1px solid rgba(249,115,22,.25)` };
    if (s === "medium") return { background: "rgba(250,204,21,.15)", color: COLORS.yellow, border: `1px solid rgba(250,204,21,.25)` };
    return { background: "rgba(34,197,94,.15)", color: COLORS.success, border: `1px solid rgba(34,197,94,.25)` };
  };

  return (
    <div style={styles.container}>
      
      {/* 1. Header Banner */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.headerTitleRow}>
            <h1 style={styles.headerTitle}>Vulnerability Intelligence Center</h1>
            <div style={styles.liveBadge}>
              <span style={styles.liveDot}></span>
              + Live
            </div>
            <FeatureGuide
              title="Vulnerability Intel"
              description={`This center lists all vulnerability alerts found across your APIs. We currently have ${vulnerabilities.length} active vulnerabilities logged.`}
              steps={[
                "Look at the 'Threat Exposure' grid chart in the sidebar to find high-risk areas.",
                "Type inside the search bar to filter vulnerabilities by endpoint path or name.",
                "Click on any row to expand details, see CVSS scores, and ask the AI Copilot to generate secure patch code."
              ]}
              techDetails={[
                "API Path: GET /api/vulnerabilities",
                "Database: Fetched from the Vulnerability collections matched to your account."
              ]}
              positionStyles={{ position: "static" }}
            />
          </div>
          <p style={styles.headerSubtitle}>Deep discovery. Smart prioritization. Proactive defense.</p>
        </div>

        <div style={styles.headerActions}>
          <button 
            onClick={triggerAiRemediation}
            disabled={isPatching}
            style={styles.aiButton}
          >
            <Brain style={{ width: "16px", height: "16px" }} />
            AI Scan Assistant
          </button>
          <button style={styles.timeButton}>
            <Clock style={{ width: "16px", height: "16px" }} />
            Last scan: 2 hours ago
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Section */}
      <div style={styles.kpiGrid}>
        {/* KPI Cards */}
        {[
          { title: "TOTAL VULNERABILITIES", count: intelligence?.total ?? "—", diff: "+18%", color: COLORS.purple },
          { title: "CRITICAL", count: intelligence?.counts?.critical ?? "—", diff: "+27%", color: COLORS.critical },
          { title: "HIGH", count: intelligence?.counts?.high ?? "—", diff: "+12%", color: COLORS.warning },
          { title: "MEDIUM", count: intelligence?.counts?.medium ?? "—", diff: "-9%", color: COLORS.yellow },
          { title: "LOW", count: intelligence?.counts?.low ?? "—", diff: "+22%", color: COLORS.success },
        ].map((kpi, idx) => (
          <div key={idx} style={styles.kpiCard}>
            <div style={styles.kpiTitle}>{kpi.title}</div>
            <div style={styles.kpiBodyRow}>
              <div style={{ ...styles.kpiCount, color: kpi.color }}>{kpi.count}</div>
              <div style={{ ...styles.kpiDiff, color: kpi.diff.startsWith("+") ? COLORS.critical : COLORS.success }}>
                {kpi.diff}
              </div>
            </div>
            <div style={styles.kpiFooter}>from last scan</div>
          </div>
        ))}

        {/* Circular Risk Exposure Score Card */}
        <div style={styles.scoreCard}>
          <div style={styles.kpiTitle}>RISK EXPOSURE SCORE</div>
          <div style={styles.scoreRow}>
            <div style={styles.scoreDialContainer}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 36 36">
                <path
                  strokeWidth="3.5"
                  stroke="rgba(255,255,255,0.06)"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${intelligence?.riskExposureScore ?? 0}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke={COLORS.critical}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "14px", fontWeight: "900" }}>
                {intelligence.riskExposureScore}
              </span>
            </div>
            <div style={styles.scoreInfo}>
              <div style={styles.scoreLabel}>{intelligence.riskExposureText} Risk</div>
              <div style={styles.scoreSub}>Overall system vector</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Filters Control Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterRow}>
          <div style={styles.filterGroups}>
            {/* Scan Profile */}
            <div style={styles.filterField}>
              <span style={styles.filterLabel}>SCAN PROFILE</span>
              <select 
                value={scanProfile}
                onChange={(e) => setScanProfile(e.target.value)}
                style={styles.select}
              >
                <option value="all">Full Security Scan</option>
                <option value="api">API Vulnerability Audit</option>
                <option value="quick">Quick Header Verification</option>
              </select>
            </div>

            {/* Asset/Target */}
            <div style={styles.filterField}>
              <span style={styles.filterLabel}>ASSET/TARGET</span>
              <select 
                value={targetAsset}
                onChange={(e) => setTargetAsset(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Targets</option>
                {uniqueAssets.map((asset, i) => (
                  <option key={i} value={asset}>{asset}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div style={styles.filterField}>
              <span style={styles.filterLabel}>SEVERITY</span>
              <select 
                value={severity}
                onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
                style={styles.select}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Status */}
            <div style={styles.filterField}>
              <span style={styles.filterLabel}>STATUS</span>
              <select 
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                style={styles.select}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Search bar and advanced filter */}
          <div style={{ display: "flex", gap: "12px", itemsCenter: "center" }}>
            <div style={styles.searchWrapper}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search vulnerabilities..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                style={styles.searchInput}
              />
            </div>

            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={styles.advancedBtn}
            >
              <Sliders style={{ width: "14px", height: "14px" }} />
              Advanced
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable strip */}
        {showAdvanced && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div>
              <label style={styles.filterLabel}>CWE CODE</label>
              <input type="text" placeholder="e.g. CWE-79" style={{ ...styles.select, width: "100%", marginTop: "4px" }} />
            </div>
            <div>
              <label style={styles.filterLabel}>OWASP CATEGORY</label>
              <input type="text" placeholder="e.g. API1:2023" style={{ ...styles.select, width: "100%", marginTop: "4px" }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button 
                onClick={() => {
                  setSeverity("all");
                  setStatus("all");
                  setSearchQuery("");
                  setMatrixFilter(null);
                  toast.success("Filters reset successfully");
                }}
                style={{ ...styles.advancedBtn, width: "100%", justifyContent: "center", padding: "8px" }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Dashboard Primary Layout: Heatmap, 3x3 Matrix, Top Vulnerabilities */}
      <div style={styles.mainGrid}>
        
        {/* Heatmap (Radar) */}
        <div style={styles.dashboardCard}>
          <div>
            <div style={styles.cardTitleRow}>
              <h3 style={styles.cardTitle}>Vulnerability Heatmap</h3>
              <Shield style={{ width: "16px", height: "16px", color: COLORS.muted }} />
            </div>
            <p style={styles.cardSub}>Visual distribution across API threat vectors</p>
          </div>

          <div style={{ width: "100%", height: "240px", marginTop: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={intelligence?.heatmapData || []}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: COLORS.muted, fontSize: 10, fontWeight: 600 }} />
                <Radar name="Threat Vector" dataKey="A" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3x3 Exploitability vs Impact Matrix */}
        <div style={styles.dashboardCard}>
          <div>
            <div style={styles.cardTitleRow}>
              <h3 style={styles.cardTitle}>Exploitability vs Impact Matrix</h3>
              <Settings style={{ width: "16px", height: "16px", color: COLORS.muted }} />
            </div>
            <p style={styles.cardSub}>Prioritized risk visualization. Click cells to filter listing</p>
          </div>

          <div style={styles.matrixContainer}>
            {["High", "Medium", "Low"].map((imp) => (
              <div key={imp} style={styles.matrixRow}>
                <div style={styles.matrixLabelY}>{imp}</div>
                {["Low", "Medium", "High"].map((exp) => {
                  const val = intelligence?.matrix?.[imp]?.[exp] || 0;
                  const isSelected = matrixFilter?.exp === exp && matrixFilter?.imp === imp;
                  
                  // Compute color based on cell priority
                  let cellBg = "rgba(255,255,255,0.02)";
                  let cellBorder = "rgba(255,255,255,0.06)";
                  let badgeBg = "rgba(255,255,255,0.08)";
                  let badgeText = COLORS.muted;

                  if (imp === "High" && exp === "High") {
                    cellBg = isSelected ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.08)";
                    cellBorder = isSelected ? COLORS.critical : "rgba(239,68,68,0.2)";
                    badgeBg = COLORS.critical;
                    badgeText = COLORS.white;
                  } else if ((imp === "High" && exp === "Medium") || (imp === "Medium" && exp === "High")) {
                    cellBg = isSelected ? "rgba(249,115,22,0.25)" : "rgba(249,115,22,0.08)";
                    cellBorder = isSelected ? COLORS.warning : "rgba(249,115,22,0.2)";
                    badgeBg = COLORS.warning;
                    badgeText = COLORS.white;
                  } else if (val > 0) {
                    cellBg = isSelected ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.08)";
                    cellBorder = isSelected ? COLORS.purple : "rgba(139,92,246,0.2)";
                    badgeBg = COLORS.purple;
                    badgeText = COLORS.white;
                  }

                  return (
                    <button
                      key={`${imp}-${exp}`}
                      onClick={() => {
                        if (isSelected) {
                          setMatrixFilter(null);
                        } else {
                          setMatrixFilter({ exp, imp });
                          toast.success(`Filtering by Exploitability: ${exp} & Impact: ${imp}`);
                        }
                      }}
                      style={{
                        ...styles.matrixCell,
                        background: cellBg,
                        borderColor: cellBorder,
                        borderStyle: "solid",
                        borderWidth: "1px"
                      }}
                    >
                      <span style={{ ...styles.matrixBadge, background: badgeBg, color: badgeText }}>
                        {val}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Bottom X Axis Labels */}
            <div style={styles.matrixLabelsX}>
              <div></div>
              <div>Low</div>
              <div>Medium</div>
              <div>High</div>
            </div>
            <div style={{ textAlign: "center", fontSize: "9px", fontWeight: "700", color: COLORS.muted, letterSpacing: "1px", textTransform: "uppercase", marginTop: "8px" }}>
              Exploitability
            </div>
          </div>
        </div>

        {/* Top Critical Findings List */}
        <div style={styles.dashboardCard}>
          <div>
            <div style={styles.cardTitleRow}>
              <h3 style={styles.cardTitle}>Top Critical Vulnerabilities</h3>
              <AlertTriangle style={{ width: "16px", height: "16px", color: COLORS.critical }} />
            </div>
            <p style={styles.cardSub}>Immediate attention required</p>
          </div>

          <div style={styles.topFindingsList}>
            {(intelligence?.topFindings || []).map((f, idx) => (
              <button
                key={idx}
                onClick={async () => {
                  if (f._id) {
                    setSelectedVuln(f);
                  } else {
                    toast.error("Vulnerability payload not found in local sandbox");
                  }
                }}
                style={styles.topFindingItem}
              >
                <div style={styles.topFindingLeft}>
                  <span style={styles.topFindingDot}></span>
                  <div>
                    <div style={styles.topFindingCve}>{f.cve}</div>
                    <div style={styles.topFindingTitle}>{f.title}</div>
                    <div style={styles.topFindingSub}>{f.owasp}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={styles.topFindingBadge}>
                    {f.cvss}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Second Row Layout: Area Trends, Predictions, Remediation & Insights Panels */}
      <div style={styles.secondRowGrid}>
        
        {/* Vulnerability Trends Area Chart */}
        <div style={styles.trendCard}>
          <div>
            <div style={styles.cardTitleRow}>
              <h3 style={styles.cardTitle}>Vulnerability Trends</h3>
              <TrendingUp style={{ width: "16px", height: "16px", color: COLORS.purple }} />
            </div>
            <p style={styles.cardSub}>Track total vulnerability volume over the last 30 days</p>
          </div>

          <div style={{ width: "100%", height: "180px", marginTop: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intelligence?.trends || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.08)" tick={{ fontSize: 9, fill: COLORS.muted }} />
                <YAxis stroke="rgba(255,255,255,0.08)" tick={{ fontSize: 9, fill: COLORS.muted }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.08)", color: "#e2e8f0", borderRadius: "12px", fontSize: 11 }} />
                <Area type="monotone" dataKey="count" stroke={COLORS.purple} strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Risk Prediction widgets */}
        <div style={styles.predictionCard}>
          <div style={{ width: "100%" }}>
            <div style={styles.cardTitleRow}>
              <h3 style={styles.cardTitle}>AI Risk Prediction</h3>
              <Brain style={{ width: "16px", height: "16px", color: COLORS.purple }} />
            </div>
            <p style={styles.cardSub}>Predicting future vulnerability trends</p>
          </div>

          {/* Predict Speedometer */}
          <div style={styles.predSpeedoWrapper}>
            <div style={styles.predSpeedoArc}></div>
            <div style={styles.predSpeedoLabel}>High</div>
          </div>

          <div style={styles.predStats}>
            <div>
              <div style={styles.predStatTitle}>PROBABILITY OF CRITICAL</div>
              <div style={{ ...styles.predStatVal, color: COLORS.critical }}>
                72% <span style={{ fontSize: "11px", color: COLORS.critical }}>▲ 14%</span>
              </div>
            </div>
            <div>
              <div style={styles.predStatTitle}>EXPECTED NEW VULNS</div>
              <div style={{ ...styles.predStatVal, color: "#E2E8F0" }}>14 - 21</div>
            </div>
          </div>
        </div>

        {/* Remediation Progress indicator */}
        <div style={styles.trendCard}>
          <div>
            <div style={styles.cardTitleRow}>
              <h3 style={styles.cardTitle}>Remediation Progress</h3>
              <CheckCircle style={{ width: "16px", height: "16px", color: COLORS.success }} />
            </div>
            <p style={styles.cardSub}>Overall fix progress status</p>
          </div>

          <div style={styles.progressList}>
            {/* Resolved */}
            <div style={styles.progressRow}>
              <div style={styles.progressInfo}>
                <span style={{ color: COLORS.muted }}>Resolved</span>
                <span style={{ color: COLORS.success, fontWeight: "700" }}>{intelligence?.remediation?.resolved ?? 0}</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, background: COLORS.success, width: `${Math.min(100, ((intelligence?.remediation?.resolved ?? 0) / (intelligence?.total || 25)) * 100)}%` }}></div>
              </div>
            </div>

            {/* In Progress */}
            <div style={styles.progressRow}>
              <div style={styles.progressInfo}>
                <span style={{ color: COLORS.muted }}>In Progress</span>
                <span style={{ color: "#60A5FA", fontWeight: "700" }}>{intelligence?.remediation?.inProgress ?? 0}</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, background: "#60A5FA", width: `${Math.min(100, ((intelligence?.remediation?.inProgress ?? 0) / (intelligence?.total || 25)) * 100)}%` }}></div>
              </div>
            </div>

            {/* Pending */}
            <div style={styles.progressRow}>
              <div style={styles.progressInfo}>
                <span style={{ color: COLORS.muted }}>Pending</span>
                <span style={{ color: COLORS.yellow, fontWeight: "700" }}>{intelligence?.remediation?.pending ?? 0}</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, background: COLORS.yellow, width: `${Math.min(100, ((intelligence?.remediation?.pending ?? 0) / (intelligence?.total || 25)) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          <button style={styles.roadmapBtn}>
            View Roadmap
          </button>
        </div>

      </div>

      {/* 6. Smart Insights Strip */}
      <div style={styles.insightsGrid}>
        {/* Smart AI Suggestion */}
        <div style={{ ...styles.insightCard, gridColumn: "span 2" }}>
          <div style={styles.insightHeader}>
            <Brain style={{ width: "16px", height: "16px", color: "#C084FC" }} />
            <span style={styles.insightTag}>AI SUGGESTION</span>
          </div>
          <p style={styles.insightBody}>
            {intelligence?.insights?.aiSuggestion || "Loading AI analysis..."}
          </p>
          <div onClick={triggerAiRemediation} style={styles.insightLink}>
            Fix Now with AI <ChevronRight style={{ width: "12px", height: "12px", marginLeft: "2px" }} />
          </div>
        </div>

        {/* Stats columns */}
        {[
          { title: "ATTACK TREND", val: intelligence?.insights?.attackTrend ?? "—", label: "Increase in attempts", color: "#F87171" },
          { title: "MOST AFFECTED ASSET", val: intelligence?.insights?.mostAffectedAsset ?? "—", label: "Vulnerability concentration", color: "#E2E8F0" },
          { title: "COMPLIANCE IMPACT", val: intelligence?.insights?.complianceImpact ?? "Loading...", label: "Regulatory verification state", color: (intelligence?.insights?.complianceImpact || "").includes("DSS") ? COLORS.critical : COLORS.success },
        ].map((insight, idx) => (
          <div key={idx} style={styles.insightCard}>
            <div style={styles.insightMiniTitle}>{insight.title}</div>
            <div style={{ ...styles.insightMiniVal, color: insight.color }}>{insight.val}</div>
            <div style={styles.insightMiniLabel}>{insight.label}</div>
          </div>
        ))}
      </div>

      {/* 7. Comprehensive Vulnerability Data Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeaderRow}>
          <div>
            <h3 style={styles.tableTitle}>Vulnerabilities Register</h3>
            <p style={styles.tableSub}>Detailed list matching current filters</p>
          </div>

          <button style={styles.exportBtn}>
            <FileSpreadsheet style={{ width: "14px", height: "14px" }} />
            Export CSV
          </button>
        </div>

        {loadingList ? (
          <div style={{ display: "flex", flexDirection: "column", itemsCenter: "center", py: "32px", textAlign: "center" }}>
            <RefreshCw style={{ width: "32px", height: "32px", color: COLORS.purple, margin: "0 auto 12px auto", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "12px", color: COLORS.muted }}>Querying database records...</p>
          </div>
        ) : vulnerabilities.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", itemsCenter: "center", py: "48px", textAlign: "center" }}>
            <Shield style={{ width: "40px", height: "40px", color: "#334155", margin: "0 auto 12px auto" }} />
            <p style={{ fontSize: "14px", fontWeight: "600", color: COLORS.muted }}>No vulnerabilities match filter parameters</p>
            <p style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>Try resetting matrix or dropdown filters</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Severity</th>
                  <th style={styles.th}>Finding</th>
                  <th style={styles.th}>Target Endpoint</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>CVSS Score</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {vulnerabilities.map((v) => {
                  const badgeStyles = getSeverityStyles(v.severity);
                  return (
                    <tr 
                      key={v._id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}
                    >
                      <td style={styles.td}>
                        <span style={{ 
                          padding: "3px 8px", 
                          borderRadius: "6px", 
                          fontSize: "10px", 
                          fontWeight: "700", 
                          textTransform: "uppercase",
                          background: badgeStyles.background,
                          color: badgeStyles.color,
                          border: badgeStyles.border
                        }}>
                          {v.severity}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button 
                            onClick={() => setSelectedVuln(v)}
                            style={styles.vulnBtn}
                          >
                            {v.title}
                          </button>
                          {v.verified && (
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#EF4444",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              fontSize: "9px",
                              fontWeight: "800",
                              textTransform: "uppercase"
                            }}>
                              Verified
                            </span>
                          )}
                        </div>
                        {v.cwe && <div style={styles.vulnCwe}>{v.cwe}</div>}
                      </td>
                      <td style={{ ...styles.td, ...styles.endpointCell }}>
                        {v.endpoint || v.inventory?.endpoint || "/"}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center", fontWeight: "700" }}>
                        {v.cvss ? v.cvss.toFixed(1) : "5.0"}
                      </td>
                      <td style={{ ...styles.td, color: COLORS.muted }}>
                        {v.category || "General"}
                      </td>
                      <td style={styles.td}>
                        <select
                          value={v.status || "open"}
                          onChange={(e) => handleStatusChange(v._id, e.target.value)}
                          style={styles.select}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <button 
                          onClick={() => setSelectedVuln(v)}
                          style={styles.actionBtn}
                        >
                          <Eye style={{ width: "16px", height: "16px" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={styles.paginationRow}>
                <span>
                  Showing page <span style={{ color: "#E2E8F0" }}>{page}</span> of <span style={{ color: "#E2E8F0" }}>{totalPages}</span>
                </span>
                <div style={styles.paginationBtns}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronLeft style={{ width: "16px", height: "16px" }} />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
                  >
                    <ChevronRight style={{ width: "16px", height: "16px" }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 8. Slide-out detail panel */}
      {selectedVuln && (
        <VulnerabilityPanel
          vulnerability={selectedVuln}
          onClose={() => setSelectedVuln(null)}
        />
      )}

    </div>
  );
}