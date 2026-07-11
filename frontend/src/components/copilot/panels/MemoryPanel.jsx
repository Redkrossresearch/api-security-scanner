import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Check, X, Brain, Loader } from "lucide-react";
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
      // In setting.controller update settings style, or we can use custom payload.
      // Wait, there is no direct put endpoint for a single memory, let's delete and re-create, OR let's just make it simple.
      // Since we don't have a direct PUT endpoint for memory in copilot.routes.js, let's keep editing in UI or add it to backend if needed.
      // Let's add updateMemory to backend if we want editing, or keep it in local UI state. Or we can just let it edit locally or show an alert.
      // Let's delete and recreate to save on adding extra backend route overhead!
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

  return (
    <>
      <style>{`
        .mem-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #FFF;
          font-size: 12px;
          padding: 6px 10px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        .mem-input:focus {
          border-color: #8B5CF6;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", boxSizing: "border-box" }}>
        {/* Search & Actions Header */}
        <div style={{ marginBottom: "14px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Stored Memories</span>
            <button
              onClick={() => setIsAdding(!isAdding)}
              style={{
                background: "rgba(139, 92, 246, 0.2)",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                color: "#A78BFA",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Plus size={12} />
              Add
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <Search size={13} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mem-input"
              style={{ paddingLeft: "30px" }}
            />
          </div>
        </div>

        {/* Add memory block */}
        {isAdding && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "12px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <input
              type="text"
              placeholder="Memory text..."
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              className="mem-input"
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={newMemoryCategory}
                onChange={(e) => setNewMemoryCategory(e.target.value)}
                style={{
                  background: "#0D1424",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#FFF",
                  fontSize: "11px",
                  borderRadius: "6px",
                  padding: "4px 8px"
                }}
              >
                <option value="General">General</option>
                <option value="Security">Security</option>
                <option value="Authentication">Authentication</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
              <button onClick={handleAdd} style={{
                background: "#8B5CF6",
                border: "none",
                borderRadius: "6px",
                color: "#FFF",
                fontSize: "11.5px",
                padding: "4px 10px",
                cursor: "pointer",
                marginLeft: "auto"
              }}>
                Save
              </button>
              <button onClick={() => setIsAdding(false)} style={{
                background: "rgba(255,255,255,0.05)",
                border: "none",
                borderRadius: "6px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "11.5px",
                padding: "4px 10px",
                cursor: "pointer"
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Scrollable list of items */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
              <Loader size={16} className="spin-loader" color="#8B5CF6" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", padding: "40px 10px" }}>
              <Brain size={24} style={{ display: "block", margin: "0 auto 8px" }} />
              <span style={{ fontSize: "11.5px" }}>No memories match search criteria</span>
            </div>
          )}
          
          {!loading && filtered.map((item) => {
            const isEditing = editingId === item._id;
            return (
              <div 
                key={item._id}
                style={{
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "8px",
                  padding: "10px",
                  position: "relative"
                }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="mem-input"
                    />
                    <Check size={13} color="#10B981" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => handleSaveEdit(item._id)} />
                    <X size={13} color="#EF4444" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setEditingId(null)} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{
                        fontSize: "9px",
                        background: "rgba(139, 92, 246, 0.15)",
                        border: "1px solid rgba(139, 92, 246, 0.25)",
                        borderRadius: "4px",
                        padding: "1px 5px",
                        color: "#A78BFA",
                        fontWeight: "700",
                        textTransform: "uppercase"
                      }}>{item.category}</span>
                      
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Edit2 size={11} color="rgba(255,255,255,0.3)" style={{ cursor: "pointer" }} onClick={() => handleStartEdit(item)} />
                        <Trash2 size={11} color="rgba(239,68,68,0.5)" style={{ cursor: "pointer" }} onClick={() => handleDelete(item._id)} />
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: "1.45" }}>
                      {item.text}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
