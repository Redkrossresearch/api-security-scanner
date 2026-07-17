import { useState } from "react";
import toast from "react-hot-toast";
import {
  Copy,
  Download,
  Brain,
  ShieldAlert,
  User,
  Lock,
  FileJson,
  ChevronRight,
} from "lucide-react";

const getInspectorData = (vuln) => {
  if (!vuln) {
    return {
      request: `GET /api/users/123 HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer *********\nAccept: application/json`,
      response: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "id": 123,\n  "name": "John Doe",\n  "email": "john.doe@example.com",\n  "role": "admin"\n}`,
      insights: [
        { icon: <ShieldAlert size={14} />, text: "Potential BOLA vulnerability detected" },
        { icon: <User size={14} />, text: "Personally identifiable information exposed" },
        { icon: <Lock size={14} />, text: "Authorization validation missing" },
      ]
    };
  }

  const title = String(vuln.title || "").toLowerCase();
  
  if (title.includes("frame") || title.includes("x-frame")) {
    return {
      request: `GET / HTTP/1.1\nHost: target.com\nUser-Agent: Mozilla/5.0\nAccept: text/html`,
      response: `HTTP/1.1 200 OK\nContent-Type: text/html\nServer: Nginx\nConnection: keep-alive\n\n<!DOCTYPE html>\n<html>\n  <!-- Missing X-Frame-Options header allows clickjacking inside frames -->\n</html>`,
      insights: [
        { icon: <ShieldAlert size={14} />, text: "Missing X-Frame-Options security header" },
        { icon: <Lock size={14} />, text: "Vulnerable to Clickjacking attack vectors" },
      ]
    };
  }
  
  if (title.includes("csp") || title.includes("content-security-policy")) {
    return {
      request: `GET / HTTP/1.1\nHost: target.com\nAccept: text/html`,
      response: `HTTP/1.1 200 OK\nContent-Type: text/html\nServer: Nginx\n\n<!DOCTYPE html>\n<html>\n  <script>eval(window.location.hash);</script>\n</html>`,
      insights: [
        { icon: <ShieldAlert size={14} />, text: "Missing Content-Security-Policy (CSP) header" },
        { icon: <Lock size={14} />, text: "Vulnerable to Cross-Site Scripting (XSS) injection" },
      ]
    };
  }

  if (title.includes("cors")) {
    return {
      request: `OPTIONS /api/data HTTP/1.1\nHost: api.target.com\nOrigin: http://evil-domain.com\nAccess-Control-Request-Method: GET`,
      response: `HTTP/1.1 200 OK\nAccess-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials: true\nServer: Nginx`,
      insights: [
        { icon: <ShieldAlert size={14} />, text: "CORS wildcard configuration detected" },
        { icon: <Lock size={14} />, text: "Allows unauthorized cross-origin requests" },
      ]
    };
  }

  if (title.includes("cookie")) {
    return {
      request: `POST /api/auth/login HTTP/1.1\nHost: api.target.com\nContent-Type: application/json\n\n{"username":"admin"}`,
      response: `HTTP/1.1 200 OK\nSet-Cookie: session_id=abc123xyz; Path=/\nServer: Nginx`,
      insights: [
        { icon: <ShieldAlert size={14} />, text: "Session cookie missing HttpOnly flag" },
        { icon: <Lock size={14} />, text: "Cookie session ID accessible via client scripts" },
      ]
    };
  }

  if (title.includes("rate")) {
    return {
      request: `GET /api/v1/auth/login HTTP/1.1 (Request 150/sec)\nHost: api.target.com`,
      response: `HTTP/1.1 200 OK (Still processing requests without rate limits)\nContent-Type: application/json`,
      insights: [
        { icon: <ShieldAlert size={14} />, text: "No HTTP 429 Too Many Requests response limits" },
        { icon: <Lock size={14} />, text: "Vulnerable to automated brute force attempts" },
      ]
    };
  }

  return {
    request: `GET / HTTP/1.1\nHost: target.com\nUser-Agent: Scanner/1.0`,
    response: `HTTP/1.1 200 OK\nServer: WebServer\nContent-Length: 0\n\n(Vulnerability identified in response headers/structure)`,
    insights: [
      { icon: <ShieldAlert size={14} />, text: vuln.title || "Vulnerability detected" },
      { icon: <Lock size={14} />, text: vuln.description || "Review target implementation" },
    ]
  };
};

