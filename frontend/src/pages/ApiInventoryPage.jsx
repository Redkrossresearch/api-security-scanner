import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  Filter,
  Download,
  Upload,
  ShieldAlert,
  Layers,
  Ghost,
  Lock,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Zap,
  Play,
  ArrowLeft,
  Server,
  Activity,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import EndpointInspectorDrawer from "../components/inventory/EndpointInspectorDrawer";
import SpecImportModal from "../components/inventory/SpecImportModal";
import WebsiteFavicon from "../components/inventory/WebsiteFavicon";

export default function ApiInventoryPage() {
  const [stats, setStats] = useState(null);
  const [targets, setTargets] = useState([]);
  const [selectedTargetHost, setSelectedTargetHost] = useState(null); // null means Target Cards Grid mode

  const [endpoints, setEndpoints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Quick Action Target Scanner State
  const [targetUrlInput, setTargetUrlInput] = useState("");
  const [scanningTarget, setScanningTarget] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [statsRes, targetsRes] = await Promise.all([
        api.get("/inventory/stats", { params: { host: selectedTargetHost || undefined } }),
        api.get("/inventory/targets"),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (targetsRes.data?.success) {
        setTargets(targetsRes.data.targets || []);
      }

      // Fetch endpoints if a target host is selected
      if (selectedTargetHost) {
        let filterParams = { search: searchTerm, host: selectedTargetHost, page: pagination.page, limit: pagination.limit };
        
        if (activeFilter === "Verified APIs Only") {
          filterParams.verifiedOnly = true;
        } else if (["REST API", "GraphQL", "WebSocket", "SSE Stream", "gRPC-Web", "WebHook", "SOAP API", "Web Page", "Sitemap", "Static Asset"].includes(activeFilter)) {
          filterParams.resourceType = activeFilter;
        } else if (activeFilter === "Shadow APIs") {
          filterParams.status = "Shadow API";
        } else if (activeFilter === "High Risk") {
          filterParams.riskScore = "High";
        } else if (activeFilter === "Public") {
          filterParams.authType = "Public / Unauthenticated";
        }

        const endpointsRes = await api.get("/inventory", { params: filterParams });
        if (endpointsRes.data?.success) {
          setEndpoints(endpointsRes.data.endpoints || []);
          if (endpointsRes.data.pagination) {
            setPagination(endpointsRes.data.pagination);
          }
        }
      }
    } catch (err) {
      console.error("[ApiInventoryPage] Fetch failed:", err);
      toast.error("Failed to load live API inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [selectedTargetHost, searchTerm, activeFilter, pagination.page]);

  // Direct Scan Target URL Handler
  const handleScanTargetSubmit = async (e) => {
    e.preventDefault();
    if (!targetUrlInput.trim()) {
      toast.error("Please enter a valid target website URL (e.g. https://api.target.com)");
      return;
    }

    setScanningTarget(true);
    const toastId = toast.loading(`Scanning ${targetUrlInput} & extracting API endpoints...`);
    try {
      const res = await api.post("/inventory/scan-target", { targetUrl: targetUrlInput });
      if (res.data?.success) {
        toast.dismiss(toastId);
        toast.success(`Discovered & ingested ${res.data.count} endpoints from ${res.data.host}!`);
        setTargetUrlInput("");
        setSelectedTargetHost(res.data.host);
        fetchInventoryData();
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.error || "Target URL scan failed.");
    } finally {
      setScanningTarget(false);
    }
  };

  const handleExportOpenApi = async () => {
    const toastId = toast.loading("Generating OpenAPI 3.0 specification...");
    try {
      const res = await api.get("/inventory/export", {
        params: { host: selectedTargetHost || undefined },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `OpenAPI_Discovered_Inventory_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss(toastId);
      toast.success("Downloaded OpenAPI 3.0 specification!");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to export OpenAPI specification.");
    }
  };

  const getMethodStyle = (method) => {
    switch ((method || "").toUpperCase()) {
      case "GET":
        return { bg: "rgba(56, 189, 248, 0.14)", color: "#38BDF8", border: "rgba(56, 189, 248, 0.35)", shadow: "none" };
      case "POST":
        return { bg: "rgba(52, 211, 153, 0.14)", color: "#34D399", border: "rgba(52, 211, 153, 0.35)", shadow: "none" };
      case "PUT":
        return { bg: "rgba(245, 158, 11, 0.14)", color: "#FBBF24", border: "rgba(245, 158, 11, 0.35)", shadow: "none" };
      case "DELETE":
        return { bg: "rgba(248, 113, 113, 0.14)", color: "#F87171", border: "rgba(248, 113, 113, 0.35)", shadow: "none" };
      case "PATCH":
        return { bg: "rgba(192, 132, 252, 0.14)", color: "#C084FC", border: "rgba(192, 132, 252, 0.35)", shadow: "none" };
      case "WS":
        return { bg: "rgba(236, 72, 153, 0.14)", color: "#EC4899", border: "rgba(236, 72, 153, 0.35)", shadow: "none" };
      case "OPTIONS":
        return { bg: "rgba(129, 140, 248, 0.14)", color: "#818CF8", border: "rgba(129, 140, 248, 0.35)", shadow: "none" };
      default:
        return { bg: "rgba(148, 163, 184, 0.14)", color: "#94A3B8", border: "rgba(148, 163, 184, 0.35)", shadow: "none" };
    }
  };

  const getRiskStyle = (risk) => {
    switch ((risk || "").toLowerCase()) {
      case "critical":
        return { bg: "rgba(239, 68, 68, 0.18)", color: "#F87171", border: "rgba(239, 68, 68, 0.35)" };
      case "high":
        return { bg: "rgba(249, 115, 22, 0.18)", color: "#FB923C", border: "rgba(249, 115, 22, 0.35)" };
      case "medium":
        return { bg: "rgba(234, 179, 8, 0.18)", color: "#FACC15", border: "rgba(234, 179, 8, 0.35)" };
      case "low":
        return { bg: "rgba(59, 130, 246, 0.18)", color: "#60A5FA", border: "rgba(59, 130, 246, 0.35)" };
      default:
        return { bg: "rgba(16, 185, 129, 0.18)", color: "#34D399", border: "rgba(16, 185, 129, 0.35)" };
    }
  };

  const getResourceTypeBadge = (type, isVerified) => {
    switch (type) {
      case "REST API":
        return { bg: "rgba(52,211,153,0.12)", color: "#34D399", label: "REST API", border: "rgba(52,211,153,0.3)" };
      case "GraphQL":
        return { bg: "rgba(192,132,252,0.12)", color: "#C084FC", label: "GraphQL", border: "rgba(192,132,252,0.3)" };
      case "WebSocket":
        return { bg: "rgba(56,189,248,0.12)", color: "#38BDF8", label: "WebSocket", border: "rgba(56,189,248,0.3)" };
      case "SSE Stream":
        return { bg: "rgba(236,72,153,0.12)", color: "#F472B6", label: "SSE Stream", border: "rgba(236,72,153,0.3)" };
      case "gRPC-Web":
        return { bg: "rgba(14,165,233,0.12)", color: "#38BDF8", label: "gRPC-Web", border: "rgba(14,165,233,0.3)" };
      case "WebHook":
        return { bg: "rgba(245,158,11,0.12)", color: "#FBBF24", label: "WebHook", border: "rgba(245,158,11,0.3)" };
      case "SOAP API":
        return { bg: "rgba(167,139,250,0.12)", color: "#A78BFA", label: "SOAP API", border: "rgba(167,139,250,0.3)" };
      case "Web Page":
        return { bg: "rgba(148,163,184,0.08)", color: "#94A3B8", label: "Web Page", border: "rgba(148,163,184,0.18)" };
      case "Sitemap":
        return { bg: "rgba(249,115,22,0.12)", color: "#F97316", label: "Sitemap", border: "rgba(249,115,22,0.3)" };
      case "Static Asset":
        return { bg: "rgba(51,65,85,0.3)", color: "#CBD5E1", label: "Static Asset", border: "rgba(51,65,85,0.4)" };
      default:
        return { bg: "rgba(52,211,153,0.12)", color: "#34D399", label: "REST API", border: "rgba(52,211,153,0.3)" };
    }
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Header Title & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {selectedTargetHost && (
              <button
                onClick={() => setSelectedTargetHost(null)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94A3B8",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowLeft size={14} /> Back to Website Targets
              </button>
            )}
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#FFF", letterSpacing: "0.5px", margin: 0 }}>
              {selectedTargetHost ? `API Catalog: ${selectedTargetHost}` : "API Inventory & Asset Catalog"}
            </h2>
          </div>
          <p style={{ color: "#64748B", fontSize: "13px", margin: "4px 0 0 0" }}>
            {selectedTargetHost
              ? `Displaying discovered endpoints for ${selectedTargetHost}`
              : "Scanned Website Target Directory — Grouped by Target Host"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFF",
              padding: "9px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Upload size={15} color="#F97316" /> Import Spec
          </button>

          <button
            onClick={handleExportOpenApi}
            style={{
              background: "linear-gradient(135deg, #F97316, #EA580C)",
              border: "none",
              color: "#FFF",
              padding: "9px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 15px rgba(249, 115, 22, 0.3)",
            }}
          >
            <Download size={15} /> Export OpenAPI 3.0
          </button>
        </div>
      </div>

      {/* Target Discovery Scanner Bar */}
      <form
        onSubmit={handleScanTargetSubmit}
        style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(3,7,18,0.98))",
          border: "1px solid rgba(249,115,22,0.25)",
          borderRadius: "18px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4), inset 0 0 20px rgba(249,115,22,0.04)",
        }}
      >
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={22} color="#F97316" />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "11px", fontWeight: "900", color: "#F97316", textTransform: "uppercase", letterSpacing: "0.8px" }}>
            Direct Target Endpoint Discovery Scanner
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#030712",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              padding: "10px 14px",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <Globe size={16} color="#94A3B8" />
            <input
              type="url"
              value={targetUrlInput}
              onChange={(e) => setTargetUrlInput(e.target.value)}
              placeholder="Enter website URL to scan (e.g. https://api.target.com)..."
              disabled={scanningTarget}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                fontSize: "13.5px",
                fontWeight: "600",
                fontFamily: "monospace",
                outline: "none",
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={scanningTarget}
          className="queue-card-hover"
          style={{
            background: "linear-gradient(135deg, #F97316, #EA580C)",
            border: "none",
            color: "#FFF",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "900",
            cursor: scanningTarget ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
            alignSelf: "flex-end",
            boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
          }}
        >
          {scanningTarget ? (
            <>
              <RefreshCw size={15} style={{ animation: "spin 1.5s linear infinite" }} /> Scanning JS & APIs...
            </>
          ) : (
            <>
              <Play size={15} fill="currentColor" /> Scan & Ingest
            </>
          )}
        </button>
      </form>

      {/* KPI Stats HUD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Total Discovered APIs</span>
            <Globe size={18} color="#3B82F6" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#FFF", marginTop: "8px" }}>
            {stats ? stats.totalEndpoints : "—"}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            Auto-synced from scanner telemetry
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Shadow APIs Detected</span>
            <Ghost size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#EF4444", marginTop: "8px" }}>
            {stats ? stats.shadowApis : "—"}
          </div>
          <div style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontWeight: "600" }}>
            Undocumented endpoints exposed
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Public / Unauthenticated</span>
            <Lock size={18} color="#EAB308" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#EAB308", marginTop: "8px" }}>
            {stats ? `${stats.publicPercent}%` : "—"}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            {stats ? `${stats.publicUnauthenticated} public endpoints` : "—"}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>High / Critical Risk</span>
            <ShieldAlert size={18} color="#F97316" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#F97316", marginTop: "8px" }}>
            {stats ? stats.highRiskTotal : "—"}
          </div>
          <div style={{ fontSize: "11px", color: "#F97316", marginTop: "4px", fontWeight: "600" }}>
            {stats ? `${stats.piiEndpointsCount} endpoints handle PII` : "—"}
          </div>
        </div>

      </div>

      {/* Domain-First Hierarchy: Target Website Cards Grid */}
      {!selectedTargetHost ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
              Scanned Target Websites ({targets.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
              <RefreshCw size={24} style={{ animation: "spin 1.5s linear infinite", margin: "0 auto 8px auto" }} />
              Loading target website inventory...
            </div>
          ) : targets.length === 0 ? (
            <div style={{ background: "#090F1B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "50px 20px", textAlign: "center", color: "#64748B" }}>
              <Globe size={36} color="#334155" style={{ margin: "0 auto 12px auto" }} />
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#94A3B8" }}>No Scanned Targets Yet</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>Run a scan from the Scanner page or enter a target URL above to discover APIs.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {targets.map((target) => (
                <div
                  key={target.host}
                  onClick={() => {
                    setSelectedTargetHost(target.host);
                    setActiveFilter("Verified APIs Only");
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  style={{
                    background: "#090F1B",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(249, 115, 22, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <WebsiteFavicon host={target.host} />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: "#F8FAFC", fontFamily: "monospace" }}>
                          {target.host}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                          Scanned {new Date(target.lastScannedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "16px" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "8px 10px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "700" }}>APIs</div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>{target.totalEndpoints}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "8px 10px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "700" }}>Shadow</div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: target.shadowApisCount > 0 ? "#EF4444" : "#10B981" }}>{target.shadowApisCount}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "8px 10px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "700" }}>PII Handling</div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#F97316" }}>{target.piiCount}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "14px", color: "#F97316", fontSize: "12px", fontWeight: "800", gap: "4px" }}>
                    View API Catalog <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Endpoint View for Selected Target */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Target Host Telemetry Bar */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(9, 15, 27, 0.9) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              borderRadius: "16px",
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Globe size={22} color="#F97316" />
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#F97316", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Selected Target Telemetry
                </div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#F8FAFC", fontFamily: "monospace" }}>
                  {selectedTargetHost}
                </div>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 14px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "800", textTransform: "uppercase" }}>Discovered</div>
                <div style={{ fontSize: "15px", fontWeight: "900", color: "#38BDF8" }}>{stats?.totalEndpoints || pagination.total || 0}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 14px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "800", textTransform: "uppercase" }}>REST APIs</div>
                <div style={{ fontSize: "15px", fontWeight: "900", color: "#34D399" }}>{endpoints.filter(e => e.isVerifiedApi).length || pagination.total || 0}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 14px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "800", textTransform: "uppercase" }}>Shadow APIs</div>
                <div style={{ fontSize: "15px", fontWeight: "900", color: "#EF4444" }}>{stats?.shadowApis || 0}</div>
              </div>

              <button
                onClick={() => setSelectedTargetHost(null)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#94A3B8",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <ArrowLeft size={14} /> Back to Targets Grid
              </button>
            </div>
          </div>
          
          {/* Filter & Search Toolbar */}
          <div
            style={{
              display: "flex",
              justify: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              padding: "14px 18px",
              borderRadius: "14px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { name: "Verified APIs Only", label: "Verified APIs Only" },
                { name: "ALL", label: "ALL" },
                { name: "REST API", label: "REST API" },
                { name: "GraphQL", label: "GraphQL" },
                { name: "WebSocket", label: "WebSocket" },
                { name: "SSE Stream", label: "SSE Stream" },
                { name: "gRPC-Web", label: "gRPC-Web" },
                { name: "WebHook", label: "WebHook" },
                { name: "SOAP API", label: "SOAP API" },
                { name: "Web Page", label: "Web Page" },
                { name: "Sitemap", label: "Sitemap" },
                { name: "Shadow APIs", label: "Shadow APIs" },
                { name: "High Risk", label: "High Risk" },
              ].map((pill) => {
                const active = activeFilter === pill.name;
                return (
                  <button
                    key={pill.name}
                    onClick={() => {
                      setActiveFilter(pill.name);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    style={{
                      background: active
                        ? "rgba(249, 115, 22, 0.2)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${active ? "#F97316" : "rgba(255, 255, 255, 0.08)"}`,
                      color: active ? "#F97316" : "#94A3B8",
                      boxShadow: "none",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div style={{ position: "relative", width: "290px" }}>
              <Search size={14} color="#64748B" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search path, params, tags..."
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "8px 12px 8px 36px",
                  color: "#FFF",
                  fontSize: "12px",
                  outline: "none",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
                }}
              />
            </div>

          </div>

          {/* Main Endpoints Data Table */}
          <div style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(12px)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 35px rgba(0,0,0,0.4)" }}>
            
            {loading ? (
              <div style={{ padding: "50px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
                <RefreshCw size={26} style={{ animation: "spin 1.5s linear infinite", margin: "0 auto 10px auto" }} />
                Fetching endpoint catalog for {selectedTargetHost}...
              </div>
            ) : endpoints.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
                <Layers size={40} color="#334155" style={{ margin: "0 auto 12px auto" }} />
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#94A3B8" }}>No Endpoints Match Filter</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Try clearing search or selecting a different filter pill.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.025)", color: "#64748B", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      <th style={{ padding: "16px 20px" }}>Method</th>
                      <th style={{ padding: "16px 20px" }}>Endpoint Path</th>
                      <th style={{ padding: "16px 20px" }}>Resource Type</th>
                      <th style={{ padding: "16px 20px" }}>Confidence</th>
                      <th style={{ padding: "16px 20px" }}>Auth Scheme</th>
                      <th style={{ padding: "16px 20px" }}>Sensitivity</th>
                      <th style={{ padding: "16px 20px" }}>Risk Tier</th>
                      <th style={{ padding: "16px 20px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((ep) => {
                      const mStyle = getMethodStyle(ep.method);
                      const rStyle = getRiskStyle(ep.riskScore);
                      const resBadge = getResourceTypeBadge(ep.resourceType || "REST API", ep.isVerifiedApi);
                      const confidence = ep.confidenceScore || (ep.isVerifiedApi ? 95 : 60);

                      return (
                        <tr
                          key={ep._id}
                          onClick={() => setSelectedEndpoint(ep)}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Method */}
                          <td style={{ padding: "16px 20px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "900",
                                color: mStyle.color,
                                background: mStyle.bg,
                                border: `1px solid ${mStyle.border}`,
                                boxShadow: mStyle.shadow,
                                padding: "4px 10px",
                                borderRadius: "7px",
                                letterSpacing: "0.5px",
                                display: "inline-block",
                              }}
                            >
                              {ep.method}
                            </span>
                          </td>

                          {/* Path & Host */}
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ fontFamily: "monospace", fontWeight: "700", color: "#F8FAFC", fontSize: "13.5px", letterSpacing: "0.2px" }}>
                              {ep.path}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace", marginTop: "3px", display: "flex", gap: "6px", alignItems: "center" }}>
                              <span>{ep.host}</span>
                              {ep.detectedBy && ep.detectedBy.length > 0 && (
                                <span style={{ color: "#38BDF8", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>
                                  ✓ {ep.detectedBy.join(", ")}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Resource Type */}
                          <td style={{ padding: "16px 20px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "800",
                                color: resBadge.color,
                                background: resBadge.bg,
                                border: `1px solid ${resBadge.border}`,
                                padding: "5px 10px",
                                borderRadius: "7px",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                              }}
                            >
                              {resBadge.label}
                            </span>
                          </td>

                          {/* Confidence Score */}
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "48px", background: "rgba(255,255,255,0.06)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                                <div
                                  style={{
                                    width: `${confidence}%`,
                                    height: "100%",
                                    background: confidence >= 90 ? "linear-gradient(90deg, #10B981, #34D399)" : confidence >= 75 ? "linear-gradient(90deg, #3B82F6, #60A5FA)" : "#EAB308",
                                    boxShadow: "0 0 8px rgba(52,211,153,0.4)",
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: "11.5px", fontWeight: "900", color: confidence >= 90 ? "#34D399" : "#FBBF24" }}>
                                {confidence}%
                              </span>
                            </div>
                          </td>

                          {/* Auth Scheme */}
                          <td style={{ padding: "16px 20px", color: "#CBD5E1", fontSize: "12px", fontWeight: "700" }}>
                            {ep.authType === "Public / Unauthenticated" ? (
                              <span style={{ color: "#EAB308", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)", padding: "4px 9px", borderRadius: "6px" }}>
                                Public
                              </span>
                            ) : (
                              <span style={{ color: "#34D399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", padding: "4px 9px", borderRadius: "6px" }}>
                                {ep.authType}
                              </span>
                            )}
                          </td>

                          {/* Sensitivity */}
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                              {(ep.dataSensitivity || ["Public"]).map((tag, i) => (
                                <span key={i} style={{ fontSize: "10px", fontWeight: "800", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", color: "#F97316", padding: "2px 7px", borderRadius: "5px" }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Risk Tier */}
                          <td style={{ padding: "16px 20px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "900", color: rStyle.color, background: rStyle.bg, border: `1px solid ${rStyle.border}`, padding: "4px 9px", borderRadius: "6px", letterSpacing: "0.5px" }}>
                              {ep.riskScore?.toUpperCase() || "LOW"}
                            </span>
                          </td>

                          {/* Action */}
                          <td style={{ padding: "16px 20px", textAlign: "right" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEndpoint(ep);
                              }}
                              style={{
                                background: "rgba(249, 115, 22, 0.12)",
                                border: "1px solid rgba(249, 115, 22, 0.35)",
                                color: "#F97316",
                                padding: "7px 14px",
                                borderRadius: "8px",
                                fontSize: "11.5px",
                                fontWeight: "800",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "all 0.2s ease",
                                boxShadow: "none",
                              }}
                            >
                              Inspect <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: "14px" }}>
              <div style={{ fontSize: "12.5px", color: "#94A3B8", fontWeight: "600" }}>
                Showing <strong style={{ color: "#FFF" }}>{pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</strong> to <strong style={{ color: "#FFF" }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong style={{ color: "#F97316" }}>{pagination.total.toLocaleString()}</strong> Endpoints
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Page Size Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94A3B8" }}>
                  <span>Show:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                    style={{
                      background: "#030712",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#FFF",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value={15}>15 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                    <option value={250}>250 per page</option>
                    <option value={500}>500 per page</option>
                    <option value={5000}>ALL (Show 5,000)</option>
                  </select>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: 1 }))}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: pagination.page <= 1 ? "#475569" : "#FFF",
                      padding: "6px 11px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    « First
                  </button>

                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: pagination.page <= 1 ? "#475569" : "#FFF",
                      padding: "6px 13px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ‹ Prev
                  </button>

                  <span style={{ fontSize: "12px", color: "#F97316", fontWeight: "900", padding: "0 8px" }}>
                    Page {pagination.page} of {pagination.pages || 1}
                  </span>

                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: pagination.page >= pagination.pages ? "#475569" : "#FFF",
                      padding: "6px 13px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next ›
                  </button>

                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.pages }))}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: pagination.page >= pagination.pages ? "#475569" : "#FFF",
                      padding: "6px 11px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer",
                    }}
                  >
                    Last »
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      <SpecImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchInventoryData}
      />

      <EndpointInspectorDrawer
        endpoint={selectedEndpoint}
        onClose={() => setSelectedEndpoint(null)}
        onUpdateSuccess={fetchInventoryData}
      />

    </div>
  );
}
