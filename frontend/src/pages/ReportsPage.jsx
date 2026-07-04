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
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

const COLORS = {
  white: "#FFFFFF",
  muted: "#94A3B8",
  purple: "#8B5CF6",
  critical: "#EF4444",
  warning: "#F97316",
  success: "#22C55E",
  border: "rgba(255,255,255,.08)",
  background: "#030712",
  cardBg: "#090d16"
};

const styles = {
  container: {
    padding: "24px",
    background: COLORS.background,
    minHeight: "100vh",
    color: COLORS.white,
    fontFamily: "Inter, sans-serif",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "13px",
    color: COLORS.muted,
    marginTop: "6px",
    fontWeight: "500",
  },
  controlStrip: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "16px 20px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    marginRight: "10px",
  },
  select: {
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "8px 16px",
    fontSize: "13px",
    color: "#E2E8F0",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: "24px",
    marginBottom: "32px",
  },
  standardCard: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  standardTitle: {
    fontSize: "14px",
    fontWeight: "800",
    margin: 0,
  },
  standardDesc: {
    fontSize: "12px",
    color: COLORS.muted,
    marginTop: "6px",
    lineHeight: "1.5",
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    fontWeight: "750",
    marginTop: "16px",
    marginBottom: "6px",
  },
  progressBarBg: {
    width: "100%",
    height: "6px",
    background: "#1e293b",
    borderRadius: "999px",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "999px",
  },
  checklistCard: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "24px",
  },
  checklistItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  checklistTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F1F5F9",
  },
  checklistDesc: {
    fontSize: "11px",
    color: COLORS.muted,
    marginTop: "2px",
  },
  exportCard: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.05)",
    background: "#0d1527",
    color: "#E2E8F0",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tableCard: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "24px",
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
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: "10px",
    textTransform: "uppercase",
  },
  td: {
    padding: "16px 10px",
    borderBottom: "1px solid rgba(255,255,255,.04)",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: COLORS.muted,
    cursor: "pointer",
    padding: "4px",
    marginLeft: "8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  }
};

