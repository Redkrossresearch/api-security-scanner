import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import useSocketEvent from "../sockets/useSocketEvent";

import { GlobalTopBar, WorkspaceLayout } from "../components/copilot/layout";
import { ChatSidebar } from "../components/copilot/sidebar";
import { ChatWorkspace } from "../components/copilot/workspace";
import { ChatWindow, PromptInput } from "../components/copilot/chat";
import { ContextPanel } from "../components/copilot/panels";
import { GlobalSettingsModal, CommandPalette } from "../components/copilot/modals";

const DEFAULT_MODEL = "gemini";
const DEFAULT_TEMPERATURE = 0.7;

const THEMES = {
  void: {
    name: "🌌 Void Neon (Default)",
    bg: "radial-gradient(circle at 50% 50%, #0b0f1e 0%, #030712 100%)",
    grid: "rgba(139, 92, 246, 0.035)",
    glow: "rgba(139, 92, 246, 0.06)",
    accent: "#8B5CF6",
  },
  matrix: {
    name: "📟 Matrix Code",
    bg: "radial-gradient(circle at 50% 50%, #051408 0%, #010502 100%)",
    grid: "rgba(16, 185, 129, 0.04)",
    glow: "rgba(16, 185, 129, 0.08)",
    accent: "#10B981",
  },
  synthwave: {
    name: "🌇 Synthwave Sunset",
    bg: "radial-gradient(circle at 50% 50%, #1a0b2e 0%, #05010a 100%)",
    grid: "rgba(236, 72, 153, 0.04)",
    glow: "rgba(249, 115, 22, 0.07)",
    accent: "#EC4899",
  },
  abyssal: {
    name: "🐙 Abyssal Deep",
    bg: "radial-gradient(circle at 50% 50%, #051624 0%, #02090f 100%)",
    grid: "rgba(6, 182, 212, 0.045)",
    glow: "rgba(6, 182, 212, 0.08)",
    accent: "#06B6D4",
  },
  ghost: {
    name: "💀 Ghost Protocol",
    bg: "radial-gradient(circle at 50% 50%, #18181b 0%, #09090b 100%)",
    grid: "rgba(255, 255, 255, 0.02)",
    glow: "rgba(255, 255, 255, 0.04)",
    accent: "#E4E4E7",
  }
};

