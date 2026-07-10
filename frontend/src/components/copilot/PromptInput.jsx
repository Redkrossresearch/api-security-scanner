import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Send, Paperclip, Code, Globe, Thermometer, Sparkles,
  ChevronDown, Brain, Zap, Check, Mic, Image as ImageIcon,
  X, Command, Plus, MessageSquare, FileText, Cpu,
  Wifi, WifiOff, Database, Layers, Scan
} from "lucide-react";
import toast from "react-hot-toast";

// Design Tokens - FIXED: Consistent naming for shadows
const THEME = {
  colors: {
    primary: "#8B5CF6",
    primaryHover: "#7C3AED",
    secondary: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    surface: "rgba(255,255,255,0.03)",
    surfaceHover: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.5)",
    textSubtle: "rgba(255,255,255,0.3)",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    full: "9999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
  },
  // FIXED: Changed key to 'shadow' to match usage below
  shadow: {
    glow: "0 0 20px rgba(139,92,246,0.3)",
    glowStrong: "0 0 40px rgba(139,92,246,0.5)",
    elevated: "0 8px 32px rgba(0,0,0,0.4)",
    floating: "0 12px 48px rgba(0,0,0,0.5)",
  },
};

const MODELS = [
  {
    id: "openai/gpt-oss-120b:free",
    label: "GPT-OSS 120B",
    provider: "OpenAI",
    badge: "🔥",
    color: "#10A37F",
    speed: "Fast",
    quality: "High",
  },
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4 31B",
    provider: "Google",
    badge: "✨",
    color: "#4285F4",
    speed: "Fast",
    quality: "High",
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    label: "Llama 3.2 3B",
    provider: "Meta",
    badge: "⚡",
    color: "#0866FF",
    speed: "Very Fast",
    quality: "Medium",
  },
  {
    id: "nvidia/nemotron-ultra-253b-v1:free",
    label: "Nemotron Ultra",
    provider: "Nvidia",
    badge: "🛡️",
    color: "#76B900",
    speed: "Medium",
    quality: "Very High",
  },
  {
    id: "deepseek/deepseek-r1:free",
    label: "DeepSeek R1",
    provider: "DeepSeek",
    badge: "🧠",
    color: "#4A90D9",
    speed: "Medium",
    quality: "High",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    label: "Mistral 7B",
    provider: "Mistral AI",
    badge: "️",
    color: "#FF7000",
    speed: "Very Fast",
    quality: "Medium",
  },
];

const SLASH_COMMANDS = [
  { cmd: "/scan", desc: "Scan API endpoints for vulnerabilities", icon: Scan, color: "#EF4444" },
  { cmd: "/explain", desc: "Explain a security vulnerability in depth", icon: Brain, color: "#8B5CF6" },
  { cmd: "/fix", desc: "Generate a secure remediation patch", icon: Zap, color: "#10B981" },
  { cmd: "/review", desc: "Review code for security flaws", icon: Code, color: "#3B82F6" },
  { cmd: "/audit", desc: "OWASP API compliance audit", icon: FileText, color: "#F59E0B" },
  { cmd: "/diagram", desc: "Create an ASCII architecture diagram", icon: Layers, color: "#06B6D4" },
  { cmd: "/report", desc: "Generate a security report summary", icon: MessageSquare, color: "#10B981" },
  { cmd: "/pentest", desc: "Simulate a penetration test scenario", icon: Cpu, color: "#EF4444" },
];