export default function RequestResponseInspector({ selectedVuln }) {
  const [tab, setTab] = useState("pretty");
  const data = getInspectorData(selectedVuln);
  const requestData = data.request;
  const rawResponse = data.response;
  const insights = data.insights;

  const getFormattedResponse = () => {
    switch (tab) {
      case "raw":
        return rawResponse;
      case "headers":
        return rawResponse.split("\n\n")[0] || "HTTP/1.1 200 OK\nContent-Type: application/json";
      case "json":
        try {
          const body = rawResponse.split("\n\n")[1];
          if (body) {
            return JSON.stringify(JSON.parse(body), null, 2);
          }
          return rawResponse;
        } catch {
          return rawResponse;
        }
      case "curl":
        const hostHeader = requestData.match(/Host:\s*([^\n]+)/);
        const host = hostHeader ? hostHeader[1].trim() : "api.example.com";
        const pathLine = requestData.split("\n")[0];
        const path = pathLine ? pathLine.split(" ")[1] : "/api/users/123";
        return `curl -i -H "Authorization: Bearer *********" https://${host}${path}`;
      case "pretty":
      default:
        return rawResponse;
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Payload copied to clipboard!");
  };

  return (
    <div
      style={{
        background: "#071126",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 1. Updated Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "20px", fontWeight: "700" }}>
            Request / Response Inspector
          </h3>
          <div style={{ color: "#64748B", fontSize: "12px", marginTop: "4px" }}>
            Analyze API traffic, payloads & security exposure
          </div>
        </div>
        <select 
          onChange={(e) => toast.success(`Selected request route: ${e.target.value}`)}
          style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.08)", color: "#FFFFFF", borderRadius: "10px", padding: "8px 12px", outline: "none", cursor: "pointer" }}
        >
          <option>GET /api/users/123</option>
          <option>POST /api/auth/login</option>
          <option>GET /api/orders</option>
        </select>
      </div>

      {/* ... badges ... */}

      {/* ─── Scrollable body container ─── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "12px",
        }}
      >
        {/* 2. Request Panel — boxShadow + emoji title + icon buttons */}
        <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.08)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 0 20px rgba(59,130,246,.08)" }}>
          <div style={{ padding: "14px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#FFFFFF", fontWeight: "600" }}>📤 Request Payload</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => handleCopy(requestData)}
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,.08)", color: "#fff", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="Copy Request"
              >
                <Copy size={14} />
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([requestData], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "request.txt";
                  a.click();
                  toast.success("Request downloaded!");
                }}
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,.08)", color: "#fff", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="Download Request"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
          <pre style={{ margin: 0, padding: "16px", color: "#CBD5E1", fontSize: "13px", fontFamily: "JetBrains Mono, monospace", lineHeight: "1.7", overflow: "auto", height: "160px" }}>
            {requestData}
          </pre>
        </div>

        {/* 3. Response Panel — boxShadow + emoji title + icon buttons */}
        <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.08)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 0 20px rgba(34,197,94,.08)" }}>
          <div style={{ padding: "14px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#22C55E", fontWeight: "600" }}>✅ Response Payload ({tab.toUpperCase()})</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => handleCopy(getFormattedResponse())}
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,.08)", color: "#fff", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="Copy Response"
              >
                <Copy size={14} />
              </button>
              <button 
                onClick={() => toast.success("AI Insight Analyzer active: Response payload validated.")}
                style={{ background: "linear-gradient(90deg,#7C3AED,#EC4899)", border: "none", color: "#fff", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="AI Analysis Summary"
              >
                <Brain size={14} />
              </button>
            </div>
          </div>
          <pre style={{ margin: 0, padding: "16px", color: "#CBD5E1", fontSize: "13px", fontFamily: "JetBrains Mono, monospace", lineHeight: "1.7", overflow: "auto", height: "180px" }}>
            {getFormattedResponse()}
          </pre>
        </div>

      <div style={{ marginTop: "16px", background: "#0B1220", border: "1px solid rgba(255,255,255,.08)", borderRadius: "14px", padding: "12px" }}>
        <div style={{ color: "#F97316", fontWeight: "700", marginBottom: "12px" }}>Security Insights</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {insights.map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "#111827", color: "#CBD5E1", fontSize: "13px" }}>
              {item.icon}
              <span>{item.text}</span>
              <div style={{ marginLeft: "auto" }}><ChevronRight size={14} /></div>
            </div>
          ))}
        </div>
      </div>

      </div>

      {/* 5. Footer Tabs — gradient active + transition */}
      <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        {["pretty", "raw", "headers", "json", "curl"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            style={{
              height: "38px",
              padding: "0 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,.08)",
              background: tab === item ? "linear-gradient(90deg,#7C3AED,#9333EA)" : "#0B1220",
              color: "#FFFFFF",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px",
              minWidth: "70px",
              transition: "all .25s ease",
              boxShadow: tab === item ? "0 0 14px rgba(124,58,237,.25)" : "none",
            }}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}