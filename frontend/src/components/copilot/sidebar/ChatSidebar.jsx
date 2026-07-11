import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, MessageSquare, Pin, Edit2, Copy, Download, Trash2, Archive, Check, X, Clock } from "lucide-react";
import toast from "react-hot-toast";

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
  const [contextMenu, setContextMenu] = useState(null);

  const editInputRef = useRef(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleStartEdit = (conv, e) => {
    e.stopPropagation();
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
    setContextMenu({ id: conv._id, conv, x: e.clientX, y: e.clientY });
  };

  const handleDeleteWithUndo = (conv, e) => {
    e?.stopPropagation();
    const id = conv._id;
    
    // Save state for undo
    let isUndone = false;
    
    // Custom toast with undo button
    toast((t) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>Deleted "{conv.title}"</span>
        <button 
          onClick={() => {
            isUndone = true;
            toast.dismiss(t.id);
            toast.success("Restore successful");
          }}
          style={{
            background: "rgba(139, 92, 246, 0.25)",
            border: "1px solid #8B5CF6",
            borderRadius: "4px",
            color: "#FFF",
            fontSize: "11px",
            padding: "2px 8px",
            cursor: "pointer",
            fontWeight: "700"
          }}
        >
          Undo
        </button>
      </div>
    ), { duration: 5000 });

    // Execute delete after timeout if not undone
    setTimeout(() => {
      if (!isUndone) {
        onDeleteConversation(id);
      }
    }, 5000);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filteredConversations.filter((c) => getCategory(c.updatedAt, c.isPinned) === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  // Highlighting matched search query text
  const renderTitle = (title) => {
    if (!searchQuery) return title;
    const index = title.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (index === -1) return title;
    const before = title.slice(0, index);
    const match = title.slice(index, index + searchQuery.length);
    const after = title.slice(index + searchQuery.length);
    return (
      <>
        {before}
        <mark style={{ background: "rgba(139, 92, 246, 0.4)", color: "#FFF", padding: "0 2px", borderRadius: "2px" }}>
          {match}
        </mark>
        {after}
      </>
    );
  };

  return (
    <>
      <style>{`
        .chat-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .chat-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.35);
          border-radius: 999px;
        }
        .chat-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
        }
        .conv-item { transition: all 0.15s ease; }
        .conv-item:hover { background: rgba(255,255,255,0.04) !important; }
        .conv-item.active { background: rgba(139, 92, 246, 0.12) !important; }
        .conv-actions { opacity: 0; transition: opacity 0.15s ease; }
        .conv-item:hover .conv-actions { opacity: 1; }
        .ctx-menu-item:hover { background: rgba(255,255,255,0.06); }
      `}</style>

      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10, 15, 30, 0.4)",
        backdropFilter: "blur(20px)",
      }}>
        {/* Header Options */}
        <div style={{ padding: "16px 16px 12px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Conversations
            </span>
            {conversations.length > 0 && (
              <button
                onClick={onClearAll}
                title="Clear all chats"
                style={{ background: "none", border: "none", color: "rgba(239,68,68,0.6)", cursor: "pointer", padding: "2px" }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            style={{
              width: "100%",
              height: "38px",
              background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
              border: "none",
              borderRadius: "10px",
              color: "#FFF",
              fontSize: "12.5px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "12px",
              boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={14} />
            New Chat
          </button>

          {/* Search bar input */}
          <div style={{ position: "relative" }}>
            <Search
              size={13}
              color="rgba(255,255,255,0.25)"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "34px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "0 10px 0 32px",
                color: "#FFF",
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div
          className="chat-sidebar-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}
        >
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "rgba(255,255,255,0.2)" }}>
              <MessageSquare size={28} style={{ marginBottom: "10px", display: "block", margin: "0 auto 10px" }} />
              <p style={{ fontSize: "12px" }}>No conversations yet</p>
              <p style={{ fontSize: "11px", marginTop: "4px" }}>Click "New Chat" to start</p>
            </div>
          )}

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: "16px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                marginBottom: "4px",
              }}>
                {category === "Pinned" && <Pin size={10} color="rgba(139,92,246,0.7)" style={{ transform: "rotate(45deg)" }} />}
                {category === "Today" && <Clock size={10} color="rgba(255,255,255,0.25)" />}
                <span style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {category}
                </span>
              </div>

              {items.map((conv) => {
                const isActive = conv._id === activeConversationId;
                const isEditing = editingId === conv._id;

                return (
                  <div
                    key={conv._id}
                    className={`conv-item ${isActive ? "active" : ""}`}
                    onClick={() => !isEditing && onSelectConversation(conv._id)}
                    onContextMenu={(e) => handleRightClick(e, conv)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isActive ? "rgba(139, 92, 246, 0.12)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(139,92,246,0.2)" : "transparent"}`,
                      marginBottom: "2px",
                      position: "relative",
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                        <input
                          ref={editInputRef}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, conv._id)}
                          style={{
                            flex: 1,
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(139,92,246,0.5)",
                            borderRadius: "5px",
                            color: "#FFF",
                            fontSize: "12px",
                            padding: "3px 7px",
                            outline: "none",
                          }}
                        />
                        <Check
                          size={13}
                          color="#10B981"
                          style={{ cursor: "pointer", flexShrink: 0 }}
                          onClick={(e) => handleSaveEdit(conv._id, e)}
                        />
                        <X
                          size={13}
                          color="#EF4444"
                          style={{ cursor: "pointer", flexShrink: 0 }}
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MessageSquare
                          size={12}
                          color={isActive ? "#A78BFA" : "rgba(255,255,255,0.25)"}
                          style={{ flexShrink: 0 }}
                        />
                        <span style={{
                          fontSize: "12.5px",
                          color: isActive ? "#FFF" : "rgba(255,255,255,0.65)",
                          fontWeight: isActive ? "600" : "400",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {renderTitle(conv.title)}
                        </span>

                        {/* Action buttons (only on hover) */}
                        <div className="conv-actions" style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartEdit(conv, e); }}
                            title="Rename"
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "2px" }}
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteWithUndo(conv, e)}
                            title="Delete"
                            style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", padding: "2px" }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {conv.isPinned && (
                          <Pin size={10} color="#8B5CF6" style={{ transform: "rotate(45deg)", flexShrink: 0 }} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Statistics */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10.5px",
          color: "rgba(255,255,255,0.2)",
          flexShrink: 0,
        }}>
          <span>{conversations.length} sessions</span>
          <span>{conversations.filter((c) => c.isPinned).length} pinned</span>
        </div>
      </div>

      {/* Context Menu Popup (Right-Click) */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: Math.min(contextMenu.y, window.innerHeight - 200),
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            zIndex: 9999,
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "4px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            minWidth: "170px",
          }}
        >
          {[
            { icon: <Edit2 size={12} />, label: "Rename", action: () => { handleStartEdit(contextMenu.conv, { stopPropagation: () => {} }); setContextMenu(null); } },
            { icon: <Pin size={12} style={{ transform: "rotate(45deg)" }} />, label: contextMenu.conv?.isPinned ? "Unpin" : "Pin to top", action: () => { onPinConversation(contextMenu.id, !contextMenu.conv.isPinned); setContextMenu(null); } },
            { icon: <Copy size={12} />, label: "Duplicate", action: () => { onDuplicateConversation(contextMenu.id); setContextMenu(null); } },
            { icon: <Download size={12} />, label: "Export chat", action: () => { onExportConversation(contextMenu.conv); setContextMenu(null); } },
            { icon: <Archive size={12} />, label: "Archive", action: () => { onArchiveConversation(contextMenu.id); setContextMenu(null); } },
            { icon: <Trash2 size={12} color="#EF4444" />, label: "Delete", color: "#EF4444", action: () => { handleDeleteWithUndo(contextMenu.conv, { stopPropagation: () => {} }); setContextMenu(null); } },
          ].map((item, i) => (
            <div
              key={i}
              className="ctx-menu-item"
              onClick={item.action}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "7px",
                cursor: "pointer",
                color: item.color || "rgba(255,255,255,0.75)",
                fontSize: "12.5px",
                fontWeight: "500",
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
