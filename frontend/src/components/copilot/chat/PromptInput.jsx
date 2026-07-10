import React, { useRef, useEffect, useState } from "react";
import { Send, Paperclip, Code, Globe, Thermometer, Sparkles, ChevronDown, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const MODELS = [
  {
    id: "openai/gpt-oss-120b:free",
    label: "GPT-OSS 120B",
    provider: "OpenAI",
    badge: "🔥",
    color: "#10A37F",
  },
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4 31B",
    provider: "Google",
    badge: "✨",
    color: "#4285F4",
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    label: "Llama 3.2 3B",
    provider: "Meta",
    badge: "⚡",
    color: "#0866FF",
  },
  {
    id: "nvidia/nemotron-ultra-253b-v1:free",
    label: "Nemotron Ultra",
    provider: "Nvidia",
    badge: "🛡️",
    color: "#76B900",
  },
  {
    id: "deepseek/deepseek-r1:free",
    label: "DeepSeek R1",
    provider: "DeepSeek",
    badge: "🧠",
    color: "#4A90D9",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    label: "Mistral 7B",
    provider: "Mistral AI",
    badge: "🌪️",
    color: "#FF7000",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    label: "Llama 3.1 8B",
    provider: "Meta",
    badge: "🤖",
    color: "#0866FF",
  },
  {
    id: "qwen/qwen-2.5-7b-instruct:free",
    label: "Qwen 2.5 7B",
    provider: "Alibaba",
    badge: "🔴",
    color: "#A70000",
  },
  {
    id: "google/gemma-2-9b-it:free",
    label: "Gemma 2 9B",
    provider: "Google",
    badge: "🪐",
    color: "#4285F4",
  },
  {
    id: "microsoft/phi-3-medium-128k-instruct:free",
    label: "Phi 3 Medium",
    provider: "Microsoft",
    badge: "🧬",
    color: "#0078D4",
  },
  {
    id: "meta-llama/llama-3-8b-instruct:free",
    label: "Llama 3 8B",
    provider: "Meta",
    badge: "🛸",
    color: "#0866FF",
  },
  {
    id: "cognitivecomputations/dolphin-mixtral-8x7b:free",
    label: "Dolphin Mixtral",
    provider: "Cognitive Computations",
    badge: "🐬",
    color: "#00A896",
  },
];

