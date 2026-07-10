import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

import { GlobalTopBar, WorkspaceLayout } from "../components/copilot/layout";
import { ChatSidebar } from "../components/copilot/sidebar";
import { ChatWorkspace } from "../components/copilot/workspace";
import { ChatWindow, PromptInput } from "../components/copilot/chat";
import { ContextPanel } from "../components/copilot/panels";
import { GlobalSettingsModal, CommandPalette } from "../components/copilot/modals";

const DEFAULT_MODEL = "google/gemma-4-31b-it:free";
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
  const [theme, setTheme] = useState("void");

  // Layout Panels State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextPanelCollapsed, setContextPanelCollapsed] = useState(false);

  // Modals Toggles
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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
  const handleSend = async (customText = "") => {
    const text = (customText || inputValue).trim();
    if (!text || loading) return;

    setLoading(true);
    if (!customText) setInputValue("");

    let convId = activeConversationId;

    try {
      // Auto-create conversation if needed
      if (!convId) {
        const convRes = await api.post("/copilot/conversations", {
          title: text.length > 40 ? text.slice(0, 40) + "..." : text,
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

      // Optimistically add user message
      const optimisticMsg = {
        _id: `temp-${Date.now()}`,
        sender: "user",
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Send to backend
      const msgRes = await api.post(`/copilot/conversations/${convId}/messages`, {
        message: text,
        model: selectedModel,
        temperature,
        webSearch,
      });

      if (msgRes.data?.success) {
        // Replace optimistic msg + add AI reply
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
                  loading={loading}
                  onSelectSuggestion={handleSend}
                  activeModel={selectedModel}
                />
              }
              promptInput={
                <PromptInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={() => handleSend()}
                  disabled={loading}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  temperature={temperature}
                  onTemperatureChange={setTemperature}
                  webSearch={webSearch}
                  onWebSearchChange={setWebSearch}
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
      </div>
    </>
  );
}