import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import socket from "../sockets/socketClient";
import {
  Shield, Activity, CheckCircle2, Clock, AlertTriangle, Search,
  Download, GitCompare, Plus, Sparkles, RefreshCw, Eye, RotateCw,
  Globe, X, ArrowUp, ArrowDown, Minus, Radio, Brain, ChevronLeft,
  ChevronRight, Copy, Check, Filter, TrendingUp
} from "lucide-react";
import ScanHistoryDrawer from "../components/scans/ScanHistoryDrawer";
import ScanComparisonModal from "../components/scans/ScanComparisonModal";
import WebsiteFavicon from "../components/inventory/WebsiteFavicon";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Exact Dashboard Theme Tokens ──────────────────────────────────────── */
const T = {
  white: "#FFFFFF",
  muted: "#94A3B8",
  dimmed: "#64748B",
  critical: "#EF4444",
  warning:  "#F97316",
  success:  "#22C55E",
  successLight: "#4ADE80",
  yellow:   "#FACC15",
  dark:     "#0F172A",
  darkAlt:  "#071126",
  darker:   "#020617",
  darkGray: "#111827",
  purple:   "#8B5CF6",
  purpleGrad: "#7C3AED",
  border:   "rgba(255,255,255,0.08)",
  skeleton: "#1e293b",
};

const card = (extra = {}) => ({
  background: "#080c14",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
  padding: "20px 22px",
  color: T.white,
  ...extra,
});

const btnPrimary = {
  background: T.warning,
  color: T.white,
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  whiteSpace: "nowrap",
};

const btnSecondary = {
  background: "rgba(255,255,255,0.03)",
  color: T.white,
  border: `1px solid rgba(255,255,255,0.08)`,
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  whiteSpace: "nowrap",
};

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes pulse-skeleton {
    0%,100% { opacity:1; }
    50%      { opacity:.45; }
  }
  @keyframes spin  { to { transform: rotate(360deg); } }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  @keyframes floatup { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes live-ping {
    0%   { transform:scale(1);   opacity:1; }
    75%, 100% { transform:scale(2.4); opacity:0; }
  }
  @keyframes row-in {
    from { opacity:0; transform:translateY(4px); }
    to   { opacity:1; transform:none; }
  }
  .sh-row {
    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
    transition: background 0.15s ease !important;
    cursor: pointer;
    animation: row-in 0.3s ease both;
  }
  .sh-row:hover {
    background: rgba(255, 255, 255, 0.03) !important;
  }
  .sh-btn { transition: opacity 0.15s ease, background 0.15s ease; }
  .sh-btn:hover { opacity:0.9; }
  .sh-act-btn {
    width:30px; height:30px; border-radius:8px; border:none;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
    transition: background 0.15s ease, opacity 0.15s ease;
  }
  .sh-act-btn:hover { opacity: 0.95; }
  .sh-filter-pill {
    padding:5px 14px; border-radius:999px; font-size:11px; font-weight:700;
    cursor:pointer; text-transform:capitalize;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }
  .sh-search-container {
    flex: 1; display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 0 16px; height: 42px;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }
  .sh-search-container:focus-within {
    border-color: rgba(139,92,246,0.3) !important;
    background-color: rgba(255,255,255,0.04) !important;
  }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }
