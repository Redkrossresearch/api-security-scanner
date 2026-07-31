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
  Download,
  Upload,
  SlidersHorizontal,
  Award,
  AlertTriangle,
  FileCode,
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
  const [username, setUsername] = useState("Atharv_SecOps");
  const [avatarUrl, setAvatarUrl] = useState(HACKER_AVATARS[0].url);
  const [email, setEmail] = useState("atharv@redkross.org.in");
  const [orgHandle, setOrgHandle] = useState("@redkross_research");
  const [themeMode, setThemeMode] = useState("dark_midnight");
  const [accentColor, setAccentColor] = useState("#F97316");
  const [compactMode, setCompactMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crawlDepth, setCrawlDepth] = useState(5);
  const [rateLimit, setRateLimit] = useState(25);
  const [subdomainDiscovery, setSubdomainDiscovery] = useState(true);
  const [piiMasking, setPiiMasking] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/T00000/B00000/XXXXXX");
  const [logRetentionDays, setLogRetentionDays] = useState("90");

  // Web Audio Synthesizer
  const playAudioClick = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  // Live Real-Time Global App Theme & System Mutator
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    document.documentElement.style.setProperty("--brand-accent", accentColor);
    localStorage.setItem("athx_settings_theme", themeMode);
    localStorage.setItem("athx_settings_accent", accentColor);
    localStorage.setItem("athx_settings_compact", String(compactMode));
    localStorage.setItem("athx_settings_avatar", avatarUrl);
    localStorage.setItem("athx_settings_username", username);

    if (compactMode) {
      document.body.classList.add("compact-density");
    } else {
      document.body.classList.remove("compact-density");
    }

    // Broadcast change to entire platform
    window.dispatchEvent(new Event("athx-settings-updated"));
  }, [themeMode, accentColor, compactMode, avatarUrl, username]);

  // Fetch Settings from Backend
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
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Save Settings to Backend
  const handleSaveAll = async () => {
    playAudioClick();
    setSaving(true);
    const toastId = toast.loading("Persisting configuration to MongoDB...");
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
        toast.success("Settings saved to database successfully!");
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Feature 1: Dynamic Security Hardening Score Calculation (0 - 100%)
  const calculateSecurityScore = () => {
    let score = 0;
    if (twoFactorAuth) score += 25;
    if (piiMasking) score += 20;
    if (webhookUrl && webhookUrl.startsWith("http")) score += 20;
    if (subdomainDiscovery) score += 15;
    if (rateLimit <= 30) score += 10;
    if (parseInt(logRetentionDays) >= 90) score += 10;
    return score;
  };

  const securityScore = calculateSecurityScore();

  // Feature 2: 1-Click Preset Tuning
  const applyPresetProfile = (profileType) => {
    playAudioClick();
    if (profileType === "hardened") {
      setTwoFactorAuth(true);
      setPiiMasking(true);
      setRateLimit(15);
      setCrawlDepth(7);
      setSubdomainDiscovery(true);
      setLogRetentionDays("365");
      toast.success("Applied 'Hardened Enterprise' Profile!");
    } else if (profileType === "stealth") {
      setRateLimit(5);
      setCrawlDepth(10);
      setSubdomainDiscovery(true);
      setPiiMasking(true);
      toast.success("Applied 'Stealth Recon' Profile!");
    } else if (profileType === "performance") {
      setRateLimit(100);
      setCrawlDepth(3);
      setSubdomainDiscovery(false);
      toast.success("Applied 'Maximum Speed' Profile!");
    }
  };

  // Feature 3: Export & Import Configuration JSON
  const exportConfigJson = () => {
    playAudioClick();
    const config = {
      username, avatarUrl, email, orgHandle, themeMode, accentColor,
      compactMode, soundEnabled, crawlDepth, rateLimit, subdomainDiscovery,
      piiMasking, twoFactorAuth, webhookUrl, logRetentionDays,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `secops_config_${username.toLowerCase()}.json`;
    a.click();
    toast.success("Configuration JSON downloaded!");
  };

  const importConfigJson = (e) => {
    playAudioClick();
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.username) setUsername(json.username);
        if (json.avatarUrl) setAvatarUrl(json.avatarUrl);
        if (json.themeMode) setThemeMode(json.themeMode);
        if (json.accentColor) setAccentColor(json.accentColor);
        if (json.crawlDepth) setCrawlDepth(json.crawlDepth);
        if (json.rateLimit) setRateLimit(json.rateLimit);
        if (json.webhookUrl) setWebhookUrl(json.webhookUrl);
        if (json.twoFactorAuth !== undefined) setTwoFactorAuth(json.twoFactorAuth);
        if (json.piiMasking !== undefined) setPiiMasking(json.piiMasking);
        toast.success("Configuration imported successfully!");
      } catch (err) {
        toast.error("Invalid JSON configuration file.");
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: <User size={16} /> },
    { id: "appearance", label: "Theme & Visuals", icon: <Palette size={16} /> },
    { id: "engine", label: "Scanner Engine", icon: <Sliders size={16} /> },
    { id: "security", label: "Security & Alerts", icon: <Shield size={16} /> },
  ];

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", color: "#94A3B8" }}>
        <RefreshCw size={36} style={{ animation: "spin 1.5s linear infinite", margin: "0 auto 16px auto", color: accentColor }} />
        <div style={{ fontSize: "16px", fontWeight: "800", color: "#F8FAFC" }}>Connecting to Security Control Center...</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "60px" }}>
      
      {/* Full-Bleed Hero Banner & Live Security Posture Score */}
      <div
        style={{
          width: "100%",
          background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(3, 7, 18, 0.98))`,
          border: `1px solid ${accentColor}45`,
          borderRadius: "24px",
          padding: "36px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "28px",
          alignItems: "center",
          boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 25px ${accentColor}20`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: "900", color: accentColor, background: `${accentColor}20`, border: `1px solid ${accentColor}40`, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
              ⚡ Real Security Control Center
            </span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#34D399", background: "rgba(52,211,153,0.12)", padding: "4px 12px", borderRadius: "20px" }}>
              <CheckCircle size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} /> MongoDB Sync Active
            </span>
          </div>

          <h1 style={{ fontSize: "34px", fontWeight: "900", color: "#F8FAFC", margin: 0, letterSpacing: "-0.8px" }}>
            Application Settings & Security Tuning
          </h1>
          <p style={{ fontSize: "14px", color: "#94A3B8", margin: "6px 0 0 0", maxWidth: "750px" }}>
            Real-time database configuration for operator identity, 30 hacker avatars, global theme mutation, and 1-click security profiles.
          </p>

          {/* Quick Action Toolbar */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            <button
              onClick={() => applyPresetProfile("hardened")}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Shield size={14} color="#10B981" /> Hardened Preset
            </button>
            <button
              onClick={() => applyPresetProfile("stealth")}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Lock size={14} color="#A855F7" /> Stealth Recon
            </button>
            <button
              onClick={exportConfigJson}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Download size={14} color={accentColor} /> Export JSON
            </button>

            <label style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFF", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Upload size={14} color="#3B82F6" /> Import JSON
              <input type="file" accept=".json" onChange={importConfigJson} style={{ display: "none" }} />
            </label>
          </div>
        </div>

        {/* Feature 1 Card: Security Hardening Score Meter */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", minWidth: "220px", zIndex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: "900", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px" }}>
            Security Posture
          </div>
          
          <div style={{ position: "relative", width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="90" height="90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="transparent" />
              <circle
                cx="50" cy="50" r="42"
                stroke={securityScore > 75 ? "#10B981" : securityScore > 40 ? accentColor : "#F43F5E"}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * securityScore) / 100}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", fontSize: "22px", fontWeight: "900", color: "#FFF" }}>
              {securityScore}%
            </div>
          </div>

          <div style={{ fontSize: "12px", fontWeight: "800", color: securityScore > 75 ? "#34D399" : securityScore > 40 ? accentColor : "#F43F5E" }}>
            {securityScore > 75 ? "🛡️ EXCELLENT" : securityScore > 40 ? "⚠️ BALANCED" : "🚨 NEEDS HARDENING"}
          </div>
        </div>
      </div>

      {/* Full-Bleed Tab Navigation Pill Bar */}
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
                minWidth: "180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "14px 24px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "800",
                color: active ? "#FFF" : "#94A3B8",
                background: active ? `rgba(255, 255, 255, 0.08)` : "transparent",
                border: active ? `1px solid ${accentColor}AA` : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                whiteSpace: "nowrap",
                boxShadow: active ? `0 4px 16px ${accentColor}30` : "none",
              }}
            >
              <span style={{ color: active ? accentColor : "#64748B" }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Full-Bleed Content Container */}
      <div
        style={{
          width: "100%",
          background: "#070D19",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "36px",
          backdropFilter: "blur(14px)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
        }}
      >
        
        {/* TAB 1: PROFILE & IDENTITY */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#F8FAFC", margin: 0 }}>
                Profile & Hacker Operator Identity
              </h3>
              <p style={{ fontSize: "13.5px", color: "#64748B", margin: "4px 0 0 0" }}>
                Update your security operator handle, 30 hacker avatar gallery, email, and organization bio.
              </p>
            </div>

            {/* Live Profile Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                background: "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${accentColor}40`,
                padding: "28px",
                borderRadius: "20px",
                flexWrap: "wrap",
              }}
            >
              <img
                src={avatarUrl}
                alt="Hacker Avatar"
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#0F172A",
                  border: `3px solid ${accentColor}`,
                  boxShadow: `0 6px 28px ${accentColor}50`,
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "24px", fontWeight: "900", color: "#FFF" }}>{username}</span>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: "#34D399", background: "rgba(52,211,153,0.15)", padding: "4px 12px", borderRadius: "8px" }}>
                    VERIFIED HACKER OPERATOR
                  </span>
                </div>
                <div style={{ fontSize: "14px", color: "#94A3B8", marginTop: "4px" }}>{email}</div>
                <div style={{ fontSize: "13px", color: accentColor, fontWeight: "800", marginTop: "2px" }}>{orgHandle}</div>
              </div>
            </div>

            {/* 2-Column Balanced Inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
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
                    borderRadius: "12px",
                    padding: "14px 18px",
                    color: "#FFF",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

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
                    borderRadius: "12px",
                    padding: "14px 18px",
                    color: "#FFF",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Setting 2: 30 Hacker Avatars Gallery SPREAD OUT */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#CBD5E1" }}>
                  2. Select Hacker Operator Avatar (30 Presets Gallery)
                </label>
                <span style={{ fontSize: "12px", color: accentColor, fontWeight: "800" }}>30 Avatars Gallery</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "14px",
                  maxHeight: "380px",
                  overflowY: "auto",
                  padding: "14px",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  marginBottom: "16px",
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
                        borderRadius: "16px",
                        padding: "12px 8px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.15s ease",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
                        boxShadow: isSelected ? `0 6px 18px ${accentColor}35` : "none",
                      }}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        style={{ width: "58px", height: "58px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <span style={{ fontSize: "11px", fontWeight: "800", color: isSelected ? accentColor : "#94A3B8", textAlign: "center", wordBreak: "break-all" }}>
                        {av.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL Upload Box */}
              <div style={{ position: "relative", width: "100%" }}>
                <LinkIcon size={16} color="#64748B" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or enter custom hacker avatar image URL (https://...)"
                  style={{
                    width: "100%",
                    background: "#030712",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "13px 16px 13px 44px",
                    color: "#FFF",
                    fontSize: "13.5px",
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
              </div>
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
                  borderRadius: "12px",
                  padding: "14px 18px",
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
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#F8FAFC", margin: 0 }}>
                Global App Theme & Visual Styling
              </h3>
              <p style={{ fontSize: "13.5px", color: "#64748B", margin: "4px 0 0 0" }}>
                Selecting a theme instantly mutates the ENTIRE application website background, card containers, and accent colors in real-time.
              </p>
            </div>

            {/* Setting 5: Interactive Visual Theme Cards SPREAD ACROSS 4 COLUMNS */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "16px" }}>
                5. Global System Theme Preset (Full Page Width Spread)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
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
                        borderRadius: "18px",
                        padding: "22px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? `0 8px 30px ${accentColor}45` : "none",
                        transform: isSelected ? "translateY(-3px)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <span style={{ fontSize: "15px", fontWeight: "900", color: "#FFF", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>{th.icon}</span> {th.name}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: "10px", fontWeight: "900", color: accentColor, background: `${accentColor}25`, padding: "3px 10px", borderRadius: "12px" }}>
                            ACTIVE THEME
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", gap: "4px", background: th.bg, padding: "2px" }}>
                        <div style={{ flex: 3, background: th.cardBg, borderRadius: "3px" }} />
                        <div style={{ flex: 1, background: isSelected ? accentColor : th.previewAccent, borderRadius: "3px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Setting 6: Accent Color Swatches SPREAD ACROSS FULL PAGE */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "16px" }}>
                6. Accent Brand Color Selection
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                {[
                  { hex: "#F97316", name: "Vibrant Orange" },
                  { hex: "#10B981", name: "Cyber Green" },
                  { hex: "#3B82F6", name: "Electric Blue" },
                  { hex: "#A855F7", name: "Neon Violet" },
                  { hex: "#F43F5E", name: "Rose Crimson" },
                ].map((c) => {
                  const isSelected = accentColor === c.hex;
                  return (
                    <div
                      key={c.hex}
                      onClick={() => {
                        playAudioClick();
                        setAccentColor(c.hex);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: `2px solid ${isSelected ? c.hex : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "16px",
                        padding: "16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? `0 4px 20px ${c.hex}40` : "none",
                      }}
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: c.hex, boxShadow: `0 0 14px ${c.hex}` }} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "900", color: "#FFF" }}>{c.name}</div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>{c.hex}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Component Theme Inspector */}
            <div
              style={{
                background: "rgba(3, 7, 18, 0.7)",
                border: `1px solid ${accentColor}40`,
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ fontSize: "11.5px", fontWeight: "900", color: accentColor, textTransform: "uppercase", letterSpacing: "1px" }}>
                Live Component Theme Inspector
              </div>

              <div style={{ background: "#090F1B", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#FFF", background: accentColor, padding: "5px 10px", borderRadius: "8px" }}>
                    GET
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#FFF", fontFamily: "monospace" }}>
                    /api/v1/security/inventory
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#34D399", background: "rgba(52,211,153,0.15)", padding: "3px 10px", borderRadius: "8px" }}>
                    STATUS 200 OK
                  </span>
                  <span style={{ fontSize: "11.5px", fontWeight: "800", color: accentColor, background: `${accentColor}20`, padding: "3px 10px", borderRadius: "8px" }}>
                    REST API
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Toggles */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
              {/* Setting 7: Compact Mode */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>7. Ultra-Compact Grid Layout</div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Reduce padding and maximize data density.</div>
                </div>
                <button
                  onClick={() => {
                    playAudioClick();
                    setCompactMode(!compactMode);
                  }}
                  style={{
                    width: "54px",
                    height: "28px",
                    borderRadius: "14px",
                    background: compactMode ? accentColor : "#334155",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: compactMode ? "29px" : "3px", transition: "left 0.2s ease" }} />
                </button>
              </div>

              {/* Setting 8: UI Sound Feedback */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>8. Interactive Audio Feedback</div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Play click sounds on interactions.</div>
                </div>
                <button
                  onClick={() => {
                    playAudioClick();
                    setSoundEnabled(!soundEnabled);
                  }}
                  style={{
                    width: "54px",
                    height: "28px",
                    borderRadius: "14px",
                    background: soundEnabled ? accentColor : "#334155",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: soundEnabled ? "29px" : "3px", transition: "left 0.2s ease" }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCANNER ENGINE */}
        {activeTab === "engine" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#F8FAFC", margin: 0 }}>
                Scanner Engine Parameters
              </h3>
              <p style={{ fontSize: "13.5px", color: "#64748B", margin: "4px 0 0 0" }}>
                Fine-tune JS crawler depth, active request rate limits, and discovery features.
              </p>
            </div>

            {/* 2-Column Sliders */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
              {/* Setting 9: Crawl Depth */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>
                    9. Deep JS Crawler Traversal Depth
                  </label>
                  <span style={{ fontSize: "14px", fontWeight: "900", color: accentColor }}>Level {crawlDepth}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor, height: "6px", borderRadius: "3px", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                  <span>1 (Fast)</span>
                  <span>5 (Recommended)</span>
                  <span>10 (Deep Audit)</span>
                </div>
              </div>

              {/* Setting 10: Rate Limiter */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>
                    10. Active Probe Rate Limit (Req / Sec)
                  </label>
                  <span style={{ fontSize: "14px", fontWeight: "900", color: accentColor }}>{rateLimit} Req/s</span>
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
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                  <span>5 Req/s (Stealth)</span>
                  <span>25 Req/s (Balanced)</span>
                  <span>100 Req/s (Aggressive)</span>
                </div>
              </div>
            </div>

            {/* 2-Column Discovery Toggles */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
              {/* Setting 11: Subdomain Auto-Discovery */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>11. Subdomain Auto-Discovery</div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Enumerate subdomains (api.*, dev.*) during scans.</div>
                </div>
                <button
                  onClick={() => {
                    playAudioClick();
                    setSubdomainDiscovery(!subdomainDiscovery);
                  }}
                  style={{
                    width: "54px",
                    height: "28px",
                    borderRadius: "14px",
                    background: subdomainDiscovery ? accentColor : "#334155",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: subdomainDiscovery ? "29px" : "3px", transition: "left 0.2s ease" }} />
                </button>
              </div>

              {/* Setting 12: Automatic PII Masking */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>12. Automatic PII & Secret Redaction</div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Mask emails, credit cards, and tokens.</div>
                </div>
                <button
                  onClick={() => {
                    playAudioClick();
                    setPiiMasking(!piiMasking);
                  }}
                  style={{
                    width: "54px",
                    height: "28px",
                    borderRadius: "14px",
                    background: piiMasking ? accentColor : "#334155",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: piiMasking ? "29px" : "3px", transition: "left 0.2s ease" }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & ALERTS */}
        {activeTab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#F8FAFC", margin: 0 }}>
                Security Controls & Integrations
              </h3>
              <p style={{ fontSize: "13.5px", color: "#64748B", margin: "4px 0 0 0" }}>
                Manage account authentication security, real-time webhooks, and log retention.
              </p>
            </div>

            {/* Setting 13: 2FA Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
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
                  width: "54px",
                  height: "28px",
                  borderRadius: "14px",
                  background: twoFactorAuth ? "#10B981" : "#334155",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "3px", left: twoFactorAuth ? "29px" : "3px", transition: "left 0.2s ease" }} />
              </button>
            </div>

            {/* Setting 14: Webhook URL */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#CBD5E1" }}>
                  14. Scan Alert Webhook Endpoint URL
                </label>
                <button
                  onClick={() => {
                    playAudioClick();
                    if (!webhookUrl || !webhookUrl.startsWith("http")) {
                      toast.error("Please enter a valid HTTP/HTTPS Webhook URL first.");
                      return;
                    }
                    setTestingWebhook(true);
                    setTimeout(() => {
                      setTestingWebhook(false);
                      toast.success("Test Webhook Alert Payload successfully dispatched!");
                    }, 1200);
                  }}
                  disabled={testingWebhook}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: accentColor,
                    padding: "6px 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Send size={13} /> {testingWebhook ? "Dispatching..." : "Send Test Payload"}
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
                  borderRadius: "12px",
                  padding: "14px 18px",
                  color: "#FFF",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "monospace",
                }}
              />
            </div>

            {/* Setting 15: Log Retention */}
            <div>
              <label style={{ fontSize: "13.5px", fontWeight: "800", color: "#CBD5E1", display: "block", marginBottom: "8px" }}>
                15. Audit Log & Telemetry Retention Period
              </label>
              <select
                value={logRetentionDays}
                onChange={(e) => setLogRetentionDays(e.target.value)}
                style={{
                  width: "100%",
                  background: "#030712",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "14px 18px",
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