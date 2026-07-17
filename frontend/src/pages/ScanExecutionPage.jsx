import { useState, useEffect, useRef } from "react";
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
      code: `// Node.js Express rate limiting setup\nconst rateLimit = require('express-rate-limit');\n\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100,                  // limit each IP to 100 requests per windowMs\n  message: 'Too many requests from this IP, please try again later.'\n});\n\napp.use('/api/', limiter);`,
      desc: "Apply rate limiting controls to block automated brute-force attacks."
    };
  }
  return {
    code: `// Generic Recommendation\n// Please refer to OWASP API Security Guidelines:\n// https://owasp.org/API-Security/\n\n// 1. Verify resource ownership checks.\n// 2. Validate input schemas.\n// 3. Restrict exposed HTTP headers.`,
    desc: "Verify implementation structure against target standards."
  };
};

export default function ScanExecutionPage() {
  const [url, setUrl] = useState("https://api.example.com");
  const [isScanning, setIsScanning] = useState(false);
  const [scan, setScan] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);

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
      toast.success("Scan completed successfully!");
      const completedScan = await scanService.getScanById(scan._id);
      setScan(completedScan);
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
      toast.error(`Scan failed: ${data.reason}`);
      setScanStatus({
        status: "failed",
        progress: 0,
      });
    }
  });

  const handleStartScan = async () => {
    if (!url) return;
    setIsScanning(true);
    setScan(null);
    setScanStatus(null);
    setSelectedVuln(null);
    setLiveLogs([]);

    try {
      const initialScan = await scanService.createScan(url);
      setScan(initialScan);
      setScanStatus({
        status: "running",
        progress: 0,
        currentScanner: "crawler",
      });
    } catch (err) {
      toast.error(err.message || "Failed to start scan");
      setIsScanning(false);
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
        <ScanStatusCard scan={scan} scanStatus={scanStatus} />
      )}

      {/* Row 1 */}

      <div
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
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1.4fr 1fr",
          gap: "20px",
          alignItems: "stretch",
          height: "780px",
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

      {/* ─── Code Fix Modal ─── */}
      {isFixModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#071126", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "28px", width: "90%", maxWidth: "680px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>🛠️ Generate AI Remediation Fix</h3>
            <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "8px", marginBottom: "16px" }}>Selected finding: <strong style={{ color: "#EF4444" }}>{selectedVuln?.title || selectedVuln?.raw?.title || "Sample Vulnerability"}</strong></p>
            
            <div style={{ color: "#CBD5E1", fontSize: "13px", marginBottom: "12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", padding: "12px", borderRadius: "10px" }}>
              💡 <strong>Remediation Recommendation:</strong> {getFixSnippet(selectedVuln).desc}
            </div>

            <pre style={{ margin: 0, padding: "16px", background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", color: "#F8F8F2", fontSize: "13px", fontFamily: "JetBrains Mono, monospace", lineHeight: "1.6", overflowX: "auto", maxHeight: "260px" }}>
              {getFixSnippet(selectedVuln).code}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button onClick={() => setIsFixModalOpen(false)} style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", border: "none", color: "#FFFFFF", padding: "10px 24px", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>Close Remediation Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Explain Risk Modal ─── */}
      {isRiskModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#071126", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "28px", width: "90%", maxWidth: "600px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>⚠️ Detailed Risk Explanation</h3>
            <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "8px", marginBottom: "20px" }}>Analyzing risk profile for: <strong style={{ color: "#F97316" }}>{selectedVuln?.title || selectedVuln?.raw?.title || "Sample Vulnerability"}</strong></p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", padding: "14px", borderRadius: "12px" }}>
                <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "600" }}>SEVERITY LEVEL</span>
                <div style={{ color: "#EF4444", fontSize: "20px", fontWeight: "700", marginTop: "4px", textTransform: "uppercase" }}>{selectedVuln?.severity || selectedVuln?.raw?.severity || "High"}</div>
              </div>
              <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.06)", padding: "14px", borderRadius: "12px" }}>
                <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "600" }}>CVSS RISK SCORE</span>
                <div style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>{selectedVuln?.cvss || selectedVuln?.raw?.cvss || "7.5"} / 10</div>
              </div>
            </div>

            <div style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.7", background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
              💬 <strong>Impact Statement:</strong> {selectedVuln?.description || selectedVuln?.raw?.description || "Exposing endpoints increases threat vector footprints and exposes service metadata to credential-stuffing automated brute force attempts."}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setIsRiskModalOpen(false)} style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", padding: "10px 24px", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>Close Analysis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}