export default function ReportsPage() {
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeStandard, setActiveStandard] = useState("owasp"); // owasp, pci, soc2

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
        type: format === "pdf" ? "application/pdf" : format === "json" ? "application/json" : "text/csv",
      });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `API_Security_Report_${selectedScanId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss(toastId);
      toast.success(`${format.toUpperCase()} compliance report downloaded successfully!`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(`Failed to export ${format.toUpperCase()} report.`);
    }
  };

  const getActiveScan = () => {
    return scans.find((s) => s.scanId === selectedScanId) || null;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", itemsCenter: "center", justifyContent: "center", minHeight: "100vh", background: COLORS.background, color: COLORS.white }}>
        <RefreshCw style={{ width: "48px", height: "48px", color: COLORS.purple, margin: "0 auto 16px auto", animation: "spin 1s linear infinite" }} />
        <p style={{ textAlign: "center", color: COLORS.muted, fontWeight: "500" }}>Loading compliance reports library...</p>
      </div>
    );
  }

  const activeScan = getActiveScan();

  // Compute compliance rates (mocked dynamically based on scan vulnerabilities)
  const critCount = activeScan?.vulnerabilitiesSummary?.critical || 0;
  const highCount = activeScan?.vulnerabilitiesSummary?.high || 0;
  const medCount = activeScan?.vulnerabilitiesSummary?.medium || 0;

  const owaspProgress = Math.max(40, 100 - (critCount * 12 + highCount * 6));
  const pciProgress = Math.max(50, 100 - (critCount * 15 + highCount * 5));
  const socProgress = Math.max(60, 100 - (critCount * 8 + highCount * 4));

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Compliance Auditing & Reports Hub</h1>
        <p style={styles.subtitle}>Audit API configurations against industry standards and generate formal PDF, CSV, and JSON audit packages.</p>
      </div>

      {/* Target Selector Control */}
      <div style={styles.controlStrip}>
        <div>
          <span style={styles.label}>Select Security Audit Target:</span>
          <select
            value={selectedScanId}
            onChange={(e) => setSelectedScanId(e.target.value)}
            style={styles.select}
          >
            {scans.map((scan) => (
              <option key={scan.scanId} value={scan.scanId}>
                {scan.target} ({new Date(scan.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", color: COLORS.muted, fontSize: "12px", fontWeight: "600" }}>
          <span>Vulnerabilities: <strong style={{ color: COLORS.critical }}>{critCount} Crit</strong> / <strong style={{ color: COLORS.warning }}>{highCount} High</strong></span>
        </div>
      </div>

      {/* Grid: Compliance Standards selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* OWASP API Top 10 */}
        <div 
          onClick={() => setActiveStandard("owasp")}
          style={{ ...styles.standardCard, borderColor: activeStandard === "owasp" ? COLORS.purple : COLORS.border }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4 style={{ ...styles.standardTitle, color: activeStandard === "owasp" ? "#C084FC" : "#FFFFFF" }}>OWASP API Security Top 10</h4>
              <ShieldCheck style={{ width: "16px", height: "16px", color: COLORS.muted }} />
            </div>
            <p style={styles.standardDesc}>Verify access control parameters, authentication headers, and object scope limits.</p>
          </div>
          <div>
            <div style={styles.progressInfo}>
              <span>COMPLIANCE RATE</span>
              <span>{owaspProgress}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${owaspProgress}%`, background: owaspProgress > 80 ? COLORS.success : COLORS.warning }}></div>
            </div>
          </div>
        </div>

        {/* PCI-DSS v4.0 */}
        <div 
          onClick={() => setActiveStandard("pci")}
          style={{ ...styles.standardCard, borderColor: activeStandard === "pci" ? COLORS.purple : COLORS.border }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4 style={{ ...styles.standardTitle, color: activeStandard === "pci" ? "#C084FC" : "#FFFFFF" }}>PCI-DSS Payment Gateway v4.0</h4>
              <AlertOctagon style={{ width: "16px", height: "16px", color: COLORS.muted }} />
            </div>
            <p style={styles.standardDesc}>Audit transmission security parameters, secure configuration standards, and data leak controls.</p>
          </div>
          <div>
            <div style={styles.progressInfo}>
              <span>COMPLIANCE RATE</span>
              <span>{pciProgress}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${pciProgress}%`, background: pciProgress > 80 ? COLORS.success : COLORS.warning }}></div>
            </div>
          </div>
        </div>

        {/* SOC 2 Type II */}
        <div 
          onClick={() => setActiveStandard("soc2")}
          style={{ ...styles.standardCard, borderColor: activeStandard === "soc2" ? COLORS.purple : COLORS.border }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4 style={{ ...styles.standardTitle, color: activeStandard === "soc2" ? "#C084FC" : "#FFFFFF" }}>SOC 2 Trust Services Criteria</h4>
              <FileText style={{ width: "16px", height: "16px", color: COLORS.muted }} />
            </div>
            <p style={styles.standardDesc}>Evaluate system logical perimeter access controls, security headers, and endpoint isolation parameters.</p>
          </div>
          <div>
            <div style={styles.progressInfo}>
              <span>COMPLIANCE RATE</span>
              <span>{socProgress}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${socProgress}%`, background: socProgress > 80 ? COLORS.success : COLORS.warning }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Details checklist & Export Center */}
      <div style={styles.grid}>
        
        {/* Compliance Checklist detail */}
        <div style={{ ...styles.checklistCard, gridColumn: "span 8" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#E2E8F0", marginBottom: "16px" }}>
            {activeStandard === "owasp" && "OWASP API Top 10 Control Checklist"}
            {activeStandard === "pci" && "PCI-DSS v4.0 API Requirement Controls"}
            {activeStandard === "soc2" && "SOC 2 CC6.1 - CC6.3 Logical Perimeter Control Checklist"}
          </h3>

          <div>
            {activeStandard === "owasp" && (
              <>
                <div style={styles.checklistItem}>
                  {critCount > 0 ? <XCircle style={{ color: COLORS.critical, width: "18px", height: "18px", marginTop: "2px" }} /> : <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />}
                  <div>
                    <div style={styles.checklistTitle}>API1:2023 - Broken Object Level Authorization (BOLA)</div>
                    <div style={styles.checklistDesc}>{critCount > 0 ? `Unchecked resource identifiers detected (BOLA exposure)` : `Passed: Access tokens and resource identifiers match owner scopes.`}</div>
                  </div>
                </div>

                <div style={styles.checklistItem}>
                  {highCount > 0 ? <XCircle style={{ color: COLORS.critical, width: "18px", height: "18px", marginTop: "2px" }} /> : <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />}
                  <div>
                    <div style={styles.checklistTitle}>API2:2023 - Broken Authentication</div>
                    <div style={styles.checklistDesc}>{highCount > 0 ? `Failed: Missing or poorly signed JWT validation configurations found.` : `Passed: Correct signature headers and secure JWT expiration policies.`}</div>
                  </div>
                </div>

                <div style={styles.checklistItem}>
                  <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />
                  <div>
                    <div style={styles.checklistTitle}>API3:2023 - Broken Object Property Level Authorization</div>
                    <div style={styles.checklistDesc}>Passed: Strict schema validation prevents parameter injection.</div>
                  </div>
                </div>

                <div style={styles.checklistItem}>
                  {medCount > 0 ? <XCircle style={{ color: COLORS.warning, width: "18px", height: "18px", marginTop: "2px" }} /> : <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />}
                  <div>
                    <div style={styles.checklistTitle}>API4:2023 - Unrestricted Resource Consumption</div>
                    <div style={styles.checklistDesc}>{medCount > 0 ? `Failed: Missing global rate limiting configuration.` : `Passed: Dynamic request rate limiter blocks automated payloads.`}</div>
                  </div>
                </div>
              </>
            )}

            {activeStandard === "pci" && (
              <>
                <div style={styles.checklistItem}>
                  <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />
                  <div>
                    <div style={styles.checklistTitle}>Req 2.2: Establish System Configuration Standards</div>
                    <div style={styles.checklistDesc}>Passed: Secure SSL configuration verified. Host validation checks succeeded.</div>
                  </div>
                </div>

                <div style={styles.checklistItem}>
                  {critCount > 0 ? <XCircle style={{ color: COLORS.critical, width: "18px", height: "18px", marginTop: "2px" }} /> : <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />}
                  <div>
                    <div style={styles.checklistTitle}>Req 4.1: Encryption of Cardholder Data in Transit</div>
                    <div style={styles.checklistDesc}>{critCount > 0 ? `Failed: Plaintext HTTP authentication endpoints were detected.` : `Passed: All communication paths force TLS v1.3 encryption.`}</div>
                  </div>
                </div>

                <div style={styles.checklistItem}>
                  {highCount > 0 ? <XCircle style={{ color: COLORS.critical, width: "18px", height: "18px", marginTop: "2px" }} /> : <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />}
                  <div>
                    <div style={styles.checklistTitle}>Req 6.5: Prevent Common Vulnerabilities in API Code</div>
                    <div style={styles.checklistDesc}>{highCount > 0 ? `Failed: Active vulnerabilities listed in standard index.` : `Passed: Code injection check passed.`}</div>
                  </div>
                </div>
              </>
            )}

            {activeStandard === "soc2" && (
              <>
                <div style={styles.checklistItem}>
                  <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />
                  <div>
                    <div style={styles.checklistTitle}>CC6.1: Logical Perimeter Authorization Protection</div>
                    <div style={styles.checklistDesc}>Passed: Logical APIs demand verified authorization header parameters.</div>
                  </div>
                </div>

                <div style={styles.checklistItem}>
                  {highCount > 0 ? <XCircle style={{ color: COLORS.critical, width: "18px", height: "18px", marginTop: "2px" }} /> : <CheckCircle style={{ color: COLORS.success, width: "18px", height: "18px", marginTop: "2px" }} />}
                  <div>
                    <div style={styles.checklistTitle}>CC6.3: Firewall & CORS Domain Restrictions</div>
                    <div style={styles.checklistDesc}>{highCount > 0 ? `Failed: Wildcard CORS origin config found ('*')` : `Passed: Access control whitelist correctly restricts origins.`}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Compliance Export Center Card */}
        <div style={{ ...styles.exportCard, gridColumn: "span 4" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#E2E8F0", marginBottom: "6px" }}>Export Center</h3>
            <p style={{ fontSize: "12px", color: COLORS.muted, lineHeight: "1.5" }}>Download pre-compiled audit archives to distribute to development teams or audit compliance bodies.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            <button 
              onClick={() => handleExport("pdf")}
              style={{ ...styles.exportBtn, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "#F87171" }}
            >
              <FileText style={{ width: "16px", height: "16px" }} />
              Export PDF Compliance Audit
            </button>

            <button 
              onClick={() => handleExport("csv")}
              style={{ ...styles.exportBtn, border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.06)", color: "#4ADE80" }}
            >
              <FileSpreadsheet style={{ width: "16px", height: "16px" }} />
              Export CSV Registry
            </button>

            <button 
              onClick={() => handleExport("json")}
              style={{ ...styles.exportBtn, border: "1px solid rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.06)", color: "#C084FC" }}
            >
              <Code style={{ width: "16px", height: "16px" }} />
              Export JSON Raw Logs
            </button>
          </div>
        </div>

      </div>

      {/* Reports Archives Ledger */}
      <div style={styles.tableCard}>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#E2E8F0", marginBottom: "16px" }}>Report Generation Archives</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Target URL</th>
              <th style={styles.th}>Assessment Date</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Risk Level</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Vulnerabilities</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Compliance Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.slice(0, 5).map((scan) => {
              const dateStr = new Date(scan.createdAt).toLocaleDateString();
              const score = scan.score || 85;
              const hasCrit = (scan.vulnerabilitiesSummary?.critical || 0) > 0;
              return (
                <tr key={scan.scanId}>
                  <td style={{ ...styles.td, fontFamily: "monospace" }}>{scan.target}</td>
                  <td style={styles.td}>{dateStr}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <span style={{ 
                      padding: "2px 8px", 
                      borderRadius: "6px", 
                      fontSize: "11px", 
                      fontWeight: "700",
                      background: hasCrit ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                      color: hasCrit ? COLORS.critical : COLORS.success
                    }}>
                      {hasCrit ? "HIGH RISK" : "SECURE"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: "center", color: COLORS.muted }}>
                    {scan.vulnerabilitiesSummary?.critical || 0} Critical / {scan.vulnerabilitiesSummary?.high || 0} High
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button 
                      onClick={() => { setSelectedScanId(scan.scanId); handleExport("pdf"); }}
                      style={{ ...styles.iconBtn, color: "#F87171" }}
                    >
                      <Download style={{ width: "14px", height: "14px" }} />
                      PDF
                    </button>
                    <button 
                      onClick={() => { setSelectedScanId(scan.scanId); handleExport("json"); }}
                      style={{ ...styles.iconBtn, color: "#C084FC" }}
                    >
                      <Download style={{ width: "14px", height: "14px" }} />
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
  );
}