import React, { useState } from "react";
import { Link2, Search, ExternalLink, Globe } from "lucide-react";

export default function SourcesPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const sources = [
    { id: "1", title: "OWASP API Security Top 10 (2023)", url: "https://owasp.org/www-project-api-security/", type: "OWASP", desc: "Top 10 security risks associated with modern Web API endpoints." },
    { id: "2", title: "CWE-89: Improper Neutralization of Special Elements used in an SQL Command", url: "https://cwe.mitre.org/data/definitions/89.html", type: "CWE", desc: "Common Weakness Enumeration entry for SQL Injection vulnerabilities." },
    { id: "3", title: "RFC 7519: JSON Web Token (JWT) Specifications", url: "https://datatracker.ietf.org/doc/html/rfc7519", type: "RFC", desc: "Official standard specifications mapping JWT claims and validation controls." },
    { id: "4", title: "NIST SP 800-115: Technical Guide to Information Security Testing", url: "https://csrc.nist.gov/publications/detail/sp/800-115/final", type: "NIST", desc: "Methodology and guidelines for penetration testing and vulnerability auditing." },
    { id: "5", title: "CWE-94: Improper Control of Generation of Code ('Code Injection')", url: "https://cwe.mitre.org/data/definitions/94.html", type: "CWE", desc: "Root causes of server-side code and parameter injections." }
  ];

  const filtered = sources.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || s.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <>
      <style>{`
        .src-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #FFF;
          font-size: 12px;
          padding: 6px 10px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        .src-type-tab {
          font-size: 10.5px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          border-radius: 5px;
          padding: 2px 8px;
          cursor: pointer;
          font-weight: 700;
        }
        .src-type-tab.active {
          background: rgba(139, 92, 246, 0.15);
          border-color: #8B5CF6;
          color: #A78BFA;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", boxSizing: "border-box" }}>
        {/* Search header controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px", flexShrink: 0 }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>References & Citations</span>
          
          <div style={{ position: "relative" }}>
            <Search size={13} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search citations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="src-input"
              style={{ paddingLeft: "30px" }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "OWASP", "CWE", "RFC", "NIST"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`src-type-tab ${selectedType === type ? "active" : ""}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list of bibliography items */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", padding: "40px 10px" }}>
              <Globe size={24} style={{ display: "block", margin: "0 auto 8px" }} />
              <span style={{ fontSize: "11.5px" }}>No sources found</span>
            </div>
          )}

          {filtered.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "8px",
                padding: "10px",
                display: "block",
                textDecoration: "none",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
              }}
            >
              <div style={{ display: "flex", justifySpace: "between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{
                  fontSize: "9px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  padding: "1px 5px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: "700"
                }}>{item.type}</span>
                <ExternalLink size={10} color="rgba(255,255,255,0.3)" />
              </div>
              <h4 style={{ margin: "4px 0", fontSize: "12px", color: "#FFF", fontWeight: "600", lineHeight: "1.4" }}>
                {item.title}
              </h4>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.45)", lineHeight: "1.45" }}>
                {item.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
