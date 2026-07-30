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
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Quick Action Target Scanner State
  const [targetUrlInput, setTargetUrlInput] = useState("");
  const [scanningTarget, setScanningTarget] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
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
        return { bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444" };
      case "high":
        return { bg: "rgba(249, 115, 22, 0.2)", color: "#F97316" };
      case "medium":
        return { bg: "rgba(234, 179, 8, 0.2)", color: "#EAB308" };
      case "low":
        return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6" };
      default:
        return { bg: "rgba(16, 185, 129, 0.2)", color: "#10B981" };
    }
  };

  const getResourceTypeBadge = (type, isVerified) => {
    switch (type) {
      case "REST API":
        return { bg: "rgba(34,197,94,0.15)", color: "#34D399", label: "🟢 REST API", border: "rgba(34,197,94,0.3)" };
      case "GraphQL":
        return { bg: "rgba(168,85,247,0.15)", color: "#C084FC", label: "🟣 GraphQL", border: "rgba(168,85,247,0.3)" };
      case "WebSocket":
        return { bg: "rgba(59,130,246,0.15)", color: "#60A5FA", label: "🔵 WebSocket", border: "rgba(59,130,246,0.3)" };
      case "SSE Stream":
        return { bg: "rgba(236,72,153,0.15)", color: "#F472B6", label: "⚡ SSE Stream", border: "rgba(236,72,153,0.3)" };
      case "gRPC-Web":
        return { bg: "rgba(14,165,233,0.15)", color: "#38BDF8", label: "⚡ gRPC-Web", border: "rgba(14,165,233,0.3)" };
      case "WebHook":
        return { bg: "rgba(245,158,11,0.15)", color: "#FBBF24", label: "🪝 WebHook", border: "rgba(245,158,11,0.3)" };
      case "SOAP API":
        return { bg: "rgba(139,92,246,0.15)", color: "#A78BFA", label: "📜 SOAP API", border: "rgba(139,92,246,0.3)" };
      case "Web Page":
        return { bg: "rgba(148,163,184,0.12)", color: "#94A3B8", label: "⚪ Web Page", border: "rgba(148,163,184,0.2)" };
      case "Sitemap":
        return { bg: "rgba(249,115,22,0.15)", color: "#F97316", label: "🟠 Sitemap", border: "rgba(249,115,22,0.3)" };
      case "Static Asset":
        return { bg: "rgba(51,65,85,0.3)", color: "#CBD5E1", label: "⚫ Static Asset", border: "rgba(51,65,85,0.4)" };
      default:
        return { bg: "rgba(234,179,8,0.15)", color: "#FBBF24", label: "🟡 Unknown", border: "rgba(234,179,8,0.3)" };
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

      {/* Direct Target Scanner Input Bar */}
      <form
        onSubmit={handleScanTargetSubmit}
        style={{
          background: "linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, rgba(9, 15, 27, 0.9) 100%)",
          border: "1px solid rgba(249, 115, 22, 0.3)",
          borderRadius: "14px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <Zap size={20} color="#F97316" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#F97316", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Direct Target Endpoint Discovery Scanner
          </div>
          <input
            type="url"
            value={targetUrlInput}
            onChange={(e) => setTargetUrlInput(e.target.value)}
            placeholder="Enter website URL to scan (e.g. https://api.target.com)..."
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#FFF",
              fontSize: "13px",
              fontWeight: "600",
              outline: "none",
              marginTop: "2px",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={scanningTarget}
          style={{
            background: "linear-gradient(135deg, #F97316, #EA580C)",
            border: "none",
            color: "#FFF",
            padding: "9px 20px",
            borderRadius: "10px",
            fontSize: "12.5px",
            fontWeight: "800",
            cursor: scanningTarget ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap",
          }}
        >
          {scanningTarget ? (
            <>
              <RefreshCw size={14} style={{ animation: "spin 1.5s linear infinite" }} /> Scanning JS & APIs...
            </>
          ) : (
            <>
              <Play size={14} /> Scan & Ingest
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
                  onClick={() => setSelectedTargetHost(target.host)}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Filter & Search Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", background: "#090F1B", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", borderRadius: "12px" }}>
            
            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["ALL", "Verified APIs Only", "REST API", "GraphQL", "WebSocket", "SSE Stream", "gRPC-Web", "WebHook", "SOAP API", "Web Page", "Sitemap", "Shadow APIs", "High Risk"].map((pill) => {
                const active = activeFilter === pill;
                return (
                  <button
                    key={pill}
                    onClick={() => {
                      setActiveFilter(pill);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    style={{
                      background: active ? "rgba(249, 115, 22, 0.18)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? "rgba(249, 115, 22, 0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: active ? "#F97316" : "#94A3B8",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div style={{ position: "relative", width: "280px" }}>
              <Search size={14} color="#64748B" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search path, params, tags..."
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "7px 12px 7px 34px",
                  color: "#FFF",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
            </div>

          </div>

          {/* Main Endpoints Data Table */}
          <div style={{ background: "#090F1B", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", overflow: "hidden" }}>
            
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
                <RefreshCw size={24} style={{ animation: "spin 1.5s linear infinite", margin: "0 auto 8px auto" }} />
                Fetching endpoint catalog for {selectedTargetHost}...
              </div>
            ) : endpoints.length === 0 ? (
              <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748B" }}>
                <Layers size={36} color="#334155" style={{ margin: "0 auto 12px auto" }} />
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#94A3B8" }}>No Endpoints Match Filter</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Try clearing search or selecting a different filter pill.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)", color: "#64748B", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                      <th style={{ padding: "14px 18px" }}>Method</th>
                      <th style={{ padding: "14px 18px" }}>Endpoint Path</th>
                      <th style={{ padding: "14px 18px" }}>Resource Type</th>
                      <th style={{ padding: "14px 18px" }}>Auth Scheme</th>
                      <th style={{ padding: "14px 18px" }}>Sensitivity</th>
                      <th style={{ padding: "14px 18px" }}>Risk Tier</th>
                      <th style={{ padding: "14px 18px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((ep) => {
                      const mStyle = getMethodStyle(ep.method);
                      const rStyle = getRiskStyle(ep.riskScore);
                      const resBadge = getResourceTypeBadge(ep.resourceType || "REST API", ep.isVerifiedApi);

                      return (
                        <tr
                          key={ep._id}
                          onClick={() => setSelectedEndpoint(ep)}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Method */}
                          <td style={{ padding: "14px 18px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "900",
                                color: mStyle.color,
                                background: mStyle.bg,
                                border: `1px solid ${mStyle.border}`,
                                padding: "3px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              {ep.method}
                            </span>
                          </td>

                          {/* Path & Host */}
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ fontFamily: "monospace", fontWeight: "700", color: "#F8FAFC", fontSize: "13px" }}>
                              {ep.path}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace", marginTop: "2px" }}>
                              {ep.host}
                            </div>
                          </td>

                          {/* Resource Type */}
                          <td style={{ padding: "14px 18px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "800",
                                color: resBadge.color,
                                background: resBadge.bg,
                                border: `1px solid ${resBadge.border}`,
                                padding: "4px 9px",
                                borderRadius: "6px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {resBadge.label}
                            </span>
                          </td>

                          {/* Auth Scheme */}
                          <td style={{ padding: "14px 18px", color: "#CBD5E1", fontSize: "12px", fontWeight: "600" }}>
                            {ep.authType === "Public / Unauthenticated" ? (
                              <span style={{ color: "#EAB308" }}>⚠️ Public</span>
                            ) : (
                              <span style={{ color: "#10B981" }}>🔒 {ep.authType}</span>
                            )}
                          </td>

                          {/* Sensitivity */}
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                              {(ep.dataSensitivity || ["Public"]).map((tag, i) => (
                                <span key={i} style={{ fontSize: "10px", fontWeight: "800", background: "rgba(249,115,22,0.12)", color: "#F97316", padding: "2px 6px", borderRadius: "4px" }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Risk Tier */}
                          <td style={{ padding: "14px 18px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "900", color: rStyle.color, background: rStyle.bg, padding: "3px 8px", borderRadius: "6px" }}>
                              {ep.riskScore || "Low"}
                            </span>
                          </td>

                          {/* Action */}
                          <td style={{ padding: "14px 18px" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEndpoint(ep);
                              }}
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "#F97316",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              Inspect <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Modals & Inspectors */}
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
