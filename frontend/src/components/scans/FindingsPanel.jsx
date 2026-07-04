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

  const mockFindings = [
    {
      id: "ATHX-001",
      severity: "Critical",
      status: "Open",
      owasp: "API1:2023",
      title: "Broken Object Level Authorization (BOLA)",
      endpoint: "GET /api/users/{id}",
      impact:
        "Attacker can access other users' data by manipulating the user ID.",
      evidence: "The API does not verify ownership before returning user data.",
      cvss: 9.8,
      expanded: true,
    },
    {
      id: "ATHX-002",
      severity: "High",
      status: "Open",
      owasp: "API1:2023",
      title: "IDOR in User Profile",
      endpoint: "/api/profile/{id}",
      cvss: 8.1,
      expanded: false,
    },
    {
      id: "ATHX-003",
      severity: "Medium",
      status: "Open",
      owasp: "API9:2023",
      title: "Swagger UI Exposure",
      endpoint: "/swagger",
      cvss: 5.3,
      expanded: false,
    },
    {
      id: "ATHX-004",
      severity: "Medium",
      status: "Fixed",
      owasp: "API8:2023",
      title: "Verbose Error Messages",
      endpoint: "/api/*",
      cvss: 4.7,
      expanded: false,
    },
  ];

  const mockFindingsWithRaw = mockFindings.map((m, idx) => {
    const isSelected = selectedVuln ? (selectedVuln.id === m.id || selectedVuln.title === m.title) : idx === 0;
    return {
      ...m,
      expanded: isSelected,
      raw: m
    };
  });

  const findings = formattedFindings.length > 0 ? formattedFindings : mockFindingsWithRaw;

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
        <h3
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "22px",
          }}
        >
          Vulnerabilities Found
        </h3>

        <span
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
        <span style={{ color: "#EF4444" }}>{scan ? criticalCount : 5} Critical</span>
        <span style={{ color: "#F97316" }}>{scan ? highCount : 12} High</span>
        <span style={{ color: "#FACC15" }}>{scan ? mediumCount : 27} Medium</span>
        <span style={{ color: "#22C55E" }}>{scan ? lowCount : 6} Low</span>
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
        {findings.map((item) => (
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
                    {item.id}
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#94A3B8",
                      fontSize: "12px",
                    }}
                  >
                    <Link2 size={12} />
                    {item.endpoint}
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(96,165,250,.12)",
                        border: "1px solid rgba(96,165,250,.25)",
                        color: "#60A5FA",
                        padding: "3px 8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {item.owasp}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    background: "rgba(239,68,68,.12)",
                    border: "1px solid rgba(239,68,68,.25)",
                    color: "#FFFFFF",
                    padding: "6px 10px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  CVSS {item.cvss}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    color: item.status === "Fixed" ? "#22C55E" : "#F97316",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {item.status}
                </div>
              </div>
            </div>

            {item.expanded && (
              <>
                <div
                  style={{
                    marginTop: "12px",
                    color: "#94A3B8",
                    fontSize: "13px",
                    lineHeight: "1.7",
                  }}
                >
                  <div>
                    <strong>Impact:</strong> {item.impact}
                  </div>

                  <div>
                    <strong>Evidence:</strong> {item.evidence}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "14px",
                  }}
                >
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
                    style={{
                      color: "#60A5FA",
                      cursor: "pointer",
                    }}
                  >
                    Details →
                  </span>

                  <span
                    style={{
                      color: "#22C55E",
                      cursor: "pointer",
                    }}
                  >
                    Remediation →
                  </span>

                  <span
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
        ))}
      </div>
    </div>
  );
}
