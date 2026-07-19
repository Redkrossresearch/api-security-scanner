import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Info,
  Bug,
  ShieldCheck,
  Link2,
} from "lucide-react";
import FeatureGuide from "../common/FeatureGuide";

export default function FindingsPanel({ scan, scanStatus, selectedVuln, onSelectVuln }) {
  const isCompleted = scan?.status === "completed";
  const rawFindings = (isCompleted && scan?.vulnerabilities) || [];

  const criticalCount = rawFindings.filter(f => f.severity?.toLowerCase() === "critical").length;
  const highCount = rawFindings.filter(f => f.severity?.toLowerCase() === "high").length;
  const mediumCount = rawFindings.filter(f => f.severity?.toLowerCase() === "medium").length;
  const lowCount = rawFindings.filter(f => f.severity?.toLowerCase() === "low").length;

  const formattedFindings = rawFindings.map((f, idx) => {
    const isSelected = selectedVuln ? (selectedVuln._id === f._id || selectedVuln.title === f.title) : idx === 0;
    return {
      id: f._id || `ATHX-${String(idx).padStart(3, "0")}`,
      severity: f.severity ? f.severity.charAt(0).toUpperCase() + f.severity.slice(1).toLowerCase() : "Medium",
      status: "Open",
      owasp: f.owasp || "OWASP N/A",
      title: f.title,
      endpoint: f.cwe || "API Endpoint",
      impact: f.description || "No impact details available.",
      evidence: f.recommendation || "Verify authentication checks.",
      cvss: f.cvss || 5.0,
      expanded: isSelected,
      raw: f
    };
  });

  const findings = formattedFindings;

  const getColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "#EF4444";
      case "high":
        return "#F97316";
      case "medium":
        return "#FACC15";
      default:
        return "#22C55E";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <ShieldAlert size={16} color="#EF4444" />;

      case "high":
        return <AlertTriangle size={16} color="#F97316" />;

      case "medium":
        return <Info size={16} color="#FACC15" />;

      default:
        return <ShieldCheck size={16} color="#22C55E" />;
    }
  };

  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "20px",
        padding: "20px",
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "22px",
            }}
          >
            Vulnerabilities Found
          </h3>
          <FeatureGuide
            title="Vulnerabilities"
            description={scan 
              ? `This panel lists the security vulnerabilities found in your last scan of "${scan.targetUrl}". We found ${criticalCount} critical, ${highCount} high, and ${mediumCount + lowCount} other issues.`
              : "No active scan selected. Select a scan from the history or run a new scan to see the results."
            }
            steps={[
              "Browse the severity counters (Critical, High, Medium, Low) to get an immediate snapshot of scan results.",
              "Click on any vulnerability row to see the target API path, details of the threat, and how to fix it.",
              "Click the 'View all' link in the top-right corner to open the master vulnerability ledger."
            ]}
            techDetails={[
              "API Path: GET /api/scans/:id",
              "Database collection: Vulnerability records linked to the scan ID.",
              "Updates: Discovered alerts are pushed directly to this UI in real-time using Socket.io WebSockets."
            ]}
            positionStyles={{ position: "static" }}
          />
        </div>

        <span
          onClick={() => toast.success("Redirecting to the comprehensive Vulnerability Database index...")}
          style={{
            color: "#8B5CF6",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          View all →
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "18px",
          marginBottom: "18px",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        <span style={{ color: "#EF4444" }}>{scan ? criticalCount : 0} Critical</span>
        <span style={{ color: "#F97316" }}>{scan ? highCount : 0} High</span>
        <span style={{ color: "#FACC15" }}>{scan ? mediumCount : 0} Medium</span>
        <span style={{ color: "#22C55E" }}>{scan ? lowCount : 0} Low</span>
      </div>

      {/* Findings */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
          overflowY: "auto",
          paddingRight: "4px",
          minHeight: 0,
        }}
      >
        {!scan ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            padding: "40px 20px",
            color: "rgba(255,255,255,0.4)"
          }}>
            <Bug size={48} color="#8B5CF6" style={{ marginBottom: "16px", opacity: 0.6 }} />
            <h4 style={{ margin: "0 0 8px 0", color: "#FFF", fontSize: "15px", fontWeight: "750" }}>
              No Scan Target Selected
            </h4>
            <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5" }}>
              Select a previous assessment from the Scan History list or run a new scan to load findings.
            </p>
          </div>
        ) : findings.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            padding: "40px 20px",
            color: "rgba(255,255,255,0.4)"
          }}>
            <ShieldCheck size={48} color="#22C55E" style={{ marginBottom: "16px", filter: "drop-shadow(0 0 10px rgba(34,197,94,0.2))" }} />
            <h4 style={{ margin: "0 0 8px 0", color: "#FFF", fontSize: "15px", fontWeight: "750" }}>
              Workspace Secure
            </h4>
            <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5" }}>
              API scan completed with a clean security posture. No active threat vectors were detected.
            </p>
          </div>
        ) : (
          findings.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectVuln && onSelectVuln(item.raw)}
              style={{
                cursor: "pointer",
                border: item.expanded
                  ? `1px solid ${getColor(item.severity)}`
                  : "1px solid rgba(255,255,255,.06)",

                background: "#0B1220",
                borderRadius: "14px",
                padding: "14px",

                transition: "all .25s ease",

                boxShadow: item.expanded
                  ? `0 0 18px ${getColor(item.severity)}18`
                  : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  {item.expanded ? (
                    <ChevronDown
                      size={16}
                      color="#64748B"
                      style={{ marginTop: "4px" }}
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                      color="#64748B"
                      style={{ marginTop: "4px" }}
                    />
                  )}

                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {getSeverityIcon(item.severity)}

                      <span
                        style={{
                          background: `${getColor(item.severity)}20`,
                          color: getColor(item.severity),
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        color: "#FFFFFF",
                        fontWeight: "600",
                        fontSize: "15px",
                      }}
                    >
                      {item.title}
                      {/* CVSS badge */}
                      <span style={{
                        backgroundColor: `${getColor(item.severity)}20`,
                        color: getColor(item.severity),
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        marginLeft: "8px",
                      }}>{`CVSS ${item.cvss}/10`}</span>
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#8B5CF6",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {item.endpoint}
                    </div>
                  </div>
                </div>
              </div>

              {item.expanded && (
                <>
                  <div
                    style={{
                      marginTop: "14px",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(255,255,255,.06)",
                      color: "#94A3B8",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    <p style={{ margin: "0 0 10px 0" }}>
                      <strong style={{ color: "#E2E8F0" }}>Impact:</strong> {item.impact}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#E2E8F0" }}>Evidence:</strong> {item.evidence}
                    </p>
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                        color: "#94A3B8",
                        fontSize: "12px",
                      }}
                    >
                      <span>Risk Score</span>
                      <span>{item.cvss}/10</span>
                    </div>

                    <div
                      style={{
                        height: "6px",
                        background: "#1E293B",
                        borderRadius: "999px",
                      }}
                    >
                      <div
                        style={{
                          width: `${item.cvss * 10}%`,
                          height: "100%",
                          background: getColor(item.severity),
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "18px",
                      marginTop: "14px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Displaying CVSS vector and discovery trace details for ${item.title}`);
                      }}
                      style={{
                        color: "#60A5FA",
                        cursor: "pointer",
                      }}
                    >
                      Details →
                    </span>

                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Remediation rules and defensive configurations generated for ${item.owasp}`);
                      }}
                      style={{
                        color: "#22C55E",
                        cursor: "pointer",
                      }}
                    >
                      Remediation →
                    </span>

                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`AI Copilot scanning potential threat vector vectors for ${item.title}`);
                      }}
                      style={{
                        color: "#A855F7",
                        cursor: "pointer",
                      }}
                    >
                      AI Analysis →
                    </span>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
