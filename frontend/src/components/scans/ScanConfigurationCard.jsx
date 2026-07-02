import { useRef } from "react";
import toast from "react-hot-toast";
import {
  Globe,
  Upload,
  FileJson,
  Terminal,
  Settings,
} from "lucide-react";

export default function ScanConfigurationCard({ url, setUrl, onStartScan, isScanning }) {
  const swaggerRef = useRef(null);
  const postmanRef = useRef(null);

  const handleSwaggerImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let parsed = {};
        if (file.name.endsWith('.json')) {
          parsed = JSON.parse(text);
        } else {
          // Simple YAML url-extractor fallback
          const urlMatch = text.match(/url:\s*(https?:\/\/[^\s'"]+)/);
          if (urlMatch) parsed.servers = [{ url: urlMatch[1] }];
        }
        
        let targetUrl = "";
        let pathsCount = 0;
        
        if (parsed.servers && parsed.servers[0]?.url) {
          targetUrl = parsed.servers[0].url;
        } else if (parsed.host) {
          const scheme = parsed.schemes?.[0] || "https";
          const basePath = parsed.basePath || "";
          targetUrl = `${scheme}://${parsed.host}${basePath}`;
        } else {
          const urlMatch = text.match(/https?:\/\/[^\s"'`]+/);
          if (urlMatch) targetUrl = urlMatch[0];
        }
        
        if (parsed.paths) {
          pathsCount = Object.keys(parsed.paths).length;
        } else {
          pathsCount = (text.match(/\/[\w\-\{\}]+/g) || []).length;
        }
        
        if (targetUrl) {
          setUrl(targetUrl);
          toast.success(`Imported Swagger API! Target URL: ${targetUrl}${pathsCount > 0 ? ` (${pathsCount} routes)` : ""}`);
        } else {
          toast.error("Could not find a valid base URL in the Swagger specification.");
        }
      } catch (err) {
        toast.error("Failed to parse Swagger specification file.");
      }
    };
    reader.readAsText(file);
  };

  const handlePostmanImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        let targetUrl = "";
        
        const findUrl = (items) => {
          for (let item of items) {
            if (item.request?.url?.raw) return item.request.url.raw;
            if (item.item) {
              const res = findUrl(item.item);
              if (res) return res;
            }
          }
          return null;
        };
        
        if (parsed.item) {
          targetUrl = findUrl(parsed.item);
        }
        
        if (targetUrl) {
          const cleanUrl = targetUrl.split('?')[0];
          setUrl(cleanUrl);
          toast.success(`Imported Postman Collection! Target URL: ${cleanUrl}`);
        } else {
          toast.error("Could not find raw requests in the Postman collection.");
        }
      } catch (err) {
        toast.error("Failed to parse Postman collection file.");
      }
    };
    reader.readAsText(file);
  };

  const handleCurlImport = () => {
    const curl = prompt("Paste your raw cURL command here:");
    if (!curl) return;
    const urlMatch = curl.match(/(?:curl\s+)?['"]?(https?:\/\/[^\s'"]+)/);
    if (urlMatch && urlMatch[1]) {
      setUrl(urlMatch[1]);
      toast.success(`Imported cURL target URL: ${urlMatch[1]}`);
    } else {
      toast.error("Valid cURL URL could not be parsed.");
    }
  };

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
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto auto",
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
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              disabled={isScanning}
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
            disabled={isScanning}
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
            disabled={isScanning}
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
            disabled={isScanning}
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
          disabled={isScanning}
          style={{
            height: "54px",
            padding: "0 18px",
            borderRadius: "14px",
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.08)",
            color: "#FFFFFF",
            cursor: isScanning ? "not-allowed" : "pointer",
          }}
        >
          <Settings size={18} />
        </button>

        {/* Start Scan Button */}
        <button
          onClick={onStartScan}
          disabled={isScanning || !url}
          style={{
            height: "54px",
            padding: "0 24px",
            borderRadius: "14px",
            background: isScanning || !url ? "#1E293B" : "#F97316",
            border: "none",
            color: isScanning || !url ? "#64748B" : "#FFFFFF",
            fontWeight: "bold",
            cursor: isScanning || !url ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {isScanning ? "Scanning..." : "Start Scan"}
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
        <input
          type="file"
          ref={swaggerRef}
          style={{ display: "none" }}
          accept=".json,.yaml,.yml"
          onChange={handleSwaggerImport}
        />
        <button
          onClick={() => swaggerRef.current?.click()}
          style={buttonStyle}
        >
          <FileJson size={16} />
          Import Swagger/OpenAPI
        </button>

        <input
          type="file"
          ref={postmanRef}
          style={{ display: "none" }}
          accept=".json"
          onChange={handlePostmanImport}
        />
        <button
          onClick={() => postmanRef.current?.click()}
          style={buttonStyle}
        >
          <Upload size={16} />
          Import Postman Collection
        </button>

        <button
          onClick={handleCurlImport}
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