const SLASH_COMMANDS = [
  { cmd: "/scan", desc: "Scan API endpoints for vulnerabilities" },
  { cmd: "/explain", desc: "Explain a security vulnerability in depth" },
  { cmd: "/fix", desc: "Generate a secure remediation patch" },
  { cmd: "/review", desc: "Review code for security flaws" },
  { cmd: "/audit", desc: "OWASP API compliance audit" },
  { cmd: "/diagram", desc: "Create an ASCII architecture diagram" },
  { cmd: "/report", desc: "Generate a security report summary" },
  { cmd: "/pentest", desc: "Simulate a penetration test scenario" },
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
  webSearch: propWebSearch,
  onWebSearchChange,
}) {
  const textareaRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showTempSlider, setShowTempSlider] = useState(false);
  
  const [localWebSearch, setLocalWebSearch] = useState(false);
  const webSearch = propWebSearch !== undefined ? propWebSearch : localWebSearch;
  const setWebSearch = onWebSearchChange || setLocalWebSearch;
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  // Auto-resize height of input area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  // Monitor slash keypress to toggle dropdown
  useEffect(() => {
    setShowSlashMenu(value.startsWith("/") && !value.includes(" "));
  }, [value]);

  // Handle outside click to close dropdown menus
  useEffect(() => {
    const handler = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  const handleSlashSelect = (cmd) => {
    onChange(`${cmd} `);
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  const handleAttachFile = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...uploadedFiles]);
    toast.success(`${uploadedFiles.length} file(s) attached successfully`);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const filteredSlash = SLASH_COMMANDS.filter((s) =>
    value.length > 1 ? s.cmd.startsWith(value.toLowerCase()) : true
  );

  return (
    <div style={{ position: "relative", padding: "0 28px 20px", flexShrink: 0, boxSizing: "border-box" }}>
      <style>{`
        .prompt-input-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }
        .tool-badge:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #FFF !important;
        }
        .model-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .prompt-input-area::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .slash-menu-item:hover {
          background: rgba(139, 92, 246, 0.12);
        }
      `}</style>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleAttachFile} 
        multiple 
        style={{ display: "none" }} 
      />

      {/* Slash commands list menu overlay */}
      {showSlashMenu && filteredSlash.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "28px",
          right: "28px",
          maxWidth: "800px",
          margin: "0 auto 8px",
          background: "#0D1424",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "6px",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
          zIndex: 100,
        }}>
          <div style={{ padding: "4px 8px 8px", fontSize: "9.5px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Directives List
          </div>
          {filteredSlash.map((item, idx) => (
            <div
              key={idx}
              className="slash-menu-item"
              onClick={() => handleSlashSelect(item.cmd)}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#A78BFA", fontWeight: "700", fontSize: "12.5px", fontFamily: "monospace" }}>
                {item.cmd}
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11.5px" }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Model dropdown Menu overlay */}
      {showModelMenu && (
        <div
          ref={modelDropdownRef}
          style={{
            position: "absolute",
            bottom: "100%",
            left: "28px",
            background: "#0D1424",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            padding: "8px",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
            marginBottom: "8px",
            zIndex: 100,
            minWidth: "260px",
          }}
        >
          <div style={{ padding: "4px 8px 10px", fontSize: "9.5px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Select Engine model
          </div>
          {MODELS.map((model) => {
            const isSelected = model.id === selectedModel;
            return (
              <div
                key={model.id}
                className="model-item"
                onClick={() => { onModelChange(model.id); setShowModelMenu(false); }}
                style={{
                  padding: "10px 12px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: isSelected ? "rgba(139,92,246,0.1)" : "transparent",
                  border: isSelected ? "1px solid rgba(139,92,246,0.2)" : "1px solid transparent",
                  marginBottom: "2px",
                }}
              >
                <span style={{ fontSize: "16px" }}>{model.badge}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12.5px", fontWeight: "600", color: isSelected ? "#FFF" : "rgba(255,255,255,0.7)" }}>
                    {model.label}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>
                    {model.provider}
                  </div>
                </div>
                {isSelected && <Check size={13} color="#A78BFA" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Console Box container */}
      <div className="prompt-input-container">
        {/* Badges Toolbar menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px 0", flexWrap: "wrap" }}>
          {/* Model picker trigger badge */}
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "7px",
              color: "#FFF",
              fontSize: "11.5px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <span>{currentModel.badge}</span>
            <span>{currentModel.label}</span>
            <ChevronDown size={11} color="rgba(255,255,255,0.4)" />
          </button>

          {/* Temperature Slider toggle trigger */}
          <button
            onClick={() => setShowTempSlider(!showTempSlider)}
            className="tool-badge"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "7px",
              color: "rgba(255,255,255,0.55)",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <Thermometer size={11} color="#A78BFA" />
            Temp: {temperature}
          </button>

          {showTempSlider && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                style={{ width: "80px", accentColor: "#8B5CF6", cursor: "pointer" }}
              />
            </div>
          )}

          {/* Web Search toggle */}
          <button
            onClick={() => setWebSearch(!webSearch)}
            className="tool-badge"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              background: webSearch ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${webSearch ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "7px",
              color: webSearch ? "#10B981" : "rgba(255,255,255,0.4)",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <Globe size={11} />
            Web Search
          </button>

          {/* Scanner context status */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "10.5px",
            color: "#10B981",
            fontWeight: "600",
            padding: "4px 8px",
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.15)",
            borderRadius: "7px",
          }}>
            <Sparkles size={10} />
            Scanner Context Bound
          </div>
        </div>

        {/* Text Input area */}
        <textarea
          ref={textareaRef}
          className="prompt-input-area"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask anything... Type '/' for directives, Shift+Enter for newline"
          style={{
            width: "100%",
            minHeight: "52px",
            maxHeight: "180px",
            background: "transparent",
            border: "none",
            color: "#FFF",
            fontSize: "14px",
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
            lineHeight: "1.6",
            padding: "12px 16px",
            boxSizing: "border-box",
          }}
        />

        {/* Uploaded Files Chips preview */}
        {files.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "4px 16px 8px" }}>
            {files.map((file, idx) => (
              <div 
                key={idx} 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.8)"
                }}
              >
                <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </span>
                <X 
                  size={10} 
                  style={{ cursor: "pointer" }} 
                  onClick={() => removeFile(idx)} 
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions panel row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px 12px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          {/* Attach trigger icon */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", padding: 0 }}
          >
            <Paperclip size={16} />
          </button>

          {/* Senders control */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.2)" }}>
              {value.length}/4000
            </span>

            {/* Send trigger Button */}
            <button
              onClick={onSend}
              disabled={disabled || !value.trim()}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: disabled || !value.trim()
                  ? "rgba(37,99,235,0.2)"
                  : "#2563EB",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
                boxShadow: disabled || !value.trim() ? "none" : "0 0 16px rgba(37,99,235,0.5)",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              <Send size={14} color={disabled || !value.trim() ? "rgba(255,255,255,0.3)" : "#FFF"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