export default function PromptInput({
  value,
  onChange,
  onSend,
  disabled,
  selectedModel,
  onModelChange,
  temperature,
  onTemperatureChange,
}) {
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showTempSlider, setShowTempSlider] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [useMemory, setUseMemory] = useState(true);
  const [scannerContext, setScannerContext] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  // Auto-resize textarea with smooth animation
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 240);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Slash command detector
  useEffect(() => {
    const lastWord = value.split(/\s+/).pop();
    setShowSlashMenu(lastWord.startsWith("/") && lastWord.length > 1);
  }, [value]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        handleSend();
      }
    }
    
    if (e.key === "Escape") {
      setShowSlashMenu(false);
      setShowModelMenu(false);
      setShowTempSlider(false);
      textareaRef.current?.blur();
    }
  }, [value, disabled]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    
    const payload = {
      text: value,
      model: selectedModel,
      temperature,
      webSearch,
      useMemory,
      scannerContext,
      attachments: attachments.map(a => ({ name: a.name, type: a.type })),
    };
    
    onSend(payload);
    
    onChange("");
    setAttachments([]);
    textareaRef.current?.focus();
  };

  const handleSlashSelect = (cmd) => {
    const words = value.split(/\s+/);
    words[words.length - 1] = cmd;
    onChange(words.join(" ") + " ");
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    toast.success(`${files.length} file(s) attached`);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.success(isRecording ? "Voice recording stopped" : "Voice recording started...");
  };

  const filteredSlash = SLASH_COMMANDS.filter((s) => {
    const lastWord = value.split(/\s+/).pop().toLowerCase();
    return lastWord.length > 1 ? s.cmd.startsWith(lastWord) : true;
  });

  const charCount = value.length;
  const maxChars = 4000;
  const charPercentage = (charCount / maxChars) * 100;

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: "relative", 
        padding: "0 24px 14px", 
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .prompt-container { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .prompt-container.focused { transform: translateY(-2px); }
        .model-menu-item, .slash-item, .attachment-chip { transition: all 0.15s ease; }
        .model-menu-item:hover, .slash-item:hover { background: rgba(139,92,246,0.08); transform: translateX(4px); }
        .send-button { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .send-button:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 0 30px rgba(37,99,235,0.6); }
        .send-button:active:not(:disabled) { transform: scale(0.95); }
        .tool-chip { transition: all 0.2s ease; }
        .tool-chip:hover { background: rgba(255,255,255,0.08); transform: translateY(-1px); }
        .tool-chip.active { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.3); }
        .attachment-chip { animation: slide-up 0.3s ease; }
        .recording-indicator { animation: pulse-glow 1.5s ease-in-out infinite; }
      `}</style>

      {/* Slash Commands Popover */}
      {showSlashMenu && filteredSlash.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "28px",
          right: "28px",
          background: "rgba(15,23,42,0.98)",
          border: `1px solid ${THEME.colors.border}`,
          borderRadius: THEME.radius.xl,
          padding: THEME.spacing.sm,
          boxShadow: THEME.shadow.floating,
          marginBottom: THEME.spacing.md,
          zIndex: 100,
          backdropFilter: "blur(12px)",
          animation: "slide-up 0.2s ease",
        }}>
          <div style={{ 
            padding: `${THEME.spacing.xs} ${THEME.spacing.md}`, 
            fontSize: "9px", 
            fontWeight: "700", 
            color: THEME.colors.textSubtle, 
            letterSpacing: "1.2px", 
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <Command size={12} /> Quick Commands
          </div>
          {filteredSlash.map((item, idx) => (
            <div
              key={idx}
              className="slash-item"
              onClick={() => handleSlashSelect(item.cmd)}
              style={{
                padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
                borderRadius: THEME.radius.lg,
                cursor: "pointer",
                display: "flex",
                gap: THEME.spacing.lg,
                alignItems: "center",
                marginBottom: idx < filteredSlash.length - 1 ? "2px" : "0",
              }}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: THEME.radius.md,
                background: `${item.color}20`, border: `1px solid ${item.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <item.icon size={16} color={item.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: THEME.colors.text, fontWeight: "600", fontSize: "13px", fontFamily: "monospace", marginBottom: "2px" }}>{item.cmd}</div>
                <div style={{ color: THEME.colors.textMuted, fontSize: "11.5px" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Selector Dropdown */}
      {showModelMenu && (
        <div
          ref={modelDropdownRef}
          style={{
            position: "absolute", bottom: "100%", left: "28px",
            background: "rgba(15,23,42,0.98)", border: `1px solid ${THEME.colors.border}`,
            borderRadius: THEME.radius.xl, padding: THEME.spacing.sm,
            boxShadow: THEME.shadow.floating, marginBottom: THEME.spacing.md,
            zIndex: 100, minWidth: "300px", backdropFilter: "blur(12px)",
            animation: "slide-up 0.2s ease",
          }}
        >
          <div style={{ padding: `${THEME.spacing.xs} ${THEME.spacing.md}`, fontSize: "9px", fontWeight: "700", color: THEME.colors.textSubtle, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: THEME.spacing.sm }}>Select AI Model</div>
          {MODELS.map((model) => {
            const isSelected = model.id === selectedModel;
            return (
              <div key={model.id} className="model-menu-item" onClick={() => { onModelChange(model.id); setShowModelMenu(false); }} style={{ padding: `${THEME.spacing.md} ${THEME.spacing.lg}`, borderRadius: THEME.radius.lg, cursor: "pointer", display: "flex", alignItems: "center", gap: THEME.spacing.md, background: isSelected ? "rgba(139,92,246,0.1)" : "transparent", border: isSelected ? `1px solid ${THEME.colors.primary}40` : "1px solid transparent", marginBottom: "2px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: THEME.radius.md, background: `${model.color}20`, border: `1px solid ${model.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{model.badge}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: isSelected ? THEME.colors.text : "rgba(255,255,255,0.85)", marginBottom: "2px" }}>{model.label}</div>
                  <div style={{ fontSize: "11px", color: THEME.colors.textSubtle, display: "flex", gap: "8px", alignItems: "center" }}>
                    <span>{model.provider}</span><span>•</span><span style={{ color: model.color }}>{model.speed}</span>
                  </div>
                </div>
                {isSelected && <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: THEME.colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#FFF" /></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Floating Input Container */}
      <div 
        className={`prompt-container ${isFocused ? "focused" : ""}`}
        style={{
          background: "linear-gradient(180deg, rgba(24,32,54,0.9) 0%, rgba(13,18,32,0.9) 100%)",
          border: `1px solid ${isFocused ? THEME.colors.primary + "70" : THEME.colors.border}`,
          borderRadius: THEME.radius["2xl"],
          overflow: "hidden",
          boxShadow: isFocused
            ? `${THEME.shadow.glowStrong}, 0 20px 50px rgba(0,0,0,0.45)`
            : `${THEME.shadow.elevated}, inset 0 1px 0 rgba(255,255,255,0.04)`,
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div style={{ display: "flex", gap: THEME.spacing.sm, padding: `${THEME.spacing.md} ${THEME.spacing.lg}`, borderBottom: `1px solid ${THEME.colors.border}`, flexWrap: "wrap" }}>
            {attachments.map((att, idx) => (
              <div key={idx} className="attachment-chip" style={{ display: "flex", alignItems: "center", gap: "6px", padding: `${THEME.spacing.xs} ${THEME.spacing.md}`, background: "rgba(139,92,246,0.1)", border: `1px solid ${THEME.colors.primary}30`, borderRadius: THEME.radius.full, fontSize: "11.5px", color: THEME.colors.text, fontWeight: "500" }}>
                <FileText size={12} color={THEME.colors.primary} />
                <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
                <button onClick={() => removeAttachment(idx)} style={{ background: "none", border: "none", color: THEME.colors.textSubtle, cursor: "pointer", padding: "2px", display: "flex", marginLeft: "4px" }}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar Row */}
        <div style={{ display: "flex", alignItems: "center", gap: THEME.spacing.sm, padding: `${THEME.spacing.md} ${THEME.spacing.lg} 0`, flexWrap: "wrap" }}>
          <button onClick={() => setShowModelMenu(!showModelMenu)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: `${THEME.spacing.xs} ${THEME.spacing.md}`, background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.full, color: THEME.colors.text, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
            <span style={{ fontSize: "16px" }}>{currentModel.badge}</span>
            <span>{currentModel.label}</span>
            <ChevronDown size={12} color={THEME.colors.textSubtle} />
          </button>

          <button onClick={() => setShowTempSlider(!showTempSlider)} className="tool-chip" style={{ display: "flex", alignItems: "center", gap: "6px", padding: `${THEME.spacing.xs} ${THEME.spacing.md}`, background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.full, color: THEME.colors.textMuted, fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}>
            <Thermometer size={12} color={THEME.colors.primary} /><span>Temp: {temperature}</span>
          </button>

          {showTempSlider && (
            <div style={{ display: "flex", alignItems: "center", gap: THEME.spacing.md, padding: `0 ${THEME.spacing.md}`, animation: "slide-up 0.2s ease" }}>
              <span style={{ fontSize: "10.5px", color: THEME.colors.textSubtle, fontWeight: "500" }}>Precise</span>
              <input type="range" min="0.1" max="2.0" step="0.1" value={temperature} onChange={(e) => onTemperatureChange(parseFloat(e.target.value))} style={{ width: "100px", accentColor: THEME.colors.primary, cursor: "pointer", height: "4px", borderRadius: "2px" }} />
              <span style={{ fontSize: "10.5px", color: THEME.colors.textSubtle, fontWeight: "500" }}>Creative</span>
            </div>
          )}

          <button onClick={() => setWebSearch(!webSearch)} className={`tool-chip ${webSearch ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: `${THEME.spacing.xs} ${THEME.spacing.md}`, background: webSearch ? "rgba(16,185,129,0.15)" : THEME.colors.surface, border: `1px solid ${webSearch ? THEME.colors.success + "40" : THEME.colors.border}`, borderRadius: THEME.radius.full, color: webSearch ? THEME.colors.success : THEME.colors.textMuted, fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}>
            {webSearch ? <Wifi size={12} /> : <WifiOff size={12} />} Web
          </button>

          <button onClick={() => setUseMemory(!useMemory)} className={`tool-chip ${useMemory ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: `${THEME.spacing.xs} ${THEME.spacing.md}`, background: useMemory ? "rgba(139,92,246,0.15)" : THEME.colors.surface, border: `1px solid ${useMemory ? THEME.colors.primary + "40" : THEME.colors.border}`, borderRadius: THEME.radius.full, color: useMemory ? THEME.colors.primary : THEME.colors.textMuted, fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}>
            <Database size={12} /> Memory
          </button>

          <button onClick={() => setScannerContext(!scannerContext)} className={`tool-chip ${scannerContext ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: `${THEME.spacing.xs} ${THEME.spacing.md}`, background: scannerContext ? "rgba(245,158,11,0.15)" : THEME.colors.surface, border: `1px solid ${scannerContext ? THEME.colors.warning + "40" : THEME.colors.border}`, borderRadius: THEME.radius.full, color: scannerContext ? THEME.colors.warning : THEME.colors.textMuted, fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}>
            <Scan size={12} /> Scanner
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Ask anything... Type '/' for commands, Shift+Enter for new line"
          style={{
            width: "100%", minHeight: "60px", maxHeight: "240px", background: "transparent", border: "none",
            color: THEME.colors.text, fontSize: "14.5px", outline: "none", resize: "none", fontFamily: "inherit",
            lineHeight: "1.6", padding: `${THEME.spacing.lg} ${THEME.spacing["2xl"]}`, boxSizing: "border-box",
          }}
        />

        {/* Bottom Action Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${THEME.spacing.sm} ${THEME.spacing.lg} ${THEME.spacing.md}`, borderTop: `1px solid ${THEME.colors.border}` }}>
          <div style={{ display: "flex", gap: THEME.spacing.sm }}>
            <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileSelect} />
            <button onClick={() => fileInputRef.current?.click()} title="Attach files" style={{ background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.full, color: THEME.colors.textMuted, cursor: "pointer", padding: `${THEME.spacing.sm} ${THEME.spacing.md}`, display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: "500", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.background = THEME.colors.surfaceHover; e.currentTarget.style.color = THEME.colors.text; }} onMouseLeave={(e) => { e.currentTarget.style.background = THEME.colors.surface; e.currentTarget.style.color = THEME.colors.textMuted; }}>
              <Paperclip size={14} /> Attach
            </button>
            
            <button onClick={toggleRecording} className={isRecording ? "recording-indicator" : ""} title="Voice input" style={{ background: isRecording ? `${THEME.colors.danger}20` : THEME.colors.surface, border: `1px solid ${isRecording ? THEME.colors.danger + "40" : THEME.colors.border}`, borderRadius: THEME.radius.full, color: isRecording ? THEME.colors.danger : THEME.colors.textMuted, cursor: "pointer", padding: `${THEME.spacing.sm} ${THEME.spacing.md}`, display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: "500", transition: "all 0.2s ease" }}>
              <Mic size={14} /> {isRecording ? "Recording..." : "Voice"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: THEME.spacing.lg }}>
            <div style={{ display: "flex", alignItems: "center", gap: THEME.spacing.sm, fontSize: "11px", color: charPercentage > 90 ? THEME.colors.danger : THEME.colors.textSubtle }}>
              <div style={{ width: "60px", height: "3px", background: THEME.colors.surface, borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(charPercentage, 100)}%`, height: "100%", background: charPercentage > 90 ? THEME.colors.danger : THEME.colors.primary, transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontWeight: "500", fontFamily: "monospace" }}>{charCount.toLocaleString()}/{maxChars.toLocaleString()}</span>
            </div>

            <button className="send-button" onClick={handleSend} disabled={disabled || !value.trim()} style={{
              width: "44px", height: "44px", borderRadius: THEME.radius.lg,
              background: disabled || !value.trim() ? THEME.colors.surface : `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.secondary} 100%)`,
              border: disabled || !value.trim() ? `1px solid ${THEME.colors.border}` : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
              boxShadow: disabled || !value.trim() ? "none" : `0 6px 20px rgba(139,92,246,0.45), 0 0 0 1px ${THEME.colors.primary}50`,
              flexShrink: 0, opacity: disabled || !value.trim() ? 0.5 : 1,
            }}>
              {disabled ? (
                <div style={{ width: "18px", height: "18px", border: `2px solid ${THEME.colors.textSubtle}30`, borderTop: `2px solid ${THEME.colors.text}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              ) : (
                <Send size={18} color="#FFF" style={{ marginLeft: "2px" }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint — compact single-line caption, no extra dead space below */}
      <div style={{ textAlign: "center", marginTop: "8px", lineHeight: 1, fontSize: "10.5px", color: THEME.colors.textSubtle, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <kbd style={{ padding: "1.5px 5px", background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.sm, fontSize: "9.5px", fontWeight: "600", fontFamily: "monospace" }}>Enter</kbd>
          <span>Send</span>
        </span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <kbd style={{ padding: "1.5px 5px", background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.sm, fontSize: "9.5px", fontWeight: "600", fontFamily: "monospace" }}>Shift+Enter</kbd>
          <span>New line</span>
        </span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <kbd style={{ padding: "1.5px 5px", background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.sm, fontSize: "9.5px", fontWeight: "600", fontFamily: "monospace" }}>/</kbd>
          <span>Commands</span>
        </span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <kbd style={{ padding: "1.5px 5px", background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.sm, fontSize: "9.5px", fontWeight: "600", fontFamily: "monospace" }}>Esc</kbd>
          <span>Close</span>
        </span>
      </div>
    </div>
  );
}