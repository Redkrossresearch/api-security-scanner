import {
  X,
  TrendingDown,
  TrendingUp,
  Shield,
  AlertTriangle,
  Brain,
  Target,
  Activity,
} from "lucide-react";

export default function ScanComparisonModal({
  open = false,
  onClose = () => {},
}) {
  if (!open) return null;

  const comparisons = [
    {
      label: "Risk Score",
      current: "8.9",
      previous: "9.8",
      change: "-9%",
      improved: true,
    },
    {
      label: "Findings",
      current: "21",
      previous: "34",
      change: "-38%",
      improved: true,
    },
    {
      label: "Critical",
      current: "5",
      previous: "11",
      change: "-54%",
      improved: true,
    },
    {
      label: "Endpoints",
      current: "127",
      previous: "120",
      change: "+6%",
      improved: false,
    },
  ];

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.65)",
          backdropFilter: "blur(6px)",
          zIndex: 1200,
        }}
      />

      {/* Modal */}

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "1200px",
          maxWidth: "95vw",
          background: "#071126",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: "24px",
          padding: "24px",
          zIndex: 1201,
          boxShadow: "0 30px 80px rgba(0,0,0,.4)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#FFFFFF",
              }}
            >
              Scan Comparison
            </h2>

            <div
              style={{
                marginTop: "6px",
                color: "#94A3B8",
                fontSize: "13px",
              }}
            >
              Compare security posture between two scans
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,.08)",
              background: "#0B1220",
              color: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scan Selectors */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#0B1220",
              border: "1px solid rgba(34,197,94,.15)",
              borderRadius: "18px",
              padding: "18px",
            }}
          >
            <div
              style={{
                color: "#22C55E",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Current Scan
            </div>

            <div style={{ color: "#FFFFFF", fontSize: "18px" }}>
              SCAN-2026-001
            </div>

            <div
              style={{
                marginTop: "6px",
                color: "#94A3B8",
                fontSize: "13px",
              }}
            >
              api.company.com
            </div>
          </div>

          <div
            style={{
              background: "#0B1220",
              border: "1px solid rgba(96,165,250,.15)",
              borderRadius: "18px",
              padding: "18px",
            }}
          >
            <div
              style={{
                color: "#60A5FA",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Previous Scan
            </div>

            <div style={{ color: "#FFFFFF", fontSize: "18px" }}>
              SCAN-2026-000
            </div>

            <div
              style={{
                marginTop: "6px",
                color: "#94A3B8",
                fontSize: "13px",
              }}
            >
              api.company.com
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(168,85,247,.08)",
            border: "1px solid rgba(168,85,247,.18)",
            borderRadius: "18px",
            padding: "18px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#C084FC",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            <Brain size={16} />
            AI Executive Summary
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                label: "Security Grade",
                value: "B+",
                color: "#FACC15",
              },
              {
                label: "Critical Open",
                value: "5",
                color: "#EF4444",
              },
              {
                label: "Resolved",
                value: "89%",
                color: "#22C55E",
              },
              {
                label: "Coverage",
                value: "96%",
                color: "#60A5FA",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#0B1220",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    color: "#64748B",
                    fontSize: "12px",
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    color: item.color,
                    fontSize: "26px",
                    fontWeight: "800",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              color: "#CBD5E1",
              lineHeight: "1.8",
              fontSize: "13px",
            }}
          >
            Security posture improved significantly between assessments.
            Critical findings reduced by 54%, overall risk score reduced by 9%,
            and remediation efficiency increased across authorization-related
            vulnerabilities.
          </div>
        </div>

        {/* Comparison Table */}

        <div
          style={{
            background: "#0B1220",
            borderRadius: "18px",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                {["Metric", "Current", "Previous", "Change"].map((item) => (
                  <th
                    key={item}
                    style={{
                      textAlign: "left",
                      padding: "16px",
                      color: "#64748B",
                      borderBottom: "1px solid rgba(255,255,255,.08)",
                    }}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {comparisons.map((item) => (
                <tr
                  key={item.label}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,.05)",
                  }}
                >
                  <td
                    style={{
                      padding: "16px",
                      color: "#FFFFFF",
                      fontWeight: "600",
                    }}
                  >
                    {item.label}
                  </td>

                  <td
                    style={{
                      padding: "16px",
                      color: "#CBD5E1",
                    }}
                  >
                    {item.current}
                  </td>

                  <td
                    style={{
                      padding: "16px",
                      color: "#CBD5E1",
                    }}
                  >
                    {item.previous}
                  </td>

                  <td
                    style={{
                      padding: "16px",
                      color: item.improved ? "#22C55E" : "#F97316",
                      fontWeight: "700",
                    }}
                  >
                    {item.improved ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <TrendingDown size={15} />
                        {item.change}
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <TrendingUp size={15} />
                        {item.change}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insights */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "#0B1220",
              borderRadius: "18px",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#22C55E",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              <Shield size={16} />
              Improvements
            </div>

            <ul
              style={{
                color: "#CBD5E1",
                lineHeight: "1.8",
                paddingLeft: "18px",
              }}
            >
              <li>Critical findings reduced by 54%</li>
              <li>Overall risk score improved</li>
              <li>Authorization controls strengthened</li>
            </ul>
          </div>

          <div
            style={{
              background: "#0B1220",
              borderRadius: "18px",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#F97316",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              <AlertTriangle size={16} />
              Attention Required
            </div>

            <ul
              style={{
                color: "#CBD5E1",
                lineHeight: "1.8",
                paddingLeft: "18px",
              }}
            >
              <li>Endpoint exposure increased</li>
              <li>Rate limiting still missing</li>
              <li>Swagger exposure remains present</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            background: "#0B1220",
            borderRadius: "18px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#22C55E",
              fontWeight: "700",
              marginBottom: "14px",
            }}
          >
            <Target size={16} />
            AI Risk Forecast
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ color: "#64748B", fontSize: "12px" }}>
                Predicted Risk Score
              </div>
              <div
                style={{
                  color: "#22C55E",
                  fontSize: "28px",
                  fontWeight: "800",
                  marginTop: "6px",
                }}
              >
                7.3
              </div>
            </div>

            <div>
              <div style={{ color: "#64748B", fontSize: "12px" }}>
                Expected Critical
              </div>
              <div
                style={{
                  color: "#22C55E",
                  fontSize: "28px",
                  fontWeight: "800",
                  marginTop: "6px",
                }}
              >
                2
              </div>
            </div>

            <div>
              <div style={{ color: "#64748B", fontSize: "12px" }}>
                Confidence
              </div>
              <div
                style={{
                  color: "#60A5FA",
                  fontSize: "28px",
                  fontWeight: "800",
                  marginTop: "6px",
                }}
              >
                97%
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
