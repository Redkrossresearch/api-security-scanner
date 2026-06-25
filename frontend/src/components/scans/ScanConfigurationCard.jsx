import {
  Globe,
  Upload,
  FileJson,
  Terminal,
  Settings,
} from "lucide-react";

export default function ScanConfigurationCard() {
  return (
    <div
      style={{
        background: "#071126",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
          gap: "16px",
          alignItems: "end",
        }}
      >
        {/* Target URL */}

        <div>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            Target API URL
          </div>

          <div
            style={{
              height: "54px",
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: "10px",
            }}
          >
            <Globe
              size={18}
              color="#94A3B8"
            />

            <input
              defaultValue="https://api.example.com"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: "14px",
              }}
            />
          </div>
        </div>

        {/* Scan Profile */}

        <div>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            Scan Profile
          </div>

          <select
            style={{
              width: "100%",
              height: "54px",
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "14px",
              color: "#FFFFFF",
              padding: "0 12px",
            }}
          >
            <option>Full Security Scan</option>
            <option>Quick Scan</option>
            <option>OWASP API Top 10</option>
          </select>
        </div>

        {/* Auth */}

        <div>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            Authentication
          </div>

          <select
            style={{
              width: "100%",
              height: "54px",
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "14px",
              color: "#FFFFFF",
              padding: "0 12px",
            }}
          >
            <option>Bearer Token</option>
            <option>API Key</option>
            <option>Basic Auth</option>
            <option>OAuth2</option>
          </select>
        </div>

        {/* Token */}

        <div>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            Token
          </div>

          <input
            type="password"
            defaultValue="eyJhbGciOiJIUzI1Ni..."
            style={{
              width: "100%",
              height: "54px",
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "14px",
              color: "#FFFFFF",
              padding: "0 12px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Settings */}

        <button
          style={{
            height: "54px",
            padding: "0 18px",
            borderRadius: "14px",
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.08)",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Import Buttons */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          style={buttonStyle}
        >
          <FileJson size={16} />
          Import Swagger/OpenAPI
        </button>

        <button
          style={buttonStyle}
        >
          <Upload size={16} />
          Import Postman Collection
        </button>

        <button
          style={buttonStyle}
        >
          <Terminal size={16} />
          Import cURL
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  height: "42px",
  padding: "0 16px",
  borderRadius: "12px",
  background: "#0B1220",
  border: "1px solid rgba(255,255,255,.08)",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
};