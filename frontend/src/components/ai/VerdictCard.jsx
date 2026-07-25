import { ShieldCheck, Zap, Clock, AlertTriangle } from "lucide-react";

export default function VerdictCard({ data }) {
  if (!data) return null;

  const priority = data.priority || "High";
  const sla = data.recommendedSLA || "14 Days";
  const criticality = data.businessCriticality || "High";
  const exploitability = data.exploitability || "High";
  const summary = data.summary || "Security threat detected on target endpoint.";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 20, 36, 0.95) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.35)",
        borderRadius: "20px",
        padding: "24px 28px",
        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.12)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10B981",
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)",
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: "-0.3px",
              }}
            >
              ATHX AI Security Verdict
            </h3>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>
              Autonomous threat score & remediation priority
            </span>
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "4px 12px",
            borderRadius: "999px",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#34D399", letterSpacing: "0.8px", textTransform: "uppercase" }}>
            VERIFIED SECURITY DECISION
          </span>
        </div>
      </div>

      {/* 4 Metric Pill Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {/* Priority */}
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "14px",
            padding: "14px 16px",
            boxShadow: "0 0 15px rgba(239, 68, 68, 0.1)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#F87171", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
            Priority
          </div>
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#EF4444" }}>
            {priority}
          </div>
        </div>

        {/* Recommended SLA */}
        <div
          style={{
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "14px",
            padding: "14px 16px",
            boxShadow: "0 0 15px rgba(56, 189, 248, 0.1)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
            Remediation SLA
          </div>
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#38BDF8" }}>
            {sla}
          </div>
        </div>

        {/* Business Criticality */}
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "14px",
            padding: "14px 16px",
            boxShadow: "0 0 15px rgba(245, 158, 11, 0.1)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
            Criticality
          </div>
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#F59E0B" }}>
            {criticality}
          </div>
        </div>

        {/* Exploitability */}
        <div
          style={{
            background: "rgba(168, 85, 247, 0.08)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "14px",
            padding: "14px 16px",
            boxShadow: "0 0 15px rgba(168, 85, 247, 0.1)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#C084FC", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
            Exploitability
          </div>
          <div style={{ fontSize: "17px", fontWeight: "900", color: "#A855F7" }}>
            {exploitability}
          </div>
        </div>
      </div>

      {/* Verdict Summary Box */}
      <div
        style={{
          background: "#030712",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderLeft: "4px solid #10B981",
          borderRadius: "14px",
          padding: "16px 20px",
          color: "#E2E8F0",
          fontSize: "14px",
          lineHeight: "1.7",
        }}
      >
        <span style={{ fontWeight: "700", color: "#34D399", marginRight: "8px" }}>Verdict Summary:</span>
        {summary}
      </div>
    </div>
  );
}