export default function CopilotPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
  const [webSearch, setWebSearch] = useState(false);
  const [funnelMode, setFunnelMode] = useState("single");
  const [theme, setTheme] = useState("void");

  // Layout Panels State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextPanelCollapsed, setContextPanelCollapsed] = useState(false);

  // Modals Toggles
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // 3D Robot Mascot interactive overlays
  const [showSpeech, setShowSpeech] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [speechTimeout, setSpeechTimeout] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  // Bind AI Stream Sockets
  useSocketEvent("ai:thinking", (data) => {
    if (data.conversationId === activeConversationId) {
      setIsThinking(true);
    }
  });

  useSocketEvent("ai:stream:start", (data) => {
    if (data.conversationId === activeConversationId) {
      setIsThinking(false);
      setMessages((prev) => {
        const filtered = prev.filter(m => m.isStreaming !== true);
        return [
          ...filtered,
          {
            _id: `streaming-${Date.now()}`,
            sender: "assistant",
            text: "",
            timestamp: new Date(),
            isStreaming: true,
            metadata: { model: selectedModel }
          }
        ];
      });
    }
  });

  useSocketEvent("ai:stream", (data) => {
    if (data.conversationId === activeConversationId) {
      setIsThinking(false);
      setMessages((prev) => {
        return prev.map((m) => {
          if (m.isStreaming) {
            return {
              ...m,
              text: m.text + data.text
            };
          }
          return m;
        });
      });
    }
  });

  useSocketEvent("ai:stream:end", (data) => {
    if (data.conversationId === activeConversationId) {
      setIsThinking(false);
      setMessages((prev) => {
        return prev.map((m) => {
          if (m.isStreaming) {
            return {
              ...m,
              _id: undefined,
              isStreaming: false,
              text: data.text,
              metadata: {
                model: data.model,
                searchResults: data.searchResults || []
              }
            };
          }
          return m;
        });
      });
      fetchConversations();
    }
  });

  const greetings = [
    "Hii, I am ATHX Copilot. Systems normalized. Zero-Trust policy fully active.",
    "System Status: OPTIMAL. All scanner nodes responding on port 5000.",
    "Security Integrity: 99.2%. Let's find some vulnerabilities today!",
    "Ready to scan! Type '/' to search for pre-defined audit directives.",
    "Hii auditor! Remember: Authentication is NOT authorization. Check your BOLA guards!"
  ];

  const handleMascotClick = () => {
    if (speechTimeout) {
      clearTimeout(speechTimeout);
    }
    const randomGreet = greetings[Math.floor(Math.random() * greetings.length)];
    setSpeechText(randomGreet);
    setShowSpeech(true);

    // Dynamic Speech Synthesis (Robotic Voice Output)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(randomGreet);
      const voices = window.speechSynthesis.getVoices();
      // Try to acquire Google US English or standard US/GB English voice
      const preferredVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.pitch = 0.80; // Low robotic tone
      utterance.rate = 1.05;  // Slightly faster pace
      utterance.volume = 0.90; // Balanced output volume
      window.speechSynthesis.speak(utterance);
    }

    const timeout = setTimeout(() => {
      setShowSpeech(false);
    }, 5000);
    setSpeechTimeout(timeout);
  };

  // ─── Fetch Conversations ──────────────────────────────────────────────────
  const fetchConversations = useCallback(async (selectFirst = false) => {
    try {
      const res = await api.get("/copilot/conversations");
      if (res.data?.success) {
        const list = res.data.conversations;
        setConversations(list);
        if (selectFirst && list.length > 0 && !activeConversationId) {
          setActiveConversationId(list[0]._id);
        }
        if (list.length === 0) {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      toast.error("Failed to load conversations");
    }
  }, [activeConversationId]);

  useEffect(() => {
    fetchConversations(true);
  }, []);

  // ─── Fetch Messages when Conversation changes ─────────────────────────────
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const load = async () => {
      try {
        const res = await api.get(`/copilot/conversations/${activeConversationId}/messages`);
        if (res.data?.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        toast.error("Failed to load messages");
      }
    };
    load();
  }, [activeConversationId]);

  // ─── Command Palette Actions Registry ─────────────────────────────────────
  const paletteActions = {
    "new-chat": () => handleNewChat(),
    "scan-url": () => {
      setContextPanelCollapsed(false);
      toast.success("Scanner context panel opened");
    },
    "settings": () => setIsSettingsOpen(true),
    "clear-chats": () => handleClearAll(),
    "export-pdf": () => {
      if (activeConversationId) {
        const active = conversations.find((c) => c._id === activeConversationId);
        if (active) handleExport(active);
      } else {
        toast.error("No active conversation to export");
      }
    }
  };

  // Listen for global Ctrl+K / Cmd+K triggers
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, []);

  // ─── New Chat ──────────────────────────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const res = await api.post("/copilot/conversations", { title: "New Chat" });
      if (res.data?.success) {
        const newConv = res.data.conversation;
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv._id);
        setMessages([]);
        setInputValue("");
        toast.success("New conversation started");
      }
    } catch (err) {
      toast.error("Failed to start new chat");
    }
  };

  // ─── Send Message ─────────────────────────────────────────────────────────
  const handleSend = async (customText = "", attachedFiles = []) => {
    const text = (customText || inputValue).trim();
    if (!text && (!attachedFiles || attachedFiles.length === 0)) return;
    if (loading) return;

    setLoading(true);
    if (!customText) setInputValue("");

    let convId = activeConversationId;

    try {
      // Auto-create conversation if needed
      if (!convId) {
        const convRes = await api.post("/copilot/conversations", {
          title: text ? (text.length > 40 ? text.slice(0, 40) + "..." : text) : `Attached ${attachedFiles.length} file(s)`,
        });
        if (!convRes.data?.success) {
          toast.error("Failed to create conversation");
          setLoading(false);
          return;
        }
        const newConv = convRes.data.conversation;
        convId = newConv._id;
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv._id);
      }

      // Optimistically add user message with attachments metadata
      const optimisticMsg = {
        _id: `temp-${Date.now()}`,
        sender: "user",
        text: text || `[Attached ${attachedFiles.length} file(s)]`,
        timestamp: new Date(),
        metadata: {
          attachments: (attachedFiles || []).map(att => ({
            name: att.name,
            type: att.type,
            size: att.size,
            isImage: att.isImage || false
          }))
        }
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Send to backend with stream: true
      const msgRes = await api.post(`/copilot/conversations/${convId}/messages`, {
        message: text,
        model: selectedModel,
        temperature,
        webSearch,
        funnelMode,
        attachments: attachedFiles,
        stream: true
      });

      if (msgRes.data?.success && msgRes.data?.stream) {
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? { ...m, _id: undefined } : m))
        );
        fetchConversations();
      } else if (msgRes.data?.success) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...optimisticMsg, _id: undefined },
          {
            sender: "assistant",
            text: msgRes.data.reply,
            timestamp: new Date(),
            metadata: { 
              model: msgRes.data.model,
              searchResults: msgRes.data.searchResults || [],
            },
          },
        ]);
        fetchConversations();
      } else {
        setMessages((prev) => prev.slice(0, -1));
        toast.error("AI engine returned an error");
      }
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      toast.error(err.response?.data?.message || err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // ─── Conversation Actions ─────────────────────────────────────────────────
  const handleRename = async (id, newTitle) => {
    try {
      const res = await api.put(`/copilot/conversations/${id}`, { title: newTitle });
      if (res.data?.success) {
        setConversations((prev) =>
          prev.map((c) => (c._id === id ? { ...c, title: newTitle } : c))
        );
      }
    } catch (err) {
      toast.error("Failed to rename");
    }
  };

  const handlePin = async (id, isPinned) => {
    try {
      const res = await api.put(`/copilot/conversations/${id}`, { isPinned });
      if (res.data?.success) {
        setConversations((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isPinned } : c))
        );
        toast.success(isPinned ? "Pinned to top" : "Unpinned");
      }
    } catch (err) {
      toast.error("Failed to update pin");
    }
  };

  const handleArchive = async (id) => {
    try {
      const res = await api.put(`/copilot/conversations/${id}/archive`);
      if (res.data?.success) {
        setConversations((prev) => prev.filter((c) => c._id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
        toast.success("Conversation archived");
      }
    } catch (err) {
      toast.error("Failed to archive");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/copilot/conversations/${id}/duplicate`);
      if (res.data?.success) {
        fetchConversations();
        toast.success("Conversation duplicated");
      }
    } catch (err) {
      toast.error("Failed to duplicate");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/copilot/conversations/${id}`);
      if (res.data?.success) {
        setConversations((prev) => prev.filter((c) => c._id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
      } else {
        toast.error(res.data?.message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete conversation");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete ALL conversations? This cannot be undone.")) return;
    try {
      await Promise.all(
        conversations.map((c) => api.delete(`/copilot/conversations/${c._id}`))
      );
      setConversations([]);
      setActiveConversationId(null);
      setMessages([]);
      toast.success("All conversations deleted");
    } catch (err) {
      toast.error("Failed to clear all");
    }
  };

  const handleExport = (conv) => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }
    const md = messages
      .map(
        (m) =>
          `### ${m.sender === "user" ? "You" : "ATHX AI"} — ${new Date(m.timestamp).toLocaleString()}\n\n${m.text}\n\n---\n`
      )
      .join("\n");

    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    el.download = `${conv.title.replace(/\s+/g, "_")}_export.md`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
    toast.success("Chat exported as Markdown");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .copilot-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background: var(--theme-bg);
          position: relative;
          transition: background 0.5s ease;
        }
        .copilot-container::after {
          content: "";
          position: absolute;
          top: -20%;
          left: 15%;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, var(--theme-glow) 0%, transparent 70%);
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
          animation: glowPulse 16s infinite alternate ease-in-out;
        }
        @keyframes glowPulse {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(60px, 40px) scale(1.15); }
        }

        /* 3D scrolling cyber grid background */
        .grid-3d-bg {
          position: absolute;
          inset: 0;
          perspective: 600px;
          perspective-origin: 50% 20%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .grid-3d-plane {
          position: absolute;
          top: -10%;
          left: -60%;
          width: 220%;
          height: 220%;
          background-image: 
            linear-gradient(var(--theme-grid) 2px, transparent 2px),
            linear-gradient(90deg, var(--theme-grid) 2px, transparent 2px);
          background-size: 64px 64px;
          transform: rotateX(78deg);
          transform-origin: top center;
          animation: gridWarpScroll 40s linear infinite;
        }
        @keyframes gridWarpScroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 2560px; }
        }

        /* 3D cockpit panels wrap rotation */
        .sidebar-3d-panel {
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          transform: perspective(1200px) rotateY(2.5deg);
          transform-origin: left center;
        }
        .sidebar-3d-panel:hover {
          transform: perspective(1200px) rotateY(0deg) translateZ(5px);
        }

        .context-3d-panel {
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          transform: perspective(1200px) rotateY(-2.5deg);
          transform-origin: right center;
        }
        .context-3d-panel:hover {
          transform: perspective(1200px) rotateY(0deg) translateZ(5px);
        }

        /* Global Viewport Floating Mascot container overlay */
        .global-mascot-container {
          position: fixed;
          bottom: 110px;
          right: 32px;
          z-index: 10000; /* Overlays absolutely everything, even context panel and sidebars */
          pointer-events: none;
          animation: botTravel 24s ease-in-out infinite;
        }

        /* Viewport-wide patrolling path - moves across context panel, workspace, sidebar! */
        @keyframes botTravel {
          0% { transform: translate(0px, 0px); }
          20% { transform: translate(-25vw, -12vh); }
          40% { transform: translate(-58vw, 15vh); }
          60% { transform: translate(-78vw, -22vh); }
          80% { transform: translate(-42vw, -45vh); }
          100% { transform: translate(0px, 0px); }
        }

        .bot-3d-mascot {
          pointer-events: auto;
          width: 120px;
          height: 160px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
        }

        .bot-3d-mascot:hover {
          transform: scale(1.15) rotateX(12deg) rotateY(-12deg);
          filter: drop-shadow(0 15px 35px rgba(139, 92, 246, 0.35));
        }

        .bot-body-wrap {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-style: preserve-3d;
          animation: botLocalHover 4s ease-in-out infinite; /* local breathing float */
        }

        @keyframes botLocalHover {
          0% { transform: translateY(0px) rotateY(12deg); }
          50% { transform: translateY(-10px) rotateY(-12deg); }
          100% { transform: translateY(0px) rotateY(12deg); }
        }

        .bot-shadow {
          position: absolute;
          bottom: -22px;
          width: 75px;
          height: 8px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          filter: blur(5px);
          animation: shadowScale 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shadowScale {
          0% { transform: scale(1) translate(0px, 0px); opacity: 0.7; }
          20% { transform: scale(0.8) translate(-30vw, 0px); opacity: 0.45; }
          40% { transform: scale(0.95) translate(-65vw, 0px); opacity: 0.6; }
          60% { transform: scale(0.75) translate(-80vw, 0px); opacity: 0.35; }
          80% { transform: scale(1.1) translate(-42vw, 0px); opacity: 0.75; }
          100% { transform: scale(1) translate(0px, 0px); opacity: 0.7; }
        }

        /* Spinning 3D Orbit Ring around Mascot Head */
        .bot-hud-ring {
          position: absolute;
          width: 140px;
          height: 140px;
          border: 1px dashed rgba(139, 92, 246, 0.28);
          border-radius: 50%;
          transform: rotateX(75deg) rotateY(15deg);
          animation: spinHUD 16s linear infinite;
          pointer-events: none;
          z-index: 4;
        }

        @keyframes spinHUD {
          0% { transform: rotateX(75deg) rotateY(15deg) rotateZ(0deg); }
          100% { transform: rotateX(75deg) rotateY(15deg) rotateZ(360deg); }
        }

        /* Pulsing LEDs on top of ears */
        .bot-ear-led {
          width: 3.5px;
          height: 3.5px;
          background: var(--theme-accent, #8B5CF6);
          border-radius: 50%;
          position: absolute;
          top: -2.5px;
          left: 1px;
          box-shadow: 0 0 6px var(--theme-accent, #8B5CF6);
          animation: ledPulse 1.2s infinite alternate;
        }

        @keyframes ledPulse {
          0% { opacity: 0.35; }
          100% { opacity: 1; filter: brightness(1.3); }
        }

        /* High-tech honeycomb matrix background pattern for visor screen */
        .bot-screen-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(30deg, rgba(139,92,246,0.06) 12%, transparent 12.5%, transparent 87%, rgba(139,92,246,0.06) 87.5%, rgba(139,92,246,0.06)),
            linear-gradient(150deg, rgba(139,92,246,0.06) 12%, transparent 12.5%, transparent 87%, rgba(139,92,246,0.06) 87.5%, rgba(139,92,246,0.06)),
            linear-gradient(30deg, rgba(139,92,246,0.06) 12%, transparent 12.5%, transparent 87%, rgba(139,92,246,0.06) 87.5%, rgba(139,92,246,0.06)),
            linear-gradient(150deg, rgba(139,92,246,0.06) 12%, transparent 12.5%, transparent 87%, rgba(139,92,246,0.06) 87.5%, rgba(139,92,246,0.06)),
            linear-gradient(60deg, rgba(139,92,246,0.08) 25%, transparent 25.5%, transparent 75%, rgba(139,92,246,0.08) 75.5%, rgba(139,92,246,0.08)),
            linear-gradient(60deg, rgba(139,92,246,0.08) 25%, transparent 25.5%, transparent 75%, rgba(139,92,246,0.08) 75.5%, rgba(139,92,246,0.08));
          background-size: 8px 14px;
          opacity: 0.75;
          z-index: 2;
          pointer-events: none;
        }

        /* Dynamic Engine Hover thruster fire cone under base */
        .bot-thruster-glow {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 22px;
          height: 18px;
          background: radial-gradient(ellipse at top, var(--theme-accent, #8B5CF6) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%);
          filter: blur(2px);
          animation: thrusterPulse 0.4s ease-in-out infinite alternate;
          z-index: 5;
          border-radius: 50% 50% 0 0;
          pointer-events: none;
        }

        @keyframes thrusterPulse {
          0% { height: 12px; opacity: 0.65; }
          100% { height: 20px; opacity: 0.95; filter: blur(3px) brightness(1.2); }
        }

        /* 3D Hologram Projection Base Platform */
        .bot-platform {
          position: absolute;
          bottom: -20px;
          width: 80px;
          height: 20px;
          perspective: 500px;
          transform-style: preserve-3d;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 1;
        }

        .bot-platform-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid var(--theme-accent, #8B5CF6);
          opacity: 0.45;
          filter: drop-shadow(0 0 8px var(--theme-accent, #8B5CF6));
          transform: rotateX(75deg);
        }

        .bot-platform-ring-1 {
          width: 80px;
          height: 80px;
          animation: spinPlatform1 12s linear infinite;
        }

        .bot-platform-ring-2 {
          width: 55px;
          height: 55px;
          border-color: #3B82F6;
          border-style: dashed;
          animation: spinPlatform2 7s linear infinite reverse;
        }

        @keyframes spinPlatform1 {
          0% { transform: rotateX(75deg) rotateZ(0deg); }
          100% { transform: rotateX(75deg) rotateZ(360deg); }
        }

        @keyframes spinPlatform2 {
          0% { transform: rotateX(75deg) rotateZ(0deg); }
          100% { transform: rotateX(75deg) rotateZ(360deg); }
        }

        /* Head - RADIAL SHADING FOR 3D SPHERICAL LOOK */
        .bot-head {
          width: 96px;
          height: 70px;
          background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f5f9 45%, #cbd5e1 75%, #94a3b8 100%);
          border-radius: 40px / 32px;
          border: 1.5px solid #F1F5F9;
          box-shadow: 
            inset 3px 3px 8px rgba(255,255,255,0.8),
            inset -3px -3px 8px rgba(148,163,184,0.35),
            0 8px 16px rgba(0, 0, 0, 0.35);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        /* 3D Side Ears/Nodes */
        .bot-ear-left, .bot-ear-right {
          width: 8px;
          height: 16px;
          background: linear-gradient(180deg, #cbd5e1, #94a3b8);
          border-radius: 4px;
          position: absolute;
          top: 27px;
          box-shadow: inset 1px 1px 2px rgba(255,255,255,0.8);
          border: 1px solid #cbd5e1;
        }
        .bot-ear-left { left: -5px; }
        .bot-ear-right { right: -5px; }

        /* Screen with glass glare */
        .bot-screen {
          width: 72px;
          height: 46px;
          background: #070a12;
          border-radius: 25px / 18px;
          border: 1.5px solid rgba(255,255,255,0.06);
          box-shadow: 
            0 0 8px rgba(0,0,0,0.85),
            inset 0 0 8px rgba(139, 92, 246, 0.2);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          overflow: hidden;
        }

        /* 3D Visor Scanning Laser Line */
        .bot-scan-laser {
          position: absolute;
          left: 0;
          right: 0;
          height: 1.5px;
          background: var(--theme-accent, #8B5CF6);
          box-shadow: 0 0 8px var(--theme-accent, #8B5CF6);
          animation: scanMove 2.5s ease-in-out infinite alternate;
          z-index: 6;
          opacity: 0.8;
        }
        @keyframes scanMove {
          0% { top: 5%; }
          100% { top: 95%; }
        }

        /* Eyes with blink animation */
        .bot-eye {
          width: 20px;
          height: 28px;
          background: radial-gradient(circle, var(--theme-accent, #8B5CF6) 0%, rgba(139, 92, 246, 0.35) 100%);
          border-radius: 50% / 40%;
          box-shadow: 
            0 0 10px var(--theme-accent, #8B5CF6),
            0 0 3px var(--theme-accent, #8B5CF6);
          position: relative;
          animation: eyeBlink 5s infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        .bot-eye-grid {
          width: 100%;
          height: 100%;
          background-image: linear-gradient(0deg, rgba(255,255,255,0.12) 1px, transparent 1px);
          background-size: 100% 3.5px;
          border-radius: 50%;
        }

        @keyframes eyeBlink {
          0%, 94%, 98%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.05); }
        }

        /* Neck */
        .bot-neck {
          width: 32px;
          height: 10px;
          background: linear-gradient(90deg, #94A3B8 0%, #475569 50%, #334155 100%);
          border-radius: 3px;
          margin-top: -5px;
          box-shadow: inset 0 2px 3px rgba(0,0,0,0.4);
          z-index: 5;
        }

        /* Torso - RADIAL SHADING FOR 3D SPHERICAL LOOK */
        .bot-torso {
          width: 82px;
          height: 74px;
          background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f5f9 45%, #cbd5e1 75%, #94a3b8 100%);
          border-radius: 50% / 44%;
          border: 1.5px solid #F1F5F9;
          box-shadow: 
            inset 3px 3px 8px rgba(255,255,255,0.8),
            inset -3px -3px 8px rgba(148,163,184,0.35),
            0 8px 16px rgba(0,0,0,0.25);
          margin-top: -3px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 8;
        }

        /* Arms & Shoulder Joints */
        .bot-shoulder-left, .bot-shoulder-right {
          width: 10px;
          height: 10px;
          background: #cbd5e1;
          border-radius: 50%;
          position: absolute;
          top: 20px;
          box-shadow: inset 1px 1px 2px #FFF;
          border: 1px solid #cbd5e1;
        }
        .bot-shoulder-left { left: -6px; }
        .bot-shoulder-right { right: -6px; }

        .bot-arm-left, .bot-arm-right {
          width: 15px;
          height: 46px;
          background: linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%);
          position: absolute;
          top: 24px;
          border-radius: 8px;
          border: 1.2px solid #F1F5F9;
          box-shadow: 
            0 4px 6px rgba(0,0,0,0.15),
            inset 1.5px 1.5px 3px rgba(255,255,255,0.6);
        }
        .bot-arm-left {
          left: -11px;
          transform: rotateZ(12deg);
          transform-origin: top center;
          animation: waveLeft 6s ease-in-out infinite alternate;
        }
        .bot-arm-right {
          right: -11px;
          transform: rotateZ(-12deg);
          transform-origin: top center;
          animation: waveRight 6s ease-in-out infinite alternate;
        }

        @keyframes waveLeft {
          0% { transform: rotateZ(12deg); }
          100% { transform: rotateZ(18deg); }
        }
        @keyframes waveRight {
          0% { transform: rotateZ(-12deg); }
          100% { transform: rotateZ(-18deg); }
        }

        /* Chest emblem screen with AI text */
        .bot-chest-plate {
          width: 38px;
          height: 38px;
          background: #070a12;
          border: 2px solid #CBD5E1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            inset 0 0 6px rgba(0,0,0,0.85),
            0 0 12px var(--theme-accent, #8B5CF6);
          position: relative;
        }

        .bot-ai-badge {
          font-size: 8.5px;
          font-weight: 900;
          color: #FFF;
          text-shadow: 0 0 6px var(--theme-accent, #8B5CF6);
          font-family: 'Outfit', 'Inter', sans-serif;
          letter-spacing: 0.5px;
          animation: glowCycle 2s ease-in-out infinite alternate;
        }

        /* Speech bubble typing popup animation */
        @keyframes speechFadeIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div 
        className="copilot-container"
        style={{
          "--theme-bg": THEMES[theme].bg,
          "--theme-glow": THEMES[theme].glow,
          "--theme-grid": THEMES[theme].grid,
          "--theme-accent": THEMES[theme].accent,
        }}
      >
        {/* 3D Moving Space Grid */}
        <div className="grid-3d-bg">
          <div className="grid-3d-plane" />
        </div>

        {/* Top Header bar */}
        <GlobalTopBar 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isScanning={loading}
          activeModel={selectedModel}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Modular Workspace grid layout */}
        <WorkspaceLayout
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          contextPanelCollapsed={contextPanelCollapsed}
          setContextPanelCollapsed={setContextPanelCollapsed}
          sidebar={
            <div className="sidebar-3d-panel" style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
              <ChatSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={(id) => {
                  setActiveConversationId(id);
                  setInputValue("");
                }}
                onNewChat={handleNewChat}
                onRenameConversation={handleRename}
                onPinConversation={handlePin}
                onDuplicateConversation={handleDuplicate}
                onDeleteConversation={handleDelete}
                onClearAll={handleClearAll}
                onExportConversation={handleExport}
                onArchiveConversation={handleArchive}
              />
            </div>
          }
          contextPanel={
            <div className="context-3d-panel" style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
              <ContextPanel />
            </div>
          }
          chatWorkspace={
            <ChatWorkspace
              chatWindow={
                <ChatWindow
                  messages={messages}
                  loading={loading || isThinking}
                  onSelectSuggestion={handleSend}
                  activeModel={selectedModel}
                />
              }
              promptInput={
                <PromptInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={(payload) => handleSend(typeof payload === "string" ? payload : payload?.text, typeof payload === "string" ? [] : payload?.attachments)}
                  disabled={loading}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  temperature={temperature}
                  onTemperatureChange={setTemperature}
                  webSearch={webSearch}
                  onWebSearchChange={setWebSearch}
                  funnelMode={funnelMode}
                  onFunnelModeChange={setFunnelMode}
                />
              }
            />
          }
        />

        {/* Global Action Modals */}
        <GlobalSettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
        
        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          actions={paletteActions}
        />

        {/* Global 3D Floating Robot Mascot companion overlaid on entire page viewport */}
        <div className="global-mascot-container">
          {/* Interactive Speech Bubble */}
          {showSpeech && (
            <div style={{
              position: "absolute",
              bottom: "165px",
              right: "20px",
              background: "rgba(10, 15, 30, 0.95)",
              border: "1.5px solid var(--theme-accent, #8B5CF6)",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.25)",
              borderRadius: "12px",
              padding: "10px 14px",
              color: "#FFF",
              fontSize: "11px",
              fontWeight: "600",
              width: "190px",
              backdropFilter: "blur(10px)",
              animation: "speechFadeIn 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
              zIndex: 110,
              pointerEvents: "auto",
            }}>
              {/* Arrow pointing down */}
              <div style={{
                position: "absolute",
                bottom: "-8px",
                right: "40px",
                width: "12px",
                height: "12px",
                background: "rgba(10, 15, 30, 0.95)",
                borderRight: "1.5px solid var(--theme-accent, #8B5CF6)",
                borderBottom: "1.5px solid var(--theme-accent, #8B5CF6)",
                transform: "rotate(45deg)",
              }} />
              <span style={{ color: "var(--theme-accent, #8B5CF6)", fontWeight: "800", display: "block", marginBottom: "4px" }}>
                🤖 ATHX AUDITOR
              </span>
              <p style={{ margin: 0, lineHeight: "1.4", color: "rgba(255,255,255,0.85)" }}>
                {speechText}
              </p>
            </div>
          )}

          <div className="bot-3d-mascot" onClick={handleMascotClick}>
            {/* Hologram Stand Platform */}
            <div className="bot-platform">
              <div className="bot-platform-ring bot-platform-ring-1"></div>
              <div className="bot-platform-ring bot-platform-ring-2"></div>
            </div>
            {/* Spinning Coordinate HUD Ring */}
            <div className="bot-hud-ring"></div>
            <div className="bot-shadow"></div>
            <div className="bot-body-wrap">
              <div className="bot-head">
                {/* High-end glossy reflection sheet overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)",
                  pointerEvents: "none",
                  zIndex: 11
                }} />
                {/* Side ears nodes with blinking LEDs */}
                <div className="bot-ear-left">
                  <div className="bot-ear-led"></div>
                </div>
                <div className="bot-ear-right">
                  <div className="bot-ear-led"></div>
                </div>
                <div className="bot-screen">
                  {/* Visor honeycomb matrix grid lines */}
                  <div className="bot-screen-grid"></div>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
                    pointerEvents: "none",
                    zIndex: 5
                  }} />
                  {/* 3D Visor Scanning Laser Line */}
                  <div className="bot-scan-laser" />
                  <div className="bot-eye"><div className="bot-eye-grid"></div></div>
                  <div className="bot-eye"><div className="bot-eye-grid"></div></div>
                </div>
              </div>
              <div className="bot-neck"></div>
              <div className="bot-torso">
                {/* Spherical glossy reflection sheet overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 65%)",
                  pointerEvents: "none",
                  zIndex: 9
                }} />
                {/* Shoulder joint connectors */}
                <div className="bot-shoulder-left"></div>
                <div className="bot-shoulder-right"></div>
                <div className="bot-arm-left"></div>
                <div className="bot-chest-plate">
                  <div className="bot-ai-badge">ATHX</div>
                </div>
                <div className="bot-arm-right"></div>
              </div>
              <div className="bot-base">
                {/* Thruster Pulse engine flare */}
                <div className="bot-thruster-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}