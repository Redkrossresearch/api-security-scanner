import {
  X,
  ShieldAlert,
  Clock,
  Calendar,
  FileText,
  CheckCircle2,
  TrendingDown,
  Brain,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Target,
  Lock,
  Sparkles,
  Shield,
  Award,
  ListChecks,
  CircleDot,
  XCircle,
  HelpCircle,
} from "lucide-react";

export default function ScanHistoryDrawer({ open = true, onClose = () => {} }) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
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

      {/* Drawer */}
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
        {/* Scoped Animations & Hover Styles */}
        <style>{`
          @keyframes drawerFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes drawerSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes drawerPulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,.12); }
            50% { box-shadow: 0 0 32px rgba(239,68,68,.22); }
          }
          @keyframes drawerShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes drawerBarFill {
            from { width: 0; }
          }
          .sd-close:hover { background: #111B2E !important; color: #fff !important; }
          .sd-kpi:hover { border-color: rgba(255,255,255,.12) !important; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,.3); }
          .sd-finding:hover { transform: translateX(4px); border-color: rgba(255,255,255,.12) !important; }
          .sd-endpoint:hover { background: rgba(124,58,237,.06) !important; border-color: rgba(124,58,237,.2) !important; }
          .sd-compliance:hover { border-color: rgba(255,255,255,.1) !important; background: #0D1628 !important; }
          .sd-priority:hover { border-color: rgba(124,58,237,.2) !important; background: #0D1628 !important; }
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
                  background: "#22C55E",
                  boxShadow: "0 0 8px rgba(34,197,94,.5)",
                }}
              />
              <span
                style={{
                  color: "#22C55E",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Completed
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
              SCAN-2026-001
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
              api.company.com
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

        {/* ─── Executive Summary ─── */}
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
            High-risk authorization weaknesses identified. Overall security
            posture improved by{" "}
            <span style={{ color: "#22C55E", fontWeight: "700" }}>14%</span>{" "}
            compared to the previous assessment.
          </div>
        </div>

        {/* ─── Risk Score ─── */}
        <div
          className="sd-risk-card"
          style={{
            background: "linear-gradient(135deg, #0B1220 0%, #111827 100%)",
            border: "1px solid rgba(239,68,68,.12)",
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
              background:
                "radial-gradient(circle, rgba(239,68,68,.06) 0%, transparent 70%)",
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
                    color: "#EF4444",
                    fontSize: "48px",
                    fontWeight: "800",
                    lineHeight: "1",
                    letterSpacing: "-2px",
                  }}
                >
                  8.9
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
                  background: "rgba(239,68,68,.1)",
                  color: "#EF4444",
                  marginTop: "10px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <AlertTriangle size={12} />
                High Risk
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
                  border: "3px solid rgba(239,68,68,.3)",
                  borderTopColor: "#EF4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldAlert size={20} color="#EF4444" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── KPI Grid ─── */}
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
              value: "B+",
              color: "#FACC15",
              icon: <ShieldCheck size={14} />,
              bg: "rgba(250,204,21,.06)",
            },
            {
              title: "Endpoints",
              value: "48",
              color: "#60A5FA",
              icon: <Layers size={14} />,
              bg: "rgba(96,165,250,.06)",
            },
            {
              title: "Critical",
              value: "3",
              color: "#EF4444",
              icon: <AlertTriangle size={14} />,
              bg: "rgba(239,68,68,.06)",
            },
            {
              title: "Resolved",
              value: "89%",
              color: "#22C55E",
              icon: <CheckCircle2 size={14} />,
              bg: "rgba(34,197,94,.06)",
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

        {/* ─── Metadata ─── */}
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
              value: "14 Jun 2026",
            },
            {
              icon: <Clock size={15} />,
              label: "Duration",
              value: "18 Minutes",
            },
            {
              icon: <FileText size={15} />,
              label: "Profile",
              value: "Full Security Audit",
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

        {/* ─── Attack Surface ─── */}
        <div
          style={{
            background: "#0B1220",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "18px",
            border: "1px solid rgba(255,255,255,.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(96,165,250,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Target size={14} color="#60A5FA" />
            </div>
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Attack Surface
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {[
              { label: "APIs", value: "48", color: "#60A5FA" },
              { label: "Public", value: "17", color: "#FACC15" },
              { label: "Sensitive", value: "6", color: "#F97316" },
              { label: "Auth Issues", value: "3", color: "#EF4444" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,.02)",
                  borderRadius: "10px",
                  padding: "12px",
                  border: "1px solid rgba(255,255,255,.04)",
                }}
              >
                <div
                  style={{
                    color: "#64748B",
                    fontSize: "11px",
                    marginBottom: "4px",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    color: item.color,
                    fontWeight: "800",
                    fontSize: "20px",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Findings Breakdown ─── */}
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

          {[
            {
              severity: "Critical",
              title: "Broken Object Level Authorization",
              color: "#EF4444",
              stats: { open: 2, fixed: 1, fp: 0 },
            },
            {
              severity: "High",
              title: "IDOR Vulnerability",
              color: "#F97316",
              stats: { open: 3, fixed: 1, fp: 1 },
            },
            {
              severity: "Medium",
              title: "Swagger Exposure",
              color: "#FACC15",
              stats: { open: 0, fixed: 2, fp: 0 },
            },
          ].map((item) => (
            <div
              key={item.title}
              className="sd-finding"
              style={{
                background: "#0B1220",
                border: `1px solid ${item.color}15`,
                borderLeft: `3px solid ${item.color}`,
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "8px",
                transition: "all .2s ease",
                cursor: "default",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      color: item.color,
                      fontWeight: "700",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: ".8px",
                      marginBottom: "4px",
                    }}
                  >
                    {item.severity}
                  </div>
                  <div
                    style={{
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {item.title}
                  </div>
                </div>
                <ChevronRight size={14} color="#475569" />
              </div>

              {/* Status Pills */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {item.stats.open > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(239,68,68,.08)",
                      color: "#EF4444",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    <CircleDot size={10} />
                    {item.stats.open} Open
                  </span>
                )}
                {item.stats.fixed > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(34,197,94,.08)",
                      color: "#22C55E",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    <CheckCircle2 size={10} />
                    {item.stats.fixed} Fixed
                  </span>
                )}
                {item.stats.fp > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(148,163,184,.08)",
                      color: "#94A3B8",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    <HelpCircle size={10} />
                    {item.stats.fp} False Positive
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Remediation Progress ─── */}
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
                background: "rgba(34,197,94,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ListChecks size={14} color="#22C55E" />
            </div>
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Remediation Progress
            </h3>
          </div>

          <div
            style={{
              background: "#0B1220",
              borderRadius: "14px",
              padding: "16px",
              border: "1px solid rgba(255,255,255,.04)",
            }}
          >
            {[
              {
                label: "Critical",
                percent: 80,
                color: "#EF4444",
                trackColor: "rgba(239,68,68,.1)",
              },
              {
                label: "High",
                percent: 60,
                color: "#F97316",
                trackColor: "rgba(249,115,22,.1)",
              },
              {
                label: "Medium",
                percent: 90,
                color: "#FACC15",
                trackColor: "rgba(250,204,21,.1)",
              },
              {
                label: "Low",
                percent: 100,
                color: "#22C55E",
                trackColor: "rgba(34,197,94,.1)",
              },
            ].map((item, idx, arr) => (
              <div
                key={item.label}
                style={{
                  marginBottom: idx < arr.length - 1 ? "14px" : "0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      color: "#CBD5E1",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      color: item.color,
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {item.percent}%
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    borderRadius: "3px",
                    background: item.trackColor,
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="sd-bar-fill"
                    style={{
                      width: `${item.percent}%`,
                      height: "100%",
                      borderRadius: "3px",
                      background: `linear-gradient(90deg, ${item.color}CC, ${item.color})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Historical Comparison ─── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(34,197,94,.06) 0%, rgba(34,197,94,.02) 100%)",
            border: "1px solid rgba(34,197,94,.12)",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(34,197,94,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingDown size={14} color="#22C55E" />
            </div>
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Historical Comparison
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(34,197,94,.08)",
              padding: "8px 14px",
              borderRadius: "10px",
              marginBottom: "12px",
              width: "fit-content",
            }}
          >
            <TrendingDown size={16} color="#22C55E" />
            <span
              style={{
                color: "#22C55E",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              34% Risk Reduction
            </span>
          </div>

          <div
            style={{
              color: "#94A3B8",
              fontSize: "13px",
              lineHeight: "1.7",
            }}
          >
            Compared with previous assessment, critical findings reduced from{" "}
            <span style={{ color: "#EF4444", fontWeight: "600" }}>7</span> to{" "}
            <span style={{ color: "#22C55E", fontWeight: "600" }}>3</span> and
            overall security score improved by{" "}
            <span style={{ color: "#22C55E", fontWeight: "600" }}>14%</span>.
          </div>
        </div>

        {/* ─── Vulnerability Details (CVSS + OWASP + MITRE) ─── */}
        <div style={{ marginBottom: "18px" }}>
          <h3
            style={{
              color: "#FFFFFF",
              marginBottom: "12px",
              fontSize: "15px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(249,115,22,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={14} color="#F97316" />
            </div>
            Vulnerability Details
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            {/* CVSS Score */}
            <div
              style={{
                background: "#0B1220",
                borderRadius: "14px",
                padding: "16px",
                border: "1px solid rgba(239,68,68,.08)",
              }}
            >
              <div
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  marginBottom: "10px",
                }}
              >
                CVSS Score
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "3px",
                }}
              >
                <span
                  style={{
                    color: "#EF4444",
                    fontSize: "32px",
                    fontWeight: "800",
                    lineHeight: "1",
                    letterSpacing: "-1px",
                  }}
                >
                  9.1
                </span>
                <span style={{ color: "#475569", fontSize: "14px" }}>/ 10</span>
              </div>
              <div
                style={{
                  marginTop: "10px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(239,68,68,.1)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="sd-bar-fill"
                  style={{
                    width: "91%",
                    height: "100%",
                    borderRadius: "2px",
                    background: "linear-gradient(90deg, #EF4444, #F97316)",
                  }}
                />
              </div>
            </div>

            {/* OWASP Category */}
            <div
              style={{
                background: "#0B1220",
                borderRadius: "14px",
                padding: "16px",
                border: "1px solid rgba(249,115,22,.08)",
              }}
            >
              <div
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  marginBottom: "10px",
                }}
              >
                OWASP Category
              </div>
              <div
                style={{
                  color: "#F97316",
                  fontWeight: "800",
                  fontSize: "16px",
                }}
              >
                API1:2023
              </div>
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                BOLA
              </div>
            </div>
          </div>

          {/* MITRE ATT&CK Mapping */}
          <div
            style={{
              background: "#0B1220",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "18px",
              border: "1px solid rgba(239,68,68,.08)",
            }}
          >
            <div
              style={{
                color: "#64748B",
                fontSize: "11px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: ".5px",
                marginBottom: "10px",
              }}
            >
              MITRE ATT&CK Mapping
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                    fontSize: "15px",
                  }}
                >
                  T1190
                </div>
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Exploit Public Facing Application
                </div>
              </div>
              <div
                style={{
                  background: "rgba(239,68,68,.12)",
                  color: "#EF4444",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                }}
              >
                High Risk
              </div>
            </div>
          </div>
        </div>

        {/* ─── Compliance Mapping ─── */}
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
                background: "rgba(168,85,247,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Award size={14} color="#A855F7" />
            </div>
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Compliance Mapping
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {[
              {
                name: "OWASP API Top 10",
                status: "Fail",
                color: "#EF4444",
                bg: "rgba(239,68,68,.08)",
                borderColor: "rgba(239,68,68,.12)",
              },
              {
                name: "PCI DSS",
                status: "Warning",
                color: "#F97316",
                bg: "rgba(249,115,22,.08)",
                borderColor: "rgba(249,115,22,.12)",
              },
              {
                name: "SOC 2",
                status: "Pass",
                color: "#22C55E",
                bg: "rgba(34,197,94,.08)",
                borderColor: "rgba(34,197,94,.12)",
              },
              {
                name: "ISO 27001",
                status: "Pass",
                color: "#22C55E",
                bg: "rgba(34,197,94,.08)",
                borderColor: "rgba(34,197,94,.12)",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="sd-compliance"
                style={{
                  background: "#0B1220",
                  border: `1px solid ${item.borderColor}`,
                  borderRadius: "12px",
                  padding: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all .2s ease",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    color: "#CBD5E1",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {item.name}
                </div>
                <span
                  style={{
                    background: item.bg,
                    color: item.color,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── AI Priority Queue ─── */}
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
                background:
                  "linear-gradient(135deg, rgba(124,58,237,.12), rgba(236,72,153,.12))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={14} color="#C084FC" />
            </div>
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              AI Priority Queue
            </h3>
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,58,237,.15), rgba(236,72,153,.15))",
                color: "#C084FC",
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "10px",
                fontWeight: "700",
                marginLeft: "auto",
              }}
            >
              AI Recommended
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {[
              {
                priority: "P1",
                title: "Fix BOLA on /api/users/{id}",
                urgency: "Immediate",
                urgencyColor: "#EF4444",
                urgencyBg: "rgba(239,68,68,.08)",
                gradient: "linear-gradient(135deg, #EF4444, #F97316)",
              },
              {
                priority: "P2",
                title: "Add Rate Limiting to /api/auth/login",
                urgency: "This Sprint",
                urgencyColor: "#F97316",
                urgencyBg: "rgba(249,115,22,.08)",
                gradient: "linear-gradient(135deg, #F97316, #FACC15)",
              },
              {
                priority: "P3",
                title: "Restrict Swagger in Production",
                urgency: "Next Sprint",
                urgencyColor: "#FACC15",
                urgencyBg: "rgba(250,204,21,.08)",
                gradient: "linear-gradient(135deg, #FACC15, #22C55E)",
              },
              {
                priority: "P4",
                title: "UUID Migration for All Endpoints",
                urgency: "Backlog",
                urgencyColor: "#60A5FA",
                urgencyBg: "rgba(96,165,250,.08)",
                gradient: "linear-gradient(135deg, #60A5FA, #A855F7)",
              },
            ].map((item, idx) => (
              <div
                key={item.priority}
                className="sd-priority"
                style={{
                  background: "#0B1220",
                  border: "1px solid rgba(255,255,255,.05)",
                  borderRadius: "12px",
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all .2s ease",
                  cursor: "default",
                }}
              >
                {/* Priority Badge */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: item.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontWeight: "800",
                    fontSize: "12px",
                    flexShrink: 0,
                  }}
                >
                  {item.priority}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: "#FFFFFF",
                      fontSize: "13px",
                      fontWeight: "600",
                      marginBottom: "4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      background: item.urgencyBg,
                      color: item.urgencyColor,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {item.urgency}
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight size={14} color="#475569" />
              </div>
            ))}
          </div>
        </div>

        {/* ─── Affected Endpoints ─── */}
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "rgba(96,165,250,.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={14} color="#60A5FA" />
              </div>
              Affected Endpoints
            </h3>
            <span
              style={{
                color: "#64748B",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              3 endpoints
            </span>
          </div>

          {[
            "GET /api/users/{id}  • Critical",
            "POST /api/auth/login • High",
            "GET /api/orders/{id} • Medium",
          ].map((endpoint) => {
            const isCritical = endpoint.includes("Critical");
            const isHigh = endpoint.includes("High");
            const severityColor = isCritical
              ? "#EF4444"
              : isHigh
                ? "#F97316"
                : "#FACC15";

            return (
              <div
                key={endpoint}
                className="sd-endpoint"
                style={{
                  background: "#0B1220",
                  border: "1px solid rgba(255,255,255,.05)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all .2s ease",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: severityColor,
                      boxShadow: `0 0 6px ${severityColor}60`,
                    }}
                  />
                  <span
                    style={{
                      color: "#CBD5E1",
                      fontSize: "13px",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontWeight: "500",
                    }}
                  >
                    {endpoint.split("•")[0].trim()}
                  </span>
                </div>
                <span
                  style={{
                    color: severityColor,
                    fontSize: "11px",
                    fontWeight: "700",
                    background: `${severityColor}12`,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                  }}
                >
                  {endpoint.split("•")[1]?.trim()}
                </span>
              </div>
            );
          })}
        </div>

        {/* ─── Timeline ─── */}
        <div style={{ marginBottom: "20px" }}>
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
                background: "rgba(34,197,94,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={14} color="#22C55E" />
            </div>
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Scan Timeline
            </h3>
          </div>

          {[
            "Reconnaissance Completed",
            "Endpoint Discovery Completed",
            "Authentication Testing",
            "Authorization Testing",
            "Report Generated",
          ].map((step, idx, arr) => (
            <div
              key={step}
              style={{
                display: "flex",
                gap: "12px",
                color: "#CBD5E1",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(34,197,94,.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={13} color="#22C55E" />
                </div>
                {idx < arr.length - 1 && (
                  <div
                    style={{
                      width: "1px",
                      height: "28px",
                      background: "rgba(34,197,94,.15)",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  paddingTop: "2px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Evidence ─── */}
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(250,204,21,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={14} color="#FACC15" />
            </div>
            <h3
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Evidence
            </h3>
          </div>

          <div
            style={{
              background: "#0B1220",
              borderRadius: "14px",
              padding: "16px",
              color: "#CBD5E1",
              fontSize: "13px",
              lineHeight: "1.7",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              border: "1px solid rgba(250,204,21,.08)",
              borderLeft: "3px solid #FACC15",
            }}
          >
            <span style={{ color: "#64748B" }}>→</span> GET /api/users/12
            returned data belonging to another user without ownership
            validation.
          </div>
        </div>

        {/* ─── Remediation Guidance ─── */}
        <div
          style={{
            background: "#0B1220",
            borderRadius: "14px",
            padding: "16px",
            marginTop: "12px",
            marginBottom: "18px",
            border: "1px solid rgba(34,197,94,.1)",
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
              fontSize: "13px",
            }}
          >
            <ShieldCheck size={16} />
            Remediation Guidance
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {[
              "Validate object ownership before returning resources.",
              "Enforce authorization checks on every endpoint.",
              "Replace sequential identifiers with UUIDs.",
              "Restrict access to Swagger/OpenAPI documentation in production.",
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  color: "#CBD5E1",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                    background: "rgba(34,197,94,.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                    color: "#22C55E",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {idx + 1}
                </div>
                {item}
              </div>
            ))}
          </div>
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
            style={{
              height: "48px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
              color: "#FFFFFF",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all .25s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="sd-shimmer" />
            <ArrowUpRight size={16} style={{ position: "relative" }} />
            <span style={{ position: "relative" }}>Compare Scan</span>
          </button>

          <button
            className="sd-btn-secondary"
            style={{
              height: "48px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,.08)",
              background: "#0B1220",
              color: "#FFFFFF",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all .25s ease",
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
