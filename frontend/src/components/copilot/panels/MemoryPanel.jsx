import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Check, X, Brain, Loader, Sparkles } from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

export default function MemoryPanel() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState("General");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/copilot/memories");
      if (res.data?.success) {
        setMemories(res.data.memories);
      }
    } catch (err) {
      console.error("Failed to fetch memories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAdd = async () => {
    if (!newMemoryText.trim()) return;
    try {
      const res = await api.post("/copilot/memories", {
        text: newMemoryText.trim(),
        category: newMemoryCategory,
      });
      if (res.data?.success) {
        setMemories((prev) => [res.data.memory, ...prev]);
        setNewMemoryText("");
        setIsAdding(false);
        toast.success("Memory added to AI context");
      }
    } catch (err) {
      toast.error("Failed to save memory");
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setEditingText(item.text);
  };

  const handleSaveEdit = async (id) => {
    if (!editingText.trim()) return;
    try {
      const current = memories.find((m) => m._id === id);
      if (!current) return;
      
      await api.delete(`/copilot/memories/${id}`);
      const res = await api.post("/copilot/memories", {
        text: editingText.trim(),
        category: current.category,
      });
      
      if (res.data?.success) {
        setMemories((prev) => prev.map((m) => m._id === id ? res.data.memory : m));
        setEditingId(null);
        toast.success("Memory updated");
      }
    } catch (err) {
      toast.error("Failed to edit memory");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/copilot/memories/${id}`);
      if (res.data?.success) {
        setMemories((prev) => prev.filter((m) => m._id !== id));
        toast.success("Memory removed");
      }
    } catch (err) {
      toast.error("Failed to delete memory");
    }
  };

  const filtered = memories.filter((m) =>
    m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case "security":
        return { text: "#EF4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)" };
      case "authentication":
        return { text: "#3B82F6", bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.2)" };
      case "infrastructure":
        return { text: "#10B981", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)" };
      default:
        return { text: "#A78BFA", bg: "rgba(167, 139, 250, 0.08)", border: "rgba(167, 139, 250, 0.2)" };
    }
  };

  return (
    <>
      <style>{`
        .mem-input {
          background: rgba(8, 14, 27, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #FFF;
          font-size: 12px;
          padding: 8px 12px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .mem-input:focus {
          border-color: #8B5CF6;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.15);
          background: rgba(13, 20, 37, 0.9);
        }
        .mem-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 12px;
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mem-card:hover {
          border-color: rgba(139, 92, 246, 0.2);
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          transform: translateY(-1px);
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.1); }
        }
        .pulse-brain {
          animation: pulseGlow 3s infinite ease-in-out;
          border-radius: 50%;
          padding: 12px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.15);
          color: #A78BFA;
          display: inline-flex;
          margin-bottom: 12px;
        }
        .shimmer-bg {
          background: linear-gradient(90deg, rgba(255,255,255,0.01) 25%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.01) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", boxSizing: "border-box" }}>
        {/* Search & Actions Header */}
        <div style={{ marginBottom: "16px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Brain size={14} color="#8B5CF6" />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stored Memories</span>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                color: "#A78BFA",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.7)";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(139, 92, 246, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Plus size={12} />
              Add Memory
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mem-input"
              style={{ paddingLeft: "34px" }}
            />
          </div>
        </div>

        {/* Add memory block */}
        {isAdding && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "16px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
          }}>
            <input
              type="text"
              placeholder="Memory text (e.g. Staging server runs on HTTP...)"
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              className="mem-input"
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <select
                value={newMemoryCategory}
                onChange={(e) => setNewMemoryCategory(e.target.value)}
                style={{
                  background: "#0D1424",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#FFF",
                  fontSize: "11px",
                  borderRadius: "6px",
                  padding: "5px 10px"
                }}
              >
                <option value="General">General</option>
                <option value="Security">Security</option>
                <option value="Authentication">Authentication</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
              
              <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                <button onClick={handleAdd} style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#FFF",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "5px 12px",
                  cursor: "pointer"
                }}>
                  Save
                </button>
                <button onClick={() => setIsAdding(false)} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: "6px",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "11px",
                  padding: "5px 12px",
                  cursor: "pointer"
                }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable list of items */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="shimmer-bg" style={{ height: "70px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", padding: "50px 10px" }}>
              <div className="pulse-brain">
                <Brain size={28} />
              </div>
              <h4 style={{ margin: "0 0 4px 0", color: "#FFF", fontSize: "13px", fontWeight: "600" }}>No Stored Memories</h4>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)", maxWidth: "200px", marginLeft: "auto", marginRight: "auto", lineHeight: "1.4" }}>
                AI learns context automatically from your chats, or you can manually save security guidelines.
              </p>
            </div>
          )}
          
          {!loading && filtered.map((item) => {
            const isEditing = editingId === item._id;
            const catColors = getCategoryColor(item.category);
            return (
              <div key={item._id} className="mem-card">
                {isEditing ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="mem-input"
                    />
                    <button 
                      onClick={() => handleSaveEdit(item._id)}
                      style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "6px", padding: "6px", cursor: "pointer", display: "inline-flex" }}
                    >
                      <Check size={12} color="#10B981" />
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "6px", padding: "6px", cursor: "pointer", display: "inline-flex" }}
                    >
                      <X size={12} color="#EF4444" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{
                        fontSize: "9px",
                        background: catColors.bg,
                        border: `1px solid ${catColors.border}`,
                        borderRadius: "5px",
                        padding: "2px 6px",
                        color: catColors.text,
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>{item.category}</span>
                      
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Edit2 size={12} color="rgba(255,255,255,0.3)" style={{ cursor: "pointer" }} onClick={() => handleStartEdit(item)} />
                        <Trash2 size={12} color="rgba(239,68,68,0.5)" style={{ cursor: "pointer" }} onClick={() => handleDelete(item._id)} />
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: "1.5" }}>
                      {item.text}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Small AI Note */}
        <div style={{
          marginTop: "12px",
          background: "rgba(139, 92, 246, 0.03)",
          border: "1px solid rgba(139, 92, 246, 0.08)",
          borderRadius: "10px",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0
        }}>
          <Sparkles size={12} color="#A78BFA" />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", lineHeight: "1.4" }}>
            <strong>Auto-Learning:</strong> Copilot compresses user chats to auto-memorize environment values instantly.
          </span>
        </div>
      </div>
    </>
  );
}
