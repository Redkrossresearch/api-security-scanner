import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle, Copy, FileCode, Tag, User, Save, Code, Server } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function EndpointInspectorDrawer({ endpoint, onClose, onUpdateSuccess }) {
  if (!endpoint) return null;

  const [notes, setNotes] = useState(endpoint.notes || "");
  const [owner, setOwner] = useState(endpoint.owner || "Security Operations");
  const [status, setStatus] = useState(endpoint.status || "Active");
  const [riskScore, setRiskScore] = useState(endpoint.riskScore || "Low");
  const [saving, setSaving] = useState(false);

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
      default:
        return { bg: "rgba(168, 85, 247, 0.15)", color: "#C084FC", border: "rgba(168, 85, 247, 0.3)" };
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
      case "low":
        return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", label: "LOW RISK" };
      default:
        return { bg: "rgba(16, 185, 129, 0.2)", color: "#10B981", label: "SECURE" };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/inventory/${endpoint._id}`, {
        notes,
        owner,
        status,
        riskScore,
      });
      if (res.data?.success) {
        toast.success("Endpoint metadata updated successfully!");
        if (onUpdateSuccess) onUpdateSuccess();
      }
    } catch (err) {
      toast.error("Failed to update endpoint metadata.");
    } finally {
      setSaving(false);
    }
  };

  const methodStyle = getMethodStyle(endpoint.method);
  const riskStyle = getRiskStyle(endpoint.riskScore);
  const fullUrl = `${endpoint.host || "https://api.target.com"}${endpoint.path}`;

  // Sample Request / Response JSON
  const sampleRequestJson = JSON.stringify(
    {
      endpoint: endpoint.path,
      method: endpoint.method,
      headers: {
        Authorization: endpoint.authType === "Public / Unauthenticated" ? "None" : "Bearer <JWT_TOKEN>",
        "Content-Type": "application/json",
      },
      queryParams: (endpoint.parameters || []).reduce((acc, p) => ({ ...acc, [p.name]: "<value>" }), {}),
    },
    null,
    2
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "540px",
        maxWidth: "92vw",
        background: "#070D19",
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "-10px 0 40px rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        color: "#FFF",
      }}
    >
      {/* Header */}
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
        <div>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#F97316", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Endpoint Inspector
          </div>
          <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "2px", color: "#F8FAFC" }}>
            API Asset Profile
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

      {/* Content Scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Method & Full Path Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "900",
                color: methodStyle.color,
                background: methodStyle.bg,
                border: `1px solid ${methodStyle.border}`,
                padding: "3px 8px",
                borderRadius: "6px",
              }}
            >
              {endpoint.method}
            </span>

            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: riskStyle.color,
                background: riskStyle.bg,
                padding: "3px 8px",
                borderRadius: "6px",
              }}
            >
              {riskStyle.label}
            </span>

            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: endpoint.status === "Shadow API" ? "#EF4444" : "#94A3B8",
                background: "rgba(255,255,255,0.04)",
                padding: "3px 8px",
                borderRadius: "6px",
                marginLeft: "auto",
              }}
            >
              {endpoint.status}
            </span>
          </div>

          <div style={{ fontSize: "14px", fontWeight: "700", fontFamily: "monospace", color: "#FFF", wordBreak: "break-all" }}>
            {endpoint.path}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
            <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
              {endpoint.host}
            </span>
            <button
              onClick={() => copyToClipboard(fullUrl)}
              style={{
                background: "transparent",
                border: "none",
                color: "#F97316",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              <Copy size={12} /> Copy URL
            </button>
          </div>
        </div>

        {/* Data Sensitivity & Auth Type */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>Auth Scheme</div>
            <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#E2E8F0", marginTop: "4px" }}>
              🔒 {endpoint.authType || "Public"}
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

        {/* Task 161.2: Raw Request Sample & Schema */}
        <div>
          <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Raw Request Sample & Schema
          </h4>
          <pre
            style={{
              background: "#030712",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "11px",
              color: "#34D399",
              fontFamily: "monospace",
              margin: 0,
              overflowX: "auto",
            }}
          >
            {sampleRequestJson}
          </pre>
        </div>

        {/* Discovered Parameters List */}
        <div>
          <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Discovered Parameters ({endpoint.parameters?.length || 0})
          </h4>
          {endpoint.parameters && endpoint.parameters.length > 0 ? (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", textAlign: "left", color: "#64748B" }}>
                    <th style={{ padding: "8px 12px" }}>Name</th>
                    <th style={{ padding: "8px 12px" }}>Location</th>
                    <th style={{ padding: "8px 12px" }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.parameters.map((p, i) => (
                    <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "#CBD5E1" }}>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#F97316" }}>{p.name}</td>
                      <td style={{ padding: "8px 12px" }}>{p.location}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{p.paramType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "#475569", fontStyle: "italic", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.05)" }}>
              No body or query parameters discovered for this endpoint.
            </div>
          )}
        </div>

        {/* Connected Vulnerabilities */}
        <div>
          <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Linked Vulnerabilities ({endpoint.vulnerabilities?.length || endpoint.vulnerabilitiesCount || 0})
          </h4>
          {endpoint.vulnerabilities && endpoint.vulnerabilities.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {endpoint.vulnerabilities.map((v, i) => (
                <div key={i} style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#F8FAFC" }}>{v.title || "Security Vulnerability"}</div>
                    <div style={{ fontSize: "10px", color: "#EF4444", fontFamily: "monospace", marginTop: "2px" }}>{v.cwe || "CWE-200"}</div>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#EF4444", background: "rgba(239,68,68,0.2)", padding: "2px 6px", borderRadius: "4px" }}>
                    {v.severity || "HIGH"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "#10B981", background: "rgba(16,185,129,0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={16} /> No active security vulnerabilities linked to this endpoint.
            </div>
          )}
        </div>

        {/* Editable Metadata Form */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", margin: 0 }}>
            Annotate Asset Metadata
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "#64748B", fontWeight: "700", display: "block", marginBottom: "4px" }}>Asset Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", background: "#030712", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", color: "#FFF", fontSize: "12px" }}
              >
                <option value="Active">Active</option>
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
            <label style={{ fontSize: "10px", color: "#64748B", fontWeight: "700", display: "block", marginBottom: "4px" }}>Security Notes & Specifications</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add security notes, operational team contacts, or deprecation schedules..."
              style={{ width: "100%", background: "#030712", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", color: "#FFF", fontSize: "12px", resize: "vertical" }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "linear-gradient(135deg, #F97316, #EA580C)",
              border: "none",
              color: "#FFF",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: saving ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <Save size={14} /> {saving ? "Saving Changes..." : "Save Asset Profile"}
          </button>
        </div>

      </div>
    </div>
  );
}
