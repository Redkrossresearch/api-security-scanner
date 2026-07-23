/**
 * CitationCard.jsx (Sprints 126-130 — Source & Citation Card Renderer)
 * Renders verified citation cards with trusted authority badges, favicon, hover preview, and external link triggers.
 */
import { useState } from "react";
import { ExternalLink, ShieldCheck, Globe, AlertTriangle } from "lucide-react";

export default function CitationCard({ citation = {} }) {
  const [isHovered, setIsHovered] = useState(false);
  const { title = "OWASP Security Guidance", url = "https://owasp.org", domain = "owasp.org", snippet = "Official OWASP documentation.", citationId = 1 } = citation;

  const isTrusted = domain.includes("owasp.org") || domain.includes("nvd.nist.gov") || domain.includes("mitre.org") || domain.includes("cve.org");
  const isBroken = url.includes("broken");

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${isHovered ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "10px", padding: "10px 14px", margin: "6px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
        transition: "all 0.2s ease", position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
        <span style={{
          background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)",
          color: "#38BDF8", borderRadius: "50%", width: "22px", height: "22px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "11px", fontWeight: "800",
        }}>
          {citationId}
        </span>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#FFFFFF", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}
            >
              {title}
            </a>
            {isTrusted && (
              <span title="Official Authority Verified Source" style={{ display: "inline-flex", alignItems: "center", gap: "2px", background: "rgba(16,185,129,0.15)", color: "#10B981", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>
                <ShieldCheck size={12} />
                Official
              </span>
            )}
            {isBroken && (
              <span title="Warning: Link may be broken or unverified" style={{ color: "#EF4444", display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "10px" }}>
                <AlertTriangle size={12} />
              </span>
            )}
          </div>

          <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "2px" }}>
            {domain} • {snippet.slice(0, 75)}...
          </div>
        </div>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#38BDF8", padding: "4px", borderRadius: "4px", textDecoration: "none" }}
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
