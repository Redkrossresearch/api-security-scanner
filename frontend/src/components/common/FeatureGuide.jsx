import { useState } from "react";
import { HelpCircle, X, Cpu, BookOpen } from "lucide-react";

export default function FeatureGuide({ title, description, steps = [], techDetails = [], positionStyles = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const defaultPosition = {
    position: "absolute",
    top: "16px",
    right: "16px",
    zIndex: 30,
    ...positionStyles
  };

  const T = {
    overlayBg: "rgba(2, 6, 23, 0.8)",
    modalBg: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
    border: "rgba(139, 92, 246, 0.25)",
    textWhite: "#ffffff",
    textMuted: "#94a3b8",
    purple: "#8b5cf6",
    purpleHover: "#a78bfa",
    green: "#22c55e",
  };

  return (
    <>
      {/* Help Circle Trigger Button */}
      <button
        type="button"
        onClick={toggleModal}
        title={`View guide for ${title}`}
        style={{
          ...defaultPosition,
          background: "rgba(255, 255, 255, 0.03)",
          border: `1px solid ${T.border}`,
          borderRadius: "50%",
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: T.textMuted,
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = T.purple;
          e.currentTarget.style.border = `1px solid ${T.purple}`;
          e.currentTarget.style.boxShadow = `0 0 10px rgba(139, 92, 246, 0.3)`;
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = T.textMuted;
          e.currentTarget.style.border = `1px solid ${T.border}`;
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <HelpCircle size={15} />
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          onClick={toggleModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: T.overlayBg,
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease-out forwards",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.modalBg,
              border: `1px solid ${T.purple}`,
              borderRadius: "20px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25)",
              color: T.textWhite,
              overflow: "hidden",
              animation: "floatUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BookOpen size={20} style={{ color: T.purple }} />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", letterSpacing: "-0.01em" }}>
                  {title} Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={toggleModal}
                style={{
                  background: "transparent",
                  border: "none",
                  color: T.textMuted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  borderRadius: "50%",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = T.textWhite;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = T.textMuted;
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
              {/* Description */}
              <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: T.textMuted, lineHeight: "1.6" }}>
                {description}
              </p>

              {/* Steps Checklist */}
              {steps.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: T.purple }}>
                    How to use this feature
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {steps.map((step, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div
                          style={{
                            background: "rgba(139, 92, 246, 0.1)",
                            border: `1px solid ${T.purple}`,
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: "750",
                            color: T.purple,
                            flexShrink: 0,
                            marginTop: "2px"
                          }}
                        >
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: "13.5px", color: "#e2e8f0", lineHeight: "1.5" }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical / Under the hood */}
              {techDetails.length > 0 && (
                <div style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(139, 92, 246, 0.03)",
                  border: "1px solid rgba(139, 92, 246, 0.12)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Cpu size={14} style={{ color: T.purple }} />
                    <h5 style={{ margin: 0, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: T.purple }}>
                      Under the Hood (Real Connectivity)
                    </h5>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: T.textMuted, display: "flex", flexDirection: "column", gap: "6px" }}>
                    {techDetails.map((detail, idx) => (
                      <li key={idx} style={{ lineHeight: "1.5" }}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                background: "rgba(0, 0, 0, 0.2)",
                borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                display: "flex",
                justifyContent: "flex-end"
              }}
            >
              <button
                type="button"
                onClick={toggleModal}
                style={{
                  background: T.purple,
                  border: "none",
                  borderRadius: "10px",
                  color: T.textWhite,
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = T.purpleHover}
                onMouseLeave={(e) => e.currentTarget.style.background = T.purple}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
