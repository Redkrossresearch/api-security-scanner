import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Archive, Pin, Edit2, Check, X, Search, 
  MessageSquare, Copy, Download, Clock, ChevronRight, 
  ChevronDown, Folder, Sparkles, Settings, MoreHorizontal,
  Command, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Design Tokens (Consistent with other components)
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
    surfaceActive: "rgba(255,255,255,0.09)",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.6)",
    textSubtle: "rgba(255,255,255,0.35)",
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "18px",
    full: "9999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
  },
  shadows: {
    elevated: "0 8px 32px rgba(0,0,0,0.4)",
    floating: "0 12px 48px rgba(0,0,0,0.6)",
  },
};

const CATEGORY_ORDER = ["Pinned", "Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older"];

function getCategory(dateString, isPinned) {
  if (isPinned) return "Pinned";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 1) return "Today";
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return "Last 7 Days";
  if (diffDays < 30) return "Last 30 Days";
  return "Older";
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onPinConversation,
  onDuplicateConversation,
  onDeleteConversation,
  onClearAll,
  onExportConversation,
  onArchiveConversation,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  const editInputRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (contextMenu && !e.target.closest('.ctx-menu-root')) {
        setContextMenu(null);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [contextMenu]);

  const handleStartEdit = (conv, e) => {
    e?.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
    setContextMenu(null);
  };

  const handleSaveEdit = (id, e) => {
    e?.stopPropagation();
    if (!editTitle.trim()) return;
    onRenameConversation(id, editTitle.trim());
    setEditingId(null);
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") handleSaveEdit(id);
    if (e.key === "Escape") setEditingId(null);
  };

  const handleRightClick = (e, conv) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id: conv._id, conv, x: e.clientX, y: e.clientY });
  };

  const toggleSection = (category) => {
    setCollapsedSections(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filteredConversations.filter((c) => getCategory(c.updatedAt, c.isPinned) === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const totalPinned = conversations.filter(c => c.isPinned).length;

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 5px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.4);
        }
        .conv-item { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .conv-item:hover { background: ${THEME.colors.surfaceHover} !important; }
        .conv-item.active { 
          background: rgba(139, 92, 246, 0.12) !important; 
          border-color: rgba(139, 92, 246, 0.25) !important;
        }
        .conv-actions { opacity: 0; transition: opacity 0.2s ease; }
        .conv-item:hover .conv-actions { opacity: 1; }
        .ctx-menu-item { transition: all 0.15s ease; }
        .ctx-menu-item:hover { 
          background: rgba(255,255,255,0.08); 
          transform: translateX(2px);
        }
        .ctx-menu-item.danger:hover { 
          background: rgba(239, 68, 68, 0.15); 
          color: ${THEME.colors.danger};
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ctx-menu-animate { animation: slideIn 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>

      <div
        ref={sidebarRef}
        style={{
          width: "280px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          borderRight: `1px solid ${THEME.colors.border}`,
          background: "rgba(10, 10, 12, 0.4)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <div style={{ padding: `${THEME.spacing.lg} ${THEME.spacing.lg} ${THEME.spacing.md}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: THEME.spacing.lg }}>
            <div style={{ display: "flex", alignItems: "center", gap: THEME.spacing.sm }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: THEME.radius.md,
                background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
              }}>
                <Sparkles size={14} color="#FFF" />
              </div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: THEME.colors.text, letterSpacing: "-0.2px" }}>
                Workspace
              </span>
            </div>
            {conversations.length > 0 && (
              <button
                onClick={onClearAll}
                title="Clear all chats"
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: THEME.colors.textSubtle, 
                  cursor: "pointer", 
                  padding: THEME.spacing.xs,
                  borderRadius: THEME.radius.sm,
                  transition: "all 0.2s",
                  display: "flex"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = THEME.colors.danger; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = THEME.colors.textSubtle; e.currentTarget.style.background = "transparent"; }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            style={{
              width: "100%",
              height: "42px",
              background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
              border: "none",
              borderRadius: THEME.radius.lg,
              color: "#FFF",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: THEME.spacing.sm,
              marginBottom: THEME.spacing.lg,
              boxShadow: "0 4px 16px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              transition: "all 0.2s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            New Chat
          </button>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color={searchQuery ? THEME.colors.primary : THEME.colors.textSubtle}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }}
            />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                background: THEME.colors.surface,
                border: `1px solid ${searchQuery ? THEME.colors.primary + "40" : THEME.colors.border}`,
                borderRadius: THEME.radius.md,
                padding: "0 32px 0 36px",
                color: THEME.colors.text,
                fontSize: "12.5px",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = THEME.colors.primary + "60"; e.currentTarget.style.background = THEME.colors.surfaceHover; }}
              onBlur={(e) => { if(!searchQuery) { e.currentTarget.style.borderColor = THEME.colors.border; e.currentTarget.style.background = THEME.colors.surface; } }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                style={{ 
                  position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                  background: THEME.colors.surfaceHover, border: "none", borderRadius: "50%",
                  width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: THEME.colors.textMuted
                }}
              >
                <X size={10} />
              </button>
            )}
            <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "2px", pointerEvents: "none", opacity: searchQuery ? 0 : 1, transition: "opacity 0.2s" }}>
              <kbd style={{ fontSize: "9px", color: THEME.colors.textSubtle, fontFamily: "monospace" }}>K</kbd>
            </div>
          </div>
        </div>

        {/* Conversation List - Scrollable */}
        <div
          className="sidebar-scroll"
          style={{ flex: 1, overflowY: "auto", padding: `0 ${THEME.spacing.sm} ${THEME.spacing.lg}` }}
        >
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 16px", color: THEME.colors.textSubtle }}>
              <MessageSquare size={28} style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px", opacity: 0.5 }} />
              <p style={{ fontSize: "13px", fontWeight: "500", margin: "0 0 4px" }}>No conversations</p>
              <p style={{ fontSize: "11.5px", margin: 0 }}>Start a new chat to begin</p>
            </div>
          )}

          {Object.entries(grouped).map(([category, items]) => {
            const isCollapsed = collapsedSections[category];
            return (
              <div key={category} style={{ marginBottom: THEME.spacing.lg }}>
                {/* Category Header */}
                <button
                  onClick={() => toggleSection(category)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: THEME.spacing.xs,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: THEME.spacing.sm }}>
                    {category === "Pinned" && <Pin size={11} color={THEME.colors.primary} />}
                    {category === "Today" && <Clock size={11} color={THEME.colors.textSubtle} />}
                    {category === "Yesterday" && <Clock size={11} color={THEME.colors.textSubtle} />}
                    {["Last 7 Days", "Last 30 Days", "Older"].includes(category) && <Hash size={11} color={THEME.colors.textSubtle} />}
                    <span style={{ fontSize: "10.5px", fontWeight: "700", color: THEME.colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                      {category}
                    </span>
                    <span style={{ fontSize: "10px", color: THEME.colors.textSubtle, background: THEME.colors.surface, padding: "1px 6px", borderRadius: THEME.radius.full }}>
                      {items.length}
                    </span>
                  </div>
                  <motion.div animate={{ rotate: isCollapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={12} color={THEME.colors.textSubtle} />
                  </motion.div>
                </button>

                {/* Items */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      {items.map((conv) => {
                        const isActive = conv._id === activeConversationId;
                        const isEditing = editingId === conv._id;
                        const isHovered = hoveredId === conv._id;

                        return (
                          <div
                            key={conv._id}
                            className={`conv-item ${isActive ? "active" : ""}`}
                            onClick={() => !isEditing && onSelectConversation(conv._id)}
                            onContextMenu={(e) => handleRightClick(e, conv)}
                            onMouseEnter={() => setHoveredId(conv._id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{
                              padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
                              borderRadius: THEME.radius.md,
                              cursor: "pointer",
                              background: isActive ? "rgba(139, 92, 246, 0.12)" : "transparent",
                              border: `1px solid ${isActive ? "rgba(139,92,246,0.2)" : "transparent"}`,
                              marginBottom: "2px",
                              position: "relative",
                              display: "flex",
                              alignItems: "center",
                              gap: THEME.spacing.sm,
                            }}
                          >
                            {isEditing ? (
                              <div style={{ display: "flex", gap: THEME.spacing.sm, alignItems: "center", width: "100%" }} onClick={(e) => e.stopPropagation()}>
                                <input
                                  ref={editInputRef}
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => handleEditKeyDown(e, conv._id)}
                                  style={{
                                    flex: 1,
                                    background: THEME.colors.surfaceActive,
                                    border: `1px solid ${THEME.colors.primary}60`,
                                    borderRadius: THEME.radius.sm,
                                    color: THEME.colors.text,
                                    fontSize: "12.5px",
                                    padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
                                    outline: "none",
                                  }}
                                />
                                <Check
                                  size={14}
                                  color={THEME.colors.success}
                                  style={{ cursor: "pointer", flexShrink: 0 }}
                                  onClick={(e) => handleSaveEdit(conv._id, e)}
                                />
                                <X
                                  size={14}
                                  color={THEME.colors.danger}
                                  style={{ cursor: "pointer", flexShrink: 0 }}
                                  onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                                />
                              </div>
                            ) : (
                              <>
                                <MessageSquare
                                  size={13}
                                  color={isActive ? THEME.colors.primary : THEME.colors.textSubtle}
                                  style={{ flexShrink: 0 }}
                                />
                                <span style={{
                                  fontSize: "12.5px",
                                  color: isActive ? THEME.colors.text : THEME.colors.textMuted,
                                  fontWeight: isActive ? "600" : "400",
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}>
                                  {conv.title}
                                </span>

                                {/* Action buttons - visible on hover */}
                                <div className="conv-actions" style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStartEdit(conv, e); }}
                                    title="Rename"
                                    style={{ background: "none", border: "none", color: THEME.colors.textSubtle, cursor: "pointer", padding: "4px", borderRadius: THEME.radius.sm, display: "flex" }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.text}
                                    onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.textSubtle}
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv._id); }}
                                    title="Delete"
                                    style={{ background: "none", border: "none", color: THEME.colors.textSubtle, cursor: "pointer", padding: "4px", borderRadius: THEME.radius.sm, display: "flex" }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.danger}
                                    onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.textSubtle}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                {conv.isPinned && (
                                  <Pin size={11} color={THEME.colors.primary} style={{ flexShrink: 0, transform: "rotate(45deg)" }} />
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer Stats / User Profile */}
        <div style={{
          padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
          borderTop: `1px solid ${THEME.colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11px",
          color: THEME.colors.textSubtle,
          flexShrink: 0,
          background: "rgba(0,0,0,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: THEME.spacing.sm }}>
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #F97316 0%, #EF4444 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "700",
              color: "#FFF",
            }}>
              U
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: THEME.colors.textMuted, fontWeight: "500", fontSize: "11.5px" }}>User</span>
              <span style={{ fontSize: "10px" }}>{conversations.length} sessions</span>
            </div>
          </div>
          <button 
            style={{ background: "none", border: "none", color: THEME.colors.textSubtle, cursor: "pointer", padding: "4px", display: "flex", borderRadius: THEME.radius.sm }}
            onMouseEnter={(e) => e.currentTarget.style.color = THEME.colors.text}
            onMouseLeave={(e) => e.currentTarget.style.color = THEME.colors.textSubtle}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="ctx-menu-root ctx-menu-animate"
            style={{
              position: "fixed",
              top: Math.min(contextMenu.y, window.innerHeight - 250),
              left: Math.min(contextMenu.x, window.innerWidth - 220),
              zIndex: 9999,
              background: "rgba(15, 23, 42, 0.95)",
              border: `1px solid ${THEME.colors.borderStrong}`,
              borderRadius: THEME.radius.lg,
              padding: THEME.spacing.sm,
              boxShadow: THEME.shadow.floating,
              minWidth: "200px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <div style={{ padding: `${THEME.spacing.xs} ${THEME.spacing.md} ${THEME.spacing.sm}`, fontSize: "9.5px", fontWeight: "700", color: THEME.colors.textSubtle, letterSpacing: "1px", textTransform: "uppercase" }}>
              Actions
            </div>
            {[
              { icon: <Edit2 size={13} />, label: "Rename", action: () => { handleStartEdit(contextMenu.conv); } },
              { icon: <Pin size={13} style={{ transform: "rotate(45deg)" }} />, label: contextMenu.conv?.isPinned ? "Unpin" : "Pin to top", action: () => { onPinConversation(contextMenu.id, !contextMenu.conv.isPinned); setContextMenu(null); } },
              { icon: <Copy size={13} />, label: "Duplicate", action: () => { onDuplicateConversation(contextMenu.id); setContextMenu(null); } },
              { icon: <Download size={13} />, label: "Export as MD", action: () => { onExportConversation(contextMenu.conv); setContextMenu(null); } },
              { icon: <Archive size={13} />, label: "Archive", action: () => { onArchiveConversation(contextMenu.id); setContextMenu(null); } },
              { icon: <Trash2 size={13} />, label: "Delete", color: THEME.colors.danger, action: () => { onDeleteConversation(contextMenu.id); setContextMenu(null); }, danger: true },
            ].map((item, i) => (
              <div
                key={i}
                className={`ctx-menu-item ${item.danger ? "danger" : ""}`}
                onClick={item.action}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: THEME.spacing.md,
                  padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
                  borderRadius: THEME.radius.sm,
                  cursor: "pointer",
                  color: item.color || THEME.colors.textMuted,
                  fontSize: "12.5px",
                  fontWeight: "500",
                  marginTop: i === 0 ? THEME.spacing.xs : "0",
                }}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}