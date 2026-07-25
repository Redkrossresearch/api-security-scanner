import MarkdownRenderer from "../common/MarkdownRenderer";
import { ShieldCheck } from "lucide-react";

export default function RemediationPlanCard({ data }) {
  if (!data) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 20, 36, 0.95) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.35)",
        borderRadius: "20px",
        padding: "26px 30px",
        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "14px",
        }}
      >
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
              fontSize: "22px",
              fontWeight: "800",
              color: "#FFFFFF",
              letterSpacing: "-0.3px",
            }}
          >
            Remediation Plan & Code Patch
          </h3>
          <span style={{ fontSize: "12px", color: "#94A3B8" }}>
            Actionable fixes, immediate mitigation & code snippet
          </span>
        </div>
      </div>

      <div
        style={{
          color: "#CBD5E1",
          lineHeight: "1.8",
          fontSize: "15px",
          margin: 0,
        }}
      >
        <MarkdownRenderer content={typeof data === "string" ? data : JSON.stringify(data, null, 2)} />
      </div>
    </div>
  );
}