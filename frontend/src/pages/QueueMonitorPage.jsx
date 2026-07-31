import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import useSocketEvent from "../sockets/useSocketEvent";
import {
  Activity,
  Server,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Zap,
  Terminal,
  Shield,
  Layers,
  RotateCcw,
  Search,
  Filter,
  Eye,
  Trash2,
  Sliders,
  Cpu,
  Radio,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const C = {
  bg: "#020617",
  card: "#090F1B",
  border: "rgba(255,255,255,0.08)",
  text: "#F8FAFC",
  muted: "#94A3B8",
  cyan: "#60A5FA",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
  purple: "#A855F7",
  yellow: "#FACC15",
};

const SEV = {
  critical: { color: "#F87171", bg: "rgba(248,113,113,0.14)" },
  high: { color: "#FB923C", bg: "rgba(251,146,60,0.14)" },
  medium: { color: "#FBBF24", bg: "rgba(251,191,36,0.14)" },
  low: { color: "#34D399", bg: "rgba(52,211,153,0.14)" },
};

const STATE = {
  completed: { color: C.green, bg: "rgba(52,211,153,0.14)", label: "COMPLETED" },
  running: { color: C.cyan, bg: "rgba(96,165,250,0.14)", label: "RUNNING" },
  failed: { color: C.red, bg: "rgba(248,113,113,0.14)", label: "FAILED" },
  queued: { color: C.purple, bg: "rgba(168,85,247,0.14)", label: "QUEUED" },
};

const relTime = (ts) => {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
};

const grade2color = (g) =>
  ({ "A+": C.green, A: C.green, "A-": "#6EE7B7", "B+": C.yellow, B: C.yellow, C: C.orange, D: C.red, F: "#EF4444" }[g] || C.muted);

export default function QueueMonitorPage() {
  const [queueMode, setQueueMode] = useState(false);
  const [queueMetrics, setQueueMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeScans, setActiveScans] = useState([]);
  const [activeProgress, setActiveProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState("all");
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [retryingId, setRetryingId] = useState(null);

  const accentColor = "var(--brand-accent, #F97316)";

  // Add Log Entry to Live Stream Terminal
  const pushTerminalLog = useCallback((msg, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      { id: Math.random().toString(), timestamp, msg, type },
      ...prev.slice(0, 49),
    ]);
  }, []);

  // Fetch Queue & Pipeline Telemetry
  const fetchAll = useCallback(async () => {
    try {
      setLastRefresh(new Date());

      const [historyRes, scansRes, metricsRes] = await Promise.allSettled([
        api.get("/scans/history"),
        api.get("/scans"),
        api.get("/queue/metrics"),
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

      if (metricsRes.status === "fulfilled" && metricsRes.value.data?.success) {
        setQueueMode(true);
        setQueueMetrics(metricsRes.value.data.metrics);
      } else {
        setQueueMode(false);
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

  // Real-Time Socket Event Listeners
  useSocketEvent("scan:start", (data) => {
    pushTerminalLog(`🚀 Scan Pipeline started for target: ${data?.targetUrl || "Target"}`, "cyan");
    fetchAll();
  });

  useSocketEvent("scan:progress", (data) => {
    if (data?.scanId) {
      setActiveProgress((prev) => ({
        ...prev,
        [data.scanId]: { progress: data.percent, currentScanner: data.currentScanner },
      }));
      pushTerminalLog(`⚡ Scan #${data.scanId.slice(-4)}: ${data.currentScanner || "Engine"} (${data.percent}%)`, "info");
    }
  });

  useSocketEvent("scan:completed", (data) => {
    pushTerminalLog(`✅ Scan Pipeline #${data?.scanId?.slice(-4) || ""} COMPLETED successfully`, "green");
    fetchAll();
  });

  useSocketEvent("scan:failed", (data) => {
    pushTerminalLog(`❌ Scan Pipeline #${data?.scanId?.slice(-4) || ""} FAILED: ${data?.error || "Error"}`, "red");
    fetchAll();
  });

  // Auto Refresh Timer
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAll]);

  // 1-Click Re-audit / Retry Scan Action
  const handleRetryScan = async (scanId) => {
    setRetryingId(scanId);
    const toastId = toast.loading("Re-dispatching scan job to queue pipeline...");
    try {
      const res = await api.post(`/scans/${scanId}/reaudit`);
      if (res.data?.success) {
        toast.dismiss(toastId);
        toast.success("Job re-dispatched to queue pipeline!");
        pushTerminalLog(`🔄 Re-dispatched Scan Job #${scanId.slice(-4)} to pipeline`, "purple");
        fetchAll();
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to retry scan job.");
    } finally {
      setRetryingId(null);
    }
  };

  const completed = history.filter((s) => s.status === "completed");
  const failed = history.filter((s) => s.status === "failed");

  const filteredHistory = filter === "all"
    ? history
    : filter === "running"
    ? history.filter((s) => s.status === "running" || s.status === "queued" || s.status === "pending")
    : filter === "completed"
    ? completed
    : failed;

  const avgDuration = completed.length
    ? Math.round(completed.reduce((a, s) => a + (s.duration || 0), 0) / completed.length)
    : 0;

  const successRate = history.length
    ? Math.round((completed.length / history.length) * 100)
    : 0;

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", color: C.muted }}>
        <RefreshCw size={36} style={{ animation: "spin 1.5s linear infinite", margin: "0 auto 16px auto", color: accentColor }} />
        <div style={{ fontSize: "16px", fontWeight: "800", color: C.text }}>Connecting to Live Task Queue Telemetry...</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "60px" }}>
      
      {/* Full-Bleed 100% Width Header */}
      <div
        style={{
          width: "100%",
          background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(3, 7, 18, 0.98))`,
          border: `1px solid ${accentColor}40`,
          borderRadius: "24px",
          padding: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
          boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 25px ${accentColor}15`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: "900", color: accentColor, background: `${accentColor}20`, border: `1px solid ${accentColor}40`, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
              ⚡ Real-Time Task Queue Pipeline
            </span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#34D399", background: "rgba(52,211,153,0.12)", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34D399", animation: "blink 1.2s ease infinite" }} />
              WebSocket Live Telemetry Active
            </span>
          </div>

          <h1 style={{ fontSize: "34px", fontWeight: "900", color: "#F8FAFC", margin: 0, letterSpacing: "-0.8px" }}>
            Task Queue & Scan Pipeline Monitor
          </h1>
          <p style={{ fontSize: "14px", color: "#94A3B8", margin: "6px 0 0 0", maxWidth: "750px" }}>
            Live distributed scan execution queue, BullMQ worker status, WebSocket telemetry stream, and job history diagnostics.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", zIndex: 1 }}>
          {lastRefresh && (
            <span style={{ fontSize: "12px", color: C.muted }}>Updated {relTime(lastRefresh.getTime())}</span>
          )}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            style={{
              background: autoRefresh ? "rgba(34,197,94,0.15)" : "#0F172A",
              border: `1px solid ${autoRefresh ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: autoRefresh ? C.green : C.muted,
              fontSize: "13px",
              fontWeight: "800",
              padding: "10px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: autoRefresh ? C.green : C.muted, animation: autoRefresh ? "blink 1.2s ease infinite" : "none" }} />
            {autoRefresh ? "Live Sync Active" : "Sync Paused"}
          </button>

          <button
            onClick={fetchAll}
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #EA580C)`,
              border: "none",
              color: "#FFF",
              padding: "10px 22px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "900",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: `0 4px 18px ${accentColor}40`,
            }}
          >
            <RefreshCw size={15} /> Refresh Pipeline
          </button>
        </div>
      </div>

      {/* Mode & Cluster Diagnostics Banner */}
      <div
        style={{
          width: "100%",
          padding: "20px 24px",
          borderRadius: "18px",
          background: queueMode ? "rgba(56,189,248,0.06)" : "rgba(168,85,247,0.06)",
          border: `1px solid ${queueMode ? "rgba(56,189,248,0.3)" : "rgba(168,85,247,0.3)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "280px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: queueMode ? "rgba(56,189,248,0.15)" : "rgba(168,85,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {queueMode ? <Server size={24} color={C.cyan} /> : <Cpu size={24} color={C.purple} />}
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "900", color: queueMode ? C.cyan : C.purple }}>
              {queueMode ? "BullMQ Distributed Queue Mode — Redis Active" : "In-Process Execution Mode (Single-Node Node.js)"}
            </div>
            <div style={{ fontSize: "12.5px", color: C.muted, marginTop: "3px" }}>
              {queueMode
                ? "Scans are offloaded to Redis BullMQ worker threads · Concurrent, retryable, distributed execution"
                : "Scans execute within the primary Node.js process thread · To enable multi-worker queue set REDIS_URL in backend/.env"}
            </div>
          </div>
        </div>

        {/* System Diagnostics Badges */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Redis Cluster", val: queueMode ? "Connected" : "Offline Mode", ok: queueMode },
            { label: "Worker Thread", val: queueMode ? "Running (16 Worker Slots)" : "In-Process Mode", ok: queueMode },
            { label: "Pipeline Mode", val: queueMode ? "BullMQ Queue" : "Direct Process", ok: true },
          ].map(({ label, val, ok }) => (
            <div key={label} style={{ background: "rgba(3, 7, 18, 0.6)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: "12px", padding: "8px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", fontWeight: "800" }}>{label}</div>
              <div style={{ fontSize: "12.5px", fontWeight: "900", color: ok ? C.green : C.orange, marginTop: "2px" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Card Full-Width Telemetry Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {[
          { label: "Active Jobs", val: activeScans.length, icon: <Activity size={22} color={C.cyan} />, color: C.cyan, pulse: activeScans.length > 0, sub: `${activeScans.length} running now` },
          { label: "Completed Jobs", val: completed.length, icon: <CheckCircle size={22} color={C.green} />, color: C.green, sub: "Successfully finished" },
          { label: "Failed Jobs", val: failed.length, icon: <XCircle size={22} color={C.red} />, color: C.red, sub: "Encountered errors" },
          { label: "Success Rate", val: `${successRate}%`, icon: <Layers size={22} color={successRate >= 80 ? C.green : C.yellow} />, color: successRate >= 80 ? C.green : C.yellow, sub: `${history.length} total jobs` },
          { label: "Avg Execution Time", val: avgDuration ? `${avgDuration}s` : "—", icon: <Clock size={22} color={C.purple} />, color: C.purple, sub: "Per pipeline run" },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: "#070D19",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: "18px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</span>
              {item.icon}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#FFF" }}>
              {item.val}
            </div>
            <div style={{ fontSize: "11.5px", color: C.muted }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Novel Feature: Real-Time Terminal Event Log Stream */}
      <div
        style={{
          width: "100%",
          background: "#030712",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Terminal size={18} color={accentColor} />
            <span style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>Live Pipeline Event Log Stream</span>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#34D399", background: "rgba(52,211,153,0.12)", padding: "3px 10px", borderRadius: "10px" }}>
            WEBSOCKET REALTIME FEED
          </span>
        </div>

        {/* Scrollable Terminal Box */}
        <div
          style={{
            height: "140px",
            overflowY: "auto",
            background: "#01040A",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "12px 16px",
            fontFamily: "monospace",
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {terminalLogs.length === 0 ? (
            <div style={{ color: C.muted, fontStyle: "italic" }}>
              Listening for real-time scan pipeline events (scan start, stage progress, completion)...
            </div>
          ) : (
            terminalLogs.map((log) => (
              <div key={log.id} style={{ color: log.type === "cyan" ? C.cyan : log.type === "green" ? C.green : log.type === "red" ? C.red : "#E2E8F0" }}>
                <span style={{ color: C.muted, marginRight: "8px" }}>[{log.timestamp}]</span>
                {log.msg}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full-Width Pipeline Jobs Table */}
      <div style={{ width: "100%", background: "#070D19", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#FFF", margin: 0 }}>
              📋 Pipeline Execution History ({filteredHistory.length} Jobs)
            </h3>
            <p style={{ fontSize: "12px", color: C.muted, margin: "2px 0 0 0" }}>
              Click any job row to view detailed telemetry, vulnerability counts, and HTTP status.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "6px", background: "#030712", padding: "4px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { key: "all", label: `All (${history.length})` },
              { key: "running", label: `Running (${activeScans.length})` },
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
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 100% Full-Width Table */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: C.muted, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <th style={{ padding: "14px 20px" }}>JOB ID</th>
                <th style={{ padding: "14px 20px" }}>TARGET WEBSITE</th>
                <th style={{ padding: "14px 20px" }}>STATUS</th>
                <th style={{ padding: "14px 20px" }}>PROGRESS</th>
                <th style={{ padding: "14px 20px", textAlign: "center" }}>GRADE</th>
                <th style={{ padding: "14px 20px" }}>FINDINGS</th>
                <th style={{ padding: "14px 20px" }}>DURATION</th>
                <th style={{ padding: "14px 20px" }}>TIMESTAMP</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: C.muted }}>
                    No scan jobs found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((scan, idx) => {
                  const isRunning = scan.status === "running" || scan.status === "queued" || scan.status === "pending";
                  const isDone = scan.status === "completed";
                  const isFail = scan.status === "failed";
                  const gradeColor = grade2color(scan.grade);

                  return (
                    <tr
                      key={scan._id || idx}
                      onClick={() => setSelectedScan(scan)}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: selectedScan?._id === scan._id ? "rgba(255,255,255,0.04)" : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = selectedScan?._id === scan._id ? "rgba(255,255,255,0.04)" : "transparent")}
                    >
                      {/* Job ID */}
                      <td style={{ padding: "14px 20px", fontFamily: "monospace", color: C.muted, fontWeight: "700" }}>
                        #{scan._id?.slice(-6) || idx + 1}
                      </td>

                      {/* Target */}
                      <td style={{ padding: "14px 20px", fontWeight: "800", color: "#FFF" }}>
                        {scan.targetUrl || scan.target || "Target Website"}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "900",
                            padding: "3px 10px",
                            borderRadius: "8px",
                            background: isDone ? STATE.completed.bg : isFail ? STATE.failed.bg : STATE.running.bg,
                            color: isDone ? STATE.completed.color : isFail ? STATE.failed.color : STATE.running.color,
                          }}
                        >
                          {isDone ? "COMPLETED" : isFail ? "FAILED" : "RUNNING"}
                        </span>
                      </td>

                      {/* Progress Bar */}
                      <td style={{ padding: "14px 20px", minWidth: "130px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${isDone ? 100 : scan.progress || 0}%`,
                                height: "100%",
                                background: isDone ? C.green : isFail ? C.red : accentColor,
                                borderRadius: "3px",
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: "800", color: C.muted }}>
                            {isDone ? "100%" : `${scan.progress || 0}%`}
                          </span>
                        </div>
                      </td>

                      {/* Grade */}
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "900", color: gradeColor }}>
                          {scan.grade || "—"}
                        </span>
                      </td>

                      {/* Findings */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {scan.criticalCount > 0 && <span style={{ fontSize: "10px", fontWeight: "800", color: SEV.critical.color, background: SEV.critical.bg, padding: "2px 6px", borderRadius: "6px" }}>C:{scan.criticalCount}</span>}
                          {scan.highCount > 0 && <span style={{ fontSize: "10px", fontWeight: "800", color: SEV.high.color, background: SEV.high.bg, padding: "2px 6px", borderRadius: "6px" }}>H:{scan.highCount}</span>}
                          {scan.mediumCount > 0 && <span style={{ fontSize: "10px", fontWeight: "800", color: SEV.medium.color, background: SEV.medium.bg, padding: "2px 6px", borderRadius: "6px" }}>M:{scan.mediumCount}</span>}
                          {(!scan.criticalCount && !scan.highCount && !scan.mediumCount) && (
                            <span style={{ fontSize: "11px", color: C.muted }}>0 findings</span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: C.muted }}>
                        {scan.duration ? `${scan.duration}s` : "—"}
                      </td>

                      {/* Timestamp */}
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: C.muted }}>
                        {relTime(scan.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRetryScan(scan._id)}
                          disabled={retryingId === scan._id}
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "#FFF",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <RotateCcw size={12} /> Retry
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

      {/* Interactive Job Diagnostics Drawer / Modal */}
      {selectedScan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "520px", maxWidth: "100%", background: "#070D19", borderLeft: "1px solid rgba(255,255,255,0.1)", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "900", color: accentColor, textTransform: "uppercase" }}>Job Telemetry Diagnostics</div>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#FFF", margin: "4px 0 0 0" }}>Job #{selectedScan._id?.slice(-8)}</h2>
              </div>
              <button onClick={() => setSelectedScan(null)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "#030712", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "11px", color: C.muted, fontWeight: "800" }}>TARGET URL</div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF", marginTop: "2px", wordBreak: "break-all" }}>{selectedScan.targetUrl || selectedScan.target}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#030712", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "11px", color: C.muted, fontWeight: "800" }}>STATUS</div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: selectedScan.status === "completed" ? C.green : C.red, marginTop: "2px" }}>{selectedScan.status?.toUpperCase()}</div>
                </div>
                <div style={{ background: "#030712", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "11px", color: C.muted, fontWeight: "800" }}>SECURITY GRADE</div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: grade2color(selectedScan.grade), marginTop: "2px" }}>{selectedScan.grade || "N/A"}</div>
                </div>
              </div>

              <div style={{ background: "#030712", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "11px", color: C.muted, fontWeight: "800" }}>VULNERABILITY COUNTS</div>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: SEV.critical.color }}>Critical: {selectedScan.criticalCount || 0}</span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: SEV.high.color }}>High: {selectedScan.highCount || 0}</span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: SEV.medium.color }}>Medium: {selectedScan.mediumCount || 0}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRetryScan(selectedScan._id)}
              style={{
                width: "100%",
                background: `linear-gradient(135deg, ${accentColor}, #EA580C)`,
                border: "none",
                color: "#FFF",
                padding: "14px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "900",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <RotateCcw size={16} /> Re-dispatch Job to Queue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
