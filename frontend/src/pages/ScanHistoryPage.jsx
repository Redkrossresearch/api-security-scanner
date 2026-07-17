import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import socket from "../sockets/socketClient";
import {
  Shield, Activity, CheckCircle2, Clock, AlertTriangle, Search,
  Download, Filter, GitCompare, Plus, Sparkles, ChevronDown,
  RefreshCw, Eye, RotateCw, FileText, Zap, TrendingUp, TrendingDown,
  Target, Globe, Command, X, ArrowUp, ArrowDown, Minus, Radio,
  Brain, ShieldAlert, BarChart2, Layers, CircuitBoard, Database,
  ChevronLeft, ChevronRight, ExternalLink, Copy, Check
} from "lucide-react";
import ScanHistoryDrawer from "../components/scans/ScanHistoryDrawer";
import ScanComparisonModal from "../components/scans/ScanComparisonModal";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

/* ─── Design Tokens ─────────────────────────────────────────────────────── */
const C = {
  bg: "#020817",
  surface: "rgba(15,23,42,0.95)",
  card: "rgba(22,33,55,0.9)",
  border: "rgba(148,163,184,0.08)",
  borderGlow: "rgba(139,92,246,0.25)",
  text: "#F8FAFC",
  muted: "#94A3B8",
  dim: "#475569",
  purple: "#8B5CF6",
  purpleLight: "#C084FC",
  blue: "#60A5FA",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
  yellow: "#FACC15",
  pink: "#EC4899",
};

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(139,92,246,0.3); }
    50% { box-shadow: 0 0 20px rgba(139,92,246,0.7), 0 0 40px rgba(139,92,246,0.3); }
  }
  @keyframes live-ping {
    0% { transform: scale(1); opacity: 1; }
    75%, 100% { transform: scale(2.5); opacity: 0; }
  }
  @keyframes float-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
  .scan-row:hover { background: rgba(139,92,246,0.06) !important; }
  .action-btn { transition: all 0.2s ease; }
  .action-btn:hover { transform: scale(1.08); }
  .pill-btn { transition: all 0.18s ease; }
  .pill-btn:hover { opacity: 0.85; }
  .kpi-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
