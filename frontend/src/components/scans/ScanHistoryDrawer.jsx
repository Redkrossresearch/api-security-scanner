import { useEffect, useState } from "react";
import { scanService } from "../../services/scanService";
import { reportService } from "../../services/reportService";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  X,
  ShieldAlert,
  Clock,
  Calendar,
  FileText,
  CheckCircle2,
  Brain,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Layers,
  Target,
  ExternalLink,
} from "lucide-react";

export default function ScanHistoryDrawer({
  open = true,
  onClose = () => {},
  selectedScan = null,
}) {
  const [scan, setScan] = useState(selectedScan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!selectedScan?._id) return;

    const fetchScan = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await scanService.getScanById(selectedScan._id);
        setScan(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load scan.");
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [selectedScan]);

  if (!open) return null;

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(0,0,0,.6)",
          color: "white",
          zIndex: 1000,
        }}
      >
        Loading scan...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(0,0,0,.6)",
          color: "#EF4444",
          zIndex: 1000,
        }}
      >
        {error}
      </div>
    );
  }

  const scanData = scan;

  if (!scanData) return null;

  // ✅ Sprint 2.3.2: Format duration properly (backend sends seconds)
  const formatDuration = (duration = 0) => {
    if (duration < 60) return `${duration} sec`;

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  };

  // ✅ Sprint 2.3.2: Use backend counts directly (source of truth)
  const criticalCount = scanData.criticalCount ?? 0;
  const highCount = scanData.highCount ?? 0;
  const mediumCount = scanData.mediumCount ?? 0;
  const lowCount = scanData.lowCount ?? 0;

  // ✅ Sprint 2.3.2: Use backend totalFindings
  const totalFindings = scanData.totalFindings ?? (scanData.vulnerabilities?.length || 0);

  const handleExport = async () => {
    if (!scanData.scanId || exporting) return;

    setExporting(true);

    try {
      await reportService.exportReport(scanData.scanId, scanData);
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 8) return "#EF4444";
    if (score >= 6) return "#F97316";
    return "#22C55E";
  };

  const getRiskBg = (score) => {
    if (score >= 8) return "rgba(239,68,68,.12)";
    if (score >= 6) return "rgba(249,115,22,.12)";
    return "rgba(34,197,94,.12)";
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "#22C55E";
    if (s === "running") return "#F59E0B";
    return "#EF4444";
  };

  // ✅ Sprint 2.3.2: getGrade is now just a fallback
  const getGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B+";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const getGradeColor = (score) => {
    if (score >= 80) return "#22C55E";
    if (score >= 60) return "#FACC15";
    return "#EF4444";
  };

  const getCvssColor = (cvss) => {
    if (cvss >= 9) return "#EF4444";
    if (cvss >= 7) return "#F97316";
    if (cvss >= 4) return "#FACC15";
    return "#22C55E";
  };

  const getSeverityColor = (severity) => {
    const s = severity?.toLowerCase();
    if (s === "critical") return "#EF4444";
    if (s === "high") return "#F97316";
    if (s === "medium") return "#FACC15";
    if (s === "low") return "#22C55E";
    return "#60A5FA";
  };

  const getSeverityBg = (severity) => {
    const color = getSeverityColor(severity);
    return `${color}15`;
  };

  const vulnerabilities = scanData.vulnerabilities || [];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.65)",
          backdropFilter: "blur(8px)",
          zIndex: 999,
          animation: "drawerFadeIn .25s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          width: "min(500px, 92vw)",
          height: "100vh",
          background: "linear-gradient(180deg, #071126 0%, #0A0F1F 100%)",
          borderLeft: "1px solid rgba(255,255,255,.07)",
          zIndex: 1000,
          overflowY: "auto",
          padding: "28px",
          animation: "drawerSlideIn .3s cubic-bezier(.4,0,.2,1)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(124,58,237,.3) transparent",
        }}
      >
        <style>{`
          @keyframes drawerFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes drawerSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes drawerPulseGlow { 0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,.12); } 50% { box-shadow: 0 0 32px rgba(239,68,68,.22); } }
          @keyframes drawerShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes drawerBarFill { from { width: 0; } }
          .sd-close:hover { background: #111B2E !important; color: #fff !important; }
          .sd-kpi:hover { border-color: rgba(255,255,255,.12) !important; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,.3); }
          .sd-finding:hover { transform: translateX(4px); border-color: rgba(255,255,255,.12) !important; }
          .sd-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(124,58,237,.35); }
          .sd-btn-secondary:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.18) !important; background: #111B2E !important; }
          .sd-risk-card { animation: drawerPulseGlow 3s ease-in-out infinite; }
          .sd-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); background-size: 200% 100%; animation: drawerShimmer 3s infinite; }
          .sd-bar-fill { animation: drawerBarFill 1s ease-out; }
          *::-webkit-scrollbar { width: 5px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: rgba(124,58,237,.3); border-radius: 10px; }
          *::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,.5); }
        `}</style>

        {/* ─── Header ─── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: getStatusColor(scanData.status),
                  boxShadow: `0 0 8px ${getStatusColor(scanData.status)}80`,
                }}
              />
              <span
                style={{
                  color: getStatusColor(scanData.status),
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {scanData.status || "Completed"}
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                color: "#FFFFFF",
                fontSize: "22px",
                fontWeight: "800",
                letterSpacing: "-.5px",
              }}
            >
              {scanData.scanId}
            </h2>
            <div
              style={{
                color: "#64748B",
                marginTop: "6px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Target size={13} />
              {scanData.targetUrl}
            </div>
          </div>

          <button
            onClick={onClose}
            className="sd-close"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,.08)",
              background: "#0B1220",
              color: "#94A3B8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .2s ease",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Executive Summary (Dynamic with backend counts) ─── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(168,85,247,.08) 0%, rgba(124,58,237,.04) 100%)",
            border: "1px solid rgba(168,85,247,.15)",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "120px",
              height: "120px",
              background:
                "radial-gradient(circle, rgba(168,85,247,.08) 0%, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#C084FC",
              fontWeight: "700",
              marginBottom: "10px",
              fontSize: "13px",
            }}
          >
            <Brain size={16} />
            Executive Summary
          </div>
          <div
            style={{
              color: "#CBD5E1",
              fontSize: "13px",
              lineHeight: "1.7",
              position: "relative",
            }}
          >
            Security scan completed successfully.{" "}
            <span style={{ color: "#FFFFFF", fontWeight: "700" }}>
              {totalFindings}
            </span>{" "}
            findings detected.
            {criticalCount > 0 && (
              <>
                {" "}
                <span style={{ color: "#EF4444", fontWeight: "700" }}>
                  {criticalCount} Critical
                </span>
              </>
            )}
            {highCount > 0 && (
              <>
                ,{" "}
                <span style={{ color: "#F97316", fontWeight: "700" }}>
                  {highCount} High
                </span>
              </>
            )}
            {mediumCount > 0 && (
              <>
                ,{" "}
                <span style={{ color: "#FACC15", fontWeight: "700" }}>
                  {mediumCount} Medium
                </span>
              </>
            )}
            {lowCount > 0 && (
              <>
                ,{" "}
                <span style={{ color: "#22C55E", fontWeight: "700" }}>
                  {lowCount} Low
                </span>
              </>
            )}
            .
          </div>
        </div>

        {/* ─── Risk Score ─── */}
        <div
          className="sd-risk-card"
          style={{
            background: "linear-gradient(135deg, #0B1220 0%, #111827 100%)",
            border: `1px solid ${getRiskBg(scanData.riskScore || 0)}`,
            borderRadius: "18px",
            padding: "20px",
            marginBottom: "18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: `radial-gradient(circle, ${getRiskColor(scanData.riskScore || 0)}10 0%, transparent 70%)`,
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Risk Score
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                <span
                  style={{
                    color: getRiskColor(scanData.riskScore || 0),
                    fontSize: "48px",
                    fontWeight: "800",
                    lineHeight: "1",
                    letterSpacing: "-2px",
                  }}
                >
                  {scanData.riskScore || 0}
                </span>
                <span
                  style={{
                    color: "#475569",
                    fontSize: "20px",
                    fontWeight: "600",
                  }}
                >
                  / 10
                </span>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: `${getRiskColor(scanData.riskScore || 0)}15`,
                  color: getRiskColor(scanData.riskScore || 0),
                  marginTop: "10px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <AlertTriangle size={12} />
                {scanData.riskLevel ||
                  ((scanData.riskScore || 0) >= 8
                    ? "High Risk"
                    : (scanData.riskScore || 0) >= 6
                      ? "Medium Risk"
                      : "Low Risk")}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  border: `3px solid ${getRiskColor(scanData.riskScore || 0)}40`,
                  borderTopColor: getRiskColor(scanData.riskScore || 0),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldAlert
                  size={20}
                  color={getRiskColor(scanData.riskScore || 0)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── KPI Grid (Using backend counts) ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          {[
            {
              title: "Security Grade",
              value: scanData.grade || getGrade(scanData.securityScore || 0),
              color: getGradeColor(scanData.securityScore || 0),
              icon: <ShieldCheck size={14} />,
              bg: `${getGradeColor(scanData.securityScore || 0)}10`,
            },
            {
              title: "Total Findings",
              value: totalFindings,
              color: "#60A5FA",
              icon: <Layers size={14} />,
              bg: "rgba(96,165,250,.06)",
            },
            {
              title: "Critical",
              value: criticalCount,
              color: "#EF4444",
              icon: <AlertTriangle size={14} />,
              bg: "rgba(239,68,68,.06)",
            },
            {
              title: "High",
              value: highCount,
              color: "#F97316",
              icon: <Zap size={14} />,
              bg: "rgba(249,115,22,.06)",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="sd-kpi"
              style={{
                background: "#0B1220",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: "14px",
                padding: "16px",
                transition: "all .25s ease",
                cursor: "default",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    color: "#64748B",
                    fontSize: "11px",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "8px",
                    background: item.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>
              </div>
              <div
                style={{
                  color: item.color,
                  fontWeight: "800",
                  fontSize: "24px",
                  letterSpacing: "-.5px",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Metadata (Fixed duration) ─── */}
        <div
          style={{
            background: "#0B1220",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "18px",
            border: "1px solid rgba(255,255,255,.04)",
          }}
        >
          {[
            {
              icon: <Calendar size={15} />,
              label: "Date",
              value: new Date(scanData.createdAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            },
            {
              icon: <Clock size={15} />,
              label: "Duration",
              value: formatDuration(scanData.duration),
            },
            {
              icon: <FileText size={15} />,
              label: "Profile",
              value: scanData.profile || "Full Security Audit",
            },
          ].map((item, idx, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: idx < arr.length - 1 ? "14px" : "0",
                marginBottom: idx < arr.length - 1 ? "14px" : "0",
                borderBottom:
                  idx < arr.length - 1
                    ? "1px solid rgba(255,255,255,.04)"
                    : "none",
                color: "#CBD5E1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  color: "#94A3B8",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "rgba(148,163,184,.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </div>
                {item.label}
              </div>
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Findings Breakdown (Dynamic) ─── */}
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(239,68,68,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={14} color="#EF4444" />
            </div>
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Findings Breakdown
            </h3>
          </div>

          {vulnerabilities.map((vulnerability, idx) => {
            const severityColor = getSeverityColor(vulnerability.severity);
            const cvssColor = getCvssColor(vulnerability.cvss || 0);
            const severityBg = getSeverityBg(vulnerability.severity);
            const statusLower = vulnerability.status?.toLowerCase();

            return (
              <div
                key={vulnerability._id || idx}
                className="sd-finding"
                style={{
                  background: "#0B1220",
                  border: `1px solid ${severityColor}20`,
                  borderLeft: `3px solid ${severityColor}`,
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "12px",
                  transition: "all .2s ease",
                  cursor: "default",
                }}
              >
                {/* Header: Severity + Title */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "inline-block",
                        background: severityBg,
                        color: severityColor,
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        marginBottom: "6px",
                      }}
                    >
                      {vulnerability.severity}
                    </div>
                    <div
                      style={{
                        color: "#FFFFFF",
                        fontSize: "14px",
                        fontWeight: "600",
                        lineHeight: "1.4",
                      }}
                    >
                      {vulnerability.title}
                    </div>
                  </div>
                  <ChevronRight size={14} color="#475569" />
                </div>

                {/* Metrics Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  {/* CVSS */}
                  <div
                    style={{
                      background: "rgba(255,255,255,.03)",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748B",
                        fontSize: "10px",
                        fontWeight: "500",
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        marginBottom: "4px",
                      }}
                    >
                      CVSS
                    </div>
                    <div
                      style={{
                        color: cvssColor,
                        fontSize: "18px",
                        fontWeight: "800",
                      }}
                    >
                      {vulnerability.cvss || 0}
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    style={{
                      background: "rgba(255,255,255,.03)",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748B",
                        fontSize: "10px",
                        fontWeight: "500",
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        marginBottom: "4px",
                      }}
                    >
                      Status
                    </div>
                    <div
                      style={{
                        color: statusLower === "open" ? "#EF4444" : 
                              statusLower === "fixed" ? "#22C55E" : "#FACC15",
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {vulnerability.status || "Open"}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    marginBottom: "12px",
                  }}
                >
                  {vulnerability.category && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ color: "#64748B", fontSize: "11px" }}>Category:</span>
                      <span style={{ color: "#CBD5E1", fontSize: "11px", fontWeight: "600" }}>
                        {vulnerability.category}
                      </span>
                    </div>
                  )}

                  {vulnerability.owasp && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ color: "#64748B", fontSize: "11px" }}>OWASP:</span>
                      <span style={{ color: "#F97316", fontSize: "11px", fontWeight: "600" }}>
                        {vulnerability.owasp}
                      </span>
                    </div>
                  )}

                  {vulnerability.detectedAt && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ color: "#64748B", fontSize: "11px" }}>Detected:</span>
                      <span style={{ color: "#CBD5E1", fontSize: "11px", fontWeight: "600" }}>
                        {new Date(vulnerability.detectedAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommendation */}
                {vulnerability.recommendation && (
                  <div
                    style={{
                      background: "rgba(124,58,237,.06)",
                      border: "1px solid rgba(124,58,237,.15)",
                      borderRadius: "8px",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#C084FC",
                        fontSize: "11px",
                        fontWeight: "700",
                        marginBottom: "4px",
                      }}
                    >
                      <Brain size={12} />
                      Recommendation
                    </div>
                    <div
                      style={{
                        color: "#CBD5E1",
                        fontSize: "12px",
                        lineHeight: "1.5",
                      }}
                    >
                      {vulnerability.recommendation}
                    </div>
                  </div>
                )}

                {/* Remediation Steps */}
                {vulnerability.remediationSteps && vulnerability.remediationSteps.length > 0 && (
                  <div
                    style={{
                      background: "rgba(34,197,94,.04)",
                      border: "1px solid rgba(34,197,94,.12)",
                      borderRadius: "8px",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#22C55E",
                        fontSize: "11px",
                        fontWeight: "700",
                        marginBottom: "6px",
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Remediation Steps
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {vulnerability.remediationSteps.map((step, stepIdx) => (
                        <div
                          key={stepIdx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "6px",
                            color: "#CBD5E1",
                            fontSize: "11px",
                            lineHeight: "1.4",
                          }}
                        >
                          <span style={{ color: "#22C55E", fontSize: "10px", marginTop: "2px" }}>✓</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reference Links */}
                {vulnerability.references && vulnerability.references.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                    }}
                  >
                    {vulnerability.references.map((ref, refIdx) => {
                      const refUrl = typeof ref === "string" ? ref : ref.url || "#";
                      let refLabel = "Reference";
                      
                      try {
                        refLabel = typeof ref === "string" ? new URL(ref).hostname : (ref.label || ref.source || "Reference");
                      } catch (e) {
                        refLabel = typeof ref === "string" ? ref : "Reference";
                      }
                      
                      return (
                        <a
                          key={refIdx}
                          href={refUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "rgba(96,165,250,.08)",
                            border: "1px solid rgba(96,165,250,.2)",
                            color: "#60A5FA",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: "600",
                            textDecoration: "none",
                            transition: "all .2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(96,165,250,.15)";
                            e.currentTarget.style.borderColor = "rgba(96,165,250,.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(96,165,250,.08)";
                            e.currentTarget.style.borderColor = "rgba(96,165,250,.2)";
                          }}
                        >
                          <ExternalLink size={10} />
                          {refLabel}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {vulnerabilities.length === 0 && (
            <div
              style={{
                background: "#0B1220",
                border: "1px solid rgba(255,255,255,.05)",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
                color: "#64748B",
                fontSize: "13px",
              }}
            >
              No vulnerabilities found in this scan.
            </div>
          )}
        </div>

        {/* ─── Actions ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            paddingBottom: "10px",
          }}
        >
          <button
            className="sd-btn-primary"
            onClick={handleExport}
            disabled={!scanData.scanId || exporting}
            style={{
              height: "48px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
              color: "#FFFFFF",
              fontWeight: "700",
              cursor: (!scanData.scanId || exporting) ? "not-allowed" : "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all .25s ease",
              position: "relative",
              overflow: "hidden",
              opacity: (!scanData.scanId || exporting) ? 0.6 : 1,
            }}
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="spin-loader" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileText size={16} style={{ position: "relative" }} />
                <span style={{ position: "relative" }}>Export PDF</span>
              </>
            )}
          </button>

          <button
            className="sd-btn-secondary"
            disabled
            style={{
              height: "48px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,.08)",
              background: "#0B1220",
              color: "#FFFFFF",
              fontWeight: "600",
              cursor: "not-allowed",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all .25s ease",
              opacity: 0.5,
            }}
          >
            <Zap size={16} color="#7C3AED" />
            Re-Run Scan
          </button>
        </div>
      </div>
    </>
  );
}