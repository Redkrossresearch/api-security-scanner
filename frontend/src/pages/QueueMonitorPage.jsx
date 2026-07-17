import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import useSocketEvent from "../sockets/useSocketEvent";

/* ─── Tokens ─────────────────────────────────── */
const C = {
  bg: "#060910",
  card: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.07)",
  text: "#E2E8F0",
  muted: "#64748B",
  cyan: "#38BDF8",
  green: "#34D399",
  red: "#F87171",
  orange: "#FB923C",
  purple: "#A78BFA",
  yellow: "#FBBF24",
};

/* ─── Severity helpers ─────────────────────────── */
const SEV = {
  critical: { color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  high:     { color: "#FB923C", bg: "rgba(251,146,60,0.10)"  },
  medium:   { color: "#FBBF24", bg: "rgba(251,191,36,0.10)"  },
  low:      { color: "#34D399", bg: "rgba(52,211,153,0.10)"  },
  info:     { color: "#38BDF8", bg: "rgba(56,189,248,0.10)"  },
};

const STATE = {
  completed: { color: C.green,  bg: "rgba(52,211,153,0.12)",   dot: C.green  },
  running:   { color: C.cyan,   bg: "rgba(56,189,248,0.12)",   dot: C.cyan   },
  failed:    { color: C.red,    bg: "rgba(248,113,113,0.12)",  dot: C.red    },
  pending:   { color: C.purple, bg: "rgba(167,139,250,0.10)",  dot: C.purple },
  queued:    { color: C.purple, bg: "rgba(167,139,250,0.10)",  dot: C.purple },
};

/* ─── Tiny helpers ───────────────────────────── */
const relTime = (ts) => {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
};

const short = (str = "", len = 30) =>
  str.length > len ? str.slice(0, len) + "…" : str;

const grade2color = (g) =>
  ({ "A+": C.green, A: C.green, "A-": "#6EE7B7", "B+": C.yellow, B: C.yellow,
     C: C.orange, D: C.red, F: "#EF4444" }[g] || C.muted);

/* ─── Sub-components ─────────────────────────── */
const StatCard = ({ icon, label, value, sub, color, pulse }) => (
  <div style={{
    flex: 1, minWidth: 120,
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: 6,
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg,transparent,${color},transparent)`,
      opacity: 0.6,
    }} />
    <span style={{ fontSize: 20 }}>{icon}</span>
    <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
      {value ?? "—"}
      {pulse && <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, marginLeft: 6, animation: "blink 1.2s ease infinite" }} />}
    </span>
    <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
    {sub && <span style={{ fontSize: 11, color: color, fontWeight: 600 }}>{sub}</span>}
  </div>
);

const Badge = ({ state }) => {
  const s = STATE[state] || STATE.pending;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block", animation: state === "running" ? "blink 1s ease infinite" : "none" }} />
      {state?.toUpperCase()}
    </span>
  );
};

const ProgressBar = ({ pct = 0, color = C.cyan }) => (
  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
  </div>
);

/* ─── Active Job Card ─────────────────────────── */
const ActiveJobCard = ({ scan, progress }) => {
  const prog = progress?.progress ?? (scan.status === "completed" ? 100 : 0);
  const scanners = progress?.scanners || {};
  const scannerList = Object.entries(scanners);

  return (
    <div style={{
      background: "rgba(56,189,248,0.04)",
      border: "1px solid rgba(56,189,248,0.18)",
      borderRadius: 14,
      padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 12,
      position: "relative", overflow: "hidden",
    }}>
      {/* Glowing top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#38BDF8,transparent)" }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>
            {short(scan.targetUrl || scan.assetName || "Unknown Target", 50)}
          </div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
            {scan.scanId}
          </div>
        </div>
        <Badge state={scan.status} />
      </div>

      {/* Progress */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.muted }}>Scan Progress</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.cyan }}>{prog}%</span>
        </div>
        <ProgressBar pct={prog} color={C.cyan} />
      </div>

      {/* Scanner grid */}
      {scannerList.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: 5 }}>
          {scannerList.map(([name, status]) => {
            const sc = status === "completed" ? C.green : status === "running" ? C.cyan : status === "failed" ? C.red : C.muted;
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: sc }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc, flexShrink: 0, animation: status === "running" ? "blink 0.8s ease infinite" : "none" }} />
                {name}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer meta */}
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.muted }}>
        <span>⏱ {relTime(scan.startedAt || scan.createdAt)}</span>
        {scan.profile && <span>📋 {scan.profile}</span>}
        {scan.environment && <span>🌐 {scan.environment}</span>}
      </div>
    </div>
  );
};

/* ─── History Row ─────────────────────────────── */
const HistoryRow = ({ scan, idx }) => {
  const total = scan.totalFindings ?? 0;
  const g = grade2color(scan.grade);

  return (
    <tr
      style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s", cursor: "default" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "12px 16px", fontFamily: "monospace", color: C.muted, fontSize: 11 }}>
        #{String(idx + 1).padStart(2, "0")}
      </td>
      <td style={{ padding: "12px 16px", color: C.text, fontSize: 12, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {scan.assetName || scan.targetUrl}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <Badge state={scan.status} />
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ProgressBar pct={scan.status === "completed" ? 100 : scan.status === "failed" ? 100 : 50} color={scan.status === "completed" ? C.green : scan.status === "failed" ? C.red : C.cyan} />
          <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
            {scan.status === "completed" ? "100%" : scan.status === "failed" ? "✗" : "…"}
          </span>
        </div>
      </td>
      <td style={{ padding: "12px 16px", textAlign: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: g }}>{scan.grade || "—"}</span>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {scan.criticalCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: SEV.critical.color, background: SEV.critical.bg, padding: "2px 7px", borderRadius: 20 }}>C:{scan.criticalCount}</span>}
          {scan.highCount > 0     && <span style={{ fontSize: 10, fontWeight: 700, color: SEV.high.color,     background: SEV.high.bg,     padding: "2px 7px", borderRadius: 20 }}>H:{scan.highCount}</span>}
          {scan.mediumCount > 0   && <span style={{ fontSize: 10, fontWeight: 700, color: SEV.medium.color,   background: SEV.medium.bg,   padding: "2px 7px", borderRadius: 20 }}>M:{scan.mediumCount}</span>}
          {total === 0 && <span style={{ fontSize: 11, color: C.muted }}>0 findings</span>}
        </div>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
        {scan.duration ? `${scan.duration}s` : "—"}
      </td>
      <td style={{ padding: "12px 16px", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
        {relTime(scan.createdAt)}
      </td>
    </tr>
  );
};

/* ─── Main Page ───────────────────────────────── */
export default function QueueMonitorPage() {
  const [queueMode, setQueueMode] = useState(false);
  const [queueMetrics, setQueueMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeScans, setActiveScans] = useState([]);
  const [activeProgress, setActiveProgress] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState("all");
  const [lastRefresh, setLastRefresh] = useState(null);
  const progressPollers = useRef({});

  // Bind Real-Time Sockets
  useSocketEvent("scan:start", () => {
    fetchAll();
  });

  useSocketEvent("scan:progress", (data) => {
    setActiveProgress((prev) => ({
      ...prev,
      [data.scanId]: { progress: data.percent, currentScanner: data.currentScanner },
    }));
    setActiveScans((prev) =>
      prev.map((s) => (s._id === data.scanId ? { ...s, progress: data.percent } : s))
    );
  });

  useSocketEvent("scan:completed", () => {
    fetchAll();
  });

  useSocketEvent("scan:failed", () => {
    fetchAll();
  });

  useSocketEvent("queue:update", (data) => {
    if (data && data.metrics) {
      setQueueMetrics(data.metrics);
    } else {
      fetchAll();
    }
  });

  useSocketEvent("dashboard:update", () => {
    fetchAll();
  });

  /* ─ fetch all data ─ */
  const fetchAll = useCallback(async () => {
    try {
      const [histRes, healthRes, summRes] = await Promise.all([
        api.get("/scans/history?limit=25&page=1"),
        api.get("/queue/health").catch(() => ({ data: { redis: "unavailable", mode: "in-process" } })),
        api.get("/scans/dashboard/summary").catch(() => ({ data: {} })),
      ]);

      const allScans = histRes.data?.scans || [];
      setHistory(allScans);
      setQueueMode(healthRes.data?.redis === "connected");
      setSummary(summRes.data?.summary || null);

      /* pull queue metrics if redis is up */
      if (healthRes.data?.redis === "connected") {
        api.get("/queue/status").then((r) => setQueueMetrics(r.data?.metrics || null)).catch(() => {});
      }

      /* separate running scans */
      const running = allScans.filter((s) => s.status === "running" || s.status === "pending");
      setActiveScans(running);

      setLastRefresh(new Date());
    } catch (err) {
      console.error("Queue monitor error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ─ derived ─ */
  const completed = history.filter((s) => s.status === "completed");
  const failed    = history.filter((s) => s.status === "failed");
  const filtered  = filter === "all" ? history
    : filter === "running" ? activeScans
    : history.filter((s) => s.status === filter);

  const avgDuration = completed.length
    ? Math.round(completed.reduce((a, s) => a + (s.duration || 0), 0) / completed.length)
    : 0;

  const successRate = history.length
    ? Math.round((completed.length / history.length) * 100)
    : 0;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: C.text, padding: "24px 28px", maxWidth: 1280 }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes fadeIn{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .queue-row { animation: fadeIn 0.25s ease both; }
      `}</style>

      {/* ─── Header ─────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>⏳</span>
            <span style={{ background: "linear-gradient(90deg,#38BDF8,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Task Queue Monitor
            </span>
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: C.muted }}>
            Live scan pipeline — {history.length} jobs processed · {activeScans.length} currently running
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {lastRefresh && (
            <span style={{ fontSize: 11, color: C.muted }}>
              Updated {relTime(lastRefresh.getTime())}
            </span>
          )}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            style={{
              background: autoRefresh ? "rgba(52,211,153,0.1)" : C.card,
              border: `1px solid ${autoRefresh ? "rgba(52,211,153,0.3)" : C.border}`,
              color: autoRefresh ? C.green : C.muted,
              fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: autoRefresh ? C.green : C.muted, animation: autoRefresh ? "blink 1.2s ease infinite" : "none" }} />
            {autoRefresh ? "Live" : "Paused"}
          </button>
          <button
            onClick={fetchAll}
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, cursor: "pointer" }}
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* ─── Mode Banner ─────────────────────────── */}
      <div style={{
        marginBottom: 24, padding: "14px 20px", borderRadius: 12,
        background: queueMode ? "rgba(56,189,248,0.05)" : "rgba(167,139,250,0.05)",
        border: `1px solid ${queueMode ? "rgba(56,189,248,0.2)" : "rgba(167,139,250,0.2)"}`,
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 22 }}>{queueMode ? "🚀" : "⚙️"}</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: queueMode ? C.cyan : C.purple }}>
            {queueMode ? "BullMQ Queue Mode — Redis Connected" : "In-Process Mode (No Redis)"}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            {queueMode
              ? "Scans are offloaded to BullMQ worker queue · Distributed, scalable, retryable"
              : "Scans run inside the Node.js process · To enable queue mode set REDIS_URL in backend/.env"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Redis",  val: queueMode ? "Connected" : "Offline",  ok: queueMode },
            { label: "Worker", val: queueMode ? "Running" : "N/A",        ok: queueMode },
            { label: "Mode",   val: queueMode ? "Queue" : "In-Process",   ok: true      },
          ].map(({ label, val, ok }) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: ok ? C.green : C.red, marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Stat Row ─────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon="🔄" label="Running"      value={activeScans.length}  color={C.cyan}   pulse={activeScans.length > 0} />
        <StatCard icon="✅" label="Completed"    value={completed.length}    color={C.green}  />
        <StatCard icon="❌" label="Failed"       value={failed.length}       color={C.red}    />
        <StatCard icon="📊" label="Success Rate" value={`${successRate}%`}   color={successRate >= 80 ? C.green : successRate >= 50 ? C.yellow : C.red} sub={`${history.length} total jobs`} />
        <StatCard icon="⏱" label="Avg Duration" value={avgDuration ? `${avgDuration}s` : "—"} color={C.purple} />
        {queueMode && queueMetrics && (
          <StatCard icon="⏳" label="Queued"     value={queueMetrics.waiting ?? 0} color={C.yellow} />
        )}
      </div>

      {/* ─── Active Scans Section ─────────────────────────── */}
      {activeScans.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🟢 Active Jobs</span>
            <span style={{ background: "rgba(56,189,248,0.12)", color: C.cyan, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, animation: "blink 1.4s ease infinite" }}>
              {activeScans.length} RUNNING
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(400px,1fr))", gap: 12 }}>
            {activeScans.map((scan) => (
              <ActiveJobCard key={scan._id} scan={scan} progress={activeProgress[scan._id]} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Pipeline Table ─────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>

        {/* Table Toolbar */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>📋 Pipeline History</span>
            <span style={{ fontSize: 11, color: C.muted }}>Last {history.length} jobs</span>
          </div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: 3 }}>
            {[
              { key: "all",       label: `All (${history.length})`         },
              { key: "running",   label: `Running (${activeScans.length})`  },
              { key: "completed", label: `Done (${completed.length})`       },
              { key: "failed",    label: `Failed (${failed.length})`        },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  background: filter === key ? "rgba(56,189,248,0.15)" : "transparent",
                  color: filter === key ? C.cyan : C.muted,
                  border: "none", fontSize: 11, fontWeight: 600,
                  padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: C.muted, fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 12, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
            <br />Loading pipeline data...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No jobs yet</div>
            <div style={{ fontSize: 12, color: C.muted }}>Run your first scan from the <strong>Scans</strong> page to see it here.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  {["#", "Target", "Status", "Progress", "Grade", "Findings", "Duration", "Started"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((scan, idx) => (
                  <HistoryRow key={scan._id} scan={scan} idx={idx} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Setup Guide (only if no Redis) ─────── */}
      {!queueMode && (
        <div style={{ marginTop: 20, padding: "18px 20px", background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.purple, marginBottom: 10 }}>
            ⚡ Upgrade to BullMQ Queue Mode
          </div>
          <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px", lineHeight: 1.7 }}>
            Enable distributed, retry-capable, concurrent scan processing by adding <code style={{ color: C.purple, background: "rgba(167,139,250,0.1)", padding: "1px 6px", borderRadius: 4 }}>REDIS_URL</code> to your <code style={{ color: C.purple }}>backend/.env</code>. The worker starts automatically.
          </p>
          <pre style={{ background: "#020617", padding: "12px 16px", borderRadius: 8, color: "#A7F3D0", fontSize: 11, fontFamily: "monospace", margin: 0, overflowX: "auto", lineHeight: 1.7 }}>
{`# backend/.env — add one of these:
REDIS_URL=redis://localhost:6379          # local Redis
REDIS_URL=rediss://default:pw@host:6380   # Redis Cloud / Upstash (TLS)

QUEUE_CONCURRENCY=3   # parallel scan workers (default: 3)`}
          </pre>
        </div>
      )}
    </div>
  );
}