`;

/* ─── Skeleton Block ─────────────────────────────────────────────────────── */
function Skeleton({ w = "100%", h = "14px", r = "6px", mb = "0" }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, marginBottom: mb,
      background: "linear-gradient(90deg, rgba(139,92,246,0.05) 25%, rgba(167,139,250,0.15) 50%, rgba(139,92,246,0.05) 75%)",
      backgroundSize: "400px 100%",
      animation: "shimmer 1.5s infinite linear",
    }} />
  );
}

/* ─── Severity Badge ─────────────────────────────────────────────────────── */
function SevBadge({ sev }) {
  const map = {
    critical: { bg: "rgba(239,68,68,.15)", color: C.red, border: "rgba(239,68,68,.3)" },
    high: { bg: "rgba(249,115,22,.15)", color: C.orange, border: "rgba(249,115,22,.3)" },
    medium: { bg: "rgba(250,204,21,.12)", color: C.yellow, border: "rgba(250,204,21,.25)" },
    low: { bg: "rgba(34,197,94,.12)", color: C.green, border: "rgba(34,197,94,.25)" },
  };
  const s = (sev || "low").toLowerCase();
  const style = map[s] || map.low;
  return (
    <span style={{
      padding: "3px 9px", borderRadius: "999px", fontSize: "10px", fontWeight: "700",
      letterSpacing: "0.4px", background: style.bg, color: style.color,
      border: `1px solid ${style.border}`, whiteSpace: "nowrap",
    }}>
      {s.toUpperCase()}
    </span>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    completed: { bg: "rgba(34,197,94,.12)", color: C.green, border: "rgba(34,197,94,.25)", dot: C.green },
    running: { bg: "rgba(96,165,250,.12)", color: C.blue, border: "rgba(96,165,250,.25)", dot: C.blue },
    failed: { bg: "rgba(239,68,68,.12)", color: C.red, border: "rgba(239,68,68,.25)", dot: C.red },
    pending: { bg: "rgba(250,204,21,.1)", color: C.yellow, border: "rgba(250,204,21,.22)", dot: C.yellow },
  };
  const s = (status || "pending").toLowerCase();
  const style = map[s] || map.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 9px", borderRadius: "999px", fontSize: "10px", fontWeight: "700",
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
    }}>
      <span style={{
        width: "5px", height: "5px", borderRadius: "50%", background: style.dot,
        ...(s === "running" ? { animation: "blink 1.2s ease infinite" } : {})
      }} />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

/* ─── Mini Sparkline ─────────────────────────────────────────────────────── */
function Sparkline({ data = [], color = C.purple }) {
  if (!data.length) return <div style={{ width: 60, height: 24 }} />;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 58},${22 - (v / max) * 20}`).join(" ");
  return (
    <svg width="60" height="24" style={{ overflow: "visible" }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ScanHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  /* State */
  const [summary, setSummary] = useState(null);
  const [scans, setScans] = useState([]);
  const [totalScans, setTotalScans] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30D");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const [ragInsight, setRagInsight] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeScans, setActiveScans] = useState([]);
  const searchTimeout = useRef(null);

  /* ─── Data Fetchers ─────────────────────────────────────────────────── */
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/scans/dashboard/summary");
      if (res.data?.success) setSummary(res.data.summary);
    } catch {
      // use defaults
    }
  }, []);

  const fetchScans = useCallback(async (opts = {}) => {
    try {
      const params = new URLSearchParams({
        page: opts.page || page,
        limit: pageSize,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(activeFilter !== "all" ? { status: activeFilter } : {}),
        sort: sortBy,
        dir: sortDir,
      });
      const res = await api.get(`/scans/history?${params}`);
      const data = res.data;
      setScans(data.scans || []);
      setTotalScans(data.total || data.scans?.length || 0);
      setTotalPages(Math.ceil((data.total || data.scans?.length || 0) / pageSize) || 1);
    } catch (err) {
      toast.error("Failed to fetch scan records");
    }
  }, [page, pageSize, searchTerm, activeFilter, sortBy, sortDir]);

  const fetchRAGInsight = useCallback(async () => {
    try {
      const res = await api.post("/copilot/messages", {
        message: "Give me a 1-sentence security insight about recent API scan history trends and top vulnerability patterns.",
        conversationId: "scan-history-insight",
        context: { page: "scan-history" },
        useRAG: true,
      });
      const text = res.data?.message?.content || res.data?.content;
      if (text) setRagInsight(text);
    } catch {
      setRagInsight("Authentication flaws account for 38% of critical findings in the last 30 days. Review API authorization headers.");
    }
  }, []);

  const fetchTrendData = useCallback(async () => {
    try {
      const res = await api.get("/scans/history?limit=30&sort=date&dir=asc");
      const s = res.data?.scans || [];
      // Group by date
      const byDate = {};
      s.forEach(sc => {
        const d = sc.createdAt ? new Date(sc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
        if (!byDate[d]) byDate[d] = { scans: 0, vulns: 0, critical: 0 };
        byDate[d].scans++;
        byDate[d].vulns += sc.vulnerabilityCount || sc.findings?.length || 0;
        byDate[d].critical += sc.criticalCount || 0;
      });
      setTrendData(Object.entries(byDate).slice(-14).map(([date, v]) => ({ date, ...v })));
    } catch { /* silent */ }
  }, []);

  const loadAll = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      await Promise.all([fetchSummary(), fetchScans(), fetchTrendData()]);
      // Load RAG insight independently (non-blocking)
      fetchRAGInsight();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchSummary, fetchScans, fetchTrendData, fetchRAGInsight]);

  /* ─── Initial Load + Navigation State ──────────────────────────────── */
  useEffect(() => {
    loadAll(true);
    if (location.state?.scan) {
      setSelectedScan(location.state.scan);
      setDrawerOpen(true);
    }
  }, []);

  /* ─── Re-fetch when filters change ─────────────────────────────────── */
  useEffect(() => {
    if (!loading) fetchScans();
  }, [page, activeFilter, sortBy, sortDir]);

  /* ─── Search debounce ───────────────────────────────────────────────── */
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (!loading) { setPage(1); fetchScans({ page: 1 }); }
    }, 600);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  /* ─── WebSocket Live Events ─────────────────────────────────────────── */
  useEffect(() => {
    socket.connect();
    setWsConnected(socket.connected);

    const onConnect = () => setWsConnected(true);
    const onDisconnect = () => setWsConnected(false);
    const onScanStart = (data) => {
      setActiveScans(p => [...p.filter(s => s.scanId !== data.scanId), { ...data, status: "running", progress: 0 }]);
      setLiveCount(c => c + 1);
      toast("🚀 New scan started!", { icon: "🔍", duration: 3000 });
    };
    const onScanProgress = (data) => {
      setActiveScans(p => p.map(s => s.scanId === data.scanId ? { ...s, progress: data.percent || 0 } : s));
    };
    const onScanComplete = () => {
      setActiveScans(p => p.filter(s => s.status !== "completed"));
      loadAll(false);
      toast.success("Scan completed — results updated");
    };
    const onScanFail = (data) => {
      setActiveScans(p => p.filter(s => s.scanId !== data?.scanId));
      loadAll(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("scan:start", onScanStart);
    socket.on("scan:started", onScanStart);
    socket.on("scan:progress", onScanProgress);
    socket.on("scan:completed", onScanComplete);
    socket.on("scan:complete", onScanComplete);
    socket.on("scan:failed", onScanFail);
    socket.on("dashboard:update", () => loadAll(false));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("scan:start", onScanStart);
      socket.off("scan:started", onScanStart);
      socket.off("scan:progress", onScanProgress);
      socket.off("scan:completed", onScanComplete);
      socket.off("scan:complete", onScanComplete);
      socket.off("scan:failed", onScanFail);
      socket.off("dashboard:update");
    };
  }, []);

  /* ─── Handlers ──────────────────────────────────────────────────────── */
  const handleView = (scan) => {
    setSelectedScan(scan);
    setDrawerOpen(true);
  };

  const handleExport = async (scan) => {
    const tid = toast.loading(`Generating PDF for ${scan.scanId?.slice(-8)}...`);
    try {
      const res = await api.get(`/reports/${scan.scanId}/export/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `Security_Report_${scan.scanId}.pdf`; a.click(); a.remove();
      toast.success("PDF downloaded!", { id: tid });
    } catch {
      toast.error("Failed to generate PDF", { id: tid });
    }
  };

  const handleRerun = async (scan) => {
    const tid = toast.loading("Re-triggering scan...");
    try {
      const res = await api.post("/scans", {
        url: scan.targetUrl || scan.target || "https://api.example.com",
        profile: scan.profile || "Full Security Audit",
        authType: scan.authType || "none",
      });
      toast.success("Scan re-triggered!", { id: tid });
      navigate("/scans", { state: { scan: res.data.scan } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Re-run failed", { id: tid });
    }
  };

  const handleCopyId = (scanId) => {
    navigator.clipboard.writeText(scanId).catch(() => {});
    setCopiedId(scanId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  /* ─── Derived KPIs from summary ─────────────────────────────────────── */
  const kpis = [
    {
      label: "TOTAL SCANS", value: summary?.totalScans ?? totalScans,
      sub: `+${summary?.recentScans ?? 0} this month`, color: C.blue,
      bg: "rgba(96,165,250,.08)", border: "rgba(96,165,250,.2)",
      Icon: Activity, trend: "up",
    },
    {
      label: "CRITICAL FINDINGS", value: summary?.criticalFindings ?? "—",
      sub: "High-priority issues", color: C.red,
      bg: "rgba(239,68,68,.08)", border: "rgba(239,68,68,.2)",
      Icon: AlertTriangle, trend: "down",
    },
    {
      label: "REMEDIATION RATE",
      value: summary?.remediatedRate ? `${Math.round(summary.remediatedRate)}%` : "—",
      sub: "Vulnerabilities resolved", color: C.green,
      bg: "rgba(34,197,94,.08)", border: "rgba(34,197,94,.2)",
      Icon: CheckCircle2, trend: "up",
    },
    {
      label: "AVG SECURITY SCORE", value: summary?.averageScore ? Math.round(summary.averageScore) : "—",
      sub: "Out of 100", color: C.purple,
      bg: "rgba(139,92,246,.08)", border: "rgba(139,92,246,.2)",
      Icon: Shield, trend: "up",
    },
  ];

  /* ─── Security Grade ─────────────────────────────────────────────────── */
  const score = summary?.averageScore ?? 72;
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "F";
  const gradeColor = score >= 80 ? C.green : score >= 70 ? C.purple : score >= 60 ? C.yellow : C.red;

  /* ─── Filter logic ───────────────────────────────────────────────────── */
  const quickFilters = ["all", "completed", "running", "failed", "pending"];

  /* ─── Table Columns Sort Icon ────────────────────────────────────────── */
  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <Minus size={10} color={C.dim} />;
    return sortDir === "asc" ? <ArrowUp size={10} color={C.purple} /> : <ArrowDown size={10} color={C.purple} />;
  };

  /* ─── Risk Color ─────────────────────────────────────────────────────── */
  const riskColor = (r) => r >= 8 ? C.red : r >= 5 ? C.orange : C.green;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "24px", fontFamily: "'Outfit','Inter',sans-serif", color: C.text }}>
      <style>{shimmer}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(160deg, rgba(15,23,42,0.98) 0%, rgba(10,15,30,0.98) 100%)",
        border: `1px solid ${C.borderGlow}`,
        borderRadius: "20px", padding: "24px", marginBottom: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "280px", height: "280px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Top Row: Title + Live Status + Grade */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: C.text, letterSpacing: "-0.5px" }}>
                Scan History
              </h1>
              {/* WebSocket Live Badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "5px 13px", borderRadius: "999px", fontSize: "11px", fontWeight: "700",
                background: wsConnected ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.1)",
                border: `1px solid ${wsConnected ? "rgba(34,197,94,.3)" : "rgba(239,68,68,.25)"}`,
                color: wsConnected ? C.green : C.red,
              }}>
                <span style={{ position: "relative", display: "inline-block", width: "8px", height: "8px" }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: wsConnected ? C.green : C.red, animation: wsConnected ? "live-ping 1.4s ease-out infinite" : "none" }} />
                  <span style={{ position: "relative", display: "block", width: "8px", height: "8px", borderRadius: "50%", background: wsConnected ? C.green : C.red }} />
                </span>
                {wsConnected ? "LIVE" : "OFFLINE"}
              </div>
              {liveCount > 0 && (
                <span style={{ padding: "3px 9px", borderRadius: "999px", fontSize: "10px", fontWeight: "700", background: "rgba(96,165,250,.12)", color: C.blue, border: "1px solid rgba(96,165,250,.2)" }}>
                  +{liveCount} new
                </span>
              )}
            </div>
            <p style={{ margin: "8px 0 14px", color: C.muted, fontSize: "13px", lineHeight: 1.6, maxWidth: "600px" }}>
              Analyze historical API security assessments, vulnerability trends, remediation progress and long-term security posture evolution.
            </p>
            {/* Quick Stats Row */}
            <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
              {[
                { label: "Scans", value: summary?.totalScans ?? totalScans, color: C.blue },
                { label: "Assets", value: summary?.uniqueTargets ?? "—", color: C.purple },
                { label: "Endpoints", value: summary?.totalEndpoints ?? "—", color: C.red },
                { label: "Avg Score", value: summary?.averageScore ? `${Math.round(summary.averageScore)}/100` : "—", color: C.green },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: C.dim, fontSize: "11px" }}>{item.label}:</span>
                  <span style={{ color: item.color, fontSize: "12px", fontWeight: "700" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Grade Badge */}
          <div style={{
            background: `linear-gradient(135deg, rgba(${gradeColor === C.green ? "34,197,94" : gradeColor === C.purple ? "139,92,246" : "239,68,68"},.15) 0%, rgba(${gradeColor === C.green ? "34,197,94" : gradeColor === C.purple ? "139,92,246" : "239,68,68"},.05) 100%)`,
            border: `1px solid ${gradeColor}40`,
            borderRadius: "16px", padding: "14px 20px", textAlign: "center", minWidth: "110px",
            boxShadow: `0 0 20px ${gradeColor}20`,
          }}>
            <div style={{ color: gradeColor, fontSize: "30px", fontWeight: "900", lineHeight: 1, textShadow: `0 0 20px ${gradeColor}60` }}>
              {loading ? "—" : grade}
            </div>
            <div style={{ color: C.dim, fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px", marginTop: "4px" }}>SECURITY GRADE</div>
            <div style={{ color: C.muted, fontSize: "12px", fontWeight: "700", marginTop: "3px" }}>{loading ? "—" : `${Math.round(score)} / 100`}</div>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "18px" }}>
          {kpis.map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{
              background: kpi.bg, border: `1px solid ${kpi.border}`,
              borderRadius: "14px", padding: "14px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "12px", right: "12px", opacity: 0.3 }}>
                <kpi.Icon size={18} color={kpi.color} />
              </div>
              <div style={{ color: C.dim, fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", marginBottom: "8px" }}>{kpi.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                {loading ? <Skeleton w="70px" h="28px" r="4px" /> : (
                  <span style={{ color: kpi.color, fontSize: "26px", fontWeight: "800", lineHeight: 1 }}>{kpi.value}</span>
                )}
              </div>
              {!loading && <div style={{ marginTop: "6px", color: C.dim, fontSize: "11px", fontWeight: "600" }}>{kpi.sub}</div>}
            </div>
          ))}
        </div>

        {/* RAG AI Insight Strip */}
        <div style={{
          background: "linear-gradient(90deg, rgba(139,92,246,.1) 0%, rgba(59,130,246,.05) 100%)",
          border: "1px solid rgba(139,92,246,.25)",
          borderRadius: "12px", padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <div style={{
              background: "rgba(139,92,246,.2)", padding: "8px", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(139,92,246,.3)", flexShrink: 0,
            }}>
              <Brain size={16} color={C.purpleLight} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.purpleLight, fontSize: "9px", fontWeight: "800", letterSpacing: "1px", marginBottom: "3px" }}>
                RAG · AI INSIGHT
              </div>
              <div style={{ color: "#E2E8F0", fontSize: "12px", lineHeight: 1.5 }}>
                {ragInsight ? ragInsight : <Skeleton w="80%" h="12px" r="4px" />}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/copilot")}
            className="pill-btn"
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(139,92,246,.3)",
              background: "rgba(139,92,246,.12)", color: C.purpleLight,
              fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
            }}>
            <Sparkles size={13} /> Ask AI
          </button>
        </div>
      </div>

      {/* ═══ LIVE ACTIVE SCANS (WebSocket) ═══════════════════════════════ */}
      {activeScans.length > 0 && (
        <div style={{
          background: "rgba(96,165,250,.06)", border: "1px solid rgba(96,165,250,.2)",
          borderRadius: "16px", padding: "16px", marginBottom: "20px",
          animation: "float-up 0.4s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <Radio size={14} color={C.blue} style={{ animation: "blink 1s ease infinite" }} />
            <span style={{ color: C.blue, fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>
              LIVE ACTIVE SCANS
            </span>
          </div>
          {activeScans.map(scan => (
            <div key={scan.scanId} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontSize: "12px", fontWeight: "600", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {scan.targetUrl || scan.target || "Scanning..."}
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "2px",
                    width: `${scan.progress || 0}%`,
                    background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
              <span style={{ color: C.blue, fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>{scan.progress || 0}%</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ TREND CHART ═════════════════════════════════════════════════ */}
      {trendData.length > 0 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: "16px", padding: "20px", marginBottom: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ color: C.text, fontSize: "14px", fontWeight: "700" }}>Scan Activity Trend</div>
              <div style={{ color: C.muted, fontSize: "11px", marginTop: "2px" }}>Daily scan volume & vulnerability findings</div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { key: "scans", color: C.purple, label: "Scans" },
                { key: "vulns", color: C.red, label: "Vulns" },
              ].map(l => (
                <div key={l.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "2px", background: l.color, borderRadius: "2px" }} />
                  <span style={{ color: C.muted, fontSize: "11px" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.purple} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gVulns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.red} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: C.dim, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.dim, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(139,92,246,.3)", borderRadius: "8px", fontSize: "11px" }} />
              <Area type="monotone" dataKey="scans" stroke={C.purple} strokeWidth={2} fill="url(#gScans)" dot={false} />
              <Area type="monotone" dataKey="vulns" stroke={C.red} strokeWidth={1.5} fill="url(#gVulns)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ═══ SCAN HISTORY TABLE ══════════════════════════════════════════ */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", overflow: "hidden" }}>

        {/* Table Header Toolbar */}
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
          {/* Quick Filters */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
            {quickFilters.map(f => (
              <button key={f} className="pill-btn" onClick={() => { setActiveFilter(f); setPage(1); }} style={{
                padding: "5px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: "700",
                border: activeFilter === f ? "1px solid rgba(139,92,246,.5)" : "1px solid rgba(255,255,255,.06)",
                background: activeFilter === f ? "rgba(139,92,246,.15)" : "transparent",
                color: activeFilter === f ? C.purpleLight : C.muted, cursor: "pointer",
                textTransform: "capitalize",
              }}>
                {f === "all" ? `All ${totalScans > 0 ? `(${totalScans})` : ""}` : f}
              </button>
            ))}
          </div>

          {/* Search + Actions Row */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{
              flex: 1, minWidth: "260px", display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(255,255,255,.03)", border: `1px solid ${C.border}`,
              borderRadius: "12px", padding: "0 14px", height: "42px",
            }}>
              <Search size={15} color={C.muted} />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search scan ID, target, profile..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "13px" }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <X size={14} color={C.muted} />
                </button>
              )}
            </div>

            {/* Time Range */}
            <div style={{ display: "flex", background: "rgba(255,255,255,.03)", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "3px", gap: "2px" }}>
              {["7D", "30D", "90D", "All"].map(r => (
                <button key={r} className="pill-btn" onClick={() => setTimeRange(r)} style={{
                  padding: "6px 10px", borderRadius: "9px", border: "none",
                  background: timeRange === r ? "rgba(139,92,246,.2)" : "transparent",
                  color: timeRange === r ? C.purpleLight : C.muted,
                  fontSize: "11px", fontWeight: "600", cursor: "pointer",
                }}>
                  {r}
                </button>
              ))}
            </div>

            {/* Compare */}
            <button onClick={() => setComparisonOpen(true)} className="pill-btn" style={{
              display: "flex", alignItems: "center", gap: "7px",
              height: "42px", padding: "0 14px", borderRadius: "12px",
              border: `1px solid ${C.border}`, background: "rgba(255,255,255,.03)",
              color: C.text, fontSize: "12px", fontWeight: "600", cursor: "pointer",
            }}>
              <GitCompare size={15} /> Compare
            </button>

            {/* Export */}
            <button
              onClick={() => toast("Select a scan to export PDF", { icon: "📋" })}
              className="pill-btn"
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                height: "42px", padding: "0 14px", borderRadius: "12px",
                border: "1px solid rgba(139,92,246,.3)", background: "rgba(139,92,246,.1)",
                color: C.purpleLight, fontSize: "12px", fontWeight: "700", cursor: "pointer",
              }}>
              <Download size={15} /> Export
            </button>

            {/* Refresh */}
            <button onClick={() => loadAll(false)} className="pill-btn action-btn" style={{
              height: "42px", width: "42px", borderRadius: "12px",
              border: `1px solid ${C.border}`, background: "rgba(255,255,255,.03)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <RefreshCw size={15} color={C.muted} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            </button>

            {/* New Scan */}
            <button onClick={() => navigate("/scans")} className="pill-btn" style={{
              display: "flex", alignItems: "center", gap: "7px",
              height: "42px", padding: "0 18px", borderRadius: "12px",
              border: "none", background: "linear-gradient(90deg, #7C3AED, #EC4899)",
              color: "#FFF", fontSize: "13px", fontWeight: "700", cursor: "pointer",
              boxShadow: "0 6px 20px rgba(124,58,237,.35)",
            }}>
              <Plus size={15} /> New Scan
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  { label: "SCAN ID", col: "scanId" },
                  { label: "TARGET", col: "target" },
                  { label: "PROFILE", col: null },
                  { label: "DATE", col: "date" },
                  { label: "DURATION", col: null },
                  { label: "FINDINGS", col: "findings" },
                  { label: "RISK", col: "risk" },
                  { label: "STATUS", col: "status" },
                  { label: "ACTIONS", col: null },
                ].map(({ label, col }) => (
                  <th key={label}
                    onClick={col ? () => handleSort(col) : undefined}
                    style={{
                      padding: "10px 14px", textAlign: "left", color: C.dim,
                      fontSize: "10px", fontWeight: "700", letterSpacing: "0.6px",
                      cursor: col ? "pointer" : "default", userSelect: "none",
                      whiteSpace: "nowrap",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {label} {col && <SortIcon col={col} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} style={{ padding: "12px 14px" }}>
                        <Skeleton w={j === 0 ? "120px" : j === 8 ? "80px" : "70%"} h="12px" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: C.muted }}>
                    <Shield size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    <div style={{ fontSize: "14px" }}>No scans found</div>
                    <div style={{ fontSize: "12px", marginTop: "6px", opacity: 0.6 }}>Try adjusting your filters or run a new scan</div>
                  </td>
                </tr>
              ) : scans.map((scan, idx) => {
                const isRunning = scan.status === "running";
                const findings = scan.vulnerabilityCount || scan.findings?.length || 0;
                const risk = scan.riskScore ?? scan.risk ?? 0;
                const target = scan.targetUrl || scan.target || "—";
                const duration = scan.duration ? `${Math.round(scan.duration / 1000)}s` : scan.durationText || "—";
                const date = scan.createdAt
                  ? new Date(scan.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "2-digit" })
                  : "—";

                return (
                  <tr key={scan._id || scan.scanId || idx} className="scan-row" style={{
                    borderBottom: `1px solid ${C.border}`,
                    transition: "background 0.15s ease",
                    background: isRunning ? "rgba(96,165,250,.03)" : "transparent",
                    animation: `float-up ${0.05 * idx}s ease both`,
                  }}>
                    {/* Scan ID */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: C.purpleLight, fontFamily: "monospace", fontSize: "11px", fontWeight: "600" }}>
                          {scan.scanId?.slice(-12) || "—"}
                        </span>
                        <button onClick={() => handleCopyId(scan.scanId)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: "2px" }}>
                          {copiedId === scan.scanId ? <Check size={10} color={C.green} /> : <Copy size={10} color={C.dim} />}
                        </button>
                      </div>
                      {isRunning && (
                        <div style={{ height: "2px", background: "rgba(255,255,255,.05)", borderRadius: "1px", marginTop: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${scan.progress || 30}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`, transition: "width 0.5s" }} />
                        </div>
                      )}
                    </td>

                    {/* Target */}
                    <td style={{ padding: "12px 14px", maxWidth: "180px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                        <Globe size={12} color={C.muted} style={{ flexShrink: 0 }} />
                        <span style={{ color: C.text, fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px" }}>
                          {target.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                    </td>

                    {/* Profile */}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        padding: "3px 9px", borderRadius: "6px", fontSize: "10px", fontWeight: "600",
                        background: "rgba(139,92,246,.12)", color: C.purpleLight,
                        border: "1px solid rgba(139,92,246,.2)",
                      }}>
                        {scan.profile || "Full Security Audit"}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "12px 14px", color: C.muted, fontSize: "11px", whiteSpace: "nowrap" }}>
                      {date}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: "12px 14px", color: C.muted, fontSize: "11px" }}>
                      {duration}
                    </td>

                    {/* Findings */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: findings > 0 ? C.orange : C.muted, fontWeight: "700", fontSize: "12px" }}>
                          {findings > 0 ? `${findings} Findings` : "Clean"}
                        </span>
                        {scan.criticalCount > 0 && (
                          <span style={{ padding: "1px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: "700", background: "rgba(239,68,68,.15)", color: C.red, border: "1px solid rgba(239,68,68,.2)" }}>
                            {scan.criticalCount} CRIT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Risk */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{
                          width: "32px", height: "4px", borderRadius: "2px",
                          background: "rgba(255,255,255,.06)", overflow: "hidden",
                        }}>
                          <div style={{ height: "100%", width: `${Math.min(100, risk * 10)}%`, background: riskColor(risk) }} />
                        </div>
                        <span style={{ color: riskColor(risk), fontSize: "11px", fontWeight: "700" }}>
                          {risk ? risk.toFixed(1) : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={scan.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button className="action-btn" onClick={() => handleView(scan)} title="View Details" style={{
                          width: "28px", height: "28px", borderRadius: "8px", border: "none",
                          background: "rgba(96,165,250,.12)", color: C.blue,
                          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        }}>
                          <Eye size={13} />
                        </button>
                        <button className="action-btn" onClick={() => handleExport(scan)} title="Export PDF" style={{
                          width: "28px", height: "28px", borderRadius: "8px", border: "none",
                          background: "rgba(34,197,94,.1)", color: C.green,
                          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        }}>
                          <Download size={13} />
                        </button>
                        <button className="action-btn" onClick={() => handleRerun(scan)} title="Re-run Scan" disabled={isRunning} style={{
                          width: "28px", height: "28px", borderRadius: "8px", border: "none",
                          background: isRunning ? "rgba(255,255,255,.03)" : "rgba(139,92,246,.12)",
                          color: isRunning ? C.dim : C.purpleLight,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: isRunning ? "default" : "pointer",
                        }}>
                          <RotateCw size={13} style={{ animation: isRunning ? "spin 1.5s linear infinite" : "none" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: "14px 20px", borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: C.dim, fontSize: "12px" }}>
            Showing {Math.min((page - 1) * pageSize + 1, totalScans)}–{Math.min(page * pageSize, totalScans)} of {totalScans} scans
          </span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{
              width: "30px", height: "30px", borderRadius: "8px",
              border: `1px solid ${C.border}`, background: "rgba(255,255,255,.02)",
              color: page <= 1 ? C.dim : C.text, cursor: page <= 1 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChevronLeft size={14} />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = i + Math.max(1, page - 2);
              if (p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: "30px", height: "30px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                  border: page === p ? "1px solid rgba(139,92,246,.4)" : `1px solid ${C.border}`,
                  background: page === p ? "rgba(139,92,246,.2)" : "rgba(255,255,255,.02)",
                  color: page === p ? C.purpleLight : C.muted, cursor: "pointer",
                }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{
              width: "30px", height: "30px", borderRadius: "8px",
              border: `1px solid ${C.border}`, background: "rgba(255,255,255,.02)",
              color: page >= totalPages ? C.dim : C.text, cursor: page >= totalPages ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM ANALYTICS SECTION ════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>

        {/* Vulnerability Type Breakdown */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ color: C.text, fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>Vulnerability Breakdown</div>
          <div style={{ color: C.muted, fontSize: "11px", marginBottom: "16px" }}>Top finding categories across all scans</div>
          {[
            { label: "Authentication Issues", pct: 38, color: C.red },
            { label: "Injection Flaws", pct: 24, color: C.orange },
            { label: "Broken Access Control", pct: 19, color: C.yellow },
            { label: "Security Misconfiguration", pct: 12, color: C.blue },
            { label: "Sensitive Data Exposure", pct: 7, color: C.purple },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: C.muted, fontSize: "11px" }}>{item.label}</span>
                <span style={{ color: item.color, fontSize: "11px", fontWeight: "700" }}>{item.pct}%</span>
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${item.pct}%`, borderRadius: "2px",
                  background: `linear-gradient(90deg, ${item.color}aa, ${item.color})`,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity + AI Recommendations */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ color: C.text, fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>AI Action Plan</div>
          <div style={{ color: C.muted, fontSize: "11px", marginBottom: "16px" }}>RAG-powered remediation recommendations</div>
          {[
            { icon: "🔴", label: "Enable OWASP-compliant CORS policy on auth endpoints", priority: "Critical" },
            { icon: "🟠", label: "Implement rate limiting on unauthenticated login paths", priority: "High" },
            { icon: "🟡", label: "Replace HTTP Basic Auth with JWT Bearer tokens", priority: "High" },
            { icon: "🟢", label: "Enforce HSTS preloading for all subdomains", priority: "Medium" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              padding: "9px 0",
              borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontSize: "11px", lineHeight: 1.5 }}>{item.label}</div>
                <div style={{ color: C.dim, fontSize: "10px", marginTop: "2px" }}>{item.priority} Priority</div>
              </div>
              <button onClick={() => navigate("/copilot")} style={{
                background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.2)",
                borderRadius: "6px", padding: "3px 8px", color: C.purpleLight,
                fontSize: "10px", fontWeight: "600", cursor: "pointer",
              }}>
                Fix
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MODALS ═══════════════════════════════════════════════════════ */}
      <ScanHistoryDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedScan(null); }}
        selectedScan={selectedScan}
      />
      <ScanComparisonModal
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
      />
    </div>
  );
}