import { useState } from "react";
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

export default function RequestResponseInspector() {
  const [tab, setTab] = useState("pretty");

  const requestData = `GET /api/users/123 HTTP/1.1
...`;

  const responseData = `HTTP/1.1 200 OK
...`;

  return (
    <div style={{ background: "#071126", border: "1px solid rgba(255,255,255,.08)", borderRadius: "24px", padding: "24px", minHeight: "100%" }}>
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
        <select style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.08)", color: "#FFFFFF", borderRadius: "10px", padding: "8px 12px" }}>
          <option>GET /api/users/123</option>
          <option>POST /api/auth/login</option>
          <option>GET /api/orders</option>
        </select>
      </div>

      {/* ... badges ... */}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 2. Request Panel — boxShadow + emoji title + icon buttons */}
        <div style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,.08)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 0 20px rgba(59,130,246,.08)" }}>
          <div style={{ padding: "14px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#FFFFFF", fontWeight: "600" }}>📤 Request Payload</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ background: "#111827", border: "1px solid rgba(255,255,255,.08)", color: "#fff", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Copy size={14} />
              </button>
              <button style={{ background: "#111827", border: "1px solid rgba(255,255,255,.08)", color: "#fff", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
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
            <span style={{ color: "#22C55E", fontWeight: "600" }}>✅ Response Payload (200 OK)</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ background: "#111827", border: "1px solid rgba(255,255,255,.08)", color: "#fff", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Copy size={14} />
              </button>
              <button style={{ background: "linear-gradient(90deg,#7C3AED,#EC4899)", border: "none", color: "#fff", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={14} />
              </button>
            </div>
          </div>
          <pre style={{ margin: 0, padding: "16px", color: "#CBD5E1", fontSize: "13px", fontFamily: "JetBrains Mono, monospace", lineHeight: "1.7", overflow: "auto", height: "180px" }}>
            {responseData}
          </pre>
        </div>
      </div>

      {/* 4. Security Insights — icon rows with ChevronRight */}
      <div style={{ marginTop: "16px", background: "#0B1220", border: "1px solid rgba(255,255,255,.08)", borderRadius: "14px", padding: "12px" }}>
        <div style={{ color: "#F97316", fontWeight: "700", marginBottom: "12px" }}>Security Insights</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { icon: <ShieldAlert size={14} />, text: "Potential BOLA vulnerability detected" },
            { icon: <User size={14} />, text: "Personally identifiable information exposed" },
            { icon: <Lock size={14} />, text: "Authorization validation missing" },
            { icon: <FileJson size={14} />, text: "Sensitive response fields discovered" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "#111827", color: "#CBD5E1", fontSize: "13px" }}>
              {item.icon}
              <span>{item.text}</span>
              <div style={{ marginLeft: "auto" }}><ChevronRight size={14} /></div>
            </div>
          ))}
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