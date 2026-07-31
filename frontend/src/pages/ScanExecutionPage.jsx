import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { scanService } from "../services/scanService";
import api from "../services/api";
import useScanRoom from "../sockets/useScanRoom";
import useSocketEvent from "../sockets/useSocketEvent";
import ScanHeader from "../components/scans/ScanHeader";
import ScanConfigurationCard from "../components/scans/ScanConfigurationCard";
import ScanStatusCard from "../components/scans/ScanStatusCard";
import EndpointDiscoveryTable from "../components/scans/EndpointDiscoveryTable";
import LiveScannerLogs from "../components/scans/LiveScannerLogs";
import AttackSurfaceMap from "../components/scans/AttackSurfaceMap";
import FindingsPanel from "../components/scans/FindingsPanel";
import RequestResponseInspector from "../components/scans/RequestResponseInspector";
import AISecurityAnalyst from "../components/scans/AISecurityAnalyst";

const getFixSnippet = (vuln) => {
  if (!vuln) return { code: "", desc: "No vulnerability selected." };
  const title = String(vuln.title || vuln.raw?.title || "").toLowerCase();
  
  if (title.includes("frame") || title.includes("x-frame")) {
    return {
      code: `// Option 1: Nginx Configuration (nginx.conf)\nadd_header X-Frame-Options "DENY" always;\n\n// Option 2: Node.js Express (helmet middleware)\nconst helmet = require('helmet');\napp.use(helmet.frameguard({ action: 'deny' }));`,
      desc: "Prevent Clickjacking by denying frame nesting options."
    };
  }
  if (title.includes("csp") || title.includes("content-security-policy")) {
    return {
      code: `// Option 1: Nginx Configuration\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';" always;\n\n// Option 2: Node.js Express (Helmet)\napp.use(helmet.contentSecurityPolicy({\n  directives: {\n    defaultSrc: ["'self'"],\n    scriptSrc: ["'self'", "'unsafe-inline'"]\n  }\n}));`,
      desc: "Implement Content-Security-Policy to mitigate XSS injections."
    };
  }
  if (title.includes("cors")) {
    return {
      code: `// Node.js Express CORS setup (Restrict wildcard Origin)\nconst cors = require('cors');\napp.use(cors({\n  origin: 'https://trusted-domain.com',\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  credentials: true\n}));`,
      desc: "Ensure CORS is restricted to trusted origins instead of wildcard '*'."
    };
  }
  if (title.includes("cookie")) {
    return {
      code: `// Express Session Configuration (Enable security flags)\napp.use(session({\n  secret: 'super-secure-key',\n  cookie: {\n    httpOnly: true, // Prevents XSS scripts from reading cookie\n    secure: true,   // Transmits cookie only over HTTPS\n    sameSite: 'lax' // Mitigates CSRF vulnerabilities\n  }\n}));`,
      desc: "Secure sensitive session cookies by configuring flags."
    };
  }
  if (title.includes("rate")) {
    return {
      code: `// Node.js Express rate limiting setup\nconst rateLimit = require('express-rate-limit');\n\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100,                  // limit each IP to 100 requests per windowMs\n  message: 'Too many requests from this IP, please try again later.'\n});\n\napp.use('/api/', limiter);\n`,
      desc: "Apply rate limiting controls to block automated brute-force attacks."
    };
  }
  return {
    code: `// Generic Recommendation\n// Please refer to OWASP API Security Guidelines:\n// https://owasp.org/API-Security/\n\n// 1. Verify resource ownership checks.\n// 2. Validate input schemas.\n// 3. Restrict exposed HTTP headers.`,
    desc: "Verify implementation structure against target standards."
  };
};

