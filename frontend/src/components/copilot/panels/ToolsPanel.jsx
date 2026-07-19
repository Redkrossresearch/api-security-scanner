import React, { useState, useEffect } from "react";
import { Search, Terminal, Sliders, RefreshCw, Cpu, Activity } from "lucide-react";
import api from "../../../services/api";
import useSocketEvent from "../../../sockets/useSocketEvent";
import toast from "react-hot-toast";
import FeatureGuide from "../../common/FeatureGuide";

export default function ToolsPanel() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveLogs, setLiveLogs] = useState([]);

  // Fetch outbound tools from backend
  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await api.get("/mcp/tools");
      if (res.data?.success) {
        setTools(res.data.tools || []);
      }
    } catch (err) {
      console.error("Failed to load active MCP tools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // Listen to live tool execution events from backend
  useSocketEvent("ai:thinking", (data) => {
    if (data?.toolExecuting) {
      const { name, server, status, arguments: args, error } = data.toolExecuting;
      const time = new Date().toLocaleTimeString();
      let logStr = "";

      if (status === "running") {
        const formattedArgs = args ? JSON.stringify(args) : "{}";
        logStr = `[${time}] ⚙️ Executing ${server}:${name} with args ${formattedArgs}`;
      } else if (status === "completed") {
        logStr = `[${time}] ✅ Done: ${server}:${name}`;
      } else if (status === "failed") {
        logStr = `[${time}] ❌ Failed: ${server}:${name} (${error || "Unknown Error"})`;
      }

      if (logStr) {
        setLiveLogs((prev) => [logStr, ...prev.slice(0, 49)]); // Keep last 50 logs
      }
    }
  });

  // Filter tools by search query
  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group tools by server name
  const groupedTools = filteredTools.reduce((acc, t) => {
    if (!acc[t.serverName]) {
      acc[t.serverName] = [];
    }
    acc[t.serverName].push(t);
    return acc;
  }, {});

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "16px",
      gap: "16px",
      overflowY: "auto"
    }}>
      {/* Live Tool Execution Console */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h4 style={{
          margin: 0,
          fontSize: "11px",
          fontWeight: "800",
          color: "#E2E8F0",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap"
        }}>
          <Activity size={12} style={{ color: "#10B981" }} />
          Live Tool Execution Logs
          <FeatureGuide
            title="Copilot Tools"
            description={`Here you can see the active AI tools. You currently have ${tools.length} tools connected from ${Object.keys(groupedTools).length} external servers.`}
            steps={[
              "Look at the tools list below to see what actions the AI Copilot can perform for you.",
              "Ask the AI Copilot to run tasks (like 'find vulnerabilities' or 'check scanner status') to activate tools.",
              "Watch the console box below to see tool inputs and execution results in real-time."
            ]}
            techDetails={[
              "API Route: GET /api/mcp/tools",
              "WebSockets: Receives 'ai:thinking' events dynamically when tools start, succeed, or fail."
            ]}
            positionStyles={{ position: "static" }}
          />
        </h4>
        <div style={{
          background: "#020617",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "10px",
          height: "110px",
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: "10.5px",
          color: "#38BDF8"
        }}>
          {liveLogs.length === 0 ? (
            <div style={{ color: "#64748B", fontStyle: "italic", textAlign: "center", marginTop: "32px" }}>
              Ready. Tool outputs will print here live.
            </div>
          ) : (
            liveLogs.map((log, idx) => (
              <div key={idx} style={{ marginBottom: "4px", whiteSpace: "pre-wrap" }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tools Directory */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: "800",
            color: "#E2E8F0",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>
            Active Tools Directory ({tools.length})
          </h4>
          <button
            onClick={fetchTools}
            disabled={loading}
            style={{
              background: "transparent",
              border: "none",
              color: "#8B5CF6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: "700"
            }}
          >
            <RefreshCw size={10} className={loading ? "spin" : ""} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>

        {/* Search input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "4px 10px",
          gap: "8px"
        }}>
          <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools & servers..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#FFF",
              fontSize: "11.5px",
              width: "100%"
            }}
          />
        </div>

        {/* Tools list */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          {loading && tools.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
              <RefreshCw size={24} style={{ color: "#8B5CF6", animation: "spin 1s linear infinite" }} />
            </div>
          ) : Object.keys(groupedTools).length === 0 ? (
            <div style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.3)",
              fontSize: "12px",
              marginTop: "40px",
              border: "1px dashed rgba(255,255,255,0.05)",
              padding: "24px",
              borderRadius: "12px"
            }}>
              No active tools found. Make sure you have connected and enabled external servers in settings.
            </div>
          ) : (
            Object.keys(groupedTools).map((serverName) => (
              <div key={serverName} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "#A78BFA",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  background: "rgba(139,92,246,0.06)",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>
                  🖥️ Server: {serverName}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {groupedTools[serverName].map((tool) => (
                    <div key={tool.name} style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      padding: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "750", color: "#E2E8F0", fontFamily: "monospace" }}>
                          {tool.name}
                        </span>
                      </div>
                      {tool.description && (
                        <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.45)", lineHeight: "1.4" }}>
                          {tool.description}
                        </p>
                      )}
                      
                      {/* Input parameters schema summary */}
                      {tool.inputSchema && tool.inputSchema.properties && Object.keys(tool.inputSchema.properties).length > 0 && (
                        <div style={{
                          background: "rgba(0,0,0,0.15)",
                          borderRadius: "4px",
                          padding: "6px 8px",
                          marginTop: "2px"
                        }}>
                          <span style={{ fontSize: "9.5px", color: "#A78BFA", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                            Parameters:
                          </span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "3px" }}>
                            {Object.keys(tool.inputSchema.properties).map((propName) => {
                              const prop = tool.inputSchema.properties[propName];
                              const isRequired = tool.inputSchema.required?.includes(propName);
                              return (
                                <div key={propName} style={{ display: "flex", alignItems: "baseline", gap: "6px", fontSize: "10px" }}>
                                  <span style={{ fontFamily: "monospace", color: "#38BDF8", fontWeight: "700" }}>
                                    {propName}{isRequired ? "*" : ""}
                                  </span>
                                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px" }}>
                                    ({prop.type || "string"})
                                  </span>
                                  {prop.description && (
                                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "9.5px" }}>
                                      - {prop.description.length > 50 ? prop.description.slice(0, 50) + "..." : prop.description}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
