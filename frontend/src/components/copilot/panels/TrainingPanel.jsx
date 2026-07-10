import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Cpu, Check, X, Loader } from "lucide-react";
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
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #FFF;
          font-size: 12px;
          padding: 6px 10px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }
        .train-input:focus {
          border-color: #8B5CF6;
        }
        .train-card {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 8px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .train-bubble {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          line-height: 1.4;
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-all;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", boxSizing: "border-box" }}>
        {/* Header Actions */}
        <div style={{ marginBottom: "14px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Few-Shot Training Pairs</span>
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
              Train AI
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <Search size={13} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search trainings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="train-input"
              style={{ paddingLeft: "30px" }}
            />
          </div>
        </div>

        {/* Add Training Segment */}
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
            <div>
              <label style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "4px" }}>Sample User Prompt</label>
              <input
                type="text"
                placeholder="e.g. Find SQL Injection in /users"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                className="train-input"
              />
            </div>
            <div>
              <label style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "4px" }}>Expected Assistant Response</label>
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
                background: "#8B5CF6",
                border: "none",
                borderRadius: "6px",
                color: "#FFF",
                fontSize: "11.5px",
                padding: "4px 10px",
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
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
              <Loader size={16} className="spin-loader" color="#8B5CF6" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", padding: "40px 10px" }}>
              <Cpu size={24} style={{ display: "block", margin: "0 auto 8px" }} />
              <span style={{ fontSize: "11px" }}>No custom alignment examples trained yet. Click "Train AI" above.</span>
            </div>
          )}
          
          {!loading && filtered.map((item) => (
            <div key={item._id} className="train-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.35)", fontWeight: "700", textTransform: "uppercase" }}>TRAINING EXAMPLE</span>
                <Trash2 size={11} color="rgba(239,68,68,0.5)" style={{ cursor: "pointer" }} onClick={() => handleDelete(item._id)} />
              </div>
              <div>
                <span style={{ fontSize: "8.5px", color: "#A78BFA", display: "block", marginBottom: "2px" }}>PROMPT:</span>
                <div className="train-bubble" style={{ background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.15)", color: "#FFF" }}>
                  {item.prompt}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "8.5px", color: "#10B981", display: "block", marginBottom: "2px" }}>RESPONSE PATTERN:</span>
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
