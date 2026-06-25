import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Eye,
  FileText,
  RotateCw,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function ScanHistoryTable({ onView }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const response = await api.get("/scans/history");

      console.log("SCAN HISTORY API =", response.data);

      setScans(response.data.scans || []);
    } catch (error) {
      console.error("Failed to load scans", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk >= 8) return "#EF4444";
    if (risk >= 6) return "#F97316";
    return "#22C55E";
  };

  // --- Helper Functions for Upgrades ---
  const getRiskLabel = (risk) => {
    if (risk >= 8) return "Critical";
    if (risk >= 6) return "High";
    return "Low";
  };

  const getTrendData = (trend) => {
    if (trend === "Improved")
      return { icon: "⬇", color: "#22C55E", bg: "rgba(34,197,94,.12)" };
    if (trend === "Increased")
      return { icon: "⬆", color: "#EF4444", bg: "rgba(239,68,68,.12)" };
    return { icon: "➡", color: "#3B82F6", bg: "rgba(59,130,246,.12)" };
  };

  const getAiVerdict = (risk) => {
    if (risk >= 8)
      return {
        text: "Immediate Action",
        color: "#EF4444",
        bg: "rgba(239,68,68,.12)",
        border: "rgba(239,68,68,.3)",
      };
    if (risk >= 6)
      return {
        text: "Monitor",
        color: "#F97316",
        bg: "rgba(249,115,22,.12)",
        border: "rgba(249,115,22,.3)",
      };
    return {
      text: "Stable",
      color: "#22C55E",
      bg: "rgba(34,197,94,.12)",
      border: "rgba(34,197,94,.3)",
    };
  };

  const getProfileStyle = (profile = "") => {
    if (profile.includes("Audit"))
      return {
        bg: "rgba(139,92,246,.12)",
        color: "#A855F7",
        border: "rgba(139,92,246,.25)",
      };
    if (profile.includes("Auth"))
      return {
        bg: "rgba(59,130,246,.12)",
        color: "#3B82F6",
        border: "rgba(59,130,246,.25)",
      };
    if (profile.includes("OWASP"))
      return {
        bg: "rgba(239,68,68,.12)",
        color: "#EF4444",
        border: "rgba(239,68,68,.25)",
      };
    if (profile.includes("Compliance"))
      return {
        bg: "rgba(34,197,94,.12)",
        color: "#22C55E",
        border: "rgba(34,197,94,.25)",
      };
    return {
      bg: "rgba(100,116,139,.12)",
      color: "#94A3B8",
      border: "rgba(100,116,139,.25)",
    };
  };

  const getScanDetails = (id) => {
    const details = {
      "SCAN-2026-001": {
        summary:
          "Comprehensive audit revealed critical misconfigurations in API gateway and exposed PII endpoints. Immediate patching required for authentication bypass vulnerabilities.",
        findings: [
          { name: "SQL Injection in /api/v1/users", severity: "Critical" },
          { name: "Broken Object Level Authorization", severity: "High" },
          { name: "Missing Rate Limiting", severity: "Medium" },
        ],
        recommendations: [
          "Implement WAF rules for SQLi prevention",
          "Enforce strict BOLA checks on all object references",
          "Enable API rate limiting at the gateway level",
        ],
        endpoints: [
          { path: "/api/v1/users/{id}", status: "Critical" },
          { path: "/api/v1/auth/login", status: "High" },
          { path: "/api/v1/payments", status: "Secure" },
        ],
      },
      "SCAN-2026-003": {
        summary:
          "Payment gateway scan identified severe OWASP Top 10 vulnerabilities. High risk of financial data exfiltration if left unpatched.",
        findings: [
          { name: "Insecure Direct Object References", severity: "Critical" },
          { name: "Weak Cryptographic Storage", severity: "Critical" },
          { name: "Missing Security Headers", severity: "Medium" },
        ],
        recommendations: [
          "Upgrade encryption standards for PII/PCI data",
          "Implement strict access control lists (ACLs)",
          "Add HSTS and CSP headers to all responses",
        ],
        endpoints: [
          { path: "/payments/process", status: "Critical" },
          { path: "/transactions/history", status: "High" },
          { path: "/refunds/initiate", status: "Secure" },
        ],
      },
    };

    return (
      details[id] || {
        summary:
          "Routine scan completed. No immediate critical threats detected, but continuous monitoring is recommended to maintain security posture.",
        findings: [
          { name: "Outdated TLS Version", severity: "Low" },
          { name: "Verbose Error Messages", severity: "Low" },
          { name: "Missing HSTS Header", severity: "Medium" },
        ],
        recommendations: [
          "Update TLS configuration to 1.3",
          "Implement custom error handling pages",
          "Enable HTTP Strict Transport Security",
        ],
        endpoints: [
          { path: "/api/health", status: "Secure" },
          { path: "/api/v1/data", status: "Secure" },
          { path: "/admin/dashboard", status: "Monitor" },
        ],
      }
    );
  };

  const filteredScans = scans.filter(
    (scan) =>
      (scan.scanId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scan.targetUrl || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scan.profile || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- Reusable Components ---
  const ActionButton = ({ icon: Icon, color, onClick }) => (
    <div
      onClick={onClick}
      style={{
        background: "#0B1220",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "8px",
        padding: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,.05)";
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#0B1220";
        e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
      }}
    >
      <Icon size={16} color={color} />
    </div>
  );

  const ToolbarButton = ({ icon: Icon, label, primary = false }) => (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 16px",
        borderRadius: "10px",
        border: primary ? "none" : "1px solid rgba(255,255,255,.08)",
        background: primary
          ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
          : "#0B1220",
        color: primary ? "#FFFFFF" : "#94A3B8",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: primary ? "0 4px 12px rgba(59,130,246,.3)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!primary) {
          e.currentTarget.style.background = "rgba(255,255,255,.05)";
          e.currentTarget.style.color = "#FFFFFF";
        }
      }}
      onMouseLeave={(e) => {
        if (!primary) {
          e.currentTarget.style.background = "#0B1220";
          e.currentTarget.style.color = "#94A3B8";
        }
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!loading && scans.length === 0) {
    return <div>No Scan History Found</div>;
  }

  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            Historical Scan Records
          </h3>
          <div style={{ color: "#94A3B8", fontSize: "13px", marginTop: "6px" }}>
            Complete security assessment history
          </div>
        </div>
        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "12px",
            padding: "8px 14px",
            color: "#64748B",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          245 Total Scans
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "16px",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search
            size={16}
            color="#64748B"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search Scan ID, Target, or Profile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "12px",
              padding: "10px 14px 10px 40px",
              color: "#FFFFFF",
              fontSize: "13px",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(59,130,246,.5)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(255,255,255,.08)")
            }
          />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <ToolbarButton icon={Filter} label="All Risks" />
          <ToolbarButton icon={Calendar} label="Last 30 Days" />
          <ToolbarButton icon={Download} label="Export" primary />
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Critical Scans",
            value: "34",
            trend: "↓ 12%",
            color: "#EF4444",
            trendColor: "#22C55E",
          },
          {
            label: "High Risk Assets",
            value: "18",
            trend: "↓ 5%",
            color: "#F97316",
            trendColor: "#22C55E",
          },
          {
            label: "Average Findings",
            value: "12.4",
            trend: "↑ 1.8",
            color: "#60A5FA",
            trendColor: "#EF4444",
          },
          {
            label: "Resolved",
            value: "89%",
            trend: "↑ 14%",
            color: "#22C55E",
            trendColor: "#22C55E",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: "14px",
              padding: "16px",
            }}
          >
            <div
              style={{
                color: "#64748B",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  color: item.color,
                  fontSize: "24px",
                  fontWeight: "800",
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  color: item.trendColor,
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {item.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,.02)" }}>
              {[
                { label: "", width: "4px" }, // Severity Strip
                "Scan ID",
                "Target",
                "Profile",
                "Date",
                "Duration",
                "Risk",
                "Findings",
                "Trend",
                "AI Verdict",
                "Status",
                "Actions",
              ].map((item, idx) => (
                <th
                  key={idx}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    color: "#64748B",
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderBottom: "1px solid rgba(255,255,255,.08)",
                    width: item.width || "auto",
                  }}
                >
                  {item.label !== undefined ? item.label : item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredScans.map((scan) => {
              const trendData = getTrendData("Stable");
              const aiVerdict = getAiVerdict(scan.riskScore || 0);
              const profileStyle = getProfileStyle(scan.profile || "");
              const isExpanded = expandedRow === scan.scanId;
              const isHovered = hoveredRow === scan.scanId;

              return (
                <React.Fragment key={scan._id}>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,.05)",
                      background: isHovered
                        ? "rgba(255,255,255,0.03)"
                        : "transparent",
                      boxShadow: isHovered
                        ? "inset 4px 0 0 0 #3B82F6"
                        : "inset 4px 0 0 0 transparent",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredRow(scan.scanId)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Severity Strip */}
                    <td
                      style={{
                        padding: 0,
                        width: "4px",
                        background: getRiskColor(scan.riskScore || 0),
                      }}
                    />

                    {/* Scan ID */}
                    <td
                      style={{ padding: "16px", cursor: "pointer" }}
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : scan.scanId)
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            color: "#8B5CF6",
                            fontWeight: "700",
                            fontSize: "13px",
                          }}
                        >
                          {scan.scanId}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={14} color="#8B5CF6" />
                        ) : (
                          <ChevronDown size={14} color="#8B5CF6" />
                        )}
                      </div>
                      <div
                        style={{
                          color: "#475569",
                          fontSize: "10px",
                          marginTop: "2px",
                          fontWeight: "600",
                        }}
                      >
                        Scan #{(scan.scanId || "").split("-").pop()}
                      </div>
                    </td>

                    {/* Target */}
                    <td
                      style={{
                        padding: "16px",
                        color: "#FFFFFF",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      {scan.targetUrl}
                    </td>

                    {/* Profile Badge */}
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          background: profileStyle.bg,
                          border: `1px solid ${profileStyle.border}`,
                          color: profileStyle.color,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {scan.profile}
                      </span>
                    </td>

                    {/* Date */}
                    <td
                      style={{
                        padding: "16px",
                        color: "#CBD5E1",
                        fontSize: "13px",
                      }}
                    >
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </td>

                    {/* Duration */}
                    <td
                      style={{
                        padding: "16px",
                        color: "#CBD5E1",
                        fontSize: "13px",
                      }}
                    >
                      {scan.duration}s
                    </td>

                    {/* Risk Badge */}
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          background: `${getRiskColor(scan.riskScore || 0)}15`,
                          border: `1px solid ${getRiskColor(scan.riskScore || 0)}40`,
                          color: getRiskColor(scan.riskScore || 0),
                          padding: "5px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: getRiskColor(scan.riskScore || 0),
                          }}
                        />
                        {getRiskLabel(scan.riskScore || 0)}{" "}
                        {scan.riskScore || 0}
                      </span>
                    </td>

                    {/* Findings Badge */}
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          background: "rgba(96,165,250,.12)",
                          border: "1px solid rgba(96,165,250,.25)",
                          color: "#60A5FA",
                          padding: "5px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {scan.totalFindings || 0} Findings
                      </span>
                    </td>

                    {/* Trend */}
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          background: trendData.bg,
                          color: trendData.color,
                          padding: "5px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {trendData.icon} Stable
                      </span>
                    </td>

                    {/* AI Verdict */}
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          background: aiVerdict.bg,
                          border: `1px solid ${aiVerdict.border}`,
                          color: aiVerdict.color,
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {aiVerdict.text}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span
                          style={{
                            background: "rgba(34,197,94,.15)",
                            color: "#22C55E",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: "700",
                          }}
                        >
                          {scan.status}
                        </span>
                        <span
                          style={{
                            background: "rgba(139,92,246,.15)",
                            color: "#A855F7",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: "700",
                          }}
                        >
                          AI Reviewed
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <ActionButton
                          icon={Eye}
                          color="#60A5FA"
                          onClick={onView}
                        />
                        <ActionButton icon={FileText} color="#A855F7" />
                        <ActionButton icon={RotateCw} color="#22C55E" />
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row Details */}
                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={12}
                        style={{
                          padding: 0,
                          background: "rgba(255,255,255,0.02)",
                          borderBottom: "1px solid rgba(255,255,255,.08)",
                        }}
                      >
                        <div
                          style={{
                            padding: "24px 32px",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "24px",
                          }}
                        >
                          {/* Col 1: Exec Summary & Top Findings */}
                          <div>
                            <h4
                              style={{
                                color: "#FFFFFF",
                                margin: "0 0 12px 0",
                                fontSize: "14px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <FileText size={16} color="#60A5FA" /> Executive
                              Summary
                            </h4>
                            <p
                              style={{
                                color: "#94A3B8",
                                fontSize: "12px",
                                lineHeight: "1.6",
                                margin: "0 0 20px 0",
                              }}
                            >
                              {getScanDetails(scan.scanId).summary}
                            </p>

                            <h4
                              style={{
                                color: "#FFFFFF",
                                margin: "0 0 12px 0",
                                fontSize: "14px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <AlertTriangle size={16} color="#EF4444" /> Top
                              Findings
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {getScanDetails(scan.scanId).findings.map(
                                (f, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      background: "#0B1220",
                                      padding: "10px 12px",
                                      borderRadius: "8px",
                                      border: "1px solid rgba(255,255,255,.05)",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "#CBD5E1",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {f.name}
                                    </span>
                                    <span
                                      style={{
                                        color:
                                          f.severity === "Critical"
                                            ? "#EF4444"
                                            : f.severity === "High"
                                              ? "#F97316"
                                              : "#60A5FA",
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        background: "rgba(255,255,255,.05)",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      {f.severity}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Col 2: Risk Breakdown & Recommendations */}
                          <div>
                            <h4
                              style={{
                                color: "#FFFFFF",
                                margin: "0 0 12px 0",
                                fontSize: "14px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <ShieldAlert size={16} color="#F97316" /> Risk
                              Breakdown
                            </h4>
                            <div
                              style={{
                                background: "#0B1220",
                                padding: "16px",
                                borderRadius: "12px",
                                border: "1px solid rgba(255,255,255,.05)",
                                marginBottom: "20px",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "36px",
                                  fontWeight: "800",
                                  color: getRiskColor(scan.riskScore || 0),
                                  lineHeight: 1,
                                }}
                              >
                                {scan.riskScore || 0}
                              </div>
                              <div
                                style={{
                                  color: "#64748B",
                                  fontSize: "11px",
                                  marginTop: "4px",
                                  fontWeight: "600",
                                }}
                              >
                                OVERALL RISK SCORE
                              </div>
                            </div>

                            <h4
                              style={{
                                color: "#FFFFFF",
                                margin: "0 0 12px 0",
                                fontSize: "14px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <CheckCircle2 size={16} color="#22C55E" />{" "}
                              Recommendations
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {getScanDetails(scan.scanId).recommendations.map(
                                (rec, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      display: "flex",
                                      gap: "10px",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        background: "#22C55E",
                                        marginTop: "6px",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <span
                                      style={{
                                        color: "#CBD5E1",
                                        fontSize: "12px",
                                        lineHeight: "1.5",
                                      }}
                                    >
                                      {rec}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Col 3: Affected Endpoints */}
                          <div>
                            <h4
                              style={{
                                color: "#FFFFFF",
                                margin: "0 0 12px 0",
                                fontSize: "14px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Search size={16} color="#A855F7" /> Affected
                              Endpoints
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {getScanDetails(scan.scanId).endpoints.map(
                                (ep, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      background: "#0B1220",
                                      padding: "12px",
                                      borderRadius: "8px",
                                      border: "1px solid rgba(255,255,255,.05)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        color: "#E2E8F0",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        fontFamily: "monospace",
                                        marginBottom: "6px",
                                      }}
                                    >
                                      {ep.path}
                                    </div>
                                    <span
                                      style={{
                                        color:
                                          ep.status === "Critical"
                                            ? "#EF4444"
                                            : ep.status === "High"
                                              ? "#F97316"
                                              : ep.status === "Secure"
                                                ? "#22C55E"
                                                : "#60A5FA",
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        background: "rgba(255,255,255,.05)",
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      {ep.status}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div style={{ color: "#64748B", fontSize: "12px" }}>
          Showing{" "}
          <span style={{ color: "#FFFFFF", fontWeight: "600" }}>
            1-{filteredScans.length}
          </span>{" "}
          of <span style={{ color: "#FFFFFF", fontWeight: "600" }}>245</span>{" "}
          scans
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "8px",
              padding: "8px 16px",
              color: "#94A3B8",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Previous
          </button>
          <button
            style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(59,130,246,.3)",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
