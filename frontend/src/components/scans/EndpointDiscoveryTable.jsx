import { Search, ChevronDown } from "lucide-react";

export default function EndpointDiscoveryTable() {
  const endpoints = [
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

  const methodColor = (method) => {
    switch (method) {
      case "GET":
        return "#22C55E";
      case "POST":
        return "#F59E0B";
      case "PUT":
        return "#A855F7";
      case "DELETE":
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  return (
    <div
      style={{
        background: "#071126",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "20px",
        height: "560px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#FFFFFF",
            fontSize: "22px",
            fontWeight: "700",
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

          <button
            style={{
              height: "38px",
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.08)",
              color: "#CBD5E1",
              borderRadius: "10px",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            All Methods
            <ChevronDown size={14} />
          </button>

          {/* Search */}

          <div
            style={{
              width: "220px",
              height: "38px",
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
            }}
          >
            <Search size={15} color="#94A3B8" />

            <input
              placeholder="Search endpoints..."
              style={{
                flex: 1,
                marginLeft: "8px",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
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
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  color: "#64748B",
                  fontSize: "12px",
                  paddingBottom: "12px",
                }}
              >
                METHOD
              </th>

              <th
                style={{
                  textAlign: "left",
                  color: "#64748B",
                  fontSize: "12px",
                  paddingBottom: "12px",
                }}
              >
                ENDPOINT
              </th>

              <th
                style={{
                  textAlign: "left",
                  color: "#64748B",
                  fontSize: "12px",
                  paddingBottom: "12px",
                }}
              >
                STATUS
              </th>

              <th
                style={{
                  textAlign: "left",
                  color: "#64748B",
                  fontSize: "12px",
                  paddingBottom: "12px",
                }}
              >
                SOURCE
              </th>
            </tr>
          </thead>

          <tbody>
            {endpoints.map((item, index) => (
              <tr
                key={index}
                style={{
                  borderTop: "1px solid rgba(255,255,255,.05)",
                }}
              >
                <td
                  style={{
                    padding: "12px 0",
                  }}
                >
                  <span
                    style={{
                      color: methodColor(item.method),
                      fontWeight: "700",
                      fontSize: "13px",
                    }}
                  >
                    {item.method}
                  </span>
                </td>

                <td
                  style={{
                    color: "#E2E8F0",
                    fontSize: "14px",
                  }}
                >
                  {item.endpoint}
                </td>

                <td>
                  <span
                    style={{
                      color: "#22C55E",
                      fontWeight: "700",
                      fontSize: "13px",
                    }}
                  >
                    {item.status}
                  </span>
                </td>

                <td
                  style={{
                    color: "#94A3B8",
                    fontSize: "13px",
                  }}
                >
                  {item.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}

      <div
        style={{
          marginTop: "12px",
        }}
      >
        <span
          style={{
            color: "#8B5CF6",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          View all endpoints →
        </span>
      </div>
    </div>
  );
}
