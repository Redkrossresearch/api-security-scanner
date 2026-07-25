import { BookOpen, ExternalLink } from "lucide-react";

export default function ReferencesCard({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 20, 36, 0.95) 100%)",
        border: "1px solid rgba(168, 85, 247, 0.3)",
        borderRadius: "20px",
        padding: "26px 30px",
        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 30px rgba(168, 85, 247, 0.1)",
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
            background: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#A855F7",
            boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
          }}
        >
          <BookOpen size={20} />
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
            Knowledge Sources & Security Catalog
          </h3>
          <span style={{ fontSize: "12px", color: "#94A3B8" }}>
            OWASP API Security, CWE Taxonomies & NVD CVSS Database
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {data.map((item, index) => {
          const isUrl = typeof item === "string" && item.startsWith("http");
          return (
            <a
              key={index}
              href={isUrl ? item : "#"}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "14px 18px",
                color: "#E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.5)";
                e.currentTarget.style.background = "rgba(168, 85, 247, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#A855F7" }}>#{index + 1}</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#F1F5F9" }}>{item}</span>
              </div>
              <ExternalLink size={16} color="#94A3B8" />
            </a>
          );
        })}
      </div>
    </div>
  );
}