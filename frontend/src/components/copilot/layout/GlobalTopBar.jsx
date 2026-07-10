import React, { useState } from "react";
import { Shield, Sparkles, Bell, Settings, Search, LogOut, ChevronDown, User, Globe, Cpu } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";

export default function GlobalTopBar({ onOpenSettings, onOpenCommandPalette, isScanning, activeModel }) {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userName = currentUser?.displayName || "Authenticated User";
  const userEmail = currentUser?.email || "No Email";
  
  return (
    <>
      <style>{`
        .topbar-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          height: 36px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .topbar-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: #FFF;
        }
        .profile-dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.15s;
          border-radius: 6px;
        }
        .profile-dd-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #FFF;
        }
      `}</style>
      
      <div style={{
        height: "60px",
        minHeight: "60px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        background: "rgba(10, 15, 30, 0.6)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 100,
      }}>
        {/* Left Side: Brand & Context Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(124, 58, 237, 0.4)",
            }}>
              <Shield size={16} color="#FFF" />
            </div>
            <div>
              <span style={{ fontSize: "15px", fontWeight: "900", color: "#FFF", letterSpacing: "0.5px" }}>
                ATHX AI
              </span>
              <span style={{
                fontSize: "10px",
                color: "#8B5CF6",
                fontWeight: "700",
                marginLeft: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                Copilot
              </span>
            </div>
          </div>

          {/* Breadcrumb separator */}
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.15)" }} />

          {/* Target workspace */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            <span>Workspace:</span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: "600" }}>
              Atharv-design/api-security-scanner
            </span>
          </div>
        </div>

        {/* Right Side: Command search, notifications, Status, Profile dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Quick Command Search Palette Trigger */}
          <button 
            onClick={onOpenCommandPalette}
            className="topbar-btn"
            style={{ width: "180px", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Search size={13} />
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Search actions...</span>
            </div>
            <kbd style={{
              fontSize: "9px",
              background: "rgba(255,255,255,0.08)",
              padding: "2px 4px",
              borderRadius: "4px",
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.12)"
            }}>
              Ctrl+K
            </kbd>
          </button>

          {/* Engine Status indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.06)",
            border: "1px solid rgba(16, 185, 129, 0.18)",
            padding: "5px 12px",
            borderRadius: "8px",
            height: "36px",
            boxSizing: "border-box"
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: isScanning ? "#F59E0B" : "#10B981",
              boxShadow: `0 0 6px ${isScanning ? "#F59E0B" : "#10B981"}`,
              animation: isScanning ? "pulse 1.2s infinite" : "none"
            }} />
            <span style={{
              fontSize: "11px",
              fontWeight: "800",
              color: isScanning ? "#F59E0B" : "#10B981",
              fontFamily: "monospace"
            }}>
              {isScanning ? "SHIELD://SCANNING" : "SHIELD://ACTIVE"}
            </span>
          </div>

          {/* Active Model tag */}
          <div style={{
            fontSize: "11.5px",
            color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "0 10px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            borderRadius: "8px",
            fontWeight: "600"
          }}>
            {activeModel ? activeModel.split("/")[1]?.split(":")[0]?.toUpperCase() || "GPT-OSS" : "GPT-OSS"}
          </div>

          {/* Notification bell */}
          <button className="topbar-btn" style={{ width: "36px", padding: 0, justifyContent: "center" }} onClick={() => toast.success("No new security alerts")}>
            <Bell size={14} />
          </button>

          {/* Settings button */}
          <button className="topbar-btn" style={{ width: "36px", padding: 0, justifyContent: "center" }} onClick={onOpenSettings}>
            <Settings size={14} />
          </button>

          {/* Profile Dropdown Menu */}
          <div style={{ position: "relative" }}>
            <button 
              className="topbar-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ padding: "0 8px 0 6px" }}
            >
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #1E293B, #0F172A)",
                border: "1.5px solid rgba(249, 115, 22, 0.4)",
                color: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "800",
              }}>
                {userName.charAt(0)}
              </div>
              <ChevronDown size={12} color="rgba(255,255,255,0.4)" />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  onClick={() => setDropdownOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 999 }}
                />
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "#0F1626",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  padding: "8px",
                  minWidth: "220px",
                  zIndex: 1000,
                }}>
                  {/* User info */}
                  <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "8px" }}>
                    <div style={{ color: "#FFF", fontSize: "13px", fontWeight: "700" }}>{userName}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>{userEmail}</div>
                  </div>

                  {/* Actions */}
                  <div className="profile-dd-item" onClick={() => { setDropdownOpen(false); onOpenSettings(); }}>
                    <Settings size={13} />
                    <span>Account Settings</span>
                  </div>
                  <div className="profile-dd-item" onClick={() => { setDropdownOpen(false); logout(); }} style={{ color: "#EF4444" }}>
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
