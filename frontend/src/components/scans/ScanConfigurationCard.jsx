import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Globe,
  Upload,
  FileJson,
  Terminal,
  Settings,
  Play,
  Sliders,
} from "lucide-react";

export default function ScanConfigurationCard({ url, setUrl, onStartScan, isScanning }) {
  const swaggerRef = useRef(null);
  const postmanRef = useRef(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [maxDepth, setMaxDepth] = useState(15);
  const [timeoutSecs, setTimeoutSecs] = useState(5);
  const [intensity, setIntensity] = useState("Moderate");

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
    <div className="sci-fi-config-card">
      {/* Moving background glow effect */}
      <div className="sci-fi-glow-overlay" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px, 2.2fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) auto auto",
          gap: "18px",
          alignItems: "end",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Target URL */}
        <div>
          <div className="sci-fi-label">
            Target API URL
            {url && <span className="active-signal-dot" />}
          </div>

          <div className="sci-fi-input-wrapper">
            <Globe
              size={15}
              className={`sci-fi-globe-icon ${url ? "pulse-globe" : ""}`}
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
                fontSize: "13.5px",
                fontWeight: "600",
                fontFamily: "monospace",
              }}
            />
          </div>
        </div>

        {/* Scan Profile */}
        <div>
          <div className="sci-fi-label">Scan Profile</div>
          <select
            disabled={isScanning}
            className="sci-fi-select"
          >
            <option>Full Security Scan</option>
            <option>Quick Scan</option>
            <option>OWASP API Top 10</option>
          </select>
        </div>

        {/* Auth */}
        <div>
          <div className="sci-fi-label">Authentication</div>
          <select
            disabled={isScanning}
            className="sci-fi-select"
          >
            <option>Bearer Token</option>
            <option>API Key</option>
            <option>Basic Auth</option>
            <option>OAuth2</option>
          </select>
        </div>

        {/* Token */}
        <div>
          <div className="sci-fi-label">Token</div>
          <input
            type="password"
            defaultValue="eyJhbGciOiJIUzI1Ni..."
            disabled={isScanning}
            className="sci-fi-select"
            style={{ boxSizing: "border-box", fontFamily: "monospace" }}
          />
        </div>

        {/* Settings */}
        <button
          disabled={isScanning}
          onClick={() => setShowSettingsModal(true)}
          className="sci-fi-settings-btn"
          title="Advanced Scanner Configuration"
        >
          <Settings size={15} />
        </button>

        {/* Start Scan Button */}
        <button
          onClick={onStartScan}
          disabled={isScanning || !url}
          className={`sci-fi-scan-btn ${isScanning || !url ? "disabled" : ""}`}
        >
          {isScanning ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="spinner-border" />
              Scanning
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Play size={15} fill="currentColor" />
              Start Scan
            </span>
          )}
        </button>
      </div>

      {/* Import Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "24px",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 2,
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
          className="sci-fi-import-btn import-orange"
        >
          <FileJson size={13} />
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
          className="sci-fi-import-btn import-blue"
        >
          <Upload size={13} />
          Import Postman Collection
        </button>

        <button
          onClick={handleCurlImport}
          className="sci-fi-import-btn import-green"
        >
          <Terminal size={13} />
          Import cURL
        </button>
      </div>

      {/* ─── Advanced Settings Modal ─── */}
      {showSettingsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#071126", border: "1px solid rgba(249,115,22,0.25)", borderRadius: "24px", padding: "28px", width: "90%", maxWidth: "520px", boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(249,115,22,0.1)" }}>
            <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "19px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <Sliders size={18} color="#F97316" /> Advanced Scanner Config
            </h3>
            <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "8px", marginBottom: "20px" }}>Tune crawling parameters and active penetration testing payloads intensity.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Max Crawl Depth */}
              <div>
                <label style={{ display: "block", color: "#64748B", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Max Crawl Depth</label>
                <select value={maxDepth} onChange={(e) => setMaxDepth(Number(e.target.value))} className="sci-fi-select">
                  <option value={5}>5 Links (Fast Demonstration)</option>
                  <option value={15}>15 Links (Moderate Audit)</option>
                  <option value={30}>30 Links (Deep Scan)</option>
                </select>
              </div>

              {/* Request Timeout */}
              <div>
                <label style={{ display: "block", color: "#64748B", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Request Timeout (Seconds)</label>
                <select value={timeoutSecs} onChange={(e) => setTimeoutSecs(Number(e.target.value))} className="sci-fi-select">
                  <option value={2}>2 Seconds (Aggressive)</option>
                  <option value={5}>5 Seconds (Recommended)</option>
                  <option value={10}>10 Seconds (Safe/Slow Target)</option>
                </select>
              </div>

              {/* Intensity */}
              <div>
                <label style={{ display: "block", color: "#64748B", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Exploitation Intensity</label>
                <select value={intensity} onChange={(e) => setIntensity(e.target.value)} className="sci-fi-select">
                  <option value="Low">Low (Passive Checks Only)</option>
                  <option value="Moderate">Moderate (Standard Payloads)</option>
                  <option value="High">High (Deep Penetration Payloads)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "28px" }}>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8", padding: "10px 20px", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
              <button onClick={() => {
                setShowSettingsModal(false);
                toast.success("Scanner parameters successfully updated!");
              }} style={{ background: "linear-gradient(135deg, #FF7A1A, #EA580C)", border: "none", color: "#FFFFFF", padding: "10px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "13px", boxShadow: "0 4px 15px rgba(249,115,22,0.25)" }}>Save Config</button>
            </div>
          </div>
        </div>
      )}

      {/* Inject custom sci-fi styling */}
      <style>{`
        .sci-fi-config-card {
          background: linear-gradient(180deg, #050B16 0%, #02050A 100%);
          border: 1px solid rgba(249, 115, 22, 0.15);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 0 35px rgba(249, 115, 22, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.02);
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .sci-fi-config-card:hover {
          border-color: rgba(249, 115, 22, 0.28);
          box-shadow: 0 0 45px rgba(249, 115, 22, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.02);
        }

        .sci-fi-glow-overlay {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.03) 0%, transparent 60%);
          pointer-events: none;
          z-index: 1;
          animation: rotateGlow 20s linear infinite;
        }

        @keyframes rotateGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .sci-fi-label {
          color: #64748B;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .active-signal-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #F97316;
          box-shadow: 0 0 6px #F97316;
        }

        .sci-fi-input-wrapper {
          height: 46px;
          background: rgba(1, 2, 5, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          gap: 10px;
          transition: all 0.22s ease;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        }

        .sci-fi-input-wrapper:focus-within {
          border-color: rgba(249, 115, 22, 0.4);
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.12), inset 0 0 10px rgba(0,0,0,0.5);
        }

        .sci-fi-globe-icon {
          color: #64748B;
          transition: all 0.3s ease;
        }

        .sci-fi-globe-icon.pulse-globe {
          color: #F97316;
          filter: drop-shadow(0 0 5px rgba(249, 115, 22, 0.6));
          animation: pulseGlobeSignal 2s infinite ease-in-out;
        }

        @keyframes pulseGlobeSignal {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.9); opacity: 0.7; }
        }

        .sci-fi-select {
          width: 100%;
          height: 46px;
          background: rgba(1, 2, 5, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          color: #E2E8F0;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.22s ease;
          outline: none;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        }

        .sci-fi-select:focus {
          border-color: rgba(249, 115, 22, 0.4);
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.12), inset 0 0 10px rgba(0,0,0,0.5);
        }

        .sci-fi-settings-btn {
          height: 46px;
          padding: 0 14px;
          border-radius: 10px;
          background: rgba(1, 2, 5, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.04);
          color: #64748B;
          cursor: pointer;
          transition: all 0.22s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        }

        .sci-fi-settings-btn:hover {
          color: #F8FAFC;
          background: rgba(255, 255, 255, 0.015);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .sci-fi-scan-btn {
          height: 46px;
          padding: 0 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, #FF7A1A 0%, #EA580C 100%);
          border: none;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.35);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sci-fi-scan-btn:hover:not(.disabled) {
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.6);
          transform: translateY(-1.5px);
        }

        .sci-fi-scan-btn.disabled {
          background: #1E293B;
          color: #64748B;
          cursor: not-allowed;
          box-shadow: none;
        }

        .sci-fi-import-btn {
          height: 36px;
          padding: 0 14px;
          border-radius: 8px;
          background: rgba(1, 2, 5, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.03);
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.22s ease;
        }

        .sci-fi-import-btn:hover {
          color: #F8FAFC;
          background: rgba(255, 255, 255, 0.015);
        }

        .sci-fi-import-btn.import-orange:hover {
          border-color: rgba(249, 115, 22, 0.4);
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.12);
        }

        .sci-fi-import-btn.import-blue:hover {
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.12);
        }

        .sci-fi-import-btn.import-green:hover {
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.12);
        }

        .spinner-border {
          display: inline-block;
          width: 13px;
          height: 13px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}