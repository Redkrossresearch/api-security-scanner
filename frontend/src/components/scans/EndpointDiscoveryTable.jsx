import { Search, ChevronDown, CheckCircle2 } from "lucide-react";

export default function EndpointDiscoveryTable({ scan, scanStatus }) {
  const isCompleted = scan?.status === "completed";
  const rawFindings = (isCompleted && scan?.vulnerabilities) || [];
  const inventoryFinding = rawFindings.find(f => f.category === "API Inventory" || f.title === "API Inventory Analysis");

  let endpointsList = [];
  if (inventoryFinding && inventoryFinding.inventory && inventoryFinding.inventory.endpoints) {
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
    {
      method: "GET",
      endpoint: "/api/users",
      status: "200",
      source: "Swagger",
    },
    {
      method: "POST",
      endpoint: "/api/auth/login",
      status: "200",
      source: "Swagger",
    },
    {
      method: "POST",
      endpoint: "/api/auth/register",
      status: "201",
      source: "Swagger",
    },
    {
      method: "GET",
      endpoint: "/api/profile",
      status: "200",
      source: "Crawled",
    },
    {
      method: "PUT",
      endpoint: "/api/profile",
      status: "200",
      source: "Crawled",
    },
    {
      method: "DELETE",
      endpoint: "/api/account",
      status: "204",
      source: "Crawled",
    },
    {
      method: "GET",
      endpoint: "/api/orders",
      status: "200",
      source: "Crawled",
    },
    {
      method: "POST",
      endpoint: "/api/orders",
      status: "201",
      source: "Crawled",
    },
  ];

  const endpoints = endpointsList.length > 0 ? endpointsList : defaultEndpoints;

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
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#FFFFFF",
            fontSize: "18px",
            fontWeight: "900",
            letterSpacing: "0.5px",
          }}
        >
          Endpoint Discovery
        </h3>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          {/* Filter */}
          <button className="table-filter-btn">
            All Methods
            <ChevronDown size={12} />
          </button>

          {/* Search */}
          <div className="table-search-glow">
            <Search size={14} color="#64748B" />
            <input
              placeholder="Search endpoints..."
              style={{
                flex: 1,
                marginLeft: "6px",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: "12.5px",
                fontWeight: "500",
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "4px",
        }}
        className="custom-scrollable-body"
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th className="table-header-col">METHOD</th>
              <th className="table-header-col">ENDPOINT</th>
              <th className="table-header-col">STATUS</th>
              <th className="table-header-col">SOURCE</th>
            </tr>
          </thead>

          <tbody>
            {endpoints.map((item, index) => {
              const styles = methodStyles(item.method);
              return (
                <tr
                  key={index}
                  className="table-row-glow"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,.03)",
                  }}
                >
                  <td style={{ padding: "12px 0" }}>
                    <span
                      style={{
                        color: styles.color,
                        background: styles.bg,
                        border: styles.border,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontWeight: "800",
                        fontSize: "10px",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.method}
                    </span>
                  </td>

                  <td
                    style={{
                      color: "#E2E8F0",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {item.endpoint}
                  </td>

                  <td>
                    <span
                      style={{
                        color: "#10B981",
                        fontWeight: "800",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ display: "inline-block", width: "4px", height: "4px", borderRadius: "50%", background: "#10B981" }} />
                      {item.status}
                    </span>
                  </td>

                  <td
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {item.source}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <span
          style={{
            color: "#F97316",
            fontSize: "12.5px",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.22s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#FF8A2E"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#F97316"; }}
        >
          View all endpoints →
        </span>
      </div>

      <style>{`
        .table-filter-btn {
          height: 34px;
          background: rgba(3, 6, 14, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.04);
          color: #94A3B8;
          border-radius: 8px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.22s ease;
        }

        .table-filter-btn:hover {
          color: #F8FAFC;
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .table-search-glow {
          width: 170px;
          height: 34px;
          background: rgba(3, 6, 14, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          transition: all 0.22s ease;
        }

        .table-search-glow:focus-within {
          border-color: rgba(249, 115, 22, 0.35);
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.1);
          background: rgba(3, 6, 14, 0.85);
        }

        .table-header-col {
          text-align: left;
          color: #64748B;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding-bottom: 12px;
        }

        .table-row-glow {
          transition: all 0.22s ease;
        }

        .table-row-glow:hover {
          background: rgba(255, 255, 255, 0.012);
        }

        .custom-scrollable-body::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollable-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollable-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 99px;
        }

        .custom-scrollable-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
}
