import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Send, Paperclip, Code, Globe, Thermometer, Sparkles,
  ChevronDown, Brain, Zap, Check, Mic, Image as ImageIcon,
  X, Command, Plus, MessageSquare, FileText, Cpu,
  Wifi, WifiOff, Database, Layers, Scan, Shield, Lock, Key,
  AlertTriangle, Bug, Network, Server, Terminal, Eye, RefreshCw,
  List, BookOpen, Search, Filter, Crosshair, Activity, Archive,
  Hash, Package, GitBranch, Wrench, BarChart2, Radio, Fingerprint,
} from "lucide-react";
import toast from "react-hot-toast";

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
  radius: { sm: "8px", md: "12px", lg: "16px", xl: "20px", "2xl": "24px", full: "9999px" },
  spacing: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "20px", "2xl": "24px" },
  shadow: {
    glow: "0 0 20px rgba(139,92,246,0.3)",
    glowStrong: "0 0 40px rgba(139,92,246,0.5)",
    elevated: "0 8px 32px rgba(0,0,0,0.4)",
    floating: "0 12px 48px rgba(0,0,0,0.5)",
  },
};

// ─── Model Logos as SVG/IMG ────────────────────────────────────────────────────
const ModelLogo = ({ provider, color, size = 20 }) => {
  const s = size;
  if (provider === "OpenAI") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M22.28 9.82a5.49 5.49 0 0 0-.47-4.52 5.57 5.57 0 0 0-5.99-2.66A5.5 5.5 0 0 0 11.72 1a5.57 5.57 0 0 0-5.3 3.86 5.5 5.5 0 0 0-3.67 2.67 5.58 5.58 0 0 0 .69 6.53 5.5 5.5 0 0 0 .47 4.52 5.57 5.57 0 0 0 5.99 2.66A5.5 5.5 0 0 0 14 23a5.57 5.57 0 0 0 5.3-3.86 5.5 5.5 0 0 0 3.67-2.67 5.58 5.58 0 0 0-.69-6.65zm-8.22 11.5a4.12 4.12 0 0 1-2.65-.96l.13-.07 4.4-2.54a.72.72 0 0 0 .37-.63v-6.2l1.86 1.07a.07.07 0 0 1 .04.05v5.13a4.14 4.14 0 0 1-4.15 4.15zm-8.9-3.8a4.12 4.12 0 0 1-.49-2.78l.13.08 4.4 2.54a.73.73 0 0 0 .73 0l5.37-3.1v2.14a.07.07 0 0 1-.03.06L10.89 18.6a4.14 4.14 0 0 1-5.73-1.08zM3.94 8.39A4.12 4.12 0 0 1 6.09 6.5v5.2a.72.72 0 0 0 .36.62l5.37 3.1-1.86 1.07a.07.07 0 0 1-.07 0L5.4 14a4.14 4.14 0 0 1-1.46-5.61zm15.23 3.56-5.37-3.1 1.86-1.07a.07.07 0 0 1 .07 0l4.49 2.6a4.14 4.14 0 0 1-.64 7.47v-5.2a.72.72 0 0 0-.41-.7zm1.85-2.79-.13-.08-4.4-2.54a.73.73 0 0 0-.73 0l-5.37 3.1V7.5a.07.07 0 0 1 .03-.06L14.9 4.83a4.14 4.14 0 0 1 6.12 4.33zm-11.63 3.82-1.86-1.07a.07.07 0 0 1-.04-.05V6.73a4.14 4.14 0 0 1 6.78-3.18l-.13.07-4.4 2.54a.72.72 0 0 0-.37.63v6.19zm1.01-2.18 2.39-1.38 2.39 1.38v2.75l-2.39 1.38-2.39-1.38V10.8z" fill={color}/>
    </svg>
  );
  if (provider === "Google") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
  if (provider === "Meta") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#0866FF"/>
      <path d="M8.5 8.5c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v.5h-7v-.5zm-1 2h9v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5zm3.5 1.5v3h3v-3h-3z" fill="white"/>
    </svg>
  );
  if (provider === "Nvidia") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#76B900"/>
      <path d="M9 7v10h2V9h2v8h2V7H9z" fill="white"/>
      <path d="M4 9h4v2H4zM4 13h4v2H4z" fill="white"/>
      <path d="M17 9h3v2h-3zM17 13h3v2h-3z" fill="white"/>
    </svg>
  );
  if (provider === "DeepSeek") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#4A90D9"/>
      <path d="M8 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="white"/>
      <path d="M12 6v2M12 16v2M6 12h2M16 12h2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (provider === "Mistral AI") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#FF7000"/>
      <path d="M5 7h3v3H5zM5 14h3v3H5zM11 7h3v3h-3zM11 14h3v3h-3zM17 7h2v3h-2zM17 14h2v3h-2zM8 10h3v4H8zM14 10h3v4h-3z" fill="white"/>
    </svg>
  );
  if (provider === "Alibaba") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FF6A00"/>
      <path d="M8 16L12 8l4 8M9.5 13h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (provider === "Microsoft") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022"/>
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00"/>
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF"/>
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900"/>
    </svg>
  );
  if (provider === "Cognitive Computations") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#6366F1"/>
      <path d="M8 10c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.5-.8 2.8-2 3.5V16h-4v-2.5C8.8 12.8 8 11.5 8 10z" fill="white"/>
      <rect x="10" y="16" width="4" height="2" rx="1" fill="white"/>
    </svg>
  );
  if (provider === "Anthropic") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 20h4.5l1.8-4h5.4l1.8 4H21L12 2zm-1.8 10l1.8-4 1.8 4h-3.6z" fill="#F0A973"/>
    </svg>
  );
  // Default
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={color || "#6B7280"}/>
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

