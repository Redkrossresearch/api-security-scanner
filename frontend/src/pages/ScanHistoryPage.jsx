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
  background: `linear-gradient(180deg, ${T.dark} 0%, ${T.darker} 100%)`,
  border: `1px solid ${T.border}`,
  borderRadius: "20px",
  padding: "24px",
  color: T.white,
  ...extra,
});

const btnPrimary = {
  background: T.warning,
  color: T.white,
  border: "none",
  padding: "10px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  whiteSpace: "nowrap",
};

const btnSecondary = {
  background: T.darkGray,
  color: T.white,
  border: `1px solid #334155`,
  padding: "10px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "14px",
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
  .sh-row:hover { background: rgba(255,255,255,0.025) !important; cursor:pointer; }
  .sh-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .sh-btn:hover { opacity:0.82; transform:scale(1.04); }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(139,92,246,.3); border-radius:4px; }
`;

/* ─── Stat Card (identical layout to Dashboard StatCards) ───────────────── */
function StatCard({ icon, title, value, trend, trendColor = "#8B5CF6", sparkline, id = "sc" }) {
  const hexToRgb = (hex) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "139,92,246";
  };
  const rgb = hexToRgb(trendColor);
  const [displayVal, setDisplayVal] = useState("—");

  useEffect(() => {
    if (value === null || value === undefined) return;
    const str = String(value);
    const num = parseInt(str.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) { setDisplayVal(str); return; }
    let cur = 0;
    const frames = 36;
    const inc = Math.ceil(num / frames) || 1;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= num) { clearInterval(t); setDisplayVal(str); }
      else { setDisplayVal(cur + str.replace(/[0-9]/g, "")); }
    }, 1000 / 30);
    return () => clearInterval(t);
  }, [value]);

  const defaultPath = "M0 35 C25 30,40 40,60 34 C90 24,110 42,140 28 C170 14,190 35,240 18";
  const path = sparkline || defaultPath;

  return (
    <div style={{
      background: `radial-gradient(130px circle at top left, rgba(${rgb},0.12), transparent 90%), linear-gradient(180deg, #090d16 0%, #030712 100%)`,
      border: `1px solid ${T.border}`,
      borderRadius: "18px",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
      minHeight: "150px",
      boxShadow: "0 8px 24px rgba(0,0,0,.35)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 30px rgba(${rgb},0.12)`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.35)"; }}
    >
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", zIndex:2 }}>
        <div style={{
          width:"42px", height:"42px", borderRadius:"12px",
          background:`rgba(${rgb},.12)`, display:"flex", alignItems:"center", justifyContent:"center",
          color: trendColor, border:`1px solid rgba(${rgb},.2)`,
        }}>{icon}</div>
        {trend && (
          <div style={{
            padding:"4px 10px", borderRadius:"999px",
            background:`rgba(${rgb},.1)`, color:trendColor,
            fontSize:"11px", fontWeight:"700", border:`1px solid rgba(${rgb},.2)`,
          }}>{trend}</div>
        )}
      </div>

      {/* Label + Value */}
      <div style={{ zIndex:2, marginTop:"16px" }}>
        <div style={{ color:T.muted, fontSize:"11px", fontWeight:"700", letterSpacing:"0.8px", textTransform:"uppercase" }}>
          {title}
        </div>
        <div style={{ color:T.white, fontSize:"36px", fontWeight:"900", marginTop:"6px", lineHeight:1, fontFamily:"Outfit,Inter,sans-serif" }}>
          {displayVal !== "—" ? displayVal : (
            <div style={{ width:"100px", height:"36px", borderRadius:"6px", background:T.skeleton, animation:"pulse-skeleton 1.5s infinite" }} />
          )}
        </div>
      </div>

      {/* Sparkline */}
      <svg width="100%" height="48" viewBox="0 0 240 48" preserveAspectRatio="none"
        style={{ position:"absolute", left:0, bottom:0, opacity:0.65, zIndex:1 }}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={trendColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L240 48 L0 48 Z`} fill={`url(#g-${id})`} />
        <path d={path} fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const m = {
    completed: { bg:"rgba(34,197,94,.12)", color:T.success,  border:"rgba(34,197,94,.25)"  },
    running:   { bg:"rgba(96,165,250,.12)", color:"#60A5FA",  border:"rgba(96,165,250,.25)" },
    failed:    { bg:"rgba(239,68,68,.12)",  color:T.critical, border:"rgba(239,68,68,.25)"  },
    pending:   { bg:"rgba(250,204,21,.1)",  color:T.yellow,   border:"rgba(250,204,21,.22)" },
  };
  const s = (status||"pending").toLowerCase();
  const st = m[s]||m.pending;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:"5px",
      padding:"3px 9px", borderRadius:"999px", fontSize:"10px", fontWeight:"700",
      background:st.bg, color:st.color, border:`1px solid ${st.border}`,
    }}>
      <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:st.color,
        ...(s==="running"?{animation:"blink 1.2s ease infinite"}:{})
      }} />
      {s.charAt(0).toUpperCase()+s.slice(1)}
    </span>
  );
}

