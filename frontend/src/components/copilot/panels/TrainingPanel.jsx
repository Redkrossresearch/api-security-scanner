import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Cpu, Check, X, Loader, Sparkles } from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

export default function TrainingPanel() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [newResponse, setNewResponse] = useState("");

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/copilot/trainings");
      if (res.data?.success) {
        setTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error("Failed to fetch training pairs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleAdd = async () => {
    if (!newPrompt.trim() || !newResponse.trim()) {
      toast.error("Both prompt and response are required");
      return;
    }
    try {
      const res = await api.post("/copilot/trainings", {
        prompt: newPrompt.trim(),
        response: newResponse.trim(),
      });
      if (res.data?.success) {
        setTrainings((prev) => [res.data.training, ...prev]);
        setNewPrompt("");
        setNewResponse("");
        setIsAdding(false);
        toast.success("AI aligned with new training example!");
      }
    } catch (err) {
      toast.error("Failed to save training pair");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/copilot/trainings/${id}`);
      if (res.data?.success) {
        setTrainings((prev) => prev.filter((t) => t._id !== id));
        toast.success("Training example removed");
      }
    } catch (err) {
      toast.error("Failed to delete training example");
    }
  };

  const filtered = trainings.filter((t) =>
    t.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.response.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        .train-input {
          background: rgba(8, 14, 27, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #FFF;
          font-size: 12px;
          padding: 8px 12px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          transition: all 0.2s;
        }
        .train-input:focus {
          border-color: #8B5CF6;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.15);
          background: rgba(13, 20, 37, 0.9);
        }
        .train-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0.005) 100%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.2s;
        }
        .train-card:hover {
          border-color: rgba(139, 92, 246, 0.2);
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          transform: translateY(-1px);
        }
        .train-bubble {
          font-size: 11.5px;
          padding: 6px 10px;
          border-radius: 8px;
          line-height: 1.45;
          font-family: "Fira Code", "Courier New", monospace;
          white-space: pre-wrap;
          word-break: break-all;
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
        {/* Header Actions */}
        <div style={{ marginBottom: "16px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Cpu size={14} color="#8B5CF6" />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>Few-Shot Training Pairs</span>
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
              Train AI
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search trainings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="train-input"
              style={{ paddingLeft: "34px" }}
            />
          </div>
        </div>

        {/* Add Training Segment */}
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
            <div>
              <label style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: "4px", fontWeight: "700" }}>SAMPLE USER PROMPT</label>
              <input
                type="text"
                placeholder="e.g. Find SQL Injection in /users"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                className="train-input"
              />
            </div>
            <div>
              <label style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: "4px", fontWeight: "700" }}>EXPECTED ASSISTANT RESPONSE</label>
              <textarea
                placeholder="e.g. ### SQLi remediated patches..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                className="train-input"
                style={{ minHeight: "80px", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAdd} style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                border: "none",
                borderRadius: "6px",
                color: "#FFF",
                fontSize: "11px",
                fontWeight: "600",
                padding: "5px 12px",
                cursor: "pointer",
                marginLeft: "auto"
              }}>
                Save Alignment
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
        )}

        {/* Scrollable list of items */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1, 2].map((n) => (
                <div key={n} className="shimmer-bg" style={{ height: "110px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", padding: "40px 10px" }}>
              <Cpu size={24} style={{ display: "block", margin: "0 auto 8px" }} />
              <span style={{ fontSize: "11.5px" }}>No custom alignment examples trained yet. Click "Train AI" above.</span>
            </div>
          )}
          
          {!loading && filtered.map((item) => (
            <div key={item._id} className="train-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>Training Example Alignment</span>
                <Trash2 size={12} color="rgba(239,68,68,0.5)" style={{ cursor: "pointer" }} onClick={() => handleDelete(item._id)} />
              </div>
              <div>
                <span style={{ fontSize: "8.5px", color: "#A78BFA", display: "block", marginBottom: "3px", fontWeight: "700" }}>PROMPT:</span>
                <div className="train-bubble" style={{ background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.15)", color: "#FFF" }}>
                  {item.prompt}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "8.5px", color: "#10B981", display: "block", marginBottom: "3px", fontWeight: "700" }}>RESPONSE PATTERN:</span>
                <div className="train-bubble" style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.1)", color: "rgba(255,255,255,0.75)" }}>
                  {item.response}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
