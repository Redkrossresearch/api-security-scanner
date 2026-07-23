/**
 * ImageBlock.jsx (Sprint 105 — Image Block & Click-to-Zoom Lightbox Modal)
 * Displays generated/uploaded images with aspect-ratio preservation, loading skeleton, and full Lightbox zoom modal.
 */
import { useState } from "react";
import { Maximize2, Download, X, Image as ImageIcon } from "lucide-react";

export default function ImageBlock({ src, alt = "Generated Security Diagram / Image", caption = "" }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31";
    link.download = `security_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ margin: "14px 0", maxWidth: "600px" }}>
      <div style={{
        position: "relative", background: "#070D19", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}>
        {isLoading && (
          <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", gap: "8px" }}>
            <ImageIcon size={20} className="animate-pulse" />
            <span style={{ fontSize: "12px" }}>Loading media...</span>
          </div>
        )}

        <img
          src={src || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80"}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onClick={() => setIsLightboxOpen(true)}
          style={{
            width: "100%", height: "auto", display: isLoading ? "none" : "block",
            cursor: "pointer", transition: "transform 0.3s ease",
          }}
        />

        {/* Hover overlay controls */}
        <div style={{
          position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px",
        }}>
          <button
            onClick={() => setIsLightboxOpen(true)}
            title="Full Screen Lightbox Zoom"
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={handleDownload}
            title="Download PNG"
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {caption && (
        <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "6px", textAlign: "center", fontStyle: "italic" }}>
          {caption}
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {isLightboxOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button
              onClick={() => setIsLightboxOpen(false)}
              style={{ position: "absolute", top: "-40px", right: 0, background: "transparent", border: "none", color: "#FFFFFF", cursor: "pointer" }}
            >
              <X size={24} />
            </button>
            <img
              src={src || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80"}
              alt={alt}
              style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
