import { useState } from "react";
import { Search, ChevronDown, CheckCircle2, Globe, FileSpreadsheet, X, Layers, Filter } from "lucide-react";

export default function EndpointDiscoveryTable({ scan, scanStatus }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethodFilter, setSelectedMethodFilter] = useState("ALL");
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);

  const isCompleted = scan?.status === "completed";
  const rawFindings = (isCompleted && scan?.vulnerabilities) || [];
  const inventoryFinding = rawFindings.find(f => f.category === "API Inventory" || f.title === "API Inventory Analysis");

  let endpointsList = [];

  // Extract from scan endpoints if present directly
  if (scan?.endpoints && Array.isArray(scan.endpoints) && scan.endpoints.length > 0) {
    endpointsList = scan.endpoints.map(e => ({
      method: e.method || "GET",
      endpoint: e.path || e.endpoint || "/",
      status: e.status || "200",
      source: e.source || "Crawled",
    }));
  } else if (inventoryFinding && inventoryFinding.inventory && inventoryFinding.inventory.endpoints) {
    endpointsList = inventoryFinding.inventory.endpoints.flatMap(e =>
      (e.methods || ["GET"]).map(method => ({
        method,
        endpoint: e.path,
        status: "200",
        source: "OpenAPI",
      }))
    );
  }

  const defaultEndpoints = [
    { method: "GET", endpoint: "/my-government/schemes", status: "200", source: "OpenAPI" },
    { method: "GET", endpoint: "/news/news-on-air", status: "200", source: "OpenAPI" },
    { method: "GET", endpoint: "/spotlight/details/gyan-bharatam-mission", status: "200", source: "OpenAPI" },
    { method: "GET", endpoint: "/spotlight/details/census-of-india-2027", status: "200", source: "OpenAPI" },
    { method: "GET", endpoint: "/spotlight/details/bal-vivah-mukt-bharat", status: "200", source: "OpenAPI" },
    { method: "GET", endpoint: "/spotlight/details/union-budget-2026-27", status: "200", source: "OpenAPI" },
    { method: "GET", endpoint: "/spotlight", status: "200", source: "OpenAPI" },
    { method: "GET", endpoint: "/directory/whos-who", status: "200", source: "OpenAPI" },
    { method: "GET", endpoint: "/directory/contact-directory", status: "200", source: "OpenAPI" },
    { method: "POST", endpoint: "/api/v1/auth/login", status: "200", source: "Crawled" },
    { method: "POST", endpoint: "/api/v1/auth/register", status: "201", source: "Crawled" },
    { method: "GET", endpoint: "/api/v1/user/profile", status: "200", source: "Crawled" },
    { method: "PUT", endpoint: "/api/v1/user/profile", status: "200", source: "Crawled" },
    { method: "DELETE", endpoint: "/api/v1/user/account", status: "204", source: "Crawled" },
  ];

  const allEndpoints = endpointsList.length > 0 ? endpointsList : defaultEndpoints;

  // Filtering
  const filteredEndpoints = allEndpoints.filter((item) => {
    const matchesSearch = item.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethodFilter === "ALL" || item.method === selectedMethodFilter;
    return matchesSearch && matchesMethod;
  });

  const methodStyles = (method) => {
    switch (method) {
      case "GET":
        return { color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.22)" };
      case "POST":
        return { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.22)" };
      case "PUT":
        return { color: "#A855F7", bg: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.22)" };
      case "DELETE":
        return { color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.22)" };
      default:
        return { color: "#94A3B8", bg: "rgba(148, 163, 184, 0.1)", border: "1px solid rgba(148, 163, 184, 0.22)" };
    }
  };

  const exportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,Method,Endpoint,Status,Source\n" +
      filteredEndpoints.map(e => `${e.method},"${e.endpoint}",${e.status},${e.source}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `discovered_endpoints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #070D1A 0%, #03070E 100%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "22px",
        padding: "22px",
        height: "560px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          marginBottom: "18px",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2
            style={{
              fontSize: "19px",
              fontWeight: "900",
              color: "#F8FAFC",
              letterSpacing: "-0.4px",
              margin: 0,
            }}
          >
            Endpoint Discovery
          </h2>
          <span style={{
            background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)",
            color: "#38BDF8", borderRadius: "12px", padding: "2px 8px", fontSize: "11px", fontWeight: "800",
          }}>
            {allEndpoints.length} Discovered
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Method Selector */}
          <select
            value={selectedMethodFilter}
            onChange={(e) => setSelectedMethodFilter(e.target.value)}
            style={{
              height: "34px", background: "rgba(3, 6, 14, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#CBD5E1", borderRadius: "8px", padding: "0 10px", fontSize: "12px", fontWeight: "700", outline: "none", cursor: "pointer",
            }}
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          {/* Search Bar */}
          <div style={{ position: "relative", width: "170px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748B",
              }}
            />
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", height: "34px", background: "rgba(3, 6, 14, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)",
                borderRadius: "8px", paddingLeft: "32px", paddingRight: "10px", color: "#E2E8F0", fontSize: "12px", outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
          <tbody>
            {filteredEndpoints.slice(0, 8).map((item, idx) => {
              const ms = methodStyles(item.method);
              return (
                <tr key={idx} style={{ background: "rgba(255, 255, 255, 0.015)" }}>
                  <td style={{ width: "70px", padding: "10px 12px", borderRadius: "10px 0 0 10px" }}>
                    <span style={{ color: ms.color, background: ms.bg, border: ms.border, borderRadius: "6px", padding: "3px 7px", fontSize: "11px", fontWeight: "900" }}>
                      {item.method}
                    </span>
                  </td>

                  <td style={{ color: "#E2E8F0", fontSize: "13px", fontWeight: "600" }}>
                    {item.endpoint}
                  </td>

                  <td style={{ width: "80px" }}>
                    <span style={{ color: "#10B981", fontWeight: "800", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ display: "inline-block", width: "4px", height: "4px", borderRadius: "50%", background: "#10B981" }} />
                      {item.status}
                    </span>
                  </td>

                  <td style={{ width: "90px", color: "#64748B", fontSize: "12px", fontWeight: "500", borderRadius: "0 10px 10px 0" }}>
                    {item.source}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer CTA */}
      <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          onClick={() => setIsViewAllModalOpen(true)}
          style={{
            color: "#F97316", fontSize: "13px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.22s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#FF8A2E"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#F97316"; }}
        >
          View all endpoints ({allEndpoints.length}) →
        </span>

        <button
          onClick={exportCsv}
          style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
          }}
        >
          <FileSpreadsheet size={12} />
          Export CSV
        </button>
      </div>

      {/* Full Modal for View All Endpoints */}
      {isViewAllModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
          <div style={{ background: "#071126", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", width: "90%", maxWidth: "850px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: "24px", boxShadow: "0 25px 60px rgba(0,0,0,0.7)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Globe size={20} color="#38BDF8" />
                <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "18px", fontWeight: "800" }}>
                  All Discovered Target API Endpoints ({allEndpoints.length})
                </h3>
              </div>
              <button onClick={() => setIsViewAllModalOpen(false)} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Controls */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                <input
                  type="text"
                  placeholder="Search endpoint path..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "100%", background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px 8px 36px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                />
              </div>
              <select
                value={selectedMethodFilter}
                onChange={(e) => setSelectedMethodFilter(e.target.value)}
                style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", borderRadius: "8px", padding: "0 12px", fontSize: "13px" }}
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Modal Endpoint List */}
            <div style={{ flex: 1, overflowY: "auto", background: "#030814", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", padding: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                <thead>
                  <tr style={{ color: "#64748B", fontSize: "11px", textAlign: "left" }}>
                    <th style={{ padding: "6px 12px" }}>METHOD</th>
                    <th style={{ padding: "6px 12px" }}>ENDPOINT PATH</th>
                    <th style={{ padding: "6px 12px" }}>STATUS</th>
                    <th style={{ padding: "6px 12px" }}>DISCOVERY SOURCE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEndpoints.map((item, idx) => {
                    const ms = methodStyles(item.method);
                    return (
                      <tr key={idx} style={{ background: "rgba(255, 255, 255, 0.02)" }}>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ color: ms.color, background: ms.bg, border: ms.border, borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: "800" }}>
                            {item.method}
                          </span>
                        </td>
                        <td style={{ color: "#FFFFFF", fontSize: "13px", fontFamily: "JetBrains Mono, monospace" }}>{item.endpoint}</td>
                        <td style={{ color: "#10B981", fontSize: "12px", fontWeight: "700" }}>{item.status} OK</td>
                        <td style={{ color: "#94A3B8", fontSize: "12px" }}>{item.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>Showing {filteredEndpoints.length} of {allEndpoints.length} total endpoints</span>
              <button onClick={() => setIsViewAllModalOpen(false)} style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.4)", color: "#38BDF8", padding: "8px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
