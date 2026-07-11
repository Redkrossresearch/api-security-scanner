import React, { useState, useEffect, useRef } from "react";
import { Search, Terminal, Settings, MessageSquare, Play, ShieldAlert, Sparkles } from "lucide-react";

export default function CommandPalette({ isOpen, onClose, actions }) {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const commandItems = [
    { icon: <PlusIcon />, name: "New Conversation", desc: "Start a clean AI chat session", action: "new-chat" },
    { icon: <ScanIcon />, name: "Scan Target URL", desc: "Trigger audit on the target server", action: "scan-url" },
    { icon: <SettingsIcon />, name: "Account settings", desc: "Open profile and webhooks panel", action: "settings" },
    { icon: <ClearIcon />, name: "Clear conversation logs", desc: "Permanently delete chat history", action: "clear-chats" },
    { icon: <ReportIcon />, name: "Export PDF report", desc: "Download compliance documentation", action: "export-pdf" },
  ];

  const filtered = commandItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.desc.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          triggerAction(filtered[activeIndex].action);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, activeIndex]);

  const triggerAction = (act) => {
    if (actions && actions[act]) {
      actions[act]();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .palette-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 100px;
          z-index: 3000;
        }
        .palette-box {
          background: #090E1A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .palette-input {
          background: transparent;
          border: none;
          color: #FFF;
          font-size: 14px;
          outline: none;
          width: 100%;
          height: 48px;
          padding: 0 16px 0 42px;
          box-sizing: border-box;
        }
        .palette-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          cursor: pointer;
          transition: all 0.15s;
          border-radius: 8px;
          margin: 2px 6px;
        }
        .palette-item:hover, .palette-item.active {
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.22);
        }
      `}</style>

      <div className="palette-overlay" onClick={onClose}>
        <div className="palette-box" onClick={(e) => e.stopPropagation()}>
          {/* Search bar input */}
          <div style={{ position: "relative", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Search 
              size={16} 
              color="rgba(255,255,255,0.3)" 
              style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} 
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search shortcuts and commands..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
              className="palette-input"
            />
          </div>

          {/* Results list */}
          <div style={{ maxHeight: "280px", overflowY: "auto", padding: "6px 0" }}>
            {filtered.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={idx}
                  className={`palette-item ${isActive ? "active" : ""}`}
                  onClick={() => triggerAction(item.action)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  style={{
                    border: isActive ? "1px solid rgba(139, 92, 246, 0.22)" : "1px solid transparent"
                  }}
                >
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isActive ? "#A78BFA" : "rgba(255,255,255,0.4)"
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: "600", color: isActive ? "#FFF" : "rgba(255,255,255,0.85)" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>
                      {item.desc}
                    </div>
                  </div>
                  {isActive && (
                    <kbd style={{
                      fontSize: "9px",
                      background: "rgba(255,255,255,0.06)",
                      padding: "2px 5px",
                      borderRadius: "4px",
                      color: "rgba(255,255,255,0.4)"
                    }}>
                      Enter
                    </kbd>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "20px" }}>
                No commands match your search
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Icon wrappers
const PlusIcon = () => <MessageSquare size={13} />;
const ScanIcon = () => <Play size={13} />;
const SettingsIcon = () => <Settings size={13} />;
const ClearIcon = () => <ShieldAlert size={13} />;
const ReportIcon = () => <Sparkles size={13} />;