`;

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ icon, title, value, trend, trendColor = "#8B5CF6", id = "sc", index = 0 }) {
  const hexToRgb = (hex) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "139,92,246";
  };
  const rgb = hexToRgb(trendColor);
  const [displayVal, setDisplayVal] = useState("—");
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (value === null || value === undefined) return;
    const str = String(value);
    const num = parseInt(str.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) { setDisplayVal(str); return; }
    let start = null;
    const duration = 1000;
    const ease = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setDisplayVal(Math.round(ease(p) * num) + str.replace(/[0-9]/g, ""));
      if (p < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "16px",
        background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(3,7,18,0.98))",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`,
        padding: "22px 24px",
        cursor: "default",
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? "translateY(-4px)" : "translateY(0)") : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.03)" : "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyValue: "space-between", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: `rgba(${rgb},0.08)`,
            border: `1px solid rgba(${rgb},0.15)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: trendColor,
          }}>{icon}</div>

          {trend && (
            <span style={{
              fontSize: "10px", fontWeight: "700",
              color: trendColor, letterSpacing: "0.5px",
              background: `rgba(${rgb},0.06)`,
              border: `1px solid rgba(${rgb},0.12)`,
              padding: "2px 8px", borderRadius: "999px",
            }}>{trend}</span>
          )}
        </div>

        <div style={{
          fontSize: "10px", fontWeight: "700", letterSpacing: "1px",
          textTransform: "uppercase", color: "#475569",
          marginBottom: "6px",
        }}>{title}</div>

        <div style={{
          fontSize: "32px", fontWeight: "800", lineHeight: 1,
          fontFamily: "Outfit, Inter, sans-serif",
          color: "#F1F5F9",
          letterSpacing: "-0.5px",
        }}>
          {displayVal !== "—" ? displayVal : (
            <div style={{ width: "80px", height: "32px", borderRadius: "6px", background: "#161f30", animation: "pulse-skeleton 1.5s infinite" }} />
          )}
        </div>

        <div style={{ marginTop: "14px", height: "2px", background: "rgba(255,255,255,0.03)", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: visible ? "100%" : "0%",
            background: trendColor,
            borderRadius: "999px",
            transition: "width 1s ease",
            transitionDelay: `${index * 0.08 + 0.2}s`,
          }} />
        </div>
      </div>
    </div>
  );
}


/* ─── Status Badge ───────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const m = {
    completed: { bg: "rgba(34,197,94,0.06)", color: T.success, border: "rgba(34,197,94,0.15)" },
    running:   { bg: "rgba(96,165,250,0.06)", color: "#60A5FA", border: "rgba(96,165,250,0.15)" },
    failed:    { bg: "rgba(239,68,68,0.06)",  color: T.critical, border: "rgba(239,68,68,0.15)" },
    pending:   { bg: "rgba(250,204,21,0.04)",  color: T.yellow,   border: "rgba(250,204,21,0.12)" },
  };
  const s = (status||"pending").toLowerCase();
  const st = m[s]||m.pending;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:"5px",
      padding:"2px 8px", borderRadius:"999px", fontSize:"10px", fontWeight:"700",
      background:st.bg, color:st.color, border:`1px solid ${st.border}`,
      letterSpacing: "0.2px"
    }}>
      <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:st.color,
        ...(s==="running"?{animation:"blink 1.2s ease infinite"}:{})
      }} />
      {s.charAt(0).toUpperCase()+s.slice(1)}
    </span>
  );
}

/* ─── Severity Badge ─────────────────────────────────────────────────────── */
function SevBadge({ count, color, label }) {
  if (!count) return null;
  const isCrit = label.toUpperCase() === "CRIT";
  const bg = isCrit ? "rgba(239, 68, 68, 0.1)" : "rgba(249, 115, 22, 0.1)";
  const txt = isCrit ? "#F87171" : "#FB923C";
  const border = isCrit ? "rgba(239, 68, 68, 0.2)" : "rgba(249, 115, 22, 0.2)";

  return (
    <span style={{
      padding:"2px 8px", borderRadius:"999px", fontSize:"9.5px", fontWeight:"700",
      background: bg, color: txt, border: `1px solid ${border}`,
      textTransform: "uppercase",
      letterSpacing: "0.4px"
    }}>{count} {label}</span>
  );
}

/* ─── Sort Icon ──────────────────────────────────────────────────────────── */
function SortIcon({ active, dir }) {
  if (!active) return <Minus size={9} color={T.dimmed} />;
  return dir==="asc" ? <ArrowUp size={9} color={T.purple} /> : <ArrowDown size={9} color={T.purple} />;
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ScanHistoryPage() {
  const location  = useLocation();
  const navigate  = useNavigate();

  /* State */
  const [summary,       setSummary]       = useState(null);
  const [scans,         setScans]         = useState([]);
  const [totalScans,    setTotalScans]    = useState(0);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [activeFilter,  setActiveFilter]  = useState("all");
  const [sortBy,        setSortBy]        = useState("date");
  const [sortDir,       setSortDir]       = useState("desc");
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [compareOpen,   setCompareOpen]   = useState(false);
  const [selectedScan,  setSelectedScan]  = useState(null);
  const [wsLive,        setWsLive]        = useState(false);
  const [activeScans,   setActiveScans]   = useState([]);
  const [ragInsight,    setRagInsight]    = useState(null);
  const [trendData,     setTrendData]     = useState([]);
  const [copiedId,      setCopiedId]      = useState(null);
  const PAGE_SIZE = 10;
  const searchT = useRef(null);

  /* ── fetch summary ─ */
  const fetchSummary = useCallback(async () => {
    try {
      const r = await api.get("/scans/dashboard/summary");
      if (r.data?.success) setSummary(r.data.summary);
    } catch { /* silent */ }
  }, []);

  /* ── fetch scans ─ */
  const fetchScans = useCallback(async (opts={}) => {
    try {
      const p = new URLSearchParams({
        page: String(opts.page ?? page),
        limit: String(PAGE_SIZE),
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(activeFilter !== "all" ? { status: activeFilter } : {}),
        sort: sortBy, dir: sortDir,
      });
      const r = await api.get(`/scans/history?${p}`);
      setScans(r.data.scans || []);
      const tot = r.data.total ?? r.data.scans?.length ?? 0;
      setTotalScans(tot);
      setTotalPages(Math.max(1, Math.ceil(tot / PAGE_SIZE)));
    } catch { toast.error("Failed to fetch scan records"); }
  }, [page, searchTerm, activeFilter, sortBy, sortDir]);

  /* ── fetch trend sparkline data ─ */
  const fetchTrend = useCallback(async () => {
    try {
      const r = await api.get("/scans/history?limit=20&sort=date&dir=asc");
      const s = r.data?.scans || [];
      const byDate = {};
      s.forEach(sc => {
        const d = sc.createdAt
          ? new Date(sc.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})
          : "—";
        if (!byDate[d]) byDate[d] = { scans:0, vulns:0 };
        byDate[d].scans++;
        byDate[d].vulns += sc.vulnerabilityCount || 0;
      });
      setTrendData(Object.entries(byDate).slice(-12).map(([date,v])=>({date,...v})));
    } catch { /* silent */ }
  }, []);

  /* ── fetch RAG insight ─ */
  const fetchInsight = useCallback(async () => {
    try {
      const r = await api.post("/copilot/messages", {
        message: "Give a single concise security insight sentence about API scan vulnerability trends.",
        conversationId: "sh-rag-insight",
        useRAG: true,
      });
      const txt = r.data?.reply || r.data?.message?.content || r.data?.content;
      if (txt) setRagInsight(txt);
    } catch {
      setRagInsight("Authentication flaws represent 38% of critical findings. Prioritize JWT validation and CORS hardening on all API routes.");
    }
  }, []);

  /* ── load all ─ */
  const loadAll = useCallback(async (initial=false) => {
    if (initial) setLoading(true); else setRefreshing(true);
    await Promise.all([fetchSummary(), fetchScans(), fetchTrend()]);
    setLoading(false); setRefreshing(false);
    fetchInsight();
  }, [fetchSummary, fetchScans, fetchTrend, fetchInsight]);

  useEffect(() => {
    loadAll(true);
    if (location.state?.scan) { setSelectedScan(location.state.scan); setDrawerOpen(true); }
  }, []);

  useEffect(() => { if (!loading) fetchScans(); }, [page, activeFilter, sortBy, sortDir]);

  useEffect(() => {
    clearTimeout(searchT.current);
    searchT.current = setTimeout(() => {
      if (!loading) { setPage(1); fetchScans({page:1}); }
    }, 600);
    return () => clearTimeout(searchT.current);
  }, [searchTerm]);

  /* ── WebSocket ─ */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !socket.connected) {
      socket.connect();
    }
    setWsLive(socket.connected);
    const onCon  = () => setWsLive(true);
    const onDis  = () => setWsLive(false);
    const onStart = d => {
      setActiveScans(p => [...p.filter(s=>s.scanId!==d.scanId), {...d,status:"running",progress:0}]);
      toast("🔍 New scan started!", {duration:3000});
    };
    const onProg = d => setActiveScans(p => p.map(s=>s.scanId===d.scanId?{...s,progress:d.percent||0}:s));
    const onDone = () => { setActiveScans([]); loadAll(false); toast.success("Scan complete — records updated"); };
    const onFail = d => { setActiveScans(p=>p.filter(s=>s.scanId!==d?.scanId)); loadAll(false); };
    socket.on("connect",       onCon);
    socket.on("disconnect",    onDis);
    socket.on("scan:start",    onStart);
    socket.on("scan:started",  onStart);
    socket.on("scan:progress", onProg);
    socket.on("scan:completed",onDone);
    socket.on("scan:complete", onDone);
    socket.on("scan:failed",   onFail);
    socket.on("dashboard:update", () => loadAll(false));
    return () => {
      ["connect","disconnect","scan:start","scan:started","scan:progress",
       "scan:completed","scan:complete","scan:failed","dashboard:update"]
       .forEach(ev => socket.off(ev));
    };
  }, []);

  /* ── Handlers ─ */
  const handleView = sc => { setSelectedScan(sc); setDrawerOpen(true); };

  const handleExport = async sc => {
    const tid = toast.loading("Generating PDF...");
    try {
      const r = await api.get(`/reports/${sc.scanId}/export/pdf`, {responseType:"blob"});
      const url = URL.createObjectURL(new Blob([r.data],{type:"application/pdf"}));
      const a = document.createElement("a");
      a.href=url; a.download=`Security_Report_${sc.scanId}.pdf`; a.click(); a.remove();
      toast.success("PDF downloaded!", {id:tid});
    } catch { toast.error("PDF export failed", {id:tid}); }
  };

  const handleRerun = async sc => {
    const tid = toast.loading("Re-triggering scan...");
    try {
      const r = await api.post("/scans", {
        targetUrl: sc.targetUrl || sc.target || "https://api.example.com",
        profile: sc.profile || "Full Security Audit",
        authType: sc.authType || "none",
      });
      toast.success("Scan queued!", {id:tid});
      navigate("/scans", {state:{scan:r.data.scan}});
    } catch (e) { toast.error(e.response?.data?.message || "Re-run failed", {id:tid}); }
  };

  const handleCopy = id => {
    navigator.clipboard.writeText(id).catch(()=>{});
    setCopiedId(id);
    setTimeout(()=>setCopiedId(null), 1800);
  };

  const handleSort = col => {
    if (sortBy===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  /* ── Derived values ─ */
  const score   = summary?.averageScore ?? 0;
  const grade   = score>=90?"A+":score>=80?"A":score>=70?"B":score>=60?"C":"F";
  const gradeC  = score>=80?T.success:score>=70?T.purple:score>=60?T.yellow:T.critical;

  const kpiCards = [
    {
      id:"k1", icon:<Activity size={20}/>, title:"TOTAL SCANS",
      value: summary?.totalScans ?? totalScans,
      trend: summary?.recentScans ? `+${summary.recentScans}` : null,
      trendColor:"#60A5FA",
      sparkline:"M0 40 C30 36,50 32,80 28 C110 24,130 30,160 22 C190 14,210 26,240 18",
    },
    {
      id:"k2", icon:<AlertTriangle size={20}/>, title:"CRITICAL FINDINGS",
      value: summary?.criticalFindings ?? "—",
      trend: null, trendColor: T.critical,
      sparkline:"M0 20 C30 24,50 18,80 28 C110 38,130 22,160 32 C190 42,210 30,240 36",
    },
    {
      id:"k3", icon:<CheckCircle2 size={20}/>, title:"REMEDIATION RATE",
      value: summary?.remediatedRate!=null ? `${Math.round(summary.remediatedRate)}%` : "—",
      trend: null, trendColor: T.success,
      sparkline:"M0 38 C30 34,50 30,80 24 C110 18,130 28,160 16 C190 8,210 20,240 12",
    },
    {
      id:"k4", icon:<Shield size={20}/>, title:"AVG SECURITY SCORE",
      value: summary?.averageScore ? Math.round(summary.averageScore) : "—",
      trend: null, trendColor: T.purple,
      sparkline:"M0 36 C30 30,50 34,80 26 C110 18,130 28,160 20 C190 12,210 22,240 14",
    },
  ];

  const filters = ["all","completed","running","failed","pending"];
  const riskC   = r => r>=8?T.critical:r>=5?T.warning:T.success;

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px", width:"100%",
      fontFamily:"Outfit,Inter,sans-serif", color:T.white }}>
      <style>{CSS}</style>

      {/* ══════════ HEADER (same as DashboardHeader) ══════════════════════ */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h1 style={{ color:T.white, fontSize:"42px", margin:0, fontWeight:"700" }}>
            Scan History
          </h1>
          <p style={{ color:T.muted, marginTop:"10px", margin:"10px 0 0" }}>
            Analyze historical API security assessments, vulnerability trends and remediation progress.
          </p>
        </div>

        <div style={{ display:"flex", gap:"10px", alignItems:"center", flexShrink:0 }}>
          {/* WebSocket indicator */}
          <div style={{
            display:"flex", alignItems:"center", gap:"8px",
            padding:"8px 14px", borderRadius:"12px",
            background: wsLive ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.08)",
            border:`1px solid ${wsLive?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}`,
            fontSize:"12px", fontWeight:"600",
            color: wsLive ? T.success : T.critical,
          }}>
            <span style={{ position:"relative", width:"8px", height:"8px", display:"inline-block" }}>
              {wsLive && <span style={{
                position:"absolute", inset:0, borderRadius:"50%",
                background:T.success, animation:"live-ping 1.4s ease-out infinite",
              }}/>}
              <span style={{
                position:"relative", display:"block", width:"8px", height:"8px",
                borderRadius:"50%", background: wsLive?T.success:T.critical,
              }}/>
            </span>
            {wsLive ? "LIVE" : "OFFLINE"}
          </div>

          <button
            onClick={() => loadAll(false)}
            className="sh-btn"
            style={{...btnSecondary, padding:"10px 14px"}}
            title="Refresh"
          >
            <RefreshCw size={16} style={{animation:refreshing?"spin 1s linear infinite":"none"}} />
          </button>

          <button onClick={() => setCompareOpen(true)} className="sh-btn" style={btnSecondary}>
            <GitCompare size={16}/> Compare Scans
          </button>

          <button onClick={() => navigate("/scans")} className="sh-btn" style={btnPrimary}>
            + New Scan
          </button>
        </div>
      </div>

      {/* ══════════ STAT CARDS (exact StatCard style) ══════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"20px" }}>
        {kpiCards.map((k, i) => (
          <StatCard key={k.id} {...k} index={i} />
        ))}
      </div>

      {/* Security Grade + RAG Insight strip */}
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"20px", alignItems:"stretch" }}>
        {/* Grade badge */}
        <div style={{
          ...card({ padding:"24px 34px", textAlign:"center", display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", minWidth:"160px" }),
          borderColor: `${gradeC}35`,
          background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(3,7,18,0.98))",
          boxShadow: `0 10px 30px rgba(0,0,0,0.4), inset 0 0 20px ${gradeC}10`,
          borderRadius: "20px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "relative",
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            background: `rgba(${gradeC === T.critical ? "239,68,68" : "34,197,94"}, 0.1)`,
            border: `3px solid ${gradeC}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 25px ${gradeC}30`,
            marginBottom: "12px",
          }}>
            <div style={{ color: gradeC, fontSize: "44px", fontWeight: "900", lineHeight: 1 }}>
              {loading ? "—" : grade}
            </div>
          </div>
          <div style={{ color: T.dimmed, fontSize: "10px", fontWeight: "800", letterSpacing: "1.2px", textTransform: "uppercase" }}>
            SECURITY GRADE
          </div>
          <div style={{ color: T.white, fontSize: "14px", fontWeight: "900", marginTop: "4px", fontFamily: "monospace" }}>
            {loading ? "—" : `${Math.round(score)} / 100`}
          </div>
        </div>

        {/* RAG AI insight panel */}
        <div style={{
          ...card({ padding:"24px" }),
          background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(15,23,42,0.95))",
          borderColor: "rgba(139,92,246,0.22)",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{
                width:"40px", height:"40px", borderRadius:"12px",
                background:"rgba(139,92,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center",
                border:"1px solid rgba(139,92,246,0.3)",
              }}>
                <Brain size={18} color={T.purple} />
              </div>
              <div>
                <div style={{ color:T.purple, fontSize:"11px", fontWeight:"900", letterSpacing:"1.2px" }}>
                  AI SECURITY COPILOT
                </div>
                <div style={{ color:T.dimmed, fontSize:"12px", marginTop:"2px" }}>
                  RAG-powered insights from live threat intelligence
                </div>
              </div>
            </div>
            <div style={{
              display:"flex", alignItems:"center", gap:"6px",
              padding:"5px 12px", borderRadius:"999px", fontSize:"10px", fontWeight:"800",
              background:"rgba(139,92,246,0.12)", color:T.purple,
              border:"1px solid rgba(139,92,246,0.25)",
            }}>
              <span className="queue-pulse-active" style={{ width:"6px", height:"6px", borderRadius:"50%", background:T.purple }} />
              LIVE
            </div>
          </div>

          {ragInsight ? (
            <p style={{ color:"#F1F5F9", fontSize:"13.5px", lineHeight:"1.6", margin:0, fontWeight: "500" }}>
              {ragInsight}
            </p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {[70,85,50].map((w,i) => (
                <div key={i} style={{ height:"10px", borderRadius:"4px", width:`${w}%`,
                  background:T.skeleton, animation:"pulse-skeleton 1.5s infinite" }} />
              ))}
            </div>
          )}

          <div style={{ display:"flex", gap:"12px", marginTop:"20px" }}>
            <button onClick={() => navigate("/copilot")} className="sh-btn queue-card-hover" style={{
              background: T.purple,
              border:"none", borderRadius:"10px", padding:"10px 18px",
              color:T.white, fontWeight:"800", fontSize:"12.5px", cursor:"pointer",
              boxShadow: `0 4px 14px ${T.purple}35`,
            }}>
              Analyze Now
            </button>
            <button onClick={() => navigate("/vulnerabilities")} className="sh-btn queue-card-hover" style={{
              background:"rgba(255,255,255,0.05)",
              color:T.white,
              border:"1px solid rgba(255,255,255,0.12)",
              padding:"10px 18px",
              borderRadius:"10px",
              cursor:"pointer",
              fontSize:"12.5px",
              fontWeight: "700",
              display:"flex",
              alignItems:"center",
              gap:"6px",
            }}>
              View All Recommendations →
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ TREND CHART ═══════════════════════════════════════════ */}
      {trendData.length > 0 && (
        <div style={{
          ...card({ padding: "24px" }),
          background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(3,7,18,0.98))",
          borderColor: "rgba(255,255,255,0.08)",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <div>
              <h3 style={{ margin:0, fontSize:"20px", fontWeight:"900", color: "#FFF" }}>Scan Activity Trend</h3>
              <p style={{ color:T.muted, margin:"4px 0 0", fontSize:"13px" }}>
                Daily scan volume and vulnerability discovery rate
              </p>
            </div>
            <div style={{ display:"flex", gap:"18px" }}>
              {[{label:"Scans",color:T.purple},{label:"Vulns",color:T.critical}].map(l=>(
                <div key={l.label} style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                  <div style={{ width:"12px",height:"3px",background:l.color,borderRadius:"2px" }} />
                  <span style={{ color:T.muted, fontSize:"12.5px", fontWeight: "700" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData} margin={{top:10,right:10,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.purple}   stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={T.purple}   stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.critical} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={T.critical} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fill:T.dimmed,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.dimmed,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#0F172A",border:`1px solid ${T.border}`,borderRadius:"12px",fontSize:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}/>
              <Area type="monotone" dataKey="scans" stroke={T.purple}   strokeWidth={3} fill="url(#gs)" dot={{ r: 3, fill: T.purple }}/>
              <Area type="monotone" dataKey="vulns"  stroke={T.critical} strokeWidth={2} fill="url(#gv)" dot={{ r: 3, fill: T.critical }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ══════════ LIVE ACTIVE SCANS (WebSocket badge) ═══════════════════ */}
      {activeScans.length > 0 && (
        <div style={{
          ...card({ padding:"14px 20px" }),
          borderColor: "rgba(96,165,250,0.15)",
          background: "#080c14",
          animation: "floatup 0.4s ease",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
            <Radio size={14} color="#60A5FA" style={{animation:"blink 1s ease infinite"}}/>
            <span style={{ color:"#60A5FA", fontSize:"10px", fontWeight:"800", letterSpacing:"1.2px" }}>
              LIVE ACTIVE SCANS
            </span>
          </div>
          {activeScans.map(sc => (
            <div key={sc.scanId} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"6px 0" }}>
              <Globe size={12} color={T.muted} style={{flexShrink:0}}/>
              <span style={{ color:T.white, fontSize:"12px", fontWeight:"500", flex:1,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {sc.targetUrl || sc.target || "Scanning..."}
              </span>
              <div style={{ flex:"0 0 160px", height:"4px", background:"rgba(255,255,255,.06)",
                borderRadius:"2px", overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:"2px",
                  width:`${sc.progress||0}%`,
                  background:`linear-gradient(90deg,#60A5FA,${T.purple})`,
                  transition:"width 0.5s ease",
                }}/>
              </div>
              <span style={{ color:"#60A5FA", fontSize:"11px", fontWeight:"700", flexShrink:0 }}>
                {sc.progress||0}%
              </span>
            </div>
          ))}
        </div>
      )}
      <div style={{
        background: "#080c14",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}>

        {/* Toolbar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Quick filters */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
            {filters.map(f => (
              <button key={f} className="sh-btn sh-filter-pill"
                onClick={() => { setActiveFilter(f); setPage(1); }}
                style={{
                  border: activeFilter===f ? "1px solid rgba(139,92,246,.5)" : "1px solid rgba(255,255,255,.07)",
                  background: activeFilter===f ? "rgba(139,92,246,.15)" : "rgba(255,255,255,0.02)",
                  color: activeFilter===f ? T.purple : T.dimmed,
                  boxShadow: activeFilter===f ? "0 0 14px rgba(139,92,246,0.2)" : "none",
                }}>
                {f==="all" ? `All ${totalScans>0?`(${totalScans})`:""}`  : f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>

          {/* Search + Export */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="sh-search-container">
              <Search size={14} color={T.dimmed}/>
              <input
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search scan ID, target, profile..."
                style={{ flex:1, background:"transparent", border:"none", outline:"none",
                  color: T.white, fontSize: "13px", letterSpacing: "0.2px" }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}
                  style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:"2px"}}>
                  <X size={13} color={T.dimmed}/>
                </button>
              )}
            </div>

            <button onClick={() => toast("Select a scan row to export PDF", {icon:"📋"})}
              className="sh-btn" style={{
                display:"flex", alignItems:"center", gap:"7px",
                height:"42px", padding:"0 16px", borderRadius:"12px",
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.08)",
                color:T.muted, fontSize:"13px", fontWeight:"600", cursor:"pointer",
              }}>
              <Download size={14}/> Export
            </button>

            <button onClick={() => loadAll(false)} className="sh-btn"
              style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                height:"42px", width:"42px", borderRadius:"12px",
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.08)",
                color:T.dimmed, cursor:"pointer",
              }}>
              <RefreshCw size={14} style={{animation:refreshing?"spin 1s linear infinite":"none"}}/>
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {[
                  {label:"SCAN ID",  col:"scanId"},
                  {label:"TARGET",   col:"target"},
                  {label:"PROFILE",  col:null},
                  {label:"DATE",     col:"date"},
                  {label:"DURATION", col:null},
                  {label:"FINDINGS", col:"findings"},
                  {label:"RISK",     col:"risk"},
                  {label:"STATUS",   col:"status"},
                  {label:"ACTIONS",  col:null},
                ].map(({label,col})=>(
                  <th key={label}
                    onClick={col?()=>handleSort(col):undefined}
                    style={{
                      padding:"12px 20px", textAlign:"left",
                      color: sortBy===col ? "#A78BFA" : "#94A3B8",
                      fontSize:"9.5px", fontWeight:"800", letterSpacing:"1.2px",
                      cursor:col?"pointer":"default", userSelect:"none", whiteSpace:"nowrap",
                      transition: "color 0.2s ease",
                    }}>
                    <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
                      {label}
                      {col && <SortIcon active={sortBy===col} dir={sortDir}/>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
                    {[...Array(9)].map((_,j)=>(
                      <td key={j} style={{padding:"14px 16px"}}>
                        <div style={{
                          height:"12px", borderRadius:"4px",
                          width: j===0?"120px":j===8?"80px":"65%",
                          background:T.skeleton, animation:"pulse-skeleton 1.5s infinite",
                        }}/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : scans.length===0 ? (
                <tr><td colSpan={9} style={{padding:"48px",textAlign:"center",color:T.muted}}>
                  <Shield size={36} style={{margin:"0 auto 14px",opacity:0.2,display:"block"}}/>
                  <div style={{fontSize:"15px",fontWeight:"600",color:T.white,marginBottom:"6px"}}>
                    No scans found
                  </div>
                  <div style={{fontSize:"12px",opacity:0.6}}>
                    Try adjusting filters or run a new scan
                  </div>
                </td></tr>
              ) : scans.map((sc,idx)=>{
                const isRun  = sc.status==="running";
                const target = sc.targetUrl||sc.target||"—";
                const finds  = sc.vulnerabilityCount||sc.findings?.length||0;
                const risk   = sc.riskScore??sc.risk??0;
                const dur    = sc.duration ? `${sc.duration}s` : "—";
                const date   = sc.createdAt
                  ? new Date(sc.createdAt).toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"2-digit"})
                  : "—";

                const riskColor = risk >= 8 ? "#EF4444" : risk >= 5 ? "#F97316" : "#10B981";
                const riskBg = risk >= 8 
                  ? "linear-gradient(90deg, #F97316, #EF4444)" 
                  : risk >= 5 
                    ? "linear-gradient(90deg, #F59E0B, #F97316)" 
                    : "linear-gradient(90deg, #10B981, #06B6D4)";
                const riskShadow = risk >= 8 
                  ? "0 0 8px rgba(239, 68, 68, 0.5)" 
                  : risk >= 5 
                    ? "0 0 6px rgba(249, 115, 22, 0.35)" 
                    : "0 0 6px rgba(16, 185, 129, 0.25)";

                return (
                  <tr key={sc._id||sc.scanId||idx} className="sh-row"
                    style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}
                    onClick={()=>handleView(sc)}>

                    {/* Scan ID */}
                    <td style={{padding:"14px 20px"}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                        <span style={{color:T.purple,fontFamily:"'JetBrains Mono', 'Fira Code', monospace",fontSize:"11.5px",fontWeight:"700", letterSpacing:"0.3px"}}>
                          {sc.scanId?.slice(-12)||"—"}
                        </span>
                        <button onClick={()=>handleCopy(sc.scanId)}
                          style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:"2px",opacity:0.5,transition:"opacity 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.opacity=1}
                          onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>
                          {copiedId===sc.scanId
                            ? <Check size={10} color={T.success}/>
                            : <Copy size={10} color={T.dimmed}/>}
                        </button>
                      </div>
                      {isRun && (
                        <div style={{height:"2px",background:"rgba(255,255,255,.04)",borderRadius:"1px",
                          marginTop:"6px",overflow:"hidden",width:"100px"}}>
                          <div style={{height:"100%",width:`${sc.progress||30}%`,
                            background:`linear-gradient(90deg,#60A5FA,${T.purple})`,transition:"width 0.5s"}}/>
                        </div>
                      )}
                    </td>

                    {/* Target */}
                    <td style={{padding:"14px 20px",maxWidth:"190px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px",overflow:"hidden"}}>
                        <WebsiteFavicon host={target} />
                        <span style={{color:"#CBD5E1",fontWeight:"500",overflow:"hidden",
                          textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"12px"}}>
                          {target.replace(/^https?:\/\//,"")}
                        </span>
                      </div>
                    </td>

                    {/* Profile */}
                    <td style={{padding:"14px 20px"}}>
                      <span style={{
                        padding:"3px 10px", borderRadius:"6px", fontSize:"10px", fontWeight:"700",
                        background:"rgba(139,92,246,.08)", color:"rgba(139,92,246,0.9)",
                        border:"1px solid rgba(139,92,246,.15)", letterSpacing:"0.2px",
                      }}>
                        {sc.profile||"Full Security Audit"}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{padding:"14px 20px",color:"#475569",fontSize:"11.5px",whiteSpace:"nowrap",fontWeight:"500"}}>{date}</td>

                    {/* Duration */}
                    <td style={{padding:"14px 20px",color:"#475569",fontSize:"11.5px",fontFamily:"monospace"}}>{dur}</td>

                    {/* Findings */}
                    <td style={{padding:"14px 20px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                        <span style={{color:finds>0?"#FB923C":"#22C55E",fontWeight:"700",fontSize:"12px"}}>
                          {finds>0?`${finds}`:`✓ Clean`}
                        </span>
                        <SevBadge count={sc.criticalCount} color={T.critical} label="CRIT"/>
                        <SevBadge count={sc.highCount}     color={T.warning}  label="HIGH"/>
                      </div>
                    </td>

                    {/* Risk */}
                    <td style={{padding:"14px 20px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <div style={{width:"40px",height:"3px",borderRadius:"999px",
                          background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(100,risk*10)}%`,
                            borderRadius:"999px",
                            background: riskBg,
                            boxShadow: riskShadow}}/>
                        </div>
                        <span style={{color: riskColor,fontSize:"12px",fontWeight:"700",fontFamily:"monospace"}}>
                          {risk?Number(risk).toFixed(1):"—"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{padding:"14px 20px"}}><StatusBadge status={sc.status}/></td>

                    {/* Actions */}
                    <td style={{padding:"14px 20px"}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",gap:"5px"}}>
                        <button className="sh-btn" onClick={()=>handleView(sc)} title="View Details"
                          style={{background:"transparent", color:"#94A3B8", borderRadius:"50%", border:"none", width:"30px", height:"30px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s ease, color 0.15s ease"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color="#FFF"}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#94A3B8"}}>
                          <Eye size={13}/>
                        </button>
                        <button className="sh-btn" onClick={()=>handleExport(sc)} title="Export PDF"
                          style={{background:"transparent", color:"#94A3B8", borderRadius:"50%", border:"none", width:"30px", height:"30px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s ease, color 0.15s ease"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color="#FFF"}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#94A3B8"}}>
                          <Download size={13}/>
                        </button>
                        <button className="sh-btn" onClick={()=>handleRerun(sc)} title="Re-run"
                          disabled={isRun}
                          style={{background:isRun?"rgba(255,255,255,.03)":"rgba(249,115,22,.08)",color:isRun?T.dimmed:T.warning,
                            borderRadius:"8px", border:"none", padding:"6px", cursor:isRun?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}
                          onMouseEnter={e=>{if(!isRun){e.currentTarget.style.background="rgba(249,115,22,.15)"}}}
                          onMouseLeave={e=>{e.currentTarget.style.background=isRun?"rgba(255,255,255,.03)":"rgba(249,115,22,.08)"}}>
                          <RotateCw size={13} style={{animation:isRun?"spin 1.5s linear infinite":"none"}}/>
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
        <div style={{ padding:"14px 24px", borderTop:"1px solid rgba(255,255,255,0.06)",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{color:T.dimmed,fontSize:"12px",fontWeight:"500"}}>
            Showing {Math.min((page-1)*PAGE_SIZE+1,totalScans)}–{Math.min(page*PAGE_SIZE,totalScans)} of {totalScans}
          </span>
          <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
              style={{width:"32px",height:"32px",borderRadius:"8px",
                border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",
                color:page<=1?"#334155":T.white,cursor:page<=1?"not-allowed":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"background 0.15s ease"}}>
              <ChevronLeft size={14}/>
            </button>
            {[...Array(Math.min(5,totalPages))].map((_,i)=>{
              const p = i+Math.max(1,page-2);
              if(p>totalPages) return null;
              return (
                <button key={p} onClick={()=>setPage(p)}
                  style={{width:"32px",height:"32px",borderRadius:"8px",fontSize:"12px",fontWeight:"700",
                    border:page===p?"1px solid rgba(139,92,246,0.3)":"1px solid rgba(255,255,255,0.08)",
                    background:page===p?"rgba(139,92,246,0.1)":"rgba(255,255,255,0.02)",
                    color:page===p?"#A78BFA":T.muted,cursor:"pointer",
                    transition:"background 0.15s ease, border-color 0.15s ease"}}>
                  {p}
                </button>
              );
            })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
              style={{width:"32px",height:"32px",borderRadius:"8px",
                border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",
                color:page>=totalPages?"#334155":T.white,cursor:page>=totalPages?"not-allowed":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"background 0.15s ease"}}>
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ MODALS ════════════════════════════════════════════════ */}
      <ScanHistoryDrawer
        open={drawerOpen}
        onClose={()=>{setDrawerOpen(false);setSelectedScan(null);}}
        selectedScan={selectedScan}
        onRerun={handleRerun}
      />
      <ScanComparisonModal open={compareOpen} onClose={()=>setCompareOpen(false)}/>
    </div>
  );
}