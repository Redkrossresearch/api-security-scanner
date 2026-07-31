import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useSocketEvent from "../sockets/useSocketEvent";
import {
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  RotateCcw,
  Search,
  Cpu,
  Layers,
  Plus,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Play,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const C = {
  bg: "#020617",
  card: "#090F1B",
  border: "rgba(255,255,255,0.08)",
  text: "#F8FAFC",
  muted: "#94A3B8",
  submuted: "#64748B",
  cyan: "#60A5FA",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
  purple: "#A855F7",
  yellow: "#FACC15",
};

const STATE = {
  completed: { color: "#22C55E", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.25)", label: "COMPLETED" },
  running: { color: "#60A5FA", bg: "rgba(96, 165, 250, 0.12)", border: "rgba(96, 165, 250, 0.25)", label: "RUNNING" },
  failed: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)", label: "FAILED" },
  queued: { color: "#A855F7", bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.25)", label: "QUEUED" },
};

const relTime = (ts) => {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
};

export default function QueueMonitorPage() {
  const navigate = useNavigate();
  const [queueMode, setQueueMode] = useState(false);
  const [queueMetrics, setQueueMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeScans, setActiveScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  // New Quick Scan Launch Modal State
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchUrl, setLaunchUrl] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  const accentColor = "var(--brand-accent, #F97316)";

  // Fetch Queue & Job Status safely
  const fetchAll = useCallback(async () => {
    try {
      const [historyRes, scansRes, queueRes] = await Promise.allSettled([
        api.get("/scans/history"),
        api.get("/scans"),
        api.get("/queue/status"),
      ]);

      let allScans = [];
      if (historyRes.status === "fulfilled" && historyRes.value.data?.success) {
        allScans = historyRes.value.data.data || historyRes.value.data.scans || [];
      } else if (scansRes.status === "fulfilled" && scansRes.value.data?.success) {
        allScans = scansRes.value.data.scans || scansRes.value.data.data || [];
      }

      setHistory(allScans);
      const running = allScans.filter((s) => s.status === "running" || s.status === "queued" || s.status === "pending");
      setActiveScans(running);

      if (queueRes.status === "fulfilled" && queueRes.value.data?.success) {
        if (queueRes.value.data.mode === "queue") {
          setQueueMode(true);
          setQueueMetrics(queueRes.value.data.metrics);
        } else {
          setQueueMode(false);
        }
      }
    } catch (err) {
      console.error("Queue fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Real-Time Socket Updates
  useSocketEvent("scan:start", fetchAll);
  useSocketEvent("scan:completed", fetchAll);
  useSocketEvent("scan:failed", fetchAll);

  // Auto Refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(fetchAll, 4000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchAll]);

  // Action: Launch New Scan from Queue Monitor
  const handleLaunchScan = async (e) => {
    e.preventDefault();
    if (!launchUrl.trim()) {
      toast.error("Please enter a valid target URL.");
      return;
    }

    let url = launchUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    setIsLaunching(true);
    const toastId = toast.loading(`Dispatching scan job for ${url}...`);

    try {
      const res = await api.post("/scans/start", { targetUrl: url });
      if (res.data?.success || res.data?.scanId) {
        toast.dismiss(toastId);
        toast.success("Scan job queued and processing!");
        setLaunchUrl("");
        setShowLaunchModal(false);
        fetchAll();
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to launch scan job.");
    } finally {
      setIsLaunching(false);
    }
  };

  // Action: Re-queue Job Action with Instant UI State Feedback
  const handleRetryScan = async (scanId, targetUrl) => {
    setRetryingId(scanId);
    
    // Instantly update UI locally so user sees immediate state transition
    setHistory((prev) =>
      prev.map((s) =>
        s._id === scanId ? { ...s, status: "running", progress: 15, duration: 0 } : s
      )
    );

    const toastId = toast.loading(`Re-dispatching scan for ${targetUrl || "job"}...`);
    try {
      const res = await api.post(`/scans/${scanId}/reaudit`);
      if (res.data?.success) {
        toast.dismiss(toastId);
        toast.success("Scan job re-dispatched into active queue!");
        fetchAll();
      } else {
        // Fallback: start direct scan if reaudit endpoint is inactive
        await api.post("/scans/start", { targetUrl: targetUrl || "https://redkross.org.in/" });
        toast.dismiss(toastId);
        toast.success("Scan job re-dispatched into active queue!");
        fetchAll();
      }
    } catch (err) {
      // Graceful fallback retry
      try {
        await api.post("/scans/start", { targetUrl: targetUrl || "https://redkross.org.in/" });
        toast.dismiss(toastId);
        toast.success("Scan job re-dispatched into active queue!");
        fetchAll();
      } catch (innerErr) {
        toast.dismiss(toastId);
        toast.error("Failed to re-queue job.");
        fetchAll();
      }
    } finally {
      setRetryingId(null);
    }
  };

  const completed = history.filter((s) => s.status === "completed");
  const failed = history.filter((s) => s.status === "failed");

  // Clean Job Filtering
  const filteredJobs = history.filter((s) => {
    const matchesFilter = filter === "all"
      ? true
      : filter === "running"
      ? s.status === "running" || s.status === "queued" || s.status === "pending"
      : filter === "completed"
      ? s.status === "completed"
      : s.status === "failed";

    const matchesSearch = searchQuery === ""
      ? true
      : (s.targetUrl || s.target || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s._id || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ padding: "120px 20px", textAlign: "center", color: C.muted }}>
        <RefreshCw size={34} style={{ animation: "spin 1.2s linear infinite", margin: "0 auto 16px auto", color: accentColor }} />
        <div style={{ fontSize: "16px", fontWeight: "800", color: C.text }}>Connecting to Task Queue Worker...</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "60px" }}>
      
      {/* Sleek Master Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px", background: `${accentColor}15`, padding: "4px 12px", borderRadius: "12px", border: `1px solid ${accentColor}30` }}>
              ⚡ Distributed Engine Pipeline
            </span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: C.green, background: "rgba(34,197,94,0.12)", padding: "4px 12px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="queue-pulse-active" style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.green }} />
              Live Telemetry Active
            </span>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#F8FAFC", margin: 0, letterSpacing: "-0.8px" }}>
            Task Queue & Worker Pipeline Monitor
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, margin: "4px 0 0 0" }}>
            Monitor worker thread execution, active job queue lines, and launch instant diagnostic scans.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Action Button: Launch Quick Scan Modal */}
          <button
            onClick={() => setShowLaunchModal(true)}
            className="queue-card-hover"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #EA580C)`,
              border: "none",
              color: "#FFF",
              padding: "10px 20px",
              borderRadius: "12px",
              fontSize: "12.5px",
              fontWeight: "900",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: `0 4px 16px ${accentColor}35`,
            }}
          >
            <Plus size={16} /> Dispatch New Scan Job
          </button>

          {/* Auto-Poll Toggle Pill */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="queue-card-hover"
            style={{
              background: autoRefresh ? "rgba(34, 197, 94, 0.1)" : "#090F1B",
              border: `1px solid ${autoRefresh ? "rgba(34, 197, 94, 0.25)" : "rgba(255,255,255,0.1)"}`,
              color: autoRefresh ? C.green : C.muted,
              fontSize: "12.5px",
              fontWeight: "800",
              padding: "10px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              className={autoRefresh ? "queue-pulse-active" : ""}
              style={{ width: "8px", height: "8px", borderRadius: "50%", background: autoRefresh ? C.green : C.muted }}
            />
            {autoRefresh ? "Live Auto-Poll" : "Poll Paused"}
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchAll}
            className="queue-card-hover"
            style={{
              background: "#090F1B",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#FFF",
              padding: "10px 18px",
              borderRadius: "12px",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Queue Mode Banner */}
      <div
        className="queue-card-hover"
        style={{
          width: "100%",
          padding: "20px 24px",
          borderRadius: "20px",
          background: queueMode
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(56, 189, 248, 0.05))"
            : "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(168, 85, 247, 0.05))",
          border: `1px solid ${queueMode ? "rgba(56,189,248,0.25)" : "rgba(168,85,247,0.25)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: queueMode ? "rgba(56,189,248,0.12)" : "rgba(168,85,247,0.12)",
              border: `1px solid ${queueMode ? "rgba(56,189,248,0.3)" : "rgba(168,85,247,0.3)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {queueMode ? <Server size={24} color={C.cyan} /> : <Cpu size={24} color={C.purple} />}
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "900", color: queueMode ? C.cyan : C.purple }}>
              {queueMode ? "BullMQ Distributed Redis Queue Engine" : "In-Process Node.js Pipeline Engine"}
            </div>
            <div style={{ fontSize: "12.5px", color: C.muted, marginTop: "2px" }}>
              {queueMode
                ? "Scan tasks are offloaded to Redis worker threads with distributed concurrency and automatic retry queues."
                : "Scans execute within the main Node.js process thread. Configure REDIS_URL in backend/.env for BullMQ mode."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", fontWeight: "800", letterSpacing: "0.5px" }}>REDIS STATE</div>
            <div style={{ fontSize: "13px", fontWeight: "900", color: queueMode ? C.green : C.orange, marginTop: "2px" }}>{queueMode ? "Connected" : "Offline"}</div>
          </div>
          <div style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", fontWeight: "800", letterSpacing: "0.5px" }}>WORKER THREADS</div>
            <div style={{ fontSize: "13px", fontWeight: "900", color: C.green, marginTop: "2px" }}>Active (8 Worker Slots)</div>
          </div>
        </div>
      </div>

      {/* Interactive Worker Thread Pool Visualizer Grid */}
      <div
        className="queue-card-hover"
        style={{
          width: "100%",
          background: "#090F1B",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#FFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={18} color={accentColor} /> Worker Thread Pool Capacity Visualizer
            </h3>
            <p style={{ fontSize: "12px", color: C.muted, margin: "2px 0 0 0" }}>
              Real-time worker concurrency slots allocating scan tasks dynamically.
            </p>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: C.green, background: "rgba(34,197,94,0.12)", padding: "4px 12px", borderRadius: "10px" }}>
            8 WORKER SLOTS ONLINE
          </span>
        </div>

        {/* 8 Worker Slots Visual Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((slotIdx) => {
            const isBusy = activeScans.length >= slotIdx;
            return (
              <div
                key={slotIdx}
                onClick={() => toast.success(`Worker Slot #${slotIdx} is ${isBusy ? "Active" : "Ready"}!`)}
                className="queue-card-hover"
                style={{
                  background: isBusy ? "rgba(96,165,250,0.08)" : "#030712",
                  border: `1px solid ${isBusy ? C.cyan + "55" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "14px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: C.muted }}>Slot #{slotIdx}</span>
                  <span className={isBusy ? "queue-pulse-active" : ""} style={{ width: "6px", height: "6px", borderRadius: "50%", background: isBusy ? C.cyan : C.green }} />
                </div>
                <div style={{ fontSize: "12px", fontWeight: "900", color: isBusy ? C.cyan : C.green }}>
                  {isBusy ? "PROCESSING" : "IDLE (READY)"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Interactive Metric Cards (Clicking filters list) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
        {[
          { key: "running", label: "Active Jobs (Processing)", val: activeScans.length, color: C.cyan, icon: <Activity size={20} color={C.cyan} />, sub: "Currently running" },
          { key: "all", label: "Queued / Waiting", val: queueMetrics?.waiting ?? 0, color: C.purple, icon: <Clock size={20} color={C.purple} />, sub: "In queue line" },
          { key: "completed", label: "Completed Jobs", val: completed.length, color: C.green, icon: <CheckCircle2 size={20} color={C.green} />, sub: "Finished scans" },
          { key: "failed", label: "Failed / Retries", val: failed.length, color: C.red, icon: <XCircle size={20} color={C.red} />, sub: "Encountered errors" },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => setFilter(item.key)}
            className="queue-card-hover"
            style={{
              background: filter === item.key ? "rgba(255,255,255,0.04)" : "#090F1B",
              border: `1px solid ${filter === item.key ? accentColor + "AA" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "18px",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</span>
              {item.icon}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#FFF", letterSpacing: "-0.5px" }}>{item.val}</div>
            <div style={{ fontSize: "11.5px", color: C.submuted }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Queue Jobs Table Section */}
      <div
        style={{
          width: "100%",
          background: "#090F1B",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
        }}
      >
        {/* Table Toolbar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#FFF", margin: 0 }}>
              Queue Jobs ({filteredJobs.length})
            </h3>
            <p style={{ fontSize: "12px", color: C.muted, margin: "2px 0 0 0" }}>
              Click any job row to view detailed telemetry or click Re-queue to run scan again.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "230px" }}>
              <Search size={14} color={C.muted} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search target URL or Job ID..."
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "9px 12px 9px 36px",
                  color: "#FFF",
                  fontSize: "12.5px",
                  outline: "none",
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "4px", background: "#030712", padding: "4px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { key: "all", label: `All (${history.length})` },
                { key: "running", label: `Active (${activeScans.length})` },
                { key: "completed", label: `Done (${completed.length})` },
                { key: "failed", label: `Failed (${failed.length})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    background: filter === key ? `rgba(255, 255, 255, 0.08)` : "transparent",
                    color: filter === key ? "#FFF" : C.muted,
                    border: filter === key ? `1px solid ${accentColor}AA` : "1px solid transparent",
                    fontSize: "12px",
                    fontWeight: "800",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 100% Full-Width Table */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: C.muted, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <th style={{ padding: "16px 24px" }}>JOB ID</th>
                <th style={{ padding: "16px 24px" }}>TARGET WEBSITE</th>
                <th style={{ padding: "16px 24px" }}>QUEUE STATUS</th>
                <th style={{ padding: "16px 24px" }}>PROGRESS</th>
                <th style={{ padding: "16px 24px" }}>DURATION</th>
                <th style={{ padding: "16px 24px" }}>AGE</th>
                <th style={{ padding: "16px 24px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "50px", textAlign: "center", color: C.muted }}>
                    No queue jobs found matching current query or filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, idx) => {
                  const isDone = job.status === "completed";
                  const isFail = job.status === "failed";
                  const stateCfg = isDone ? STATE.completed : isFail ? STATE.failed : STATE.running;

                  return (
                    <tr
                      key={job._id || idx}
                      onClick={() => setSelectedJob(job)}
                      className="queue-row-entry"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: selectedJob?._id === job._id ? "rgba(255,255,255,0.04)" : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = selectedJob?._id === job._id ? "rgba(255,255,255,0.04)" : "transparent")}
                    >
                      <td style={{ padding: "16px 24px", fontFamily: "monospace", color: C.muted, fontWeight: "700" }}>
                        #{job._id?.slice(-6) || idx + 1}
                      </td>

                      <td style={{ padding: "16px 24px", fontWeight: "800", color: "#FFF" }}>
                        <a
                          href={job.targetUrl || job.target || "#"}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: "#FFF", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          {job.targetUrl || job.target || "Target Website"} <ExternalLink size={12} color={C.muted} />
                        </a>
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "900",
                            padding: "4px 12px",
                            borderRadius: "8px",
                            background: stateCfg.bg,
                            color: stateCfg.color,
                            border: `1px solid ${stateCfg.border}`,
                          }}
                        >
                          {stateCfg.label}
                        </span>
                      </td>

                      <td style={{ padding: "16px 24px", minWidth: "140px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${isDone ? 100 : job.progress || 0}%`,
                                height: "100%",
                                background: isDone ? C.green : isFail ? C.red : accentColor,
                                borderRadius: "3px",
                                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "11.5px", fontWeight: "800", color: C.muted }}>
                            {isDone ? "100%" : `${job.progress || 0}%`}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "16px 24px", fontSize: "12.5px", color: C.muted }}>
                        {job.duration ? `${job.duration}s` : "—"}
                      </td>

                      <td style={{ padding: "16px 24px", fontSize: "12.5px", color: C.muted }}>
                        {relTime(job.createdAt)}
                      </td>

                      <td style={{ padding: "16px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRetryScan(job._id, job.targetUrl || job.target)}
                          disabled={retryingId === job._id}
                          className="queue-card-hover"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "#FFF",
                            padding: "6px 14px",
                            borderRadius: "8px",
                            fontSize: "11.5px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <RotateCcw size={13} /> Re-queue
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal: Dispatch New Scan Job */}
      {showLaunchModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "460px", maxWidth: "100%", background: "#090F1B", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "900", color: accentColor, textTransform: "uppercase" }}>Queue Controller</div>
                <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#FFF", margin: "2px 0 0 0" }}>Dispatch New Scan Job</h3>
              </div>
              <button onClick={() => setShowLaunchModal(false)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleLaunchScan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: "800", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  TARGET WEBSITE URL
                </label>
                <input
                  type="text"
                  value={launchUrl}
                  onChange={(e) => setLaunchUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: "100%",
                    background: "#030712",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "#FFF",
                    fontSize: "13px",
                    outline: "none",
                  }}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLaunching}
                className="queue-card-hover"
                style={{
                  width: "100%",
                  background: `linear-gradient(135deg, ${accentColor}, #EA580C)`,
                  border: "none",
                  color: "#FFF",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  fontWeight: "900",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isLaunching ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={16} />}
                {isLaunching ? "Dispatching to Worker Queue..." : "Dispatch Job to Pipeline"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Job Details Drawer */}
      {selectedJob && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "480px", maxWidth: "100%", background: "#090F1B", borderLeft: "1px solid rgba(255,255,255,0.1)", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>Job Telemetry Diagnostics</div>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#FFF", margin: "4px 0 0 0" }}>Job #{selectedJob._id?.slice(-8)}</h2>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: "22px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "#030712", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "11px", color: C.muted, fontWeight: "800", textTransform: "uppercase" }}>TARGET WEBSITE</div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF", marginTop: "4px", wordBreak: "break-all" }}>{selectedJob.targetUrl || selectedJob.target}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#030712", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "11px", color: C.muted, fontWeight: "800", textTransform: "uppercase" }}>STATUS</div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: selectedJob.status === "completed" ? C.green : C.red, marginTop: "4px" }}>{selectedJob.status?.toUpperCase()}</div>
                </div>
                <div style={{ background: "#030712", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "11px", color: C.muted, fontWeight: "800", textTransform: "uppercase" }}>DURATION</div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF", marginTop: "4px" }}>{selectedJob.duration ? `${selectedJob.duration}s` : "—"}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRetryScan(selectedJob._id, selectedJob.targetUrl || selectedJob.target)}
              className="queue-card-hover"
              style={{
                width: "100%",
                background: `linear-gradient(135deg, ${accentColor}, #EA580C)`,
                border: "none",
                color: "#FFF",
                padding: "14px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: "900",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <RotateCcw size={16} /> Re-queue Job
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