const MODELS = [
  // ⚡ Active Native API Keys (Google Gemini & Groq LPU Active)
  { id: "gemini", label: "Gemini Flash Latest (Active API Key)", provider: "Google Gemini", color: "#4285F4", speed: "Ultra Fast", quality: "Highest", desc: "Google's active Gemini model via GEMINI_API_KEY" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Active API Key)", provider: "Google Gemini", color: "#4285F4", speed: "Ultra Fast", quality: "High", desc: "Next-gen Gemini 2.0 Flash engine" },
  { id: "groq", label: "Llama 3.3 70B (Groq Active Key)", provider: "Groq LPU", color: "#F55036", speed: "⚡ 500 tok/s", quality: "Ultra", desc: "Ultra-fast Groq LPU inference (180ms response)" },
  { id: "groq-instant", label: "Llama 3.1 8B (Groq Active Key)", provider: "Groq LPU", color: "#F55036", speed: "⚡ 800 tok/s", quality: "High", desc: "Instant Groq LPU inference (89ms response)" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Active API Key)", provider: "Google Gemini", color: "#8E24AA", speed: "Medium", quality: "Ultra", desc: "Complex security reasoning with 1M context" },

  // 🔄 Multi-Provider Fallback Models
  { id: "openai", label: "GPT-4o-Mini (OpenRouter / Fallback)", provider: "OpenAI", color: "#10A37F", speed: "Fast", quality: "High", desc: "OpenAI instruction model via OpenRouter/Fallback" },
  { id: "claude", label: "Claude 3.5 Sonnet (Fallback)", provider: "Anthropic", color: "#F0A973", speed: "Fast", quality: "Highest", desc: "Anthropic's flagship model via fallback" },
  { id: "deepseek", label: "DeepSeek V3 (Fallback)", provider: "DeepSeek", color: "#4A90D9", speed: "Fast", quality: "Highest", desc: "DeepSeek reasoning model via fallback" },
  { id: "qwen-coder", label: "Qwen Coder 32B (Fallback)", provider: "Alibaba", color: "#FF6A00", speed: "Fast", quality: "High", desc: "Code security analysis model" },
  { id: "mistral", label: "Mistral Small (Fallback)", provider: "Mistral AI", color: "#FF7000", speed: "Very Fast", quality: "Medium", desc: "Fast & light security auditing model" },
];




