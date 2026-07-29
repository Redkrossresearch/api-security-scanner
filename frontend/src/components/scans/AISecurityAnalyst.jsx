import {
  Brain,
  Sparkles,
  AlertTriangle,
  Target,
  ChevronRight,
  FileText,
} from "lucide-react";

export default function AISecurityAnalyst({
  scan,
  scanStatus,
  selectedVuln,
  onGenerateFix,
  onGenerateReport,
  onExplainRisk,
}) {
  const isCompleted = scan?.status === "completed";
  const rawFindings = (isCompleted && scan?.vulnerabilities) || [];
  const score = scan ? scan.securityScore : 91;
  const gradeText = score >= 80 ? "Excellent" : (score >= 60 ? "Medium" : "Poor");

  const criticalCount = scan ? scan.criticalCount : 3;
  const highCount = scan ? scan.highCount : 5;

  const sortedRisks = [...rawFindings].sort((a,b) => (b.cvss || 0) - (a.cvss || 0)).slice(0, 3);
  
  const risks = sortedRisks.length > 0 ? sortedRisks.map(r => ({
    name: r.title,
    severity: r.severity ? r.severity.charAt(0).toUpperCase() + r.severity.slice(1).toLowerCase() : "Medium",
    color: r.severity?.toLowerCase() === "critical" ? "#EF4444" : (r.severity?.toLowerCase() === "high" ? "#F97316" : "#FACC15"),
  })) : [
    { name: "BOLA", severity: "Critical", color: "#EF4444" },
    { name: "IDOR", severity: "High", color: "#F97316" },
    { name: "Rate Limiting", severity: "Medium", color: "#FACC15" },
  ];

  const plans = (selectedVuln && (selectedVuln.remediationSteps?.length > 0 || selectedVuln.raw?.remediationSteps?.length > 0))
    ? (selectedVuln.remediationSteps || selectedVuln.raw.remediationSteps)
    : (selectedVuln && (selectedVuln.recommendation || selectedVuln.raw?.recommendation)
        ? [selectedVuln.recommendation || selectedVuln.raw.recommendation]
        : (sortedRisks.length > 0 ? sortedRisks.map(r => r.recommendation || "Remediate finding.") : [
            "Implement object ownership validation",
            "Restrict Swagger UI access",
            "Add rate limiting to auth endpoints",
            "Use UUIDs instead of sequential IDs",
          ]));

  const summaryText = selectedVuln 
    ? `AI Copilot Focus: Analyzing "${selectedVuln.title || selectedVuln.raw?.title}". This vulnerability has a CVSS score of ${selectedVuln.cvss || selectedVuln.raw?.cvss || 5.0} and is classified as ${selectedVuln.severity || selectedVuln.raw?.severity || "medium"} severity. Description: ${selectedVuln.description || selectedVuln.raw?.description || "Review exposed endpoint data."}`
    : (scan 
        ? `The scan successfully analyzed ${scan.assetName || "the target"}. Discovered ${scan.totalFindings} vulnerabilities in total. Recommended to immediately address critical access issues.`
        : "The scan identified multiple authorization weaknesses, exposed API documentation, and missing rate limiting controls. Immediate remediation is recommended for critical authorization findings.");
  return (
    <div
      style={{
        background: "#071126",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "18px",
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Scoped Animations & Hover Styles */}
      <style>{`
        @keyframes aiShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes aiPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .ai-action-card:hover { border-color: rgba(34,197,94,.25) !important; background: #0D1628 !important; transform: translateX(2px); }
        .ai-risk-card:hover { border-color: rgba(255,255,255,.1) !important; background: #0D1628 !important; }
        .ai-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(124,58,237,.35); }
        .ai-btn-secondary:hover { background: #111B2E !important; border-color: rgba(255,255,255,.15) !important; }
        .ai-btn-outline:hover { background: rgba(249,115,22,.08) !important; }
        .ai-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent); background-size: 200% 100%; animation: aiShimmer 3s infinite; }
      `}</style>

      {/* ─── Header ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(124,58,237,.3)",
            }}
          >
            <Brain size={20} color="#FFF" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3
                style={{
                  margin: 0,
                  color: "#FFFFFF",
                  fontSize: "17px",
                  fontWeight: "700",
                }}
              >
                AI Security Analyst
              </h3>
              <span
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "#FFF",
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontWeight: "600",
                }}
              >
                Copilot
              </span>
            </div>
            <div
              style={{
                color: "#64748B",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "2px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 6px #22C55E",
                  animation: "aiPulse 2s infinite",
                }}
              />
              Last Analysis: 2 min ago
            </div>
          </div>
        </div>
      </div>

      {/* ─── Scrollable Body Container ─── */}
      <div
        className="athx-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "6px",
          marginBottom: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          minHeight: 0,
        }}
      >
        {/* ─── Score Cards ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          {/* Security Score */}
          <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "14px",
            padding: "16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              width: "60px",
              height: "60px",
              background:
                "radial-gradient(circle, rgba(34,197,94,.08), transparent)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              color: "#64748B",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            Security Score
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              marginTop: "6px",
            }}
          >
            <span
              style={{
                color: "#22C55E",
                fontSize: "32px",
                fontWeight: "800",
                lineHeight: "1",
              }}
            >
              {score}
            </span>
            <span
              style={{ color: "#475569", fontSize: "16px", fontWeight: "600" }}
            >
              /100
            </span>
          </div>
          <div
            style={{
              color: "#22C55E",
              fontSize: "12px",
              marginTop: "4px",
              fontWeight: "600",
            }}
          >
            {gradeText}
          </div>
          <div
            style={{
              marginTop: "12px",
              height: "6px",
              background: "#1E293B",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${score}%`,
                height: "100%",
                background: "linear-gradient(90deg, #22C55E, #4ADE80)",
                borderRadius: "999px",
              }}
            />
          </div>
        </div>

        {/* AI Confidence */}
        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "14px",
            padding: "16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              width: "60px",
              height: "60px",
              background:
                "radial-gradient(circle, rgba(139,92,246,.08), transparent)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              color: "#64748B",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            AI Confidence
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              marginTop: "6px",
            }}
          >
            <span
              style={{
                color: "#8B5CF6",
                fontSize: "32px",
                fontWeight: "800",
                lineHeight: "1",
              }}
            >
              97
            </span>
            <span
              style={{ color: "#475569", fontSize: "16px", fontWeight: "600" }}
            >
              %
            </span>
          </div>
          <div
            style={{
              color: "#8B5CF6",
              fontSize: "12px",
              marginTop: "4px",
              fontWeight: "600",
            }}
          >
            High Confidence
          </div>
          <div
            style={{
              marginTop: "12px",
              height: "6px",
              background: "#1E293B",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "97%",
                height: "100%",
                background: "linear-gradient(90deg, #8B5CF6, #C084FC)",
                borderRadius: "999px",
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── AI Summary ─── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(124,58,237,.06), rgba(236,72,153,.03))",
          border: "1px solid rgba(124,58,237,.2)",
          borderRadius: "16px",
          padding: "18px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#C084FC",
            fontSize: "12px",
            fontWeight: "700",
            marginBottom: "12px",
          }}
        >
          <Sparkles size={14} />
          AI SUMMARY
        </div>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "#EF444420",
              color: "#EF4444",
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            {criticalCount} Critical
          </span>
          <span
            style={{
              background: "#F9731620",
              color: "#F97316",
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            {highCount} High
          </span>
          <span
            style={{
              background: "#22C55E20",
              color: "#22C55E",
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            {scan ? (scan.totalFindings - criticalCount - highCount) : 12} Low/Medium
          </span>
          <span
            style={{
              background: "#3B82F620",
              color: "#60A5FA",
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            {score} Security Score
          </span>
        </div>

        <div
          style={{
            color: "#CBD5E1",
            lineHeight: "1.6",
            fontSize: "12px",
            marginTop: "12px",
          }}
        >
          {summaryText}
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: "#22C55E20",
                color: "#22C55E",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
              }}
            >
              Predicted Risk: {scan ? (scan.riskScore || "0.0") : "6.8"}
            </span>
            <span
              style={{
                background: "#3B82F620",
                color: "#60A5FA",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
              }}
            >
              Confidence: 97%
            </span>
          </div>
        </div>
      </div>

      {/* ─── Root Cause Analysis (FIXED NESTING) ─── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,.05), transparent)",
          border: "1px solid rgba(239,68,68,.12)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#EF4444",
            fontWeight: "700",
            marginBottom: "8px",
            fontSize: "13px",
          }}
        >
          <AlertTriangle size={14} />
          Root Cause Analysis
        </div>
        <div
          style={{
            color: "#CBD5E1",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          <span style={{ color: "#EF4444", fontWeight: "700" }}>67%</span> of
          critical findings originate from broken access control validation and
          insufficient endpoint authorization checks.
        </div>
      </div>

      {/* ─── Top Risks ─── */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#FFFFFF",
            fontWeight: "600",
            marginBottom: "10px",
            fontSize: "14px",
          }}
        >
          <Target size={14} color="#F97316" />
          Top Risks
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {risks.map((risk) => (
            <div
              key={risk.name}
              className="ai-risk-card"
              style={{
                background: "#0B1220",
                border: `1px solid ${risk.color}20`,
                borderRadius: "12px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all .2s ease",
                cursor: "default",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: risk.color,
                    boxShadow: `0 0 8px ${risk.color}`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: "600",
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={risk.name}
                >
                  {risk.name}
                </span>
              </div>
              <span
                style={{
                  background: `${risk.color}15`,
                  color: risk.color,
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                {risk.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Priority Remediation Plan ─── */}
      <div style={{ marginTop: "4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#FFFFFF",
            fontWeight: "600",
            marginBottom: "12px",
            fontSize: "14px",
          }}
        >
          <Sparkles size={14} color="#22C55E" />
          Priority Remediation Plan
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {plans.map((action, idx) => (
            <div
              key={idx}
              className="ai-action-card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#0B1220",
                border: "1px solid rgba(34,197,94,.1)",
                borderRadius: "10px",
                padding: "12px 14px",
                transition: "all .2s ease",
                cursor: "pointer",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
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
                    color: "#22C55E",
                    fontSize: "11px",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <span
                  style={{
                    color: "#CBD5E1",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  {action}
                </span>
              </div>
              <ChevronRight size={14} color="#475569" />
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ─── Actions ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <button
          className="ai-btn-primary"
          onClick={onGenerateFix}
          style={{
            height: "44px",
            border: "none",
            borderRadius: "12px",
            background: "linear-gradient(135deg,#7C3AED,#EC4899)",
            color: "#FFFFFF",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all .2s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="ai-shimmer" />
          <Sparkles size={14} style={{ position: "relative" }} />
          <span style={{ position: "relative" }}>Generate Fix</span>
        </button>

        <button
          className="ai-btn-secondary"
          onClick={onGenerateReport}
          style={{
            height: "44px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "#0B1220",
            color: "#FFFFFF",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all .2s ease",
          }}
        >
          <FileText size={14} />
          Generate Report
        </button>

        <button
          className="ai-btn-outline"
          onClick={onExplainRisk}
          style={{
            height: "44px",
            borderRadius: "12px",
            border: "1px solid rgba(249,115,22,.3)",
            background: "transparent",
            color: "#F97316",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all .2s ease",
          }}
        >
          <AlertTriangle size={14} />
          Explain Risk
        </button>
      </div>
    </div>
  );
}