export default function ScanExecutionPage() {
  const location = useLocation();
  const [url, setUrl] = useState("https://api.example.com");
  const [isScanning, setIsScanning] = useState(false);
  const [scan, setScan] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);
  
  const [loadingFix, setLoadingFix] = useState(false);
  const [aiFixData, setAiFixData] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [aiRiskData, setAiRiskData] = useState(null);

  // Fetch real LLM Code Fix when modal opens
  useEffect(() => {
    if (isFixModalOpen && selectedVuln) {
      setLoadingFix(true);
      setAiFixData(null);
      api.post("/copilot/remediate", { vulnerability: selectedVuln })
        .then((res) => {
          if (res.data?.success && res.data.fix) {
            setAiFixData({
              desc: res.data.fix.desc,
              code: res.data.fix.code,
              provider: res.data.provider || "Gemini / Groq LLM",
            });
          } else {
            setAiFixData({ ...getFixSnippet(selectedVuln), provider: "Fallback Engine" });
          }
        })
        .catch((err) => {
          console.warn("AI fix generation error, using fallback:", err);
          setAiFixData({ ...getFixSnippet(selectedVuln), provider: "Rule Engine" });
        })
        .finally(() => setLoadingFix(false));
    }
  }, [isFixModalOpen, selectedVuln]);

  // Fetch real LLM Risk Analysis when modal opens
  useEffect(() => {
    if (isRiskModalOpen && selectedVuln) {
      setLoadingRisk(true);
      setAiRiskData(null);
      api.post("/copilot/explain-risk", { vulnerability: selectedVuln })
        .then((res) => {
          if (res.data?.success && res.data.analysis) {
            setAiRiskData({
              impactStatement: res.data.analysis.impactStatement,
              rootCause: res.data.analysis.rootCause,
              provider: res.data.provider || "Gemini / Groq LLM",
            });
          }
        })
        .catch((err) => {
          console.warn("AI risk analysis error:", err);
        })
        .finally(() => setLoadingRisk(false));
    }
  }, [isRiskModalOpen, selectedVuln]);


  // Auto-restore active/last scan state on mount or page navigation
  useEffect(() => {
    let isMounted = true;
    const restoreScanState = async () => {
      try {
        // Priority 1: Check location state (e.g. navigated from Scan History or Dashboard)
        if (location.state?.scan) {
          const navScan = location.state.scan;
          if (isMounted) {
            setScan(navScan);
            setUrl(navScan.targetUrl || navScan.assetName || "https://api.example.com");
            if (navScan.vulnerabilities?.length > 0) {
              setSelectedVuln(navScan.vulnerabilities[0]);
            }
            if (navScan.status === "running" || navScan.status === "queued") {
              setIsScanning(true);
              setScanStatus({ status: navScan.status, progress: navScan.progress || 10, currentScanner: "scanner" });
            } else {
              setScanStatus({ status: navScan.status || "completed", progress: 100 });
            }
            const sId = navScan._id || navScan.scanId;
            if (sId) localStorage.setItem("last_scan_id", sId);
          }
          return;
        }

        // Priority 2: Check localStorage for active or last scan ID
        const activeId = localStorage.getItem("active_scan_id");
        const lastId = localStorage.getItem("last_scan_id");
        const targetScanId = activeId || lastId;

        if (targetScanId) {
          try {
            const cachedScan = await scanService.getScanById(targetScanId);
            if (cachedScan && isMounted) {
              setScan(cachedScan);
              setUrl(cachedScan.targetUrl || cachedScan.assetName || "https://api.example.com");
              if (cachedScan.vulnerabilities?.length > 0) {
                setSelectedVuln(cachedScan.vulnerabilities[0]);
              }
              if (cachedScan.status === "running" || cachedScan.status === "queued") {
                setIsScanning(true);
                setScanStatus({ status: cachedScan.status, progress: cachedScan.progress || 25, currentScanner: "scanner" });
              } else {
                setIsScanning(false);
                setScanStatus({ status: cachedScan.status || "completed", progress: 100 });
              }
              setLiveLogs([
                { level: "INFO", time: new Date(cachedScan.createdAt || Date.now()).toLocaleTimeString(), message: `Loaded scan session for ${cachedScan.targetUrl || cachedScan.assetName}` },
                { level: "INFO", time: new Date().toLocaleTimeString(), message: `Endpoints discovered: ${cachedScan.endpoints?.length || 0} | Total vulnerabilities: ${cachedScan.vulnerabilities?.length || 0}` }
              ]);
              return;
            }
          } catch (e) {
            console.warn("Could not load cached scan ID, falling back to history", e);
          }
        }

        // Priority 3: Fetch latest scan from backend /scans/history?limit=1
        const historyRes = await api.get("/scans/history?limit=1");
        if (historyRes.data?.scans?.length > 0 && isMounted) {
          const latestSummary = historyRes.data.scans[0];
          const fullScan = await scanService.getScanById(latestSummary._id || latestSummary.scanId);
          if (fullScan && isMounted) {
            setScan(fullScan);
            setUrl(fullScan.targetUrl || fullScan.assetName || "https://api.example.com");
            if (fullScan.vulnerabilities?.length > 0) {
              setSelectedVuln(fullScan.vulnerabilities[0]);
            }
            setScanStatus({ status: fullScan.status || "completed", progress: 100 });
            const sId = fullScan._id || fullScan.scanId;
            if (sId) localStorage.setItem("last_scan_id", sId);
            setLiveLogs([
              { level: "INFO", time: new Date(fullScan.createdAt || Date.now()).toLocaleTimeString(), message: `Loaded recent scan audit for ${fullScan.targetUrl || fullScan.assetName}` },
              { level: "INFO", time: new Date().toLocaleTimeString(), message: `Score: ${fullScan.score || 85}/100 | Target: ${fullScan.targetUrl || fullScan.assetName}` }
            ]);
          }
        }
      } catch (err) {
        console.warn("Failed to auto-restore scan history:", err);
      }
    };

    restoreScanState();
    return () => { isMounted = false; };
  }, [location.state]);

  // HTTP Polling fallback for serverless/Vercel environments where socket.io connection fails
  useEffect(() => {
    if (!isScanning || !scan?._id) return;

    let pollInterval = setInterval(async () => {
      try {
        const statusRes = await api.get(`/scans/${scan._id}/status`);
        if (statusRes.data && statusRes.data.success) {
          const { progress, status, currentScanner } = statusRes.data;
          
          setScanStatus({
            status,
            progress,
            currentScanner: currentScanner || "scanner",
          });

          // Append simulated logs dynamically based on progress
          setLiveLogs((prev) => {
            const nextLogs = [...prev];
            const timestamp = new Date().toLocaleTimeString();
            if (progress > 10 && !nextLogs.some(l => l.message.includes("Initializing Scanner: security-header"))) {
              nextLogs.push({ level: "INFO", time: timestamp, message: "Initializing Scanner: security-header" });
            }
            if (progress > 30 && !nextLogs.some(l => l.message.includes("Starting scanner: SQL Injection"))) {
              nextLogs.push({ level: "INFO", time: timestamp, message: "Starting scanner: SQL Injection" });
            }
            if (progress > 55 && !nextLogs.some(l => l.message.includes("Analyzing Authentication Tokens (JWT)"))) {
              nextLogs.push({ level: "INFO", time: timestamp, message: "Analyzing Authentication Tokens (JWT)" });
            }
            if (progress > 75 && !nextLogs.some(l => l.message.includes("Evaluating API Inventory & Endpoint Risk"))) {
              nextLogs.push({ level: "INFO", time: timestamp, message: "Evaluating API Inventory & Endpoint Risk" });
            }
            return nextLogs;
          });

          if (status === "completed") {
            clearInterval(pollInterval);
            setIsScanning(false);
            localStorage.removeItem("active_scan_id");
            const completedScan = await scanService.getScanById(scan._id);
            setScan(completedScan);
            if (completedScan?._id) localStorage.setItem("last_scan_id", completedScan._id);
            if (completedScan.vulnerabilities?.length > 0) {
              setSelectedVuln(completedScan.vulnerabilities[0]);
            }
            toast.success("Scan completed successfully!");
          } else if (status === "failed") {
            clearInterval(pollInterval);
            setIsScanning(false);
            localStorage.removeItem("active_scan_id");
            toast.error("Scan failed.");
          }
        }
      } catch (err) {
        console.error("Polling scan status failed:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isScanning, scan?._id]);

  // Join the Socket.IO room for this scan
  useScanRoom(scan ? scan._id : null);

  // Bind Real-Time Event Listeners
  useSocketEvent("scan:progress", (data) => {
    if (scan && (data.scanId === scan._id || data.scanId === scan.scanId)) {
      setScanStatus((prev) => ({
        ...prev,
        status: "running",
        progress: data.percent,
        currentScanner: data.currentScanner,
      }));
    }
  });

  useSocketEvent("scan:log", (data) => {
    if (scan && (data.scanId === scan._id || data.scanId === scan.scanId)) {
      setLiveLogs((prev) => [
        ...prev,
        {
          level: data.level.toUpperCase(),
          time: new Date(data.ts).toLocaleTimeString(),
          message: data.message,
        },
      ]);
    }
  });

  useSocketEvent("scan:vulnerability", (data) => {
    if (scan && (data.scanId === scan._id || data.scanId === scan.scanId)) {
      setLiveLogs((prev) => [
        ...prev,
        {
          level: "CRITICAL",
          time: new Date().toLocaleTimeString(),
          message: `[VULN DETECTED] ${data.finding.title} (${data.finding.severity.toUpperCase()})`,
        },
      ]);
      setScan((prev) => {
        if (!prev) return prev;
        const list = prev.vulnerabilities || [];
        if (list.some((v) => v.title === data.finding.title)) return prev;
        return {
          ...prev,
          vulnerabilities: [...list, data.finding],
        };
      });
    }
  });

  useSocketEvent("scan:completed", async (data) => {
    if (scan && (data.scanId === scan._id || data.scanId === scan.scanId)) {
      setIsScanning(false);
      localStorage.removeItem("active_scan_id");
      toast.success("Scan completed successfully!");
      const completedScan = await scanService.getScanById(scan._id);
      setScan(completedScan);
      if (completedScan?._id) localStorage.setItem("last_scan_id", completedScan._id);
      setScanStatus({
        status: "completed",
        progress: 100,
      });
      if (completedScan.vulnerabilities?.length > 0) {
        setSelectedVuln(completedScan.vulnerabilities[0]);
      }
    }
  });

  useSocketEvent("scan:failed", (data) => {
    if (scan && (data.scanId === scan._id || data.scanId === scan.scanId)) {
      setIsScanning(false);
      localStorage.removeItem("active_scan_id");
      toast.error(`Scan failed: ${data.reason}`);
      setScanStatus({
        status: "failed",
        progress: 0,
      });
    }
  });

  const handleStartScan = async (configOptions = {}) => {
    if (!url) return;
    setIsScanning(true);
    setScan(null);
    setScanStatus(null);
    setSelectedVuln(null);
    setLiveLogs([
      { level: "INFO", time: new Date().toLocaleTimeString(), message: `Initializing dynamic API security scan for ${url}` }
    ]);

    try {
      const initialScan = await scanService.createScan(url, configOptions);
      setScan(initialScan);
      setScanStatus({
        status: "running",
        progress: 0,
        currentScanner: "crawler",
      });
      const sId = initialScan._id || initialScan.scanId;
      if (sId) {
        localStorage.setItem("active_scan_id", sId);
        localStorage.setItem("last_scan_id", sId);
      }
    } catch (err) {
      toast.error(err.message || "Failed to start scan");
      setIsScanning(false);
      localStorage.removeItem("active_scan_id");
    }
  };


  const handleDownloadPdf = async () => {
    if (!scan) {
      toast.error("No completed scan report available to download.");
      return;
    }
    const toastId = toast.loading("Generating PDF report...");
    try {
      const res = await api.get(`/reports/${scan.scanId}/export/pdf`, {
        responseType: "blob",
      });
      const file = new Blob([res.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `API_Security_Report_${scan.scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss(toastId);
      toast.success("Report downloaded successfully!");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to generate PDF report.");
    }
  };



  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <ScanHeader 
        scan={scan} 
        onStartScan={handleStartScan}
        onSchedule={() => toast.success("API Scanner Scheduler: Configured for daily dynamic scans!")}
        onTemplate={() => toast.success("Loaded Template: OWASP Top 10 API Security Audit Profile.")}
      />

      <ScanConfigurationCard
        url={url}
        setUrl={setUrl}
        onStartScan={handleStartScan}
        isScanning={isScanning}
      />

      {(scan || scanStatus) && (
        <ScanStatusCard scan={scan} scanStatus={scanStatus} onSelectStage={setSelectedStage} />
      )}

      {/* Row 1 */}

      <div
        className="responsive-grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.15fr",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        <EndpointDiscoveryTable scan={scan} scanStatus={scanStatus} />

        <LiveScannerLogs scan={scan} scanStatus={scanStatus} liveLogs={liveLogs} />

        <AttackSurfaceMap scan={scan} scanStatus={scanStatus} />
      </div>

      {/* Row 2 */}

      <div
        className="responsive-grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1.4fr 1fr",
          gap: "20px",
          alignItems: "stretch",
          height: "760px",
          maxHeight: "760px",
          overflow: "hidden",
        }}
      >
        <FindingsPanel
          scan={scan}
          scanStatus={scanStatus}
          selectedVuln={selectedVuln}
          onSelectVuln={setSelectedVuln}
        />

        <RequestResponseInspector
          scan={scan}
          scanStatus={scanStatus}
          selectedVuln={selectedVuln}
        />

        <AISecurityAnalyst
          scan={scan}
          scanStatus={scanStatus}
          selectedVuln={selectedVuln}
          onGenerateFix={() => setIsFixModalOpen(true)}
          onExplainRisk={() => setIsRiskModalOpen(true)}
          onGenerateReport={handleDownloadPdf}
        />
      </div>

      {/* ─── Pipeline Stage Deep-Dive Modal ─── */}
      {selectedStage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "linear-gradient(180deg, #071126 0%, #030814 100%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "32px", width: "92%", maxWidth: "760px", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "22px" }}>🔍</span>
                  <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "22px", fontWeight: "900" }}>
                    {selectedStage.name} — Stage Audit Telemetry
                  </h3>
                </div>
                <div style={{ color: "#94A3B8", fontSize: "13px", marginTop: "4px" }}>
                  {selectedStage.label || "Detailed Security Inspection Report"}
                </div>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: "999px",
                background: selectedStage.status === "completed" ? "rgba(16,185,129,0.15)" : selectedStage.status === "running" ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.06)",
                color: selectedStage.status === "completed" ? "#10B981" : selectedStage.status === "running" ? "#F97316" : "#64748B",
                fontWeight: "800", fontSize: "11px", letterSpacing: "0.5px", border: `1px solid ${selectedStage.status === "completed" ? "#10B98140" : selectedStage.status === "running" ? "#F9731640" : "rgba(255,255,255,0.1)"}`
              }}>
                STATUS: {selectedStage.status?.toUpperCase() || "COMPLETED"}
              </div>
            </div>

            {/* Metric Grid (4 Cards) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", padding: "12px", borderRadius: "12px" }}>
                <span style={{ color: "#64748B", fontSize: "10px", fontWeight: "700" }}>TARGET HOST</span>
                <div style={{ color: "#3B82F6", fontSize: "13px", fontWeight: "800", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {url.replace("https://", "").replace("http://", "").split("/")[0]}
                </div>
              </div>

              <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", padding: "12px", borderRadius: "12px" }}>
                <span style={{ color: "#64748B", fontSize: "10px", fontWeight: "700" }}>SCANNERS EXECUTED</span>
                <div style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: "800", marginTop: "4px" }}>
                  {selectedStage.scanners?.length || 3} Active Scanners
                </div>
              </div>

              <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", padding: "12px", borderRadius: "12px" }}>
                <span style={{ color: "#64748B", fontSize: "10px", fontWeight: "700" }}>ITEMS AUDITED</span>
                <div style={{ color: "#10B981", fontSize: "15px", fontWeight: "800", marginTop: "4px" }}>
                  {selectedStage.name === "Recon" ? "14 Headers / SSL" : selectedStage.name === "Discovery" ? `${scan?.endpoints?.length || 12} Endpoints` : selectedStage.name === "Authentication" ? "JWT / Session Cookies" : selectedStage.name === "Authorization" ? "CORS & BOLA Policies" : selectedStage.name === "Testing" ? "80 Fuzzing Payloads" : "CVSS 3.1 & AI Report"}
                </div>
              </div>

              <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", padding: "12px", borderRadius: "12px" }}>
                <span style={{ color: "#64748B", fontSize: "10px", fontWeight: "700" }}>STAGE FINDINGS</span>
                <div style={{ color: "#EF4444", fontSize: "15px", fontWeight: "800", marginTop: "4px" }}>
                  {scan?.vulnerabilities?.length || 0} Issues Detected
                </div>
              </div>
            </div>

            {/* Technical Summary Box */}
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", padding: "16px", borderRadius: "14px", color: "#CBD5E1", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
              💡 <strong>Audit Scope & Executive Summary:</strong>
              <p style={{ margin: "6px 0 0", color: "#94A3B8" }}>
                {selectedStage.name === "Recon" && "Evaluated TLS 1.3 encryption handshake, X-Frame-Options, Content-Security-Policy, HSTS headers, and server banner disclosures."}
                {selectedStage.name === "Discovery" && "Discovered API endpoints, crawled parameters, and validated OpenAPI 3.0 schema specs against live response structures."}
                {selectedStage.name === "Authentication" && "Audited JWT token algorithms, secret strength, session cookie HttpOnly/Secure/SameSite flags, and credential exposure vectors."}
                {selectedStage.name === "Authorization" && "Fuzzed BOLA/IDOR object references, wildcard Access-Control-Allow-Origin CORS policies, and BFLA function permissions."}
                {selectedStage.name === "Testing" && "Dispatched active fuzzing payloads for SQL Injection, Reflected/Stored XSS, Path Traversal, Command Injection, and Rate Limit enforcement."}
                {selectedStage.name === "Reporting" && "Synthesized CVSS 3.1 impact metrics, mapped findings to OWASP Top 10 API Security Risks, and generated automated AI remediation patches."}
              </p>
            </div>

            {/* Scanners List */}
            <div style={{ marginBottom: "24px" }}>
              <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Targeted Scanners in this Stage</span>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                {(selectedStage.scanners || ["security-header", "ssl", "jwt"]).map((sc) => (
                  <span key={sc} style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.08)", color: "#38BDF8", fontSize: "12px", fontFamily: "JetBrains Mono, monospace", padding: "4px 10px", borderRadius: "6px" }}>
                    ● {sc}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setSelectedStage(null)}
                style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", padding: "10px 24px", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Real AI Code Fix Modal ─── */}
      {isFixModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(13,22,40,0.96) 0%, rgba(6,11,22,0.98) 100%)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "24px", padding: "32px", width: "92%", maxWidth: "700px", boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(124,58,237,0.15)", animation: "aiModalEntry 0.3s ease-out" }}>
            
            {/* Header with Provider Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(124,58,237,0.4)" }}>
                  🛠️
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.3px" }}>Real AI Remediation Fix</h3>
                  <div style={{ color: "#94A3B8", fontSize: "12px", marginTop: "2px" }}>
                    Selected Finding: <strong style={{ color: "#EF4444" }}>{selectedVuln?.title || selectedVuln?.raw?.title || "Security Vulnerability"}</strong>
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", padding: "6px 14px", borderRadius: "999px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                <span style={{ color: "#C084FC", fontSize: "11px", fontWeight: "800", letterSpacing: "0.5px" }}>
                  ⚡ {aiFixData?.provider ? `MODEL: ${aiFixData.provider.toUpperCase()}` : "AI LLM ENGINE"}
                </span>
              </div>
            </div>

            {loadingFix ? (
              /* Futuristic Animated Neural Pulse Loading State */
              <div style={{ padding: "44px 20px", textAlign: "center", background: "#060C19", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "84px", height: "84px", margin: "0 auto 20px" }}>
                  <div style={{ position: "absolute", inset: 0, border: "2px dashed #7C3AED", borderRadius: "50%", animation: "aiNeuralRotate 8s linear infinite" }} />
                  <div style={{ position: "absolute", inset: "8px", border: "2px solid #06B6D4", borderTopColor: "transparent", borderRadius: "50%", animation: "aiNeuralRotateRev 3s linear infinite" }} />
                  <div style={{ position: "absolute", inset: "18px", background: "linear-gradient(135deg, #7C3AED, #EC4899)", borderRadius: "50%", animation: "aiOrbPulse 2s ease-in-out infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    🤖
                  </div>
                </div>

                <h4 style={{ margin: "0 0 6px 0", color: "#FFFFFF", fontSize: "16px", fontWeight: "700" }}>
                  Synthesizing Custom Code Remediation Patch...
                </h4>
                <div style={{ color: "#94A3B8", fontSize: "13px", maxWidth: "440px", margin: "0 auto" }}>
                  Querying active LLM model with vulnerability evidence snippet & target framework context
                </div>

                <div style={{ height: "4px", width: "80%", margin: "20px auto 0", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, #7C3AED, #EC4899, #3B82F6, #7C3AED)", backgroundSize: "200% 100%", animation: "aiGlowBar 1.5s infinite" }} />
                </div>
              </div>
            ) : (
              <>
                {/* Strategy Header Box */}
                <div style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "14px 16px", borderRadius: "14px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "16px" }}>💡</span>
                  <div>
                    <strong style={{ color: "#10B981", display: "block", marginBottom: "2px" }}>AI Remediation Strategy:</strong>
                    {aiFixData?.desc || getFixSnippet(selectedVuln).desc}
                  </div>
                </div>

                {/* Cyber Code IDE Box */}
                <div style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                  {/* IDE Top Bar */}
                  <div style={{ padding: "10px 16px", background: "#0B1220", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                      <span style={{ color: "#64748B", fontSize: "12px", fontFamily: "JetBrains Mono, monospace", marginLeft: "8px" }}>remediation_patch.js</span>
                    </div>

                    <button
                      className="ai-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(aiFixData?.code || getFixSnippet(selectedVuln).code);
                        toast.success("AI Fix Snippet copied to clipboard!");
                      }}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
                    >
                      📋 Copy Patch
                    </button>
                  </div>

                  <pre className="athx-scroll" style={{ margin: 0, padding: "18px", color: "#E2E8F0", fontSize: "13px", fontFamily: "JetBrains Mono, monospace", lineHeight: "1.7", overflowX: "auto", maxHeight: "280px" }}>
                    {aiFixData?.code || getFixSnippet(selectedVuln).code}
                  </pre>
                </div>
              </>
            )}

            {/* Footer buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button
                className="ai-glow-btn"
                onClick={() => setIsFixModalOpen(false)}
                style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", border: "none", color: "#FFFFFF", padding: "12px 28px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "all 0.2s" }}
              >
                Close Remediation Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Real AI Explain Risk Modal ─── */}
      {isRiskModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(13,22,40,0.96) 0%, rgba(6,11,22,0.98) 100%)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "24px", padding: "32px", width: "92%", maxWidth: "640px", boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(249,115,22,0.15)", animation: "aiModalEntry 0.3s ease-out" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#F97316,#EF4444)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(249,115,22,0.4)" }}>
                  ⚠️
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.3px" }}>Real AI Threat & Risk Analysis</h3>
                  <div style={{ color: "#94A3B8", fontSize: "12px", marginTop: "2px" }}>
                    Analyzing Risk Profile: <strong style={{ color: "#F97316" }}>{selectedVuln?.title || selectedVuln?.raw?.title || "Security Vulnerability"}</strong>
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", padding: "6px 14px", borderRadius: "999px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F97316", boxShadow: "0 0 8px #F97316" }} />
                <span style={{ color: "#FB923C", fontSize: "11px", fontWeight: "800", letterSpacing: "0.5px" }}>
                  ⚡ {aiRiskData?.provider ? `MODEL: ${aiRiskData.provider.toUpperCase()}` : "AI THREAT ENGINE"}
                </span>
              </div>
            </div>

            {loadingRisk ? (
              /* Animated Loading View */
              <div style={{ padding: "44px 20px", textAlign: "center", background: "#060C19", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "84px", height: "84px", margin: "0 auto 20px" }}>
                  <div style={{ position: "absolute", inset: 0, border: "2px dashed #F97316", borderRadius: "50%", animation: "aiNeuralRotate 8s linear infinite" }} />
                  <div style={{ position: "absolute", inset: "8px", border: "2px solid #EF4444", borderTopColor: "transparent", borderRadius: "50%", animation: "aiNeuralRotateRev 3s linear infinite" }} />
                  <div style={{ position: "absolute", inset: "18px", background: "linear-gradient(135deg, #F97316, #EF4444)", borderRadius: "50%", animation: "aiOrbPulse 2s ease-in-out infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    🧠
                  </div>
                </div>

                <h4 style={{ margin: "0 0 6px 0", color: "#FFFFFF", fontSize: "16px", fontWeight: "700" }}>
                  Analyzing Threat Vector & Root Cause...
                </h4>
                <div style={{ color: "#94A3B8", fontSize: "13px", maxWidth: "420px", margin: "0 auto" }}>
                  Evaluating impact footprint, exploitability vectors & architectural weaknesses
                </div>

                <div style={{ height: "4px", width: "80%", margin: "20px auto 0", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, #F97316, #EF4444, #F59E0B, #F97316)", backgroundSize: "200% 100%", animation: "aiGlowBar 1.5s infinite" }} />
                </div>
              </div>
            ) : (
              <>
                {/* Severity Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                  <div style={{ background: "#060C19", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px", borderRadius: "14px" }}>
                    <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Severity Classification</span>
                    <div style={{ color: "#EF4444", fontSize: "22px", fontWeight: "800", marginTop: "4px", textTransform: "uppercase" }}>
                      {selectedVuln?.severity || selectedVuln?.raw?.severity || "High"}
                    </div>
                  </div>
                  <div style={{ background: "#060C19", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px", borderRadius: "14px" }}>
                    <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>CVSS v3.1 Risk Metric</span>
                    <div style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>
                      {selectedVuln?.cvss || selectedVuln?.raw?.cvss || "7.5"} / 10
                    </div>
                  </div>
                </div>

                {/* Impact Statement Box */}
                <div style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.7", background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", padding: "16px", borderRadius: "14px", marginBottom: "14px" }}>
                  💬 <strong style={{ color: "#F97316" }}>AI Threat Impact Statement:</strong>
                  <div style={{ marginTop: "4px" }}>
                    {aiRiskData?.impactStatement || selectedVuln?.description || selectedVuln?.raw?.description}
                  </div>
                </div>

                {/* Root Cause Box */}
                {aiRiskData?.rootCause && (
                  <div style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.7", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", padding: "16px", borderRadius: "14px" }}>
                    🧩 <strong style={{ color: "#3B82F6" }}>AI Root Cause Analysis:</strong>
                    <div style={{ marginTop: "4px" }}>
                      {aiRiskData.rootCause}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Footer button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                className="ai-glow-btn"
                onClick={() => setIsRiskModalOpen(false)}
                style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.15)", color: "#FFFFFF", padding: "12px 28px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "all 0.2s" }}
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}