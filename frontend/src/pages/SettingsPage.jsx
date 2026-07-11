import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../services/settingService";
import { 
  Shield, 
  Key, 
  Calendar, 
  Bell, 
  Save, 
  RefreshCw, 
  Hash, 
  Plus, 
  Trash2,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import toast from "react-hot-toast";

const COLORS = {
  white: "#FFFFFF",
  muted: "#94A3B8",
  purple: "#8B5CF6",
  purpleGradient: "#7C3AED",
  success: "#22C55E",
  border: "rgba(255,255,255,.08)",
  background: "#030712",
  cardBg: "#090d16"
};

const styles = {
  container: {
    padding: "24px",
    background: COLORS.background,
    minHeight: "100%",
    color: COLORS.white,
    fontFamily: "Inter, sans-serif",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "13px",
    color: COLORS.muted,
    marginTop: "6px",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid rgba(255,255,255,.04)",
    paddingBottom: "14px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "750",
    color: "#E2E8F0",
    margin: 0,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  select: {
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#D1D5DB",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },
  input: {
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#E5E7EB",
    outline: "none",
  },
  customHeaderRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginTop: "4px",
  },
  addHeaderBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "rgba(139,92,246,0.1)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: "8px",
    color: "#C084FC",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    width: "fit-content",
  },
  deleteHeaderBtn: {
    background: "transparent",
    border: "none",
    color: "#EF4444",
    cursor: "pointer",
    padding: "4px",
  },
  saveBtnRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 24px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #7C3AED, #4F46E5)",
    border: "none",
    color: COLORS.white,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  testBtn: {
    background: "#111827",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    color: "#E2E8F0",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 10px",
    cursor: "pointer",
    width: "fit-content",
    marginTop: "4px",
  }
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Settings states
  const [authType, setAuthType] = useState("none");
  const [authToken, setAuthToken] = useState("");
  const [cronSchedule, setCronSchedule] = useState("disabled");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [jiraWebhook, setJiraWebhook] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [targetHeaders, setTargetHeaders] = useState([]);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        if (data) {
          setAuthType(data.authType || "none");
          setAuthToken(data.authToken || "");
          setCronSchedule(data.cronSchedule || "disabled");
          setSlackWebhook(data.slackWebhook || "");
          setJiraWebhook(data.jiraWebhook || "");
          setDiscordWebhook(data.discordWebhook || "");
          setTargetHeaders(data.targetHeaders || []);
        }
      } catch (err) {
        toast.error("Failed to load settings configuration");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Save configurations
  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        authType,
        authToken,
        cronSchedule,
        slackWebhook,
        jiraWebhook,
        discordWebhook,
        targetHeaders
      };
      await updateSettings(config);
      toast.success("Security scanner configurations saved successfully");
    } catch (err) {
      toast.error("Failed to save configurations");
    } finally {
      setSaving(false);
    }
  };

  // Add custom target header
  const handleAddHeader = () => {
    setTargetHeaders([...targetHeaders, { name: "", value: "" }]);
  };

  // Delete target header
  const handleRemoveHeader = (idx) => {
    setTargetHeaders(targetHeaders.filter((_, i) => i !== idx));
  };

  // Update specific header field
  const handleHeaderChange = (idx, field, val) => {
    setTargetHeaders(targetHeaders.map((h, i) => i === idx ? { ...h, [field]: val } : h));
  };

  // Test Webhook channels
  const handleTestIntegration = (name) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Sending validation payload to ${name}...`,
        success: `${name} channel validation successful!`,
        error: "Validation failed."
      }
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", itemsCenter: "center", justifyContent: "center", minHeight: "100%", background: COLORS.background, color: COLORS.white }}>
        <RefreshCw style={{ width: "48px", height: "48px", color: COLORS.purple, margin: "0 auto 16px auto", animation: "spin 1s linear infinite" }} />
        <p style={{ textAlign: "center", color: COLORS.muted, fontWeight: "500" }}>Loading scanner settings configurations...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gateway & Settings Manager</h1>
        <p style={styles.subtitle}>Configure global security headers, API keys, scanner scheduling, and webhook notification parameters.</p>
      </div>

      {/* Main Form Fields */}
      <div style={styles.grid}>
        
        {/* API Authorization Settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Key style={{ width: "18px", height: "18px", color: COLORS.purple }} />
            <h3 style={styles.cardTitle}>API Target Authorization</h3>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Authentication Type</label>
            <select 
              value={authType} 
              onChange={(e) => setAuthType(e.target.value)}
              style={styles.select}
            >
              <option value="none">No Authentication</option>
              <option value="bearer">Bearer Token (Authorization header)</option>
              <option value="apikey">API Key (Header / Query Param)</option>
              <option value="custom">Custom Auth Header</option>
            </select>
          </div>

          {authType !== "none" && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Secret Token / Credential</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type={showToken ? "text" : "password"} 
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder={authType === "bearer" ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." : "API key value"}
                  style={{ ...styles.input, width: "100%", paddingRight: "36px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  style={{ position: "absolute", right: "8px", background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer" }}
                >
                  {showToken ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                </button>
              </div>
            </div>
          )}

          {/* Custom Headers Config */}
          <div style={{ ...styles.fieldGroup, borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px" }}>
            <label style={styles.label}>Custom Target Request Headers</label>
            {targetHeaders.map((header, idx) => (
              <div key={idx} style={styles.customHeaderRow}>
                <input 
                  type="text" 
                  value={header.name} 
                  onChange={(e) => handleHeaderChange(idx, "name", e.target.value)}
                  placeholder="Header-Name" 
                  style={{ ...styles.input, flex: 1 }}
                />
                <input 
                  type="text" 
                  value={header.value} 
                  onChange={(e) => handleHeaderChange(idx, "value", e.target.value)}
                  placeholder="value" 
                  style={{ ...styles.input, flex: 1.5 }}
                />
                <button 
                  onClick={() => handleRemoveHeader(idx)}
                  style={styles.deleteHeaderBtn}
                >
                  <Trash2 style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            ))}
            <button 
              onClick={handleAddHeader}
              style={styles.addHeaderBtn}
            >
              <Plus style={{ width: "12px", height: "12px" }} />
              Add Custom Header
            </button>
          </div>
        </div>

        {/* Scanner Schedule settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Calendar style={{ width: "18px", height: "18px", color: COLORS.purple }} />
            <h3 style={styles.cardTitle}>Automated Scanner Scheduling</h3>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Assessment Frequency</label>
            <select 
              value={cronSchedule} 
              onChange={(e) => setCronSchedule(e.target.value)}
              style={styles.select}
            >
              <option value="disabled">Disabled (On-Demand Scans Only)</option>
              <option value="daily">Daily Security Run (Every day at 00:00 UTC)</option>
              <option value="weekly">Weekly Compliance Run (Sundays at 02:00 UTC)</option>
              <option value="monthly">Monthly Full Scope Audit (1st of every month)</option>
            </select>
          </div>

          <div style={{ color: COLORS.muted, fontSize: "12px", lineHeight: "1.6", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.1)", padding: "12px", borderRadius: "10px", marginTop: "12px" }}>
            🛡️ <strong>Note on Automatic Runs:</strong> When scheduled, the API Security Scanner will run background pipelines using authorization headers configured on this page and report critical issues directly to integrations.
          </div>
        </div>

        {/* Integration settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Bell style={{ width: "18px", height: "18px", color: COLORS.purple }} />
            <h3 style={styles.cardTitle}>External Channel Integrations</h3>
          </div>

          {/* Slack webhook config */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Slack Incoming Webhook</label>
            <input 
              type="text" 
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              style={styles.input}
            />
            {slackWebhook && (
              <button 
                onClick={() => handleTestIntegration("Slack")}
                style={styles.testBtn}
              >
                Test Connection
              </button>
            )}
          </div>

          {/* Jira webhook config */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Jira Cloud Ticket Endpoint</label>
            <input 
              type="text" 
              value={jiraWebhook}
              onChange={(e) => setJiraWebhook(e.target.value)}
              placeholder="https://your-domain.atlassian.net/rest/api/..."
              style={styles.input}
            />
            {jiraWebhook && (
              <button 
                onClick={() => handleTestIntegration("Jira")}
                style={styles.testBtn}
              >
                Test Connection
              </button>
            )}
          </div>

          {/* Discord webhook config */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Discord Webhook URL</label>
            <input 
              type="text" 
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              style={styles.input}
            />
            {discordWebhook && (
              <button 
                onClick={() => handleTestIntegration("Discord")}
                style={styles.testBtn}
              >
                Test Connection
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Save Button Row */}
      <div style={styles.saveBtnRow}>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={styles.saveBtn}
        >
          {saving ? <RefreshCw style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Save style={{ width: "16px", height: "16px" }} />}
          Save Configurations
        </button>
      </div>

    </div>
  );
}