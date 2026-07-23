/**
 * CopyButton.jsx (Sprint 107, 108, 109, 110, 111 — Universal Copy & Export Controls)
 * Provides global copy functionality with 'Copy as Markdown' vs 'Copy as Plain Text' dropdown,
 * image export triggers, and cross-browser fallback handling.
 */
import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function CopyButton({ textToCopy = "", format = "markdown" }) {
  const [isCopied, setIsCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCopy = async (copyMode = "markdown") => {
    try {
      let content = textToCopy;
      if (copyMode === "plaintext") {
        content = textToCopy.replace(/```[a-zA-Z0-9]*\n?/g, "").replace(/[#*`_~]/g, "");
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for non-secure / legacy browser contexts
        const textarea = document.createElement("textarea");
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setIsCopied(true);
      toast.success(copyMode === "plaintext" ? "Copied as Plain Text!" : "Copied as Markdown!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    } finally {
      setShowDropdown(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={() => handleCopy("markdown")}
        style={{
          background: isCopied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${isCopied ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
          color: isCopied ? "#10B981" : "#94A3B8",
          borderRadius: "6px 0 0 6px", padding: "4px 8px", fontSize: "11px", fontWeight: "700",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s ease",
        }}
      >
        {isCopied ? <Check size={12} /> : <Copy size={12} />}
        <span>{isCopied ? "Copied!" : "Copy"}</span>
      </button>

      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderLeft: "none", color: "#94A3B8", borderRadius: "0 6px 6px 0",
          padding: "4px 4px", cursor: "pointer", display: "flex", alignItems: "center",
        }}
      >
        <ChevronDown size={12} />
      </button>

      {showDropdown && (
        <div style={{
          position: "absolute", top: "100%", right: 0, marginTop: "4px",
          background: "#071126", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "8px", padding: "4px", zIndex: 999, width: "150px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          <button
            onClick={() => handleCopy("markdown")}
            style={{
              width: "100%", textAlign: "left", background: "transparent", border: "none",
              color: "#E2E8F0", fontSize: "11px", fontWeight: "600", padding: "6px 8px", borderRadius: "4px", cursor: "pointer",
            }}
          >
            Copy as Markdown
          </button>
          <button
            onClick={() => handleCopy("plaintext")}
            style={{
              width: "100%", textAlign: "left", background: "transparent", border: "none",
              color: "#E2E8F0", fontSize: "11px", fontWeight: "600", padding: "6px 8px", borderRadius: "4px", cursor: "pointer",
            }}
          >
            Copy as Plain Text
          </button>
        </div>
      )}
    </div>
  );
}
