import React, { useState } from "react";
import { Link2, Search, ExternalLink, Globe, Sparkles } from "lucide-react";

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
          background: rgba(8, 14, 27, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #FFF;
          font-size: 12px;
          padding: 8px 12px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .src-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
          background: rgba(13, 20, 37, 0.9);
        }
        .src-type-tab {
          font-size: 10.5px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.55);
          border-radius: 6px;
          padding: 3px 10px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
        }
        .src-type-tab:hover {
          background: rgba(255,255,255,0.05);
          color: #FFF;
        }
        .src-type-tab.active {
          background: rgba(139, 92, 246, 0.12);
          border-color: #8B5CF6;
          color: #A78BFA;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.15);
        }
        .src-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0.005) 100%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 12px;
          display: block;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .src-card:hover {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
          border-color: rgba(59, 130, 246, 0.25);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", boxSizing: "border-box" }}>
        {/* Search header controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Globe size={14} color="#3B82F6" />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>References & Citations</span>
          </div>
          
          <div style={{ position: "relative" }}>
            <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search citations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="src-input"
              style={{ paddingLeft: "34px" }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
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
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
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
              className="src-card"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{
                  fontSize: "9px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "5px",
                  padding: "2px 6px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: "800",
                  letterSpacing: "0.5px"
                }}>{item.type}</span>
                <ExternalLink size={11} color="rgba(255,255,255,0.3)" />
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
