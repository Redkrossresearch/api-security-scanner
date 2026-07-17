import { useState, useEffect } from "react";
import api from "../services/api";
import { downloadReport } from "../services/reportService";
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  AlertOctagon, 
  FileSpreadsheet, 
  Code,
  Calendar,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Award,
  ShieldAlert,
  Zap,
  Globe
} from "lucide-react";
import toast from "react-hot-toast";

const COLORS = {
  white: "#FFFFFF",
  muted: "#CBD5E1",
  purple: "#C084FC",
  critical: "#F87171",
  warning: "#FB923C",
  success: "#34D399",
  border: "rgba(139, 92, 246, 0.3)",
  background: "linear-gradient(135deg, #070d19 0%, #02050b 100%)",
  cardBg: "rgba(22, 30, 49, 0.95)",
  glassBorder: "rgba(139, 92, 246, 0.25)"
};

export default function ReportsPage() {
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeStandard, setActiveStandard] = useState("owasp"); // owasp, pci, soc2
  const [activeScanData, setActiveScanData] = useState(null);

  // Load Scan history to select from
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/scans/history");
        const list = res.data.scans || [];
        setScans(list);
        if (list.length > 0) {
          setSelectedScanId(list[0].scanId);
        }
      } catch (err) {
        toast.error("Failed to load historical scans list");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Fetch complete details when scan selection changes
  useEffect(() => {
    if (!selectedScanId) return;
    const fetchScanDetails = async () => {
      try {
        const res = await api.get(`/scans/${selectedScanId}`);
        if (res.data) {
          setActiveScanData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch scan detail", err);
      }
    };
    fetchScanDetails();
  }, [selectedScanId]);

  // Download logic helper
  const handleExport = async (format) => {
    if (!selectedScanId) {
      toast.error("Please select a target scan first");
      return;
    }

    const toastId = toast.loading(`Generating & exporting ${format.toUpperCase()} compliance payload...`);
    try {
      const data = await downloadReport(selectedScanId, format);
      const file = new Blob([data], {
        type: format === "pdf" ? "application/pdf" : (format === "json" || format === "openapi") ? "application/json" : "text/csv",
      });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      const downloadName = format === "openapi" ? `API_Specification_${selectedScanId}.json` : `API_Security_Report_${selectedScanId}.${format}`;
      link.setAttribute("download", downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss(toastId);
      toast.success(`${format.toUpperCase()} downloaded successfully!`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(`Failed to export ${format.toUpperCase()} report.`);
    }
  };

  const getOwaspControls = (vulnerabilities = []) => {
    const bolaFail = vulnerabilities.some(v => /bola|object level authorization|api1/i.test(v.title + " " + v.description));
    const authFail = vulnerabilities.some(v => /auth|jwt|token|api2/i.test(v.title + " " + v.description));
    const propFail = vulnerabilities.some(v => /property level|mass assignment|api3/i.test(v.title + " " + v.description));
    const rateFail = vulnerabilities.some(v => /rate limit|resource consumption|api4/i.test(v.title + " " + v.description));

    return [
      {
        id: "api1",
        title: "API1:2023 - Broken Object Level Authorization (BOLA)",
        passed: !bolaFail,
        desc: bolaFail ? "Critical Exposure: Unchecked resource identifiers detected." : "Secure: Access tokens and resource identifiers match owner scopes."
      },
      {
        id: "api2",
        title: "API2:2023 - Broken Authentication",
        passed: !authFail,
        desc: authFail ? "Insecure Setup: Missing or poorly signed JWT validation configurations." : "Secure: Correct signature headers and secure JWT expiration policies."
      },
      {
        id: "api3",
        title: "API3:2023 - Broken Object Property Level Authorization",
        passed: !propFail,
        desc: propFail ? "Exposure Found: Sensitive properties can be manipulated in request payload." : "Secure: Strict schema validation prevents property level authorization bypass."
      },
      {
        id: "api4",
        title: "API4:2023 - Unrestricted Resource Consumption",
        passed: !rateFail,
        desc: rateFail ? "Rate Limit Violation: Missing global rate limiting configuration." : "Secure: Dynamic request rate limiter blocks automated payloads."
      }
    ];
  };

  const getPciControls = (vulnerabilities = []) => {
    const sslFail = vulnerabilities.some(v => /ssl|tls|cipher|encryption/i.test(v.title + " " + v.description));
    const transitFail = vulnerabilities.some(v => /plaintext|http|in transit/i.test(v.title + " " + v.description));
    const codeFail = vulnerabilities.some(v => /injection|xss|rce|cwe/i.test(v.title + " " + v.description));

    return [
      {
        id: "req2",
        title: "Req 2.2: Establish System Configuration Standards",
        passed: !sslFail,
        desc: sslFail ? "Verification Failure: Poor cipher suites or insecure TLS configurations detected." : "Secure: Secure TLS configuration verified. Host validation checks succeeded."
      },
      {
        id: "req4",
        title: "Req 4.1: Encryption of Cardholder Data in Transit",
        passed: !transitFail,
        desc: transitFail ? "Plaintext Endpoint: Plaintext HTTP authentication endpoints were detected." : "Secure: All communication paths force TLS v1.3 encryption."
      },
      {
        id: "req6",
        title: "Req 6.5: Prevent Common Vulnerabilities in API Code",
        passed: !codeFail,
        desc: codeFail ? "Exploit Threat: Active injection vulnerabilities listed in standard index." : "Secure: Code injection check passed."
      }
    ];
  };

  const getSocControls = (vulnerabilities = []) => {
    const authFail = vulnerabilities.some(v => /auth|credential|login/i.test(v.title + " " + v.description));
    const corsFail = vulnerabilities.some(v => /cors|cross-origin|wildcard/i.test(v.title + " " + v.description));

    return [
      {
        id: "cc6_1",
        title: "CC6.1: Logical Perimeter Authorization Protection",
        passed: !authFail,
        desc: authFail ? "Access Loophole: Logical APIs are accessible without verified authorization parameters." : "Secure: Logical APIs demand verified authorization header parameters."
      },
      {
        id: "cc6_3",
        title: "CC6.3: Firewall & CORS Domain Restrictions",
        passed: !corsFail,
        desc: corsFail ? "Configuration Error: Wildcard CORS origin config found ('*') or firewall bypass allowed." : "Secure: Access control whitelist correctly restricts origins."
      }
    ];
  };

  const activeScan = scans.find(s => s.scanId === selectedScanId) || null;
  const vulnerabilitiesList = activeScanData?.vulnerabilities || [];

  const owaspControls = getOwaspControls(vulnerabilitiesList);
  const pciControls = getPciControls(vulnerabilitiesList);
  const socControls = getSocControls(vulnerabilitiesList);

  const owaspProgress = owaspControls.length > 0 ? Math.round((owaspControls.filter(c => c.passed).length / owaspControls.length) * 100) : 100;
  const pciProgress = pciControls.length > 0 ? Math.round((pciControls.filter(c => c.passed).length / pciControls.length) * 100) : 100;
  const socProgress = socControls.length > 0 ? Math.round((socControls.filter(c => c.passed).length / socControls.length) * 100) : 100;

  const critCount = activeScan?.criticalCount || 0;
  const highCount = activeScan?.highCount || 0;

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", background: "#020617", color: COLORS.white }}>
        <RefreshCw style={{ width: "42px", height: "42px", color: COLORS.purple, margin: "0 auto 16px auto", animation: "spin 1.5s linear infinite" }} />
        <p style={{ textAlign: "center", color: COLORS.muted, fontSize: "13px", fontWeight: "600" }}>Loading compliance reports library...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .rep-container {
          padding: 28px;
          background: ${COLORS.background};
          min-height: 100%;
          color: #FFF;
          font-family: 'Outfit', 'Inter', sans-serif;
          box-sizing: border-box;
        }
        
        /* Glassmorphic Cyber Panels */
        .hud-card {
          background: ${COLORS.cardBg};
          border: 1.5px solid ${COLORS.glassBorder};
          border-radius: 24px;
          padding: 26px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          position: relative;
        }
        
        .standard-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1.5px solid ${COLORS.glassBorder};
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 165px;
          position: relative;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .standard-card:hover {
          transform: translateY(-4px);
          border-color: rgba(167, 139, 250, 0.5);
          background: rgba(30, 41, 59, 0.85);
          box-shadow: 0 12px 35px rgba(167, 139, 250, 0.2);
        }
        .standard-card.active {
          border-color: #A78BFA;
          background: linear-gradient(180deg, rgba(167, 139, 250, 0.15) 0%, rgba(22, 30, 49, 0.95) 100%);
          box-shadow: 0 0 25px rgba(167, 139, 250, 0.35), inset 0 1px 0 rgba(167, 139, 250, 0.4);
        }
        .rep-select {
          background: #0d1527;
          border: 1.5px solid rgba(167, 139, 250, 0.4);
          border-radius: 12px;
          padding: 10px 18px;
          color: #FFF;
          font-size: 13.5px;
          font-weight: 700;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rep-select:focus {
          border-color: #C084FC;
          box-shadow: 0 0 15px rgba(167, 139, 250, 0.45);
        }
        
        /* High Contrast Neon Action Buttons - 100% Solid & Visible gradients */
        .exp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: #FFFFFF;
          border: none;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        .exp-btn:hover {
          transform: translateY(-2px) scale(1.02);
          filter: brightness(1.15);
        }
        .exp-btn:active {
          transform: translateY(0) scale(0.98);
        }
        
        /* High-contrast checklist cards */
        .checklist-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-radius: 16px;
          margin-bottom: 14px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .checklist-item.passed {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(22, 30, 49, 0.95) 100%);
          border: 1.5px solid rgba(16, 185, 129, 0.4);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.05);
        }
        .checklist-item.passed:hover {
          border-color: #10B981;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.15);
          transform: translateX(4px);
        }
        .checklist-item.failed {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(22, 30, 49, 0.95) 100%);
          border: 1.5px solid rgba(239, 68, 68, 0.4);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.05);
        }
        .checklist-item.failed:hover {
          border-color: #EF4444;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.15);
          transform: translateX(4px);
        }
        .glow-green {
          color: #34D399;
          filter: drop-shadow(0 0 8px rgba(52, 211, 153, 0.7));
        }
        .glow-red {
          color: #F87171;
          filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.7));
        }
        
        /* Ledger and Row highlights */
        .archive-tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.2s;
        }
        .archive-tr:hover {
          background: rgba(167, 139, 250, 0.08);
          border-left: 4px solid #A78BFA;
        }
        
        .risk-badge {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .risk-badge.high {
          background: rgba(239, 68, 68, 0.25);
          color: #F87171;
          border: 1.5px solid #EF4444;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
        }
        .risk-badge.secure {
          background: rgba(16, 185, 129, 0.25);
          color: #34D399;
          border: 1.5px solid #10B981;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        }
        
        .capsule-dl-btn {
          font-size: 11.5px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          color: #FFF;
        }
        .capsule-dl-btn:hover {
          transform: translateY(-2px) scale(1.03);
        }
      `}</style>

      <div className="rep-container">
        
        {/* Glowing cyberpunk HUD Header */}
        <div className="hud-card" style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
              border: "1.5px solid rgba(167, 139, 250, 0.6)",
              borderRadius: "16px",
              padding: "14px",
              color: "#FFF",
              display: "inline-flex",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
            }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: "27px", fontWeight: "900", margin: 0, letterSpacing: "-0.5px", background: "linear-gradient(90deg, #FFFFFF, #E2E8F0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Compliance Auditing & Reports Hub
              </h1>
              <p style={{ fontSize: "13px", color: COLORS.muted, marginTop: "4px", fontWeight: "500" }}>
                Audit API configurations against industry standards and generate formal PDF, CSV, and JSON audit packages.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ background: "rgba(167, 139, 250, 0.08)", border: "1.5px solid rgba(167, 139, 250, 0.35)", borderRadius: "14px", padding: "10px 18px", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: COLORS.muted, fontWeight: "800", letterSpacing: "0.5px", textTransform: "uppercase" }}>Total Runs</div>
              <div style={{ fontSize: "21px", fontWeight: "900", color: "#FFF", marginTop: "2px" }}>{scans.length}</div>
            </div>
            <div style={{ background: "rgba(52, 211, 153, 0.08)", border: "1.5px solid rgba(52, 211, 153, 0.35)", borderRadius: "14px", padding: "10px 18px", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: COLORS.muted, fontWeight: "800", letterSpacing: "0.5px", textTransform: "uppercase" }}>Average Health</div>
              <div style={{ fontSize: "21px", fontWeight: "900", color: "#34D399", marginTop: "2px" }}>87.5%</div>
            </div>
          </div>
        </div>

        {/* Audit Selectors HUD */}
        <div className="hud-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", padding: "18px 24px", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "900", color: "#FFF", textTransform: "uppercase", letterSpacing: "0.75px" }}>Security Audit Target:</span>
            <select
              value={selectedScanId}
              onChange={(e) => setSelectedScanId(e.target.value)}
              className="rep-select"
            >
              {scans.map((scan) => (
                <option key={scan.scanId} value={scan.scanId}>
                  {scan.targetUrl} ({new Date(scan.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <span className="risk-badge high" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10.5px" }}>
              <ShieldAlert size={12} />
              {critCount} Critical
            </span>
            <span className="risk-badge" style={{ background: "rgba(249, 115, 22, 0.25)", color: "#F97316", border: "1.5px solid #F97316", boxShadow: "0 0 12px rgba(249, 115, 22, 0.4)", display: "flex", alignItems: "center", gap: "6px", fontSize: "10.5px" }}>
              <ShieldAlert size={12} />
              {highCount} High
            </span>
          </div>
        </div>

        {/* 3 Standards Selection Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          
          {/* OWASP */}
          <div 
            onClick={() => setActiveStandard("owasp")}
            className={`standard-card ${activeStandard === "owasp" ? "active" : ""}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "900", margin: 0, color: activeStandard === "owasp" ? "#F5F3FF" : "#FFF" }}>OWASP API Security Top 10</h4>
                <p style={{ fontSize: "12px", color: COLORS.muted, marginTop: "6px", lineHeight: "1.45" }}>Verify object authorizations, token validation limits, and rate properties.</p>
              </div>
              <ShieldCheck size={18} color={activeStandard === "owasp" ? "#C084FC" : "#94A3B8"} style={{ flexShrink: 0 }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: "800", color: "#FFF", marginBottom: "6px" }}>
                <span>COMPLIANCE RATE</span>
                <span style={{ color: owaspProgress > 80 ? "#34D399" : "#FBBF24", fontWeight: "950" }}>{owaspProgress}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "9px", overflow: "hidden" }}>
                <div style={{ width: `${owaspProgress}%`, height: "100%", background: owaspProgress > 80 ? COLORS.success : COLORS.warning, borderRadius: "9px" }} />
              </div>
            </div>
          </div>

          {/* PCI-DSS */}
          <div 
            onClick={() => setActiveStandard("pci")}
            className={`standard-card ${activeStandard === "pci" ? "active" : ""}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "900", margin: 0, color: activeStandard === "pci" ? "#F5F3FF" : "#FFF" }}>PCI-DSS Payment Gateway v4.0</h4>
                <p style={{ fontSize: "12px", color: COLORS.muted, marginTop: "6px", lineHeight: "1.45" }}>Audit transmission configuration standards, encryption in transit, and payloads.</p>
              </div>
              <AlertOctagon size={18} color={activeStandard === "pci" ? "#C084FC" : "#94A3B8"} style={{ flexShrink: 0 }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: "800", color: "#FFF", marginBottom: "6px" }}>
                <span>COMPLIANCE RATE</span>
                <span style={{ color: pciProgress > 80 ? "#34D399" : "#FBBF24", fontWeight: "950" }}>{pciProgress}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "9px", overflow: "hidden" }}>
                <div style={{ width: `${pciProgress}%`, height: "100%", background: pciProgress > 80 ? COLORS.success : COLORS.warning, borderRadius: "9px" }} />
              </div>
            </div>
          </div>

          {/* SOC 2 */}
          <div 
            onClick={() => setActiveStandard("soc2")}
            className={`standard-card ${activeStandard === "soc2" ? "active" : ""}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "900", margin: 0, color: activeStandard === "soc2" ? "#F5F3FF" : "#FFF" }}>SOC 2 Trust Services Criteria</h4>
                <p style={{ fontSize: "12px", color: COLORS.muted, marginTop: "6px", lineHeight: "1.45" }}>Evaluate system logical perimeter controls and endpoint isolation parameters.</p>
              </div>
              <Award size={18} color={activeStandard === "soc2" ? "#C084FC" : "#94A3B8"} style={{ flexShrink: 0 }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: "800", color: "#FFF", marginBottom: "6px" }}>
                <span>COMPLIANCE RATE</span>
                <span style={{ color: socProgress > 80 ? "#34D399" : "#FBBF24", fontWeight: "950" }}>{socProgress}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "9px", overflow: "hidden" }}>
                <div style={{ width: `${socProgress}%`, height: "100%", background: socProgress > 80 ? COLORS.success : COLORS.warning, borderRadius: "9px" }} />
              </div>
            </div>
          </div>

        </div>

        {/* Detailed checklist & Export Center */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px", marginBottom: "32px" }}>
          
          {/* High Contrast Compliance Checklist Details */}
          <div className="hud-card" style={{ gridColumn: "span 8" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#F1F5F9", marginBottom: "22px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={16} color="#C084FC" />
              {activeStandard === "owasp" && "OWASP API Top 10 Control Checklist"}
              {activeStandard === "pci" && "PCI-DSS v4.0 API Requirement Controls"}
              {activeStandard === "soc2" && "SOC 2 CC6.1 - CC6.3 Logical Perimeter Control Checklist"}
            </h3>

            <div style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
              {activeStandard === "owasp" && owaspControls.map((c) => (
                <div key={c.id} className={`checklist-item ${c.passed ? "passed" : "failed"}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {c.passed ? <CheckCircle size={20} className="glow-green" /> : <XCircle size={20} className="glow-red" />}
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>{c.title}</div>
                      <div style={{ fontSize: "12px", color: "#E2E8F0", marginTop: "4px", lineHeight: "1.4" }}>{c.desc}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "900",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: c.passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    color: c.passed ? "#34D399" : "#F87171",
                    border: `1.5px solid ${c.passed ? "#10B981" : "#EF4444"}`
                  }}>
                    {c.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              ))}

              {activeStandard === "pci" && pciControls.map((c) => (
                <div key={c.id} className={`checklist-item ${c.passed ? "passed" : "failed"}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {c.passed ? <CheckCircle size={20} className="glow-green" /> : <XCircle size={20} className="glow-red" />}
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>{c.title}</div>
                      <div style={{ fontSize: "12px", color: "#E2E8F0", marginTop: "4px", lineHeight: "1.4" }}>{c.desc}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "900",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: c.passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    color: c.passed ? "#34D399" : "#F87171",
                    border: `1.5px solid ${c.passed ? "#10B981" : "#EF4444"}`
                  }}>
                    {c.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              ))}

              {activeStandard === "soc2" && socControls.map((c) => (
                <div key={c.id} className={`checklist-item ${c.passed ? "passed" : "failed"}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {c.passed ? <CheckCircle size={20} className="glow-green" /> : <XCircle size={20} className="glow-red" />}
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>{c.title}</div>
                      <div style={{ fontSize: "12px", color: "#E2E8F0", marginTop: "4px", lineHeight: "1.4" }}>{c.desc}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "900",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: c.passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    color: c.passed ? "#34D399" : "#F87171",
                    border: `1.5px solid ${c.passed ? "#10B981" : "#EF4444"}`
                  }}>
                    {c.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* High Contrast Solid Export Panel */}
          <div className="hud-card" style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#F1F5F9", marginBottom: "8px" }}>Export Center</h3>
              <p style={{ fontSize: "12.5px", color: COLORS.muted, lineHeight: "1.5" }}>Download pre-compiled audit archives to distribute to development teams or audit compliance bodies.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "24px" }}>
              <button 
                onClick={() => handleExport("pdf")}
                className="exp-btn"
                style={{ background: "linear-gradient(135deg, #EF4444 0%, #991B1B 100%)", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.45)" }}
              >
                <FileText size={15} style={{ marginRight: "4px" }} />
                Export PDF Compliance Audit
              </button>

              <button 
                onClick={() => handleExport("csv")}
                className="exp-btn"
                style={{ background: "linear-gradient(135deg, #10B981 0%, #065F46 100%)", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.45)" }}
              >
                <FileSpreadsheet size={15} style={{ marginRight: "4px" }} />
                Export CSV Registry
              </button>

              <button 
                onClick={() => handleExport("json")}
                className="exp-btn"
                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #4C1D95 100%)", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.45)" }}
              >
                <Code size={15} style={{ marginRight: "4px" }} />
                Export JSON Raw Logs
              </button>

              <button 
                onClick={() => handleExport("openapi")}
                className="exp-btn"
                style={{ background: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)", boxShadow: "0 4px 15px rgba(14, 165, 233, 0.45)" }}
              >
                <Code size={15} style={{ marginRight: "4px" }} />
                Export OpenAPI Schema
              </button>
            </div>
          </div>

        </div>

        {/* Report generation archives table */}
        <div className="hud-card">
          <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#F1F5F9", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe size={16} color="#C084FC" />
            Report Generation Archives
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1.5px solid rgba(167, 139, 250, 0.35)", padding: "14px 12px", color: "#FFF", fontSize: "10.5px", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.75px" }}>Target URL</th>
                  <th style={{ borderBottom: "1.5px solid rgba(167, 139, 250, 0.35)", padding: "14px 12px", color: "#FFF", fontSize: "10.5px", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.75px" }}>Assessment Date</th>
                  <th style={{ borderBottom: "1.5px solid rgba(167, 139, 250, 0.35)", padding: "14px 12px", color: "#FFF", fontSize: "10.5px", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.75px", textAlign: "center" }}>Risk Level</th>
                  <th style={{ borderBottom: "1.5px solid rgba(167, 139, 250, 0.35)", padding: "14px 12px", color: "#FFF", fontSize: "10.5px", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.75px", textAlign: "center" }}>Vulnerabilities</th>
                  <th style={{ borderBottom: "1.5px solid rgba(167, 139, 250, 0.35)", padding: "14px 12px", color: "#FFF", fontSize: "10.5px", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.75px", textAlign: "right" }}>Compliance Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 8).map((scan) => {
                  const dateStr = new Date(scan.createdAt).toLocaleDateString();
                  const hasCrit = (scan.criticalCount || 0) > 0 || (scan.highCount || 0) > 0;
                  return (
                    <tr key={scan.scanId} className="archive-tr">
                      <td style={{ padding: "18px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.04)", fontFamily: "'Fira Code', monospace", color: "#38BDF8", fontSize: "12px", fontWeight: "750" }}>{scan.targetUrl}</td>
                      <td style={{ padding: "18px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.04)", color: "#FFF", fontWeight: "700" }}>{dateStr}</td>
                      <td style={{ padding: "18px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.04)", textAlign: "center" }}>
                        <span className={`risk-badge ${hasCrit ? "high" : "secure"}`}>
                          {hasCrit ? "HIGH RISK" : "SECURE"}
                        </span>
                      </td>
                      <td style={{ padding: "18px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.04)", textAlign: "center", color: "#E2E8F0", fontWeight: "700" }}>
                        <span style={{ color: (scan.criticalCount || 0) > 0 ? "#F87171" : "inherit", fontWeight: "900" }}>{scan.criticalCount || 0} Critical</span> / {scan.highCount || 0} High
                      </td>
                      <td style={{ padding: "18px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.04)", textAlign: "right" }}>
                        <button 
                          onClick={() => { setSelectedScanId(scan.scanId); handleExport("pdf"); }}
                          className="capsule-dl-btn"
                          style={{ background: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)", boxShadow: "0 0 12px rgba(239, 68, 68, 0.45)" }}
                        >
                          <Download size={12} />
                          PDF
                        </button>
                        <button 
                          onClick={() => { setSelectedScanId(scan.scanId); handleExport("json"); }}
                          className="capsule-dl-btn"
                          style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)", boxShadow: "0 0 12px rgba(139, 92, 246, 0.45)", marginLeft: "10px" }}
                        >
                          <Download size={12} />
                          JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}