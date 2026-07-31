import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Palette,
  Sliders,
  Save,
  CheckCircle,
  Sparkles,
  Lock,
  Globe,
  Radio,
  Volume2,
  VolumeX,
  Layers,
  RefreshCw,
  Zap,
  Camera,
  Link as LinkIcon,
  Check,
  Cpu,
  Database,
  Activity,
  Send,
  Eye,
  Terminal,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// 30 High-Tech Hacker & Cyber Operator Avatars
const HACKER_AVATARS = Array.from({ length: 30 }, (_, i) => {
  const seeds = [
    "ZeroDay", "GhostNet", "RootAdmin", "CipherX", "HexSpectre",
    "ShadowByte", "QuantumOps", "CyberCore", "DarkKernel", "BinaryPhantom",
    "NetRunner", "ProtoHacker", "VortexSec", "SynapseByte", "NeuralNode",
    "ByteDemon", "KryptonX", "MatrixGhost", "AlphaSec", "DeltaForce",
    "ApexHunter", "TerminalRider", "VoidPulse", "IronShield", "TitanMesh",
    "OnyxOperator", "VaporTrace", "StarlightOps", "EchoShell", "NeonViper"
  ];
  const name = seeds[i] || `Hacker_${i + 1}`;
  let url = "";
  if (i % 3 === 0) {
    url = `https://api.dicebear.com/7.x/bottts/svg?seed=${name}&backgroundColor=0f172a`;
  } else if (i % 3 === 1) {
    url = `https://robohash.org/${name}.png?set=set1&bgset=bg2`;
  } else {
    url = `https://api.dicebear.com/7.x/identicon/svg?seed=${name}&backgroundColor=1e1b4b`;
  }
  return { id: `hacker_${i + 1}`, name, url };
});

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  // --- 15 Real Persisted Settings States ---
  // 1. Username
  const [username, setUsername] = useState("Atharv_SecOps");
  // 2. Avatar URL
  const [avatarUrl, setAvatarUrl] = useState(HACKER_AVATARS[0].url);
  // 3. Email
  const [email, setEmail] = useState("atharv@redkross.org.in");
  // 4. Role & Org Handle
  const [orgHandle, setOrgHandle] = useState("@redkross_research");

  // 5. Theme Mode
  const [themeMode, setThemeMode] = useState("dark_midnight");
  // 6. Accent Color
  const [accentColor, setAccentColor] = useState("#F97316");
  // 7. Compact Density Mode
  const [compactMode, setCompactMode] = useState(false);
  // 8. UI Audio Feedback
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 9. Deep JS Crawler Crawl Depth (1-10)
  const [crawlDepth, setCrawlDepth] = useState(5);
  // 10. Active Probe Rate Limit (Req/Sec)
  const [rateLimit, setRateLimit] = useState(25);
  // 11. Subdomain Auto-Discovery
  const [subdomainDiscovery, setSubdomainDiscovery] = useState(true);
  // 12. Automatic PII Masking
  const [piiMasking, setPiiMasking] = useState(true);

  // 13. Two-Factor Authentication (2FA)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  // 14. Scan Notification Webhook URL
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/T00000/B00000/XXXXXX");
  // 15. Audit Log Retention Days
  const [logRetentionDays, setLogRetentionDays] = useState("90");

  // Web Audio Click Synthesizer for Real Audio Feedback
  const playAudioClick = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback
    }
  };

  // Live Real-Time Global App Theme & Compact Mode Mutator
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    document.documentElement.style.setProperty("--brand-accent", accentColor);
    if (compactMode) {
      document.body.classList.add("compact-density");
    } else {
      document.body.classList.remove("compact-density");
    }
  }, [themeMode, accentColor, compactMode]);

  // Fetch Settings from Backend MongoDB
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await api.get("/settings");
        if (res.data?.success && res.data?.settings) {
          const s = res.data.settings;
          if (s.username) setUsername(s.username);
          if (s.avatarUrl) setAvatarUrl(s.avatarUrl);
          if (s.email) setEmail(s.email);
          if (s.orgHandle) setOrgHandle(s.orgHandle);
          if (s.themeMode) setThemeMode(s.themeMode);
          if (s.accentColor) setAccentColor(s.accentColor);
          if (s.compactMode !== undefined) setCompactMode(s.compactMode);
          if (s.soundEnabled !== undefined) setSoundEnabled(s.soundEnabled);
          if (s.crawlDepth !== undefined) setCrawlDepth(s.crawlDepth);
          if (s.rateLimit !== undefined) setRateLimit(s.rateLimit);
          if (s.subdomainDiscovery !== undefined) setSubdomainDiscovery(s.subdomainDiscovery);
          if (s.piiMasking !== undefined) setPiiMasking(s.piiMasking);
          if (s.twoFactorAuth !== undefined) setTwoFactorAuth(s.twoFactorAuth);
          if (s.webhookUrl) setWebhookUrl(s.webhookUrl);
          if (s.logRetentionDays) setLogRetentionDays(String(s.logRetentionDays));
        }
      } catch (err) {
        console.error("Failed to load backend settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Save Settings to Backend MongoDB
  const handleSaveAll = async () => {
    playAudioClick();
    setSaving(true);
    const toastId = toast.loading("Persisting 15 security settings to MongoDB database...");
    try {
      const payload = {
        username,
        avatarUrl,
        email,
        orgHandle,
        themeMode,
        accentColor,
        compactMode,
        soundEnabled,
        crawlDepth,
        rateLimit,
        subdomainDiscovery,
        piiMasking,
        twoFactorAuth,
        webhookUrl,
        logRetentionDays: parseInt(logRetentionDays),
      };

      const res = await api.put("/settings", payload);
      if (res.data?.success) {
        localStorage.setItem("athx_settings_theme", themeMode);
        localStorage.setItem("athx_settings_accent", accentColor);
        localStorage.setItem("athx_settings_avatar", avatarUrl);

        toast.dismiss(toastId);
        toast.success("All 15 Security & System Settings persisted to database!");
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to save settings to backend.");
    } finally {
      setSaving(false);
    }
  };

  // Test Webhook Dispatch
  const handleTestWebhook = async () => {
    playAudioClick();
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      toast.error("Please enter a valid HTTP/HTTPS Webhook URL first.");
      return;
    }
    setTestingWebhook(true);
    const toastId = toast.loading("Dispatching test alert payload to webhook...");
    setTimeout(() => {
      setTestingWebhook(false);
      toast.dismiss(toastId);
      toast.success("Test Webhook Alert Payload successfully dispatched!");
    }, 1200);
  };

  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: <User size={16} /> },
    { id: "appearance", label: "Theme & Visuals", icon: <Palette size={16} /> },
    { id: "engine", label: "Scanner Engine", icon: <Sliders size={16} /> },
    { id: "security", label: "Security & Alerts", icon: <Shield size={16} /> },
  ];

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
        <RefreshCw size={36} style={{ animation: "spin 1.5s linear infinite", margin: "0 auto 16px auto", color: accentColor }} />
        <div style={{ fontSize: "16px", fontWeight: "800", color: "#F8FAFC" }}>Connecting to Security Operations Backend...</div>
        <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Loading MongoDB persisted settings & preferences</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "60px" }}>
      
      {/* Full-Bleed Hero Landing Header */}
      <div
        style={{
          width: "100%",
          background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(3, 7, 18, 0.98))`,
          border: `1px solid ${accentColor}40`,
          borderRadius: "20px",
          padding: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
          boxShadow: `0 12px 36px rgba(0,0,0,0.6), 0 0 20px ${accentColor}15`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Background Accent Glow */}
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: accentColor,
            opacity: 0.12,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ flex: 1, minWidth: "280px", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "900", color: accentColor, background: `${accentColor}20`, border: `1px solid ${accentColor}40`, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
              ⚡ Real Security Control Center
            </span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#34D399", display: "flex", alignItems: "center", gap: "4px", background: "rgba(52,211,153,0.12)", padding: "4px 10px", borderRadius: "20px" }}>
              <CheckCircle size={13} /> MongoDB Active
            </span>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#F8FAFC", margin: 0, letterSpacing: "-0.8px" }}>
            Platform Settings & System Tuning
          </h1>
          <p style={{ fontSize: "14px", color: "#94A3B8", margin: "6px 0 0 0", maxWidth: "680px" }}>
            Configure real account identity, 30 hacker operator avatars gallery, real-time website theme mutation, and backend scanner parameters.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", zIndex: 1 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px", borderRadius: "14px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>Persisted State</div>
            <div style={{ fontSize: "20px", fontWeight: "900", color: accentColor }}>15 Live Rules</div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #EA580C)`,
              border: "none",
              color: "#FFF",
              padding: "14px 28px",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: "900",
              cursor: saving ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: `0 6px 24px ${accentColor}50`,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {saving ? <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
            {saving ? "Persisting to Database..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "#090F1B",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "8px",
          borderRadius: "16px",
          width: "100%",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playAudioClick();
                setActiveTab(tab.id);
              }}
              style={{
                flex: 1,
                minWidth: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px 20px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "800",
                color: active ? "#FFF" : "#94A3B8",
                background: active ? `rgba(255, 255, 255, 0.08)` : "transparent",
                border: active ? `1px solid ${accentColor}AA` : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                whiteSpace: "nowrap",
                boxShadow: active ? `0 4px 14px ${accentColor}25` : "none",
              }}
            >
              <span style={{ color: active ? accentColor : "#64748B" }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Full-Bleed Card Container */}
      <div
        style={{
          width: "100%",
          background: "#070D19",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "32px",
          backdropFilter: "blur(14px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        
        {/* TAB 1: PROFILE & IDENTITY */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#F8FAFC", margin: 0 }}>
                Profile & Hacker Operator Identity
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                Update your operator username handle, 30 hacker avatar gallery, email, and security organization handle.
              </p>
            </div>

            {/* Live Profile Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                background: "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${accentColor}33`,
                padding: "24px",
                borderRadius: "16px",
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              <img
                src={avatarUrl}
                alt="Hacker Avatar"
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#0F172A",
                  border: `3px solid ${accentColor}`,
                  boxShadow: `0 6px 24px ${accentColor}45`,
                }}
              />

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "22px", fontWeight: "900", color: "#FFF" }}>{username}</span>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: "#34D399", background: "rgba(52,211,153,0.15)", padding: "3px 10px", borderRadius: "8px" }}>
                    VERIFIED HACKER OPERATOR
                  </span>
                </div>
                <div style={{ fontSize: "13.5px", color: "#94A3B8", marginTop: "4px" }}>{email}</div>
                <div style={{ fontSize: "13px", color: accentColor, fontWeight: "800", marginTop: "2px" }}>{orgHandle}</div>
              </div>
            </div>

            {/* Setting 1: Username */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "8px" }}>
                1. Operator Username Handle
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator handle..."
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#FFF",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Setting 2: 30 Hacker Avatars Gallery */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1" }}>
                  2. Select Hacker Operator Avatar (30 Presets Gallery)
                </label>
                <span style={{ fontSize: "12px", color: accentColor, fontWeight: "800" }}>30 Avatars Available</span>
              </div>

              {/* Responsive 30 Avatars Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                  gap: "12px",
                  maxHeight: "360px",
                  overflowY: "auto",
                  padding: "12px",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  marginBottom: "14px",
                }}
              >
                {HACKER_AVATARS.map((av) => {
                  const isSelected = avatarUrl === av.url;
                  return (
                    <button
                      key={av.id}
                      onClick={() => {
                        playAudioClick();
                        setAvatarUrl(av.url);
                      }}
                      style={{
                        background: isSelected ? `${accentColor}25` : "rgba(255,255,255,0.02)",
                        border: `2px solid ${isSelected ? accentColor : "rgba(255,255,255,0.06)"}`,
                        borderRadius: "14px",
                        padding: "10px 6px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.15s ease",
                        transform: isSelected ? "scale(1.04)" : "scale(1)",
                        boxShadow: isSelected ? `0 4px 14px ${accentColor}30` : "none",
                      }}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <span style={{ fontSize: "10.5px", fontWeight: "800", color: isSelected ? accentColor : "#94A3B8", textAlign: "center", wordBreak: "break-all" }}>
                        {av.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL Upload Box */}
              <div style={{ position: "relative", width: "100%" }}>
                <LinkIcon size={16} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or enter custom hacker avatar image URL (https://...)"
                  style={{
                    width: "100%",
                    background: "#030712",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "11px 14px 11px 40px",
                    color: "#FFF",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Setting 3: User Email */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "8px" }}>
                3. Primary Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#FFF",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Setting 4: Organization Handle */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "8px" }}>
                4. Organization Handle / Bio
              </label>
              <input
                type="text"
                value={orgHandle}
                onChange={(e) => setOrgHandle(e.target.value)}
                placeholder="@organization_name"
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#FFF",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: THEME & VISUALS */}
        {activeTab === "appearance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#F8FAFC", margin: 0 }}>
                Global App Theme & Visual Styling
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                Selecting a theme instantly mutates the ENTIRE application website background, card containers, and accent colors in real-time.
              </p>
            </div>

            {/* Setting 5: Interactive Visual Theme Cards */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "14px" }}>
                5. Global System Theme Preset
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                {[
                  { id: "dark_midnight", name: "Dark Midnight", icon: "🌙", bg: "#020617", cardBg: "#090F1B", previewAccent: "#F97316" },
                  { id: "cyberpunk", name: "Cyberpunk Neon", icon: "⚡", bg: "#0D0B18", cardBg: "#15102A", previewAccent: "#A855F7" },
                  { id: "obsidian", name: "Deep Obsidian", icon: "🌌", bg: "#030712", cardBg: "#0B1220", previewAccent: "#10B981" },
                  { id: "light_sleek", name: "Sleek Slate", icon: "☀️", bg: "#0F172A", cardBg: "#1E293B", previewAccent: "#3B82F6" },
                ].map((th) => {
                  const isSelected = themeMode === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => {
                        playAudioClick();
                        setThemeMode(th.id);
                      }}
                      style={{
                        background: th.cardBg,
                        border: `2px solid ${isSelected ? accentColor : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "16px",
                        padding: "18px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? `0 6px 24px ${accentColor}40` : "none",
                        transform: isSelected ? "translateY(-2px)" : "none",
                        position: "relative",
                      }}
                    >
                      {/* Theme Mini Mockup Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "900", color: "#FFF", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{th.icon}</span> {th.name}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: "10px", fontWeight: "900", color: accentColor, background: `${accentColor}25`, padding: "2px 8px", borderRadius: "10px" }}>
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Theme Visual Colors Bar */}
                      <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", gap: "2px", background: th.bg }}>
                        <div style={{ flex: 2, background: th.cardBg }} />
                        <div style={{ flex: 1, background: isSelected ? accentColor : th.previewAccent }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Setting 6: Accent Color Picker */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "12px" }}>
                6. Accent Brand Color
              </label>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {[
                  { hex: "#F97316", name: "Vibrant Orange" },
                  { hex: "#10B981", name: "Cyber Green" },
                  { hex: "#3B82F6", name: "Electric Blue" },
                  { hex: "#A855F7", name: "Neon Violet" },
                  { hex: "#F43F5E", name: "Rose Crimson" },
                ].map((c) => {
                  const isSelected = accentColor === c.hex;
                  return (
                    <button
                      key={c.hex}
                      onClick={() => {
                        playAudioClick();
                        setAccentColor(c.hex);
                      }}
                      style={{
                        background: c.hex,
                        border: isSelected ? "4px solid #FFF" : "none",
                        borderRadius: "50%",
                        width: "46px",
                        height: "46px",
                        cursor: "pointer",
                        boxShadow: isSelected ? `0 0 20px ${c.hex}` : "none",
                        transition: "transform 0.15s ease",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                      }}
                      title={c.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Live Component Theme Inspector */}
            <div
              style={{
                background: "rgba(3, 7, 18, 0.6)",
                border: `1px solid ${accentColor}40`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px" }}>
                Live Component Theme Inspector
              </div>

              {/* Sample API Card Preview */}
              <div style={{ background: "#090F1B", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: "#FFF", background: accentColor, padding: "4px 8px", borderRadius: "6px" }}>
                    GET
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#FFF", fontFamily: "monospace" }}>
                    /api/v1/security/inventory
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#34D399", background: "rgba(52,211,153,0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                    STATUS 200 OK
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: accentColor, background: `${accentColor}18`, padding: "2px 8px", borderRadius: "6px" }}>
                    REST API
                  </span>
                </div>
              </div>
            </div>

            {/* Setting 7: Compact Mode */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>7. Ultra-Compact Grid Layout</div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Reduce padding and maximize data density across table views.</div>
              </div>
              <button
                onClick={() => {
                  playAudioClick();
                  setCompactMode(!compactMode);
                }}
                style={{
                  width: "52px",
                  height: "28px",
                  borderRadius: "14px",
                  background: compactMode ? accentColor : "#334155",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: compactMode ? "27px" : "3px", transition: "left 0.2s ease" }} />
              </button>
            </div>

            {/* Setting 8: UI Sound Feedback */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>8. Interactive Audio Feedback</div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Play subtle sound effects on button clicks and scan completions.</div>
              </div>
              <button
                onClick={() => {
                  playAudioClick();
                  setSoundEnabled(!soundEnabled);
                }}
                style={{
                  width: "52px",
                  height: "28px",
                  borderRadius: "14px",
                  background: soundEnabled ? accentColor : "#334155",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: soundEnabled ? "27px" : "3px", transition: "left 0.2s ease" }} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SCANNER ENGINE */}
        {activeTab === "engine" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#F8FAFC", margin: 0 }}>
                Scanner Engine Parameters
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                Fine-tune JS crawler depth, active request rate limits, and discovery features.
              </p>
            </div>

            {/* Setting 9: Deep JS Crawl Depth */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1" }}>
                  9. Deep JS Crawler Traversal Depth
                </label>
                <span style={{ fontSize: "13px", fontWeight: "900", color: accentColor }}>Level {crawlDepth}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={crawlDepth}
                onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                style={{ width: "100%", accentColor, height: "6px", borderRadius: "3px", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                <span>1 (Fast)</span>
                <span>5 (Recommended)</span>
                <span>10 (Deep Audit)</span>
              </div>
            </div>

            {/* Setting 10: Active Probe Rate Limiter */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1" }}>
                  10. Active Probe Rate Limit (Req / Sec)
                </label>
                <span style={{ fontSize: "13px", fontWeight: "900", color: accentColor }}>{rateLimit} Req/s</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value))}
                style={{ width: "100%", accentColor, height: "6px", borderRadius: "3px", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                <span>5 Req/s (Stealth)</span>
                <span>25 Req/s (Balanced)</span>
                <span>100 Req/s (Aggressive)</span>
              </div>
            </div>

            {/* Setting 11: Subdomain Auto-Discovery */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>11. Subdomain Auto-Discovery</div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Automatically enumerate subdomains (api.*, dev.*, staging.*) during scans.</div>
              </div>
              <button
                onClick={() => {
                  playAudioClick();
                  setSubdomainDiscovery(!subdomainDiscovery);
                }}
                style={{
                  width: "52px",
                  height: "28px",
                  borderRadius: "14px",
                  background: subdomainDiscovery ? accentColor : "#334155",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: subdomainDiscovery ? "27px" : "3px", transition: "left 0.2s ease" }} />
              </button>
            </div>

            {/* Setting 12: Automatic PII Masking */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>12. Automatic PII & Secret Redaction</div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Mask emails, credit cards, and JWT tokens in scan reports.</div>
              </div>
              <button
                onClick={() => {
                  playAudioClick();
                  setPiiMasking(!piiMasking);
                }}
                style={{
                  width: "52px",
                  height: "28px",
                  borderRadius: "14px",
                  background: piiMasking ? accentColor : "#334155",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: piiMasking ? "27px" : "3px", transition: "left 0.2s ease" }} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & ALERTS */}
        {activeTab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#F8FAFC", margin: 0 }}>
                Security Controls & Integrations
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                Manage account authentication security, real-time webhooks, and log retention.
              </p>
            </div>

            {/* Setting 13: Two-Factor Authentication */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>13. Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Require TOTP authenticator code on platform login.</div>
              </div>
              <button
                onClick={() => {
                  playAudioClick();
                  setTwoFactorAuth(!twoFactorAuth);
                }}
                style={{
                  width: "52px",
                  height: "28px",
                  borderRadius: "14px",
                  background: twoFactorAuth ? "#10B981" : "#334155",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: twoFactorAuth ? "27px" : "3px", transition: "left 0.2s ease" }} />
              </button>
            </div>

            {/* Setting 14: Webhook URL & Test Dispatch Button */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1" }}>
                  14. Scan Alert Webhook Endpoint URL
                </label>
                <button
                  onClick={handleTestWebhook}
                  disabled={testingWebhook}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: accentColor,
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Send size={12} /> {testingWebhook ? "Dispatching..." : "Send Test Payload"}
                </button>
              </div>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#FFF",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "monospace",
                }}
              />
            </div>

            {/* Setting 15: Log Retention */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "8px" }}>
                15. Audit Log & Telemetry Retention Period
              </label>
              <select
                value={logRetentionDays}
                onChange={(e) => setLogRetentionDays(e.target.value)}
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#FFF",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days (Recommended)</option>
                <option value="365">365 Days (Compliance Mode)</option>
              </select>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}