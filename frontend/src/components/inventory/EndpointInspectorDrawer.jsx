import React, { useState } from "react";
import { X, CheckCircle, Copy, Save, AlertCircle, Terminal, ShieldAlert, Cpu, Network, Database, Code, FileText } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function EndpointInspectorDrawer({ endpoint, onClose, onUpdateSuccess }) {
  if (!endpoint) return null;

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'curl' | 'schema' | 'vectors' | 'security'
  const [notes, setNotes] = useState(endpoint.notes || "");
  const [owner, setOwner] = useState(endpoint.owner || "Security Operations");
  const [status, setStatus] = useState(endpoint.status || "Active");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/inventory/${endpoint._id}`, {
        notes,
        owner,
        status,
      });
      if (res.data?.success) {
        toast.success("Endpoint asset profile updated successfully!");
        if (onUpdateSuccess) onUpdateSuccess();
      }
    } catch (err) {
      toast.error("Failed to update endpoint metadata.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, msg = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const getMethodStyle = (method) => {
    switch ((method || "").toUpperCase()) {
      case "GET":
        return { bg: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", border: "rgba(59, 130, 246, 0.3)" };
      case "POST":
        return { bg: "rgba(16, 185, 129, 0.15)", color: "#34D399", border: "rgba(16, 185, 129, 0.3)" };
      case "PUT":
        return { bg: "rgba(245, 158, 11, 0.15)", color: "#FBBF24", border: "rgba(245, 158, 11, 0.3)" };
      case "DELETE":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#F87171", border: "rgba(239, 68, 68, 0.3)" };
      case "PATCH":
        return { bg: "rgba(168, 85, 247, 0.15)", color: "#C084FC", border: "rgba(168, 85, 247, 0.3)" };
      case "WS":
        return { bg: "rgba(6, 182, 212, 0.15)", color: "#22D3EE", border: "rgba(6, 182, 212, 0.3)" };
      default:
        return { bg: "rgba(148, 163, 184, 0.15)", color: "#94A3B8", border: "rgba(148, 163, 184, 0.3)" };
    }
  };

  const getRiskStyle = (risk) => {
    switch ((risk || "").toLowerCase()) {
      case "critical":
        return { bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444", label: "CRITICAL RISK" };
      case "high":
        return { bg: "rgba(249, 115, 22, 0.2)", color: "#F97316", label: "HIGH RISK" };
      case "medium":
        return { bg: "rgba(234, 179, 8, 0.2)", color: "#EAB308", label: "MEDIUM RISK" };
      default:
        return { bg: "rgba(16, 185, 129, 0.2)", color: "#10B981", label: "LOW RISK" };
    }
  };

  const methodStyle = getMethodStyle(endpoint.method);
  const riskStyle = getRiskStyle(endpoint.riskScore);
  const fullUrl = `${endpoint.host}${endpoint.path}`;
  const confidence = endpoint.confidenceScore || (endpoint.isVerifiedApi ? 95 : 60);

  // Generate real cURL command for developers & security analysts
  const generateCurl = () => {
    let cmd = `curl -X ${endpoint.method || "GET"} "${fullUrl}"`;
    cmd += ` \\\n  -H "Accept: ${endpoint.contentType || "application/json"}"`;
    if (endpoint.authType && endpoint.authType !== "Public / Unauthenticated") {
      cmd += ` \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN"`;
    }
    if (endpoint.method && ["POST", "PUT", "PATCH"].includes(endpoint.method.toUpperCase())) {
      cmd += ` \\\n  -H "Content-Type: application/json"`;
      cmd += ` \\\n  -d '${JSON.stringify(endpoint.sampleRequest || { data: "example" })}'`;
    }
    return cmd;
  };

  const sampleRequestJson = JSON.stringify(
    endpoint.sampleRequest || {
      headers: {
        Authorization: endpoint.authType === "Public / Unauthenticated" ? "None" : "Bearer <JWT_TOKEN>",
        "Content-Type": endpoint.contentType || "application/json",
      },
      queryParams: (endpoint.parameters || []).reduce((acc, p) => ({ ...acc, [p.name]: "<value>" }), {}),
    },
    null,
    2
  );

  const jsonSchemaStr = endpoint.jsonSchema
    ? JSON.stringify(endpoint.jsonSchema, null, 2)
    : JSON.stringify({ type: "object", properties: { status: { type: "string" }, data: { type: "array" } } }, null, 2);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "600px",
        maxWidth: "94vw",
        background: "#070D19",
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "-10px 0 50px rgba(0,0,0,0.8)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        color: "#FFF",
      }}
    >
      {/* Drawer Top Bar Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(90deg, #090F1B 0%, #030712 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={20} color="#F97316" />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#F97316", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Enterprise API Inspector
            </div>
            <div style={{ fontSize: "15px", fontWeight: "800", marginTop: "1px", color: "#F8FAFC" }}>
              {endpoint.path}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#FFF",
            borderRadius: "8px",
            padding: "6px",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Hero Badge & Path Card */}
      <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: "900", color: methodStyle.color, background: methodStyle.bg, border: `1px solid ${methodStyle.border}`, padding: "3px 8px", borderRadius: "6px" }}>
            {endpoint.method}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "800", color: riskStyle.color, background: riskStyle.bg, padding: "3px 8px", borderRadius: "6px" }}>
            {riskStyle.label}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#38BDF8", background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", padding: "3px 8px", borderRadius: "6px" }}>
            {confidence}% Confidence
          </span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: "6px", marginLeft: "auto" }}>
            {endpoint.status}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ fontSize: "12px", color: "#94A3B8", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fullUrl}
          </div>
          <button
            onClick={() => copyToClipboard(fullUrl, "Copied full API URL!")}
            style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", color: "#F97316", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}
          >
            <Copy size={12} /> Copy URL
          </button>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#090F1B", padding: "0 16px" }}>
        {[
          { id: "overview", label: "Overview", icon: Database },
          { id: "curl", label: "cURL & Play", icon: Terminal },
          { id: "schema", label: "Schema & Spec", icon: Code },
          { id: "vectors", label: "Detection Vectors", icon: Network },
          { id: "security", label: "Security & OWASP", icon: ShieldAlert },
        ].map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "12px 14px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "#F97316" : "transparent"}`,
                color: active ? "#F97316" : "#94A3B8",
                fontSize: "12px",
                fontWeight: active ? "800" : "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <IconComp size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Drawer Scrollable View Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {activeTab === "overview" && (
          <>
            {/* Auth & Sensitivity HUD */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>Auth Mechanism</div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: endpoint.authType === "Public / Unauthenticated" ? "#EAB308" : "#34D399", marginTop: "4px" }}>
                  {endpoint.authType === "Public / Unauthenticated" ? "⚠️ Unauthenticated / Public" : `🔒 ${endpoint.authType}`}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>Sensitivity Tags</div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                  {(endpoint.dataSensitivity || ["Public"]).map((tag, i) => (
                    <span key={i} style={{ fontSize: "10px", fontWeight: "800", background: "rgba(249,115,22,0.15)", color: "#F97316", padding: "2px 6px", borderRadius: "4px" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Telemetry HUD */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "16px" }}>
              <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>
                API Architecture & Telemetry
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "9.5px", color: "#64748B", fontWeight: "700" }}>Classification</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: endpoint.isVerifiedApi ? "#34D399" : "#94A3B8" }}>
                    {endpoint.resourceType || "REST API"} {endpoint.isVerifiedApi ? "✅" : "❌"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "9.5px", color: "#64748B", fontWeight: "700" }}>Backend Tech</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#60A5FA" }}>{endpoint.technology || "Express / Node.js"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "9.5px", color: "#64748B", fontWeight: "700" }}>CDN Gateway</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#F8FAFC" }}>{endpoint.cdnGateway || "Direct Server"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "9.5px", color: "#64748B", fontWeight: "700" }}>Average Latency</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#34D399" }}>{endpoint.responseTimeMs || 120} ms</div>
                </div>
                <div>
                  <div style={{ fontSize: "9.5px", color: "#64748B", fontWeight: "700" }}>CORS Protection</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: endpoint.corsEnabled ? "#34D399" : "#EF4444" }}>
                    {endpoint.corsEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "9.5px", color: "#64748B", fontWeight: "700" }}>Rate Limiting</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: endpoint.rateLimitPresent ? "#34D399" : "#F59E0B" }}>
                    {endpoint.rateLimitPresent ? "Enforced" : "None Detected"}
                  </div>
                </div>
              </div>
            </div>

            {/* Discovered Parameters List */}
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Discovered API Parameters ({endpoint.parameters?.length || 0})
              </h4>
              {endpoint.parameters && endpoint.parameters.length > 0 ? (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)", textAlign: "left", color: "#64748B" }}>
                        <th style={{ padding: "8px 12px" }}>Parameter</th>
                        <th style={{ padding: "8px 12px" }}>Location</th>
                        <th style={{ padding: "8px 12px" }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.parameters.map((p, i) => (
                        <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "#CBD5E1" }}>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#F97316", fontWeight: "700" }}>{p.name}</td>
                          <td style={{ padding: "8px 12px" }}>{p.location}</td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{p.paramType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#64748B", fontStyle: "italic", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.06)" }}>
                  No URL query parameters or request body parameters discovered for this endpoint.
                </div>
              )}
            </div>

            {/* Asset Metadata Editor */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", margin: 0 }}>
                Annotate & Assign Asset
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "10px", color: "#64748B", fontWeight: "700", display: "block", marginBottom: "4px" }}>Lifecycle Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: "100%", background: "#030712", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", color: "#FFF", fontSize: "12px" }}
                  >
                    <option value="Active">Active API</option>
                    <option value="Shadow API">Shadow API</option>
                    <option value="Zombie Endpoint">Zombie Endpoint</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "10px", color: "#64748B", fontWeight: "700", display: "block", marginBottom: "4px" }}>Assigned Owner</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    style={{ width: "100%", background: "#030712", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", color: "#FFF", fontSize: "12px" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "10px", color: "#64748B", fontWeight: "700", display: "block", marginBottom: "4px" }}>Security Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Security notes, owner contacts, operational notes..."
                  style={{ width: "100%", background: "#030712", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", color: "#FFF", fontSize: "12px", resize: "vertical" }}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", border: "none", color: "#FFF", padding: "10px", borderRadius: "8px", fontWeight: "700", cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <Save size={14} /> {saving ? "Saving Profile..." : "Save Asset Profile"}
              </button>
            </div>
          </>
        )}

        {/* TAB 2: cURL & TEST PLAYGROUND */}
        {activeTab === "curl" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", margin: 0 }}>
                  Executable cURL Command
                </h4>
                <button
                  onClick={() => copyToClipboard(generateCurl(), "Copied cURL command!")}
                  style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", color: "#F97316", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Copy size={12} /> Copy cURL
                </button>
              </div>
              <pre
                style={{
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "11.5px",
                  color: "#38BDF8",
                  fontFamily: "monospace",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {generateCurl()}
              </pre>
            </div>

            <div>
              <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: "8px" }}>
                Sample Request JSON Payload
              </h4>
              <pre
                style={{
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "11.5px",
                  color: "#34D399",
                  fontFamily: "monospace",
                  margin: 0,
                  overflowX: "auto",
                }}
              >
                {sampleRequestJson}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEMA & API SPEC */}
        {activeTab === "schema" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: "8px" }}>
                Inferred Primitive JSON Schema
              </h4>
              <pre
                style={{
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "11.5px",
                  color: "#FBBF24",
                  fontFamily: "monospace",
                  margin: 0,
                  overflowX: "auto",
                }}
              >
                {jsonSchemaStr}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: DETECTION VECTORS */}
        {activeTab === "vectors" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", margin: 0 }}>
              Correlated Discovery Vectors ({endpoint.detectedBy?.length || 1})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(endpoint.detectedBy && endpoint.detectedBy.length > 0
                ? endpoint.detectedBy
                : ["Active API Probe", "JS Bundle Extractor"]
              ).map((src, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle size={14} color="#34D399" />
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#F8FAFC" }}>{src}</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#38BDF8", background: "rgba(56,189,248,0.12)", padding: "2px 6px", borderRadius: "4px" }}>
                    Verified Vector
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & OWASP TOP 10 */}
        {activeTab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", margin: 0 }}>
              Linked Vulnerabilities & OWASP Risk Profile
            </h4>
            {endpoint.vulnerabilities && endpoint.vulnerabilities.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {endpoint.vulnerabilities.map((v, i) => (
                  <div key={i} style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#F8FAFC" }}>{v.title || "Security Vulnerability"}</div>
                      <div style={{ fontSize: "10px", color: "#EF4444", fontFamily: "monospace", marginTop: "2px" }}>{v.cwe || "CWE-200 / BOLA"}</div>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#EF4444", background: "rgba(239,68,68,0.2)", padding: "3px 8px", borderRadius: "4px" }}>
                      {v.severity || "HIGH"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "12px", color: "#34D399", background: "rgba(16,185,129,0.05)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} /> No active vulnerabilities linked to this API endpoint.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

