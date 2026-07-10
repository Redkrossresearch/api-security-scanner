import React, { useState } from "react";
import { Brain, Shield, Link2, Cpu } from "lucide-react";
import MemoryPanel from "./MemoryPanel";
import ScannerPanel from "./ScannerPanel";
import SourcesPanel from "./SourcesPanel";
import TrainingPanel from "./TrainingPanel";

export default function ContextPanel() {
  const [activeTab, setActiveTab] = useState("memory"); // memory, scanner, sources, training

  return (
    <>
      <style>{`
        .tab-btn {
          flex: 1;
          height: 38px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          color: #FFF;
          background: rgba(255,255,255,0.02);
        }
        .tab-btn.active {
          color: #A78BFA;
          border-bottom-color: #8B5CF6;
          background: rgba(139, 92, 246, 0.05);
        }
      `}</style>

      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
        background: "rgba(10, 15, 30, 0.4)",
        backdropFilter: "blur(20px)",
      }}>
        {/* Tab Headers */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setActiveTab("memory")}
            className={`tab-btn ${activeTab === "memory" ? "active" : ""}`}
            title="Memory Log"
          >
            <Brain size={12} />
            Memory
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`tab-btn ${activeTab === "scanner" ? "active" : ""}`}
            title="Scanner Log"
          >
            <Shield size={12} />
            Scanner
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`tab-btn ${activeTab === "sources" ? "active" : ""}`}
            title="Referenced Sources"
          >
            <Link2 size={12} />
            Sources
          </button>
          <button
            onClick={() => setActiveTab("training")}
            className={`tab-btn ${activeTab === "training" ? "active" : ""}`}
            title="AI Few-Shot Alignment"
          >
            <Cpu size={12} />
            Train
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {activeTab === "memory" && <MemoryPanel />}
          {activeTab === "scanner" && <ScannerPanel />}
          {activeTab === "sources" && <SourcesPanel />}
          {activeTab === "training" && <TrainingPanel />}
        </div>
      </div>
    </>
  );
}