// ─── 30+ Slash Directives ──────────────────────────────────────────────────────
const SLASH_COMMANDS = [
  // Security Analysis
  { cmd: "/scan", desc: "Scan API endpoints for vulnerabilities", icon: Scan, color: "#EF4444", category: "Analysis" },
  { cmd: "/pentest", desc: "Simulate a penetration test scenario", icon: Crosshair, color: "#EF4444", category: "Analysis" },
  { cmd: "/audit", desc: "OWASP API security compliance audit", icon: Shield, color: "#F59E0B", category: "Analysis" },
  { cmd: "/fuzz", desc: "Generate fuzz testing payloads for endpoints", icon: Bug, color: "#EF4444", category: "Analysis" },
  { cmd: "/recon", desc: "Perform reconnaissance on a target domain", icon: Eye, color: "#8B5CF6", category: "Analysis" },
  { cmd: "/burp", desc: "Generate Burp Suite scan configuration", icon: Network, color: "#F59E0B", category: "Analysis" },
  { cmd: "/nmap", desc: "Create an nmap scan command for a target", icon: Radio, color: "#10B981", category: "Analysis" },
  { cmd: "/headers", desc: "Analyze HTTP security headers", icon: Filter, color: "#3B82F6", category: "Analysis" },
  // Code & Fix
  { cmd: "/fix", desc: "Generate a secure code remediation patch", icon: Zap, color: "#10B981", category: "Fix" },
  { cmd: "/review", desc: "Review code for security flaws", icon: Code, color: "#3B82F6", category: "Fix" },
  { cmd: "/patch", desc: "Create a zero-day vulnerability patch", icon: Wrench, color: "#10B981", category: "Fix" },
  { cmd: "/sanitize", desc: "Add input sanitization to code", icon: Lock, color: "#10B981", category: "Fix" },
  { cmd: "/harden", desc: "Harden server / API configuration", icon: Shield, color: "#8B5CF6", category: "Fix" },
  { cmd: "/csp", desc: "Generate Content Security Policy header", icon: Lock, color: "#3B82F6", category: "Fix" },
  { cmd: "/cors", desc: "Fix or audit CORS policy configuration", icon: Globe, color: "#06B6D4", category: "Fix" },
  // Explain
  { cmd: "/explain", desc: "Explain a security vulnerability in depth", icon: Brain, color: "#8B5CF6", category: "Explain" },
  { cmd: "/cvss", desc: "Calculate CVSS score for a vulnerability", icon: BarChart2, color: "#F59E0B", category: "Explain" },
  { cmd: "/cwe", desc: "Look up CWE weakness taxonomy", icon: Hash, color: "#6366F1", category: "Explain" },
  { cmd: "/owasp", desc: "Map finding to OWASP Top 10 / API Top 10", icon: BookOpen, color: "#F59E0B", category: "Explain" },
  { cmd: "/attack", desc: "Describe attack vector and exploit chain", icon: AlertTriangle, color: "#EF4444", category: "Explain" },
  { cmd: "/payload", desc: "Generate attack payloads for testing", icon: Terminal, color: "#EF4444", category: "Explain" },
  { cmd: "/jwt", desc: "Decode and analyze a JWT token", icon: Key, color: "#8B5CF6", category: "Explain" },
  // Reports & Docs
  { cmd: "/report", desc: "Generate a full security report summary", icon: MessageSquare, color: "#10B981", category: "Report" },
  { cmd: "/diagram", desc: "Create an ASCII architecture diagram", icon: Layers, color: "#06B6D4", category: "Report" },
  { cmd: "/checklist", desc: "Generate a security hardening checklist", icon: List, color: "#10B981", category: "Report" },
  { cmd: "/executive", desc: "Write an executive risk summary", icon: FileText, color: "#3B82F6", category: "Report" },
  { cmd: "/timeline", desc: "Create an incident response timeline", icon: Activity, color: "#F59E0B", category: "Report" },
  { cmd: "/compare", desc: "Compare two security frameworks or tools", icon: GitBranch, color: "#8B5CF6", category: "Report" },
  // Actions
  { cmd: "/search", desc: "Search security knowledge base + web", icon: Search, color: "#06B6D4", category: "Action" },
  { cmd: "/cve", desc: "Look up a CVE identifier in detail", icon: AlertTriangle, color: "#EF4444", category: "Action" },
  { cmd: "/deps", desc: "Audit dependencies for known CVEs", icon: Package, color: "#F59E0B", category: "Action" },
  { cmd: "/hash", desc: "Generate or crack password hashes", icon: Fingerprint, color: "#8B5CF6", category: "Action" },
  { cmd: "/encode", desc: "Encode / decode data (base64, URL, hex)", icon: Archive, color: "#06B6D4", category: "Action" },
  { cmd: "/regex", desc: "Generate input validation regex patterns", icon: Code, color: "#3B82F6", category: "Action" },
  { cmd: "/curl", desc: "Build a curl command for API testing", icon: Terminal, color: "#10B981", category: "Action" },
  { cmd: "/docker", desc: "Harden Docker / container configuration", icon: Server, color: "#3B82F6", category: "Action" },
];