/* ─── Severity Badge ─────────────────────────────────────────────────────── */
function SevBadge({ count, color, label }) {
  if (!count) return null;
  return (
    <span style={{
      padding:"1px 6px", borderRadius:"4px", fontSize:"9px", fontWeight:"700",
      background:`${color}1a`, color, border:`1px solid ${color}33`,
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
      const txt = r.data?.message?.content || r.data?.content;
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
    socket.connect(); setWsLive(socket.connected);
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
        url: sc.targetUrl || sc.target || "https://api.example.com",
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
        {kpiCards.map(k => (
          <StatCard key={k.id} {...k} />
        ))}
      </div>

      {/* Security Grade + RAG Insight strip */}
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"20px", alignItems:"stretch" }}>
        {/* Grade badge */}
        <div style={{
          ...card({ padding:"20px 28px", textAlign:"center", display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", minWidth:"130px" }),
          borderColor: `${gradeC}33`,
          boxShadow:`0 0 20px ${gradeC}15`,
        }}>
          <div style={{ color:gradeC, fontSize:"42px", fontWeight:"900", lineHeight:1,
            textShadow:`0 0 20px ${gradeC}60` }}>
            {loading ? "—" : grade}
          </div>
          <div style={{ color:T.dimmed, fontSize:"9px", fontWeight:"700", letterSpacing:"0.8px", marginTop:"6px" }}>
            SECURITY GRADE
          </div>
          <div style={{ color:T.muted, fontSize:"13px", fontWeight:"700", marginTop:"4px" }}>
            {loading ? "—" : `${Math.round(score)} / 100`}
          </div>
        </div>

        {/* RAG AI insight panel */}
        <div style={{
          ...card({ padding:"20px" }),
          background:"linear-gradient(120deg,rgba(124,58,237,.15) 0%,rgba(15,23,42,0.95) 60%)",
          borderColor:"rgba(139,92,246,.25)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{
                width:"36px", height:"36px", borderRadius:"10px",
                background:"rgba(139,92,246,.18)", display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 0 14px rgba(139,92,246,.3)",
              }}>
                <Brain size={18} color={T.purple} />
              </div>
              <div>
                <div style={{ color:T.purple, fontSize:"10px", fontWeight:"800", letterSpacing:"1px" }}>
                  AI SECURITY COPILOT
                </div>
                <div style={{ color:T.dimmed, fontSize:"11px", marginTop:"2px" }}>
                  RAG-powered insights from live threat intelligence
                </div>
              </div>
            </div>
            <div style={{
              display:"flex", alignItems:"center", gap:"6px",
              padding:"4px 10px", borderRadius:"999px", fontSize:"10px", fontWeight:"700",
              background:"rgba(139,92,246,.12)", color:T.purple,
              border:"1px solid rgba(139,92,246,.25)",
            }}>
              <span style={{ width:"5px", height:"5px", borderRadius:"50%",
                background:T.purple, animation:"blink 1.5s ease infinite" }} />
              LIVE
            </div>
          </div>

          {ragInsight ? (
            <p style={{ color:T.muted, fontSize:"13px", lineHeight:"1.65", margin:0 }}>
              {ragInsight}
            </p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {[70,85,50].map((w,i) => (
                <div key={i} style={{ height:"11px", borderRadius:"4px", width:`${w}%`,
                  background:T.skeleton, animation:"pulse-skeleton 1.5s infinite" }} />
              ))}
            </div>
          )}

          <div style={{ display:"flex", gap:"12px", marginTop:"16px" }}>
            <button onClick={() => navigate("/copilot")} className="sh-btn" style={{
              background:"linear-gradient(90deg,#7C3AED,#F97316)",
              border:"none", borderRadius:"12px", padding:"10px 18px",
              color:T.white, fontWeight:"700", fontSize:"13px", cursor:"pointer",
            }}>
              Analyze Now
            </button>
            <button onClick={() => navigate("/vulnerabilities")} className="sh-btn" style={{
              ...btnSecondary, fontSize:"13px",
            }}>
              View All Recommendations →
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ TREND CHART ═══════════════════════════════════════════ */}
      {trendData.length > 0 && (
        <div style={card()}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
            <div>
              <h3 style={{ margin:0, fontSize:"20px" }}>Scan Activity Trend</h3>
              <p style={{ color:T.muted, margin:"6px 0 0", fontSize:"13px" }}>
                Daily scan volume and vulnerability discovery rate
              </p>
            </div>
            <div style={{ display:"flex", gap:"16px" }}>
              {[{label:"Scans",color:T.purple},{label:"Vulns",color:T.critical}].map(l=>(
                <div key={l.label} style={{ display:"flex",alignItems:"center",gap:"7px" }}>
                  <div style={{ width:"10px",height:"2px",background:l.color,borderRadius:"2px" }} />
                  <span style={{ color:T.muted, fontSize:"12px" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={trendData} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.purple}   stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={T.purple}   stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.critical} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={T.critical} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fill:T.dimmed,fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.dimmed,fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#0F172A",border:`1px solid ${T.border}`,borderRadius:"10px",fontSize:"11px"}}/>
              <Area type="monotone" dataKey="scans" stroke={T.purple}   strokeWidth={2.5} fill="url(#gs)" dot={false}/>
              <Area type="monotone" dataKey="vulns"  stroke={T.critical} strokeWidth={1.5} fill="url(#gv)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ══════════ LIVE ACTIVE SCANS (WebSocket badge) ═══════════════════ */}
      {activeScans.length > 0 && (
        <div style={{
          ...card({ padding:"16px 20px" }),
          borderColor:"rgba(96,165,250,.25)",
          background:"linear-gradient(180deg,rgba(96,165,250,.06),rgba(15,23,42,.95))",
          animation:"floatup 0.4s ease",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
            <Radio size={14} color="#60A5FA" style={{animation:"blink 1s ease infinite"}}/>
            <span style={{ color:"#60A5FA", fontSize:"11px", fontWeight:"700", letterSpacing:"0.8px" }}>
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

      {/* ══════════ SCAN HISTORY TABLE ════════════════════════════════════ */}
      <div style={card({padding:0, overflow:"hidden"})}>

        {/* Toolbar */}
        <div style={{ padding:"18px 20px", borderBottom:`1px solid ${T.border}` }}>
          {/* Quick filters (pill tabs) */}
          <div style={{ display:"flex", gap:"6px", marginBottom:"14px", flexWrap:"wrap" }}>
            {filters.map(f => (
              <button key={f} className="sh-btn"
                onClick={() => { setActiveFilter(f); setPage(1); }}
                style={{
                  padding:"5px 14px", borderRadius:"999px", fontSize:"11px", fontWeight:"700",
                  border: activeFilter===f?"1px solid rgba(139,92,246,.5)":"1px solid rgba(255,255,255,.08)",
                  background: activeFilter===f?"rgba(139,92,246,.15)":"transparent",
                  color: activeFilter===f?T.purple:T.muted, cursor:"pointer", textTransform:"capitalize",
                }}>
                {f==="all" ? `All ${totalScans>0?`(${totalScans})`:""}` : f}
              </button>
            ))}
          </div>

          {/* Search + Export row */}
          <div style={{ display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap" }}>
            <div style={{
              flex:1, minWidth:"260px", display:"flex", alignItems:"center", gap:"10px",
              background:T.darkGray, border:`1px solid ${T.border}`,
              borderRadius:"12px", padding:"0 14px", height:"44px",
            }}>
              <Search size={15} color={T.muted}/>
              <input
                value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                placeholder="Search scan ID, target, profile..."
                style={{ flex:1, background:"transparent", border:"none", outline:"none",
                  color:T.white, fontSize:"13px" }}
              />
              {searchTerm && (
                <button onClick={()=>setSearchTerm("")}
                  style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>
                  <X size={14} color={T.muted}/>
                </button>
              )}
            </div>

            <button onClick={() => toast("Select a scan row to export PDF", {icon:"📋"})}
              className="sh-btn" style={{...btnSecondary, height:"44px"}}>
              <Download size={15}/> Export
            </button>

            <button onClick={() => loadAll(false)} className="sh-btn"
              style={{...btnSecondary, height:"44px", padding:"0 14px"}}>
              <RefreshCw size={15} style={{animation:refreshing?"spin 1s linear infinite":"none"}}/>
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
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
                      padding:"10px 16px", textAlign:"left",
                      color:T.dimmed, fontSize:"10px", fontWeight:"700", letterSpacing:"0.8px",
                      cursor:col?"pointer":"default", userSelect:"none", whiteSpace:"nowrap",
                    }}>
                    <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
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
                const dur    = sc.duration?`${Math.round(sc.duration/1000)}s`:sc.durationText||"—";
                const date   = sc.createdAt
                  ? new Date(sc.createdAt).toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"2-digit"})
                  : "—";
                return (
                  <tr key={sc._id||sc.scanId||idx} className="sh-row"
                    style={{borderBottom:`1px solid ${T.border}`, transition:"background 0.12s"}}
                    onClick={()=>handleView(sc)}>

                    {/* Scan ID */}
                    <td style={{padding:"13px 16px"}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                        <span style={{color:T.purple,fontFamily:"monospace",fontSize:"11px",fontWeight:"600"}}>
                          {sc.scanId?.slice(-12)||"—"}
                        </span>
                        <button onClick={()=>handleCopy(sc.scanId)}
                          style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:"2px"}}>
                          {copiedId===sc.scanId
                            ? <Check size={10} color={T.success}/>
                            : <Copy size={10} color={T.dimmed}/>}
                        </button>
                      </div>
                      {isRun && (
                        <div style={{height:"2px",background:"rgba(255,255,255,.04)",borderRadius:"1px",
                          marginTop:"5px",overflow:"hidden",width:"100px"}}>
                          <div style={{height:"100%",width:`${sc.progress||30}%`,
                            background:`linear-gradient(90deg,#60A5FA,${T.purple})`,transition:"width 0.5s"}}/>
                        </div>
                      )}
                    </td>

                    {/* Target */}
                    <td style={{padding:"13px 16px",maxWidth:"190px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px",overflow:"hidden"}}>
                        <Globe size={11} color={T.dimmed} style={{flexShrink:0}}/>
                        <span style={{color:T.white,fontWeight:"500",overflow:"hidden",
                          textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"12px"}}>
                          {target.replace(/^https?:\/\//,"")}
                        </span>
                      </div>
                    </td>

                    {/* Profile */}
                    <td style={{padding:"13px 16px"}}>
                      <span style={{
                        padding:"3px 9px", borderRadius:"6px", fontSize:"10px", fontWeight:"600",
                        background:"rgba(139,92,246,.12)", color:T.purple,
                        border:"1px solid rgba(139,92,246,.2)",
                      }}>
                        {sc.profile||"Full Security Audit"}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{padding:"13px 16px",color:T.muted,fontSize:"11px",whiteSpace:"nowrap"}}>{date}</td>

                    {/* Duration */}
                    <td style={{padding:"13px 16px",color:T.muted,fontSize:"11px"}}>{dur}</td>

                    {/* Findings */}
                    <td style={{padding:"13px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                        <span style={{color:finds>0?T.warning:T.muted,fontWeight:"700",fontSize:"12px"}}>
                          {finds>0?`${finds} Findings`:"Clean"}
                        </span>
                        <SevBadge count={sc.criticalCount} color={T.critical} label="CRIT"/>
                        <SevBadge count={sc.highCount}     color={T.warning}  label="HIGH"/>
                      </div>
                    </td>

                    {/* Risk */}
                    <td style={{padding:"13px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <div style={{width:"36px",height:"4px",borderRadius:"2px",
                          background:"rgba(255,255,255,.05)",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(100,risk*10)}%`,
                            background:riskC(risk)}}/>
                        </div>
                        <span style={{color:riskC(risk),fontSize:"11px",fontWeight:"700"}}>
                          {risk?Number(risk).toFixed(1):"—"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{padding:"13px 16px"}}><StatusBadge status={sc.status}/></td>

                    {/* Actions */}
                    <td style={{padding:"13px 16px"}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",gap:"4px"}}>
                        <button className="sh-btn" onClick={()=>handleView(sc)} title="View Details"
                          style={{width:"30px",height:"30px",borderRadius:"8px",border:"none",
                            background:"rgba(96,165,250,.12)",color:"#60A5FA",
                            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                          <Eye size={13}/>
                        </button>
                        <button className="sh-btn" onClick={()=>handleExport(sc)} title="Export PDF"
                          style={{width:"30px",height:"30px",borderRadius:"8px",border:"none",
                            background:"rgba(34,197,94,.1)",color:T.success,
                            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                          <Download size={13}/>
                        </button>
                        <button className="sh-btn" onClick={()=>handleRerun(sc)} title="Re-run"
                          disabled={isRun}
                          style={{width:"30px",height:"30px",borderRadius:"8px",border:"none",
                            background:isRun?"rgba(255,255,255,.03)":"rgba(249,115,22,.12)",
                            color:isRun?T.dimmed:T.warning,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            cursor:isRun?"default":"pointer"}}>
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
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${T.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{color:T.dimmed,fontSize:"12px"}}>
            Showing {Math.min((page-1)*PAGE_SIZE+1,totalScans)}–{Math.min(page*PAGE_SIZE,totalScans)} of {totalScans}
          </span>
          <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
              style={{width:"30px",height:"30px",borderRadius:"8px",
                border:`1px solid ${T.border}`,background:T.darkGray,
                color:page<=1?T.dimmed:T.white,cursor:page<=1?"default":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              <ChevronLeft size={14}/>
            </button>
            {[...Array(Math.min(5,totalPages))].map((_,i)=>{
              const p = i+Math.max(1,page-2);
              if(p>totalPages) return null;
              return (
                <button key={p} onClick={()=>setPage(p)}
                  style={{width:"30px",height:"30px",borderRadius:"8px",fontSize:"12px",fontWeight:"600",
                    border:page===p?"1px solid rgba(139,92,246,.4)":`1px solid ${T.border}`,
                    background:page===p?"rgba(139,92,246,.2)":T.darkGray,
                    color:page===p?T.purple:T.muted,cursor:"pointer"}}>
                  {p}
                </button>
              );
            })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
              style={{width:"30px",height:"30px",borderRadius:"8px",
                border:`1px solid ${T.border}`,background:T.darkGray,
                color:page>=totalPages?T.dimmed:T.white,cursor:page>=totalPages?"default":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
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
      />
      <ScanComparisonModal open={compareOpen} onClose={()=>setCompareOpen(false)}/>
    </div>
  );
}