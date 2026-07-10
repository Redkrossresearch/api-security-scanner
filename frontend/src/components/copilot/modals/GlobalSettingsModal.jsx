import React, { useState, useEffect } from "react";
import { X, Save, Shield, Settings, Sliders, Bell, Brain } from "lucide-react";
import { getSettings, updateSettings } from "../../../services/settingService";
import toast from "react-hot-toast";

export default function GlobalSettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    targetHeaders: [],
    authType: "none",
    authToken: "",
    cronSchedule: "disabled",
    slackWebhook: "",
    jiraWebhook: "",
    discordWebhook: "",
    customSystemPrompt: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        try {
          const data = await getSettings();
          if (data) setSettings(data);
        } catch (err) {
          toast.error("Failed to load settings");
        }
      };
      load();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings(settings);
      toast.success("Settings updated successfully!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeInOverlay 0.25s ease-out;
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .settings-modal-box {
          background: #090E1A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          width: 90%;
          maxWidth: 620px;
          height: 480px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: scaleInModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes scaleInModal {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .settings-tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          height: 44px;
          padding: 0 16px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        .settings-tab-btn:hover {
          color: #FFF;
          background: rgba(255,255,255,0.02);
        }
        .settings-tab-btn.active {
          color: #8B5CF6;
          border-left-color: #8B5CF6;
          background: rgba(139, 92, 246, 0.06);
        }
        .settings-input {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #FFF;
          font-size: 12.5px;
          padding: 8px 12px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .settings-input:focus {
          border-color: #8B5CF6;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.2);
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="settings-modal-box" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Settings size={18} color="#8B5CF6" />
              <h3 style={{ margin: 0, fontSize: "16px", color: "#FFF", fontWeight: "700" }}>System Settings</h3>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", padding: 0 }}>
              <X size={18} />
            </button>
          </div>

          {/* Body content */}
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            {/* Sidebar tabs */}
            <div style={{ width: "160px", borderRight: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, background: "rgba(255,255,255,0.01)" }}>
              <button onClick={() => setActiveTab("general")} className={`settings-tab-btn ${activeTab === "general" ? "active" : ""}`}>
                <Sliders size={14} />
                General Auth
              </button>
              <button onClick={() => setActiveTab("webhooks")} className={`settings-tab-btn ${activeTab === "webhooks" ? "active" : ""}`}>
                <Bell size={14} />
                Alert webhooks
              </button>
              <button onClick={() => setActiveTab("shield")} className={`settings-tab-btn ${activeTab === "shield" ? "active" : ""}`}>
                <Shield size={14} />
                Engine Specs
              </button>
              <button onClick={() => setActiveTab("prompt")} className={`settings-tab-btn ${activeTab === "prompt" ? "active" : ""}`}>
                <Brain size={14} />
                AI Prompt
              </button>
            </div>

            {/* Config panel area */}
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {activeTab === "general" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Scan Auth Type</label>
                    <select
                      value={settings.authType}
                      onChange={(e) => setSettings({ ...settings, authType: e.target.value })}
                      style={{
                        background: "#0D1424",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#FFF",
                        fontSize: "12.5px",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        outline: "none"
                      }}
                    >
                      <option value="none">None (Public Scanning)</option>
                      <option value="bearer">Bearer Token (JWT)</option>
                      <option value="apikey">Custom API Key</option>
                      <option value="basic">Basic Credentials</option>
                    </select>
                  </div>

                  {settings.authType !== "none" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Authentication Token</label>
                      <input
                        type="password"
                        placeholder="Bearer secret or key string..."
                        value={settings.authToken}
                        onChange={(e) => setSettings({ ...settings, authToken: e.target.value })}
                        className="settings-input"
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Continuous Cron Audit</label>
                    <select
                      value={settings.cronSchedule}
                      onChange={(e) => setSettings({ ...settings, cronSchedule: e.target.value })}
                      style={{
                        background: "#0D1424",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#FFF",
                        fontSize: "12.5px",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        outline: "none"
                      }}
                    >
                      <option value="disabled">Disabled</option>
                      <option value="daily">Daily Auto Scan</option>
                      <option value="weekly">Weekly Auto Scan</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === "webhooks" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Slack Integration URL</label>
                    <input
                      type="text"
                      placeholder="https://hooks.slack.com/services/..."
                      value={settings.slackWebhook}
                      onChange={(e) => setSettings({ ...settings, slackWebhook: e.target.value })}
                      className="settings-input"
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Jira Webhook Endpoint</label>
                    <input
                      type="text"
                      placeholder="https://jira.atlassian.net/webhooks/..."
                      value={settings.jiraWebhook}
                      onChange={(e) => setSettings({ ...settings, jiraWebhook: e.target.value })}
                      className="settings-input"
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Discord alert Channel URL</label>
                    <input
                      type="text"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={settings.discordWebhook}
                      onChange={(e) => setSettings({ ...settings, discordWebhook: e.target.value })}
                      className="settings-input"
                    />
                  </div>
                </>
              )}

              {activeTab === "shield" && (
                <>
                  <div style={{
                    background: "rgba(139, 92, 246, 0.05)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "12px",
                    color: "#A78BFA",
                    lineHeight: "1.5"
                  }}>
                    <strong>Engine Mode: Active Protection.</strong> Scanners auto-validate HTTP headers, TLS handshake patterns, JWT claims, and block parameters mapping injection queries.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Default Target Headers</label>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                      Input custom headers, separated by commas (e.g. X-Scanner-Token, Custom-Origin)
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. User-Agent: ATHXBot, X-Scanner-ID: 100"
                      value={settings.targetHeaders?.join(", ") || ""}
                      onChange={(e) => setSettings({ ...settings, targetHeaders: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                      className="settings-input"
                    />
                  </div>
                </>
              )}

              {activeTab === "prompt" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minHeight: 0 }}>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Custom AI System Prompt Template</label>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                      Define how the AI Copilot behaves. Leave blank to fallback to the default cyber-security expert instructions.
                    </span>
                    <textarea
                      value={settings.customSystemPrompt || ""}
                      onChange={(e) => setSettings({ ...settings, customSystemPrompt: e.target.value })}
                      placeholder="e.g. You are an API security expert. Keep explanations extremely concise..."
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        color: "#FFF",
                        fontSize: "12px",
                        padding: "10px 12px",
                        outline: "none",
                        resize: "none",
                        lineHeight: "1.5",
                        fontFamily: "monospace",
                        boxSizing: "border-box",
                        minHeight: "220px",
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer controls */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "14px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.01)",
            flexShrink: 0
          }}>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              color: "rgba(255,255,255,0.7)",
              fontSize: "12px",
              fontWeight: "600",
              height: "34px",
              padding: "0 14px",
              cursor: "pointer"
            }}>
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                border: "none",
                borderRadius: "6px",
                color: "#FFF",
                fontSize: "12px",
                fontWeight: "600",
                height: "34px",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              <Save size={13} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