// ─── AI Quick Suggestions ──────────────────────────────────────────────────────
const AI_SUGGESTIONS = [
  "Explain BOLA (Broken Object Level Authorization) with code examples",
  "Scan https://api.example.com for OWASP API Top 10 vulnerabilities",
  "Generate JWT authentication middleware for Express.js",
  "What are the most critical API security misconfigurations in 2024?",
  "Review this code for SQL injection vulnerabilities",
  "How do I implement rate limiting to prevent DDoS attacks?",
  "Explain the difference between authentication and authorization",
  "Generate a Burp Suite scan config for authenticated API testing",
  "What is SSRF and how can I exploit or prevent it?",
  "Create a security hardening checklist for Node.js REST APIs",
  "Decode and analyze this JWT token for security issues",
  "How do I prevent XSS in React applications?",
  "Generate CORS policy for a production API server",
  "Explain CVE-2024-4577 and its impact on PHP servers",
  "Write a penetration test report template",
];

const CATEGORY_COLORS = {
  Analysis: "#EF4444",
  Fix: "#10B981",
  Explain: "#8B5CF6",
  Report: "#3B82F6",
  Action: "#06B6D4",
};

const getFileBadgeColor = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': case 'ts': case 'tsx': return { bg: 'rgba(247,223,30,0.1)', border: 'rgba(247,223,30,0.3)', text: '#F7DF1E', ext: 'JS' };
    case 'json': return { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10B981', ext: 'JSON' };
    case 'py': return { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3B82F6', ext: 'PY' };
    case 'html': case 'htm': return { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', text: '#F97316', ext: 'HTML' };
    case 'css': return { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', text: '#6366F1', ext: 'CSS' };
    case 'md': return { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#A855F7', ext: 'MD' };
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': return { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.3)', text: '#EC4899', ext: 'IMG' };
    default: return { bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.3)', text: '#9CA3AF', ext: ext.toUpperCase() };
  }
};

export default function PromptInput({
  value, onChange, onSend, disabled, selectedModel, onModelChange, temperature, onTemperatureChange, webSearch, onWebSearchChange,
}) {
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showTempSlider, setShowTempSlider] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [useMemory, setUseMemory] = useState(true);
  const [scannerContext, setScannerContext] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(null);
  const [modelSearch, setModelSearch] = useState("");
  
  const recognitionRef = useRef(null);

  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 240);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Slash command detector
  useEffect(() => {
    const parts = value.split(/\s+/);
    const lastWord = parts[parts.length - 1];
    if (lastWord.startsWith("/")) {
      setSlashFilter(lastWord.toLowerCase());
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
      setSlashFilter("");
    }
  }, [value]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setShowModelMenu(false);
        setModelSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && (value.trim() || attachments.length > 0)) handleSend();
    }
    if (e.key === "Escape") {
      setShowSlashMenu(false);
      setShowModelMenu(false);
      setShowTempSlider(false);
      textareaRef.current?.blur();
    }
  }, [value, disabled, attachments]);

  const handleSend = () => {
    if ((!value.trim() && attachments.length === 0) || disabled) return;
    onSend({ text: value, model: selectedModel, temperature, webSearch, useMemory, scannerContext, attachments });
    onChange("");
    setAttachments([]);
    textareaRef.current?.focus();
  };

  const handleSlashSelect = (cmd) => {
    const parts = value.split(/\s+/);
    parts[parts.length - 1] = cmd;
    onChange(parts.join(" ") + " ");
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 2MB.`);
        return;
      }

      const ext = file.name.split(".").pop().toLowerCase();
      const isTextFile = /^(txt|py|js|jsx|ts|tsx|json|md|html|css|yml|yaml|xml|sh|java|go|c|cpp|h|sql|ini|conf|csv|properties|gradle|bat|cmd|ps1)$/.test(ext);

      if (file.type.startsWith("image/")) {
        const imgReader = new FileReader();
        imgReader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              size: file.size,
              content: event.target.result,
              isImage: true
            }
          ]);
        };
        imgReader.readAsDataURL(file);
      } else if (isTextFile) {
        const txtReader = new FileReader();
        txtReader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || "text/plain",
              size: file.size,
              content: event.target.result,
              isImage: false
            }
          ]);
        };
        txtReader.readAsText(file);
      } else {
        // Binary/Special files (PDF, ZIP, DOCX, XLSX, etc.): Read as base64 Data URL so backend can parse safely
        const binReader = new FileReader();
        binReader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size,
              content: event.target.result,
              isImage: false
            }
          ]);
        };
        binReader.readAsDataURL(file);
      }
    });
    toast.success(`${files.length} file(s) attached`);
    e.target.value = ""; // reset file input
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Web Speech API is not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        toast.success("Voice listening active...");
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onChange((prev) => (prev ? prev + " " + transcript : transcript));
          toast.success("Speech captured!");
        }
      };

      rec.onerror = (e) => {
        console.error("Speech error:", e);
        if (e.error !== "no-speech") {
          toast.error(`Voice error: ${e.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Speech init error:", err);
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Filter slash commands
  const filteredSlash = SLASH_COMMANDS.filter((s) =>
    slashFilter.length <= 1 ? true : s.cmd.startsWith(slashFilter) || s.desc.toLowerCase().includes(slashFilter.slice(1))
  );

  // Group slash by category
  const groupedSlash = filteredSlash.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Filter models by search
  const filteredModels = MODELS.filter(
    (m) =>
      !modelSearch ||
      m.label.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const charCount = value.length;
  const maxChars = 4000;
  const charPercentage = (charCount / maxChars) * 100;

  return (
    <div ref={containerRef} style={{ position: "relative", padding: "0 24px 14px", flexShrink: 0, zIndex: 50 }}>
      <style>{`
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.3)} 50%{box-shadow:0 0 40px rgba(139,92,246,0.6)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .prompt-container{transition:all 0.3s cubic-bezier(0.4,0,0.2,1)}
        .prompt-container.focused{transform:translateY(-2px)}
        .model-item,.slash-item{transition:all 0.15s ease}
        .model-item:hover{background:rgba(139,92,246,0.08)!important;transform:translateX(3px)}
        .slash-item:hover{background:rgba(255,255,255,0.04)!important}
        .send-btn{transition:all 0.2s cubic-bezier(0.4,0,0.2,1)}
        .send-btn:hover:not(:disabled){transform:scale(1.06);box-shadow:0 0 30px rgba(139,92,246,0.6)!important}
        .send-btn:active:not(:disabled){transform:scale(0.95)}
        .tool-chip{transition:all 0.2s ease}
        .tool-chip:hover{background:rgba(255,255,255,0.08)!important;transform:translateY(-1px)}
        .suggestion-chip{transition:all 0.2s ease;cursor:pointer}
        .suggestion-chip:hover{background:rgba(139,92,246,0.12)!important;border-color:rgba(139,92,246,0.35)!important;transform:translateY(-1px)}
        .recording-anim{animation:pulse-glow 1.5s ease-in-out infinite}
        .slash-scroll::-webkit-scrollbar{width:4px}
        .slash-scroll::-webkit-scrollbar-track{background:transparent}
        .slash-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        .model-scroll::-webkit-scrollbar{width:4px}
        .model-scroll::-webkit-scrollbar-track{background:transparent}
        .model-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* ── AI Quick Suggestions (shown when input is empty and not focused) ── */}
      {!value && !isFocused && (
        <div style={{ marginBottom: "10px", display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
          {AI_SUGGESTIONS.slice(0, 4).map((sug, idx) => (
            <div
              key={idx}
              className="suggestion-chip"
              onClick={() => { onChange(sug); textareaRef.current?.focus(); }}
              style={{
                padding: "5px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.5)",
                fontWeight: "500",
                maxWidth: "220px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              ✦ {sug.length > 38 ? sug.slice(0, 38) + "…" : sug}
            </div>
          ))}
        </div>
      )}

      {/* ── Slash Commands Popover ── */}
      {showSlashMenu && filteredSlash.length > 0 && (
        <div style={{
          position: "absolute", bottom: "100%", left: "28px", right: "28px",
          background: "rgba(10,14,28,0.98)", border: `1px solid ${THEME.colors.border}`,
          borderRadius: THEME.radius.xl, padding: "8px", boxShadow: THEME.shadow.floating,
          marginBottom: "10px", zIndex: 200, backdropFilter: "blur(16px)",
          animation: "slide-up 0.2s ease",
        }}>
          <div style={{ padding: "4px 12px 8px", fontSize: "9px", fontWeight: "800", color: THEME.colors.textSubtle, letterSpacing: "1.2px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
            <Command size={10} /> Quick Directives · {filteredSlash.length} commands
          </div>
          <div className="slash-scroll" style={{ maxHeight: "320px", overflowY: "auto" }}>
            {Object.entries(groupedSlash).map(([cat, items]) => (
              <div key={cat}>
                <div style={{ padding: "4px 12px 2px", fontSize: "8.5px", fontWeight: "700", color: CATEGORY_COLORS[cat] || "#6B7280", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {cat}
                </div>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="slash-item"
                    onClick={() => handleSlashSelect(item.cmd)}
                    style={{ padding: "7px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", gap: "10px", alignItems: "center", marginBottom: "1px" }}
                  >
                    <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: `${item.color}18`, border: `1px solid ${item.color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon size={13} color={item.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: item.color, fontWeight: "700", fontSize: "12px", fontFamily: "monospace" }}>{item.cmd}</span>
                      <span style={{ color: THEME.colors.textMuted, fontSize: "11px", marginLeft: "8px" }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Model Selector Dropdown ── */}
      {showModelMenu && (
        <div ref={modelDropdownRef} style={{
          position: "absolute", bottom: "100%", left: "28px",
          background: "rgba(10,14,28,0.98)", border: `1px solid ${THEME.colors.border}`,
          borderRadius: THEME.radius.xl, padding: "8px", boxShadow: THEME.shadow.floating,
          marginBottom: "10px", zIndex: 200, width: "320px", backdropFilter: "blur(16px)",
          animation: "slide-up 0.2s ease",
        }}>
          <div style={{ padding: "4px 12px 8px", fontSize: "9px", fontWeight: "800", color: THEME.colors.textSubtle, letterSpacing: "1.2px", textTransform: "uppercase" }}>
            AI Models · OpenRouter
          </div>
          {/* Search Models */}
          <div style={{ padding: "0 4px 6px" }}>
            <input
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Search models..."
              autoFocus
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", color: "#FFF", fontSize: "12px", padding: "6px 10px", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div className="model-scroll" style={{ maxHeight: "360px", overflowY: "auto" }}>
            {filteredModels.map((model) => {
              const isSelected = model.id === selectedModel;
              return (
                <div
                  key={model.id}
                  className="model-item"
                  onClick={() => { onModelChange(model.id); setShowModelMenu(false); setModelSearch(""); toast.success(`Switched to ${model.label}`); }}
                  style={{
                    padding: "9px 12px", borderRadius: "10px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "10px",
                    background: isSelected ? "rgba(139,92,246,0.1)" : "transparent",
                    border: isSelected ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                    marginBottom: "2px",
                  }}
                >
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${model.color}15`, border: `1px solid ${model.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ModelLogo provider={model.provider} color={model.color} size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: isSelected ? "#FFF" : "rgba(255,255,255,0.85)", marginBottom: "2px" }}>{model.label}</div>
                    <div style={{ fontSize: "10.5px", color: THEME.colors.textSubtle, display: "flex", gap: "6px", alignItems: "center" }}>
                      <span>{model.provider}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span style={{ color: model.color, fontWeight: "600" }}>{model.speed}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{model.quality}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: THEME.colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={10} color="#FFF" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "4px", padding: "6px 12px 2px", fontSize: "9.5px", color: THEME.colors.textSubtle, display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
            All models free via OpenRouter · Selected model is tried first
          </div>
        </div>
      )}

      {/* ── Main Input Container ── */}
      <div
        className={`prompt-container ${isFocused ? "focused" : ""}`}
        style={{
          background: "linear-gradient(180deg, rgba(24,32,54,0.92) 0%, rgba(13,18,32,0.92) 100%)",
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
        {/* Attachments */}
        {attachments.length > 0 && (
          <div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderBottom: `1px solid ${THEME.colors.border}`, flexWrap: "wrap", background: "rgba(0,0,0,0.15)" }}>
            {attachments.map((att, idx) => {
              const badge = getFileBadgeColor(att.name);
              return (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "5px 12px",
                  background: "rgba(255,255,255,0.02)", border: `1px solid ${THEME.colors.border}`,
                  borderRadius: "12px", fontSize: "11.5px", color: "#FFF",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)", position: "relative",
                  transition: "all 0.2s ease"
                }}>
                  {att.isImage ? (
                    <img src={att.content} alt={att.name} style={{ width: "20px", height: "20px", borderRadius: "4px", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      padding: "2px 5px", background: badge.bg, border: `1px solid ${badge.border}`,
                      borderRadius: "4px", color: badge.text, fontSize: "9px", fontWeight: "800", fontFamily: "monospace"
                    }}>
                      {badge.ext}
                    </div>
                  )}
                  <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "500" }}>{att.name}</span>
                  <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.3)" }}>({(att.size / 1024).toFixed(1)} KB)</span>
                  <button onClick={() => setAttachments((p) => p.filter((_, i) => i !== idx))} style={{
                    background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                    cursor: "pointer", padding: "2px", display: "flex", alignItems: "center",
                    justifyContent: "center", borderRadius: "50%", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "none"; }}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px 0", flexWrap: "wrap" }}>
          {/* Model Selector Button */}
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px",
              background: "rgba(255,255,255,0.04)", border: `1px solid ${THEME.colors.border}`,
              borderRadius: "20px", color: "#FFF", fontSize: "11.5px", fontWeight: "600", cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          >
            <ModelLogo provider={currentModel.provider} color={currentModel.color} size={16} />
            <span>{currentModel.label}</span>
            <ChevronDown size={11} color={THEME.colors.textSubtle} />
          </button>

          {/* Temperature */}
          <button onClick={() => setShowTempSlider(!showTempSlider)} className="tool-chip" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: "20px", color: THEME.colors.textMuted, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
            <Thermometer size={11} color={THEME.colors.primary} />{temperature}
          </button>

          {showTempSlider && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 8px", animation: "slide-up 0.2s ease" }}>
              <span style={{ fontSize: "10px", color: THEME.colors.textSubtle }}>Precise</span>
              <input type="range" min="0.1" max="2.0" step="0.1" value={temperature} onChange={(e) => onTemperatureChange(parseFloat(e.target.value))} style={{ width: "80px", accentColor: THEME.colors.primary, cursor: "pointer" }} />
              <span style={{ fontSize: "10px", color: THEME.colors.textSubtle }}>Creative</span>
            </div>
          )}

          {/* Web Search */}
          <button
            onClick={() => onWebSearchChange && onWebSearchChange(!webSearch)}
            className="tool-chip"
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", background: webSearch ? "rgba(16,185,129,0.15)" : THEME.colors.surface, border: `1px solid ${webSearch ? "#10B98140" : THEME.colors.border}`, borderRadius: "20px", color: webSearch ? "#10B981" : THEME.colors.textMuted, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
          >
            {webSearch ? <Wifi size={11} /> : <WifiOff size={11} />} Web
          </button>

          {/* Memory */}
          <button onClick={() => setUseMemory(!useMemory)} className="tool-chip" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", background: useMemory ? "rgba(139,92,246,0.15)" : THEME.colors.surface, border: `1px solid ${useMemory ? THEME.colors.primary + "40" : THEME.colors.border}`, borderRadius: "20px", color: useMemory ? THEME.colors.primary : THEME.colors.textMuted, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
            <Database size={11} /> Mem
          </button>

          {/* Scanner context */}
          <button onClick={() => setScannerContext(!scannerContext)} className="tool-chip" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", background: scannerContext ? "rgba(245,158,11,0.15)" : THEME.colors.surface, border: `1px solid ${scannerContext ? THEME.colors.warning + "40" : THEME.colors.border}`, borderRadius: "20px", color: scannerContext ? THEME.colors.warning : THEME.colors.textMuted, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
            <Scan size={11} /> Scanner
          </button>

          {/* Directives shortcut button */}
          <button
            onClick={() => { onChange("/"); textareaRef.current?.focus(); }}
            className="tool-chip"
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: "20px", color: THEME.colors.textMuted, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
          >
            <Command size={11} /> <span style={{ fontFamily: "monospace", fontSize: "11px" }}>/ Cmds</span>
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
          placeholder="Ask anything about API security... Type '/' for 30+ directives"
          style={{
            width: "100%", minHeight: "58px", maxHeight: "240px", background: "transparent", border: "none",
            color: "#FFF", fontSize: "14px", outline: "none", resize: "none", fontFamily: "inherit",
            lineHeight: "1.6", padding: "14px 20px", boxSizing: "border-box",
          }}
        />

        {/* Bottom Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 12px", borderTop: `1px solid ${THEME.colors.border}` }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileSelect} />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: "20px", color: THEME.colors.textMuted, cursor: "pointer", padding: "6px 12px", display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "500", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = THEME.colors.surfaceHover; e.currentTarget.style.color = "#FFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = THEME.colors.surface; e.currentTarget.style.color = THEME.colors.textMuted; }}
            >
              <Paperclip size={13} /> Attach
            </button>

            <button
              onClick={toggleRecording}
              className={isRecording ? "recording-anim" : ""}
              style={{ background: isRecording ? "rgba(239,68,68,0.18)" : THEME.colors.surface, border: `1px solid ${isRecording ? "#EF444440" : THEME.colors.border}`, borderRadius: "20px", color: isRecording ? "#EF4444" : THEME.colors.textMuted, cursor: "pointer", padding: "6px 12px", display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "500", transition: "all 0.2s" }}
            >
              <Mic size={13} /> {isRecording ? "Stop" : "Voice"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Active model badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: THEME.colors.textSubtle }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10B981" }} />
              <span>{currentModel.provider}</span>
            </div>

            {/* Char count */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10.5px", color: charPercentage > 90 ? THEME.colors.danger : THEME.colors.textSubtle }}>
              <div style={{ width: "50px", height: "2px", background: THEME.colors.surface, borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(charPercentage, 100)}%`, height: "100%", background: charPercentage > 90 ? THEME.colors.danger : THEME.colors.primary, transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontFamily: "monospace" }}>{charCount}/{maxChars}</span>
            </div>

            {/* Send Button */}
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: disabled || !value.trim() ? THEME.colors.surface : `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.secondary} 100%)`,
                border: disabled || !value.trim() ? `1px solid ${THEME.colors.border}` : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
                boxShadow: disabled || !value.trim() ? "none" : "0 6px 20px rgba(139,92,246,0.45)",
                flexShrink: 0, opacity: disabled || !value.trim() ? 0.5 : 1,
              }}
            >
              {disabled ? (
                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #FFF", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              ) : (
                <Send size={17} color="#FFF" style={{ marginLeft: "2px" }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hints */}
      <div style={{ textAlign: "center", marginTop: "7px", fontSize: "10px", color: THEME.colors.textSubtle, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {[["Enter", "Send"], ["Shift+↵", "New line"], ["/", "30+ Directives"], ["Esc", "Close"]].map(([key, label]) => (
          <span key={key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <kbd style={{ padding: "1px 5px", background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, borderRadius: "5px", fontSize: "9px", fontWeight: "700", fontFamily: "monospace" }}>{key}</kbd>
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}