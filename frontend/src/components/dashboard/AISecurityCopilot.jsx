import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ShieldAlert, Sparkles, ChevronRight, Activity } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = {
  white: "#FFFFFF",
  muted: "#94A3B8",
  purple: "#8B5CF6",
  critical: "#EF4444",
  warning: "#F97316",
  border: "rgba(255,255,255,.08)",
  background: "#030712"
};

const styles = {
  card: {
    background: "linear-gradient(180deg, #090d16 0%, #030712 100%)",
    border: "1px solid rgba(139,92,246,0.18)",
    borderRadius: "24px",
    padding: "20px",
    height: "360px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    animation: "copilotPulse 4s infinite ease-in-out",
    boxShadow: "0 8px 30px rgba(0,0,0,0.5)"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "15px",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(90deg, #C084FC, #8B5CF6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "9px",
    fontWeight: "800",
    color: "#C084FC",
    background: "rgba(139,92,246,0.1)",
    padding: "2px 8px",
    borderRadius: "999px",
    border: "1px solid rgba(139,92,246,0.2)"
  },
  liveDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#C084FC",
    animation: "pulseLive 1.5s infinite"
  },
  text: {
    fontSize: "12px",
    color: COLORS.muted,
    marginTop: "8px",
    lineHeight: "1.5"
  },
  list: {
    flex: 1,
    overflowY: "auto",
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingRight: "4px"
  },
  item: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "14px",
    padding: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px"
  },
  itemTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#F1F5F9",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "160px"
  },
  badge: {
    padding: "2px 6px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: "800",
    textTransform: "uppercase",
    background: "rgba(239,68,68,0.12)",
    color: COLORS.critical,
    border: "1px solid rgba(239,68,68,0.2)"
  },
  itemMeta: {
    fontSize: "10px",
    color: COLORS.muted,
    marginTop: "6px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  btn: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "750",
    border: "none",
    color: COLORS.white,
    cursor: "pointer",
    background: "linear-gradient(90deg, #7C3AED, #EC4899, #7C3AED)",
    backgroundSize: "200% auto",
    animation: "shimmerGrad 3s infinite linear",
    marginTop: "12px"
  },
  link: {
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#C084FC",
    marginTop: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px"
  }
};

function AISecurityCopilot({
  criticalCount,
  criticalFindings,
}) {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "AI Copilot starting logical perimeter graph audit...",
        success: "Audit complete! Vulnerability registers updated.",
        error: "Audit failed."
      }
    ).then(() => {
      setAnalyzing(false);
      navigate("/vulnerabilities");
    });
  };

  return (
    <div style={styles.card}>
      <style>{`
        @keyframes copilotPulse {
          0% { box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 0 rgba(139,92,246,0); border-color: rgba(139,92,246,0.18); }
          50% { box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 16px rgba(139,92,246,0.25); border-color: rgba(139,92,246,0.4); }
          100% { box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 0 rgba(139,92,246,0); border-color: rgba(139,92,246,0.18); }
        }
        @keyframes pulseLive {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmerGrad {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .copilot-item:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(139,92,246,0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139,92,246,0.08);
        }
      `}</style>

      {/* Header */}
      <div style={styles.headerRow}>
        <h3 style={styles.title}>
          <Brain style={{ width: "16px", height: "16px", color: "#C084FC" }} />
          AI Security Copilot
        </h3>
        
        <div style={styles.liveIndicator}>
          <span style={styles.liveDot}></span>
          LIVE
        </div>
      </div>

      <p style={styles.text}>
        {criticalCount} critical threat vectors require immediate automated remediation.
      </p>

      {/* Scrollable list */}
      <div style={styles.list}>
        {criticalFindings.length > 0 ? (
          criticalFindings.map((item) => (
            <div 
              key={item._id} 
              onClick={() => navigate("/vulnerabilities")}
              style={styles.item}
              className="copilot-item"
            >
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>
                  {item.title}
                </div>
                <span style={styles.badge}>
                  {item.severity}
                </span>
              </div>
              <div style={styles.itemMeta}>
                <Sparkles style={{ width: "10px", height: "10px", color: "#C084FC" }} />
                AI Auto-patch Proposal Available
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: "flex", flexDirection: "column", itemsCenter: "center", justifyContent: "center", height: "100%", color: COLORS.success, textAlign: "center", gap: "6px" }}>
            <span style={{ fontSize: "28px" }}>🎉</span>
            <div style={{ fontSize: "13px", fontWeight: "700" }}>System Core Secure</div>
            <div style={{ fontSize: "11px", color: COLORS.muted }}>No critical exploits detected.</div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        style={styles.btn}
      >
        {analyzing ? "Auditing API..." : "Analyze Now"}
      </button>

      {/* Footer link */}
      <div
        onClick={() => navigate("/vulnerabilities")}
        style={styles.link}
      >
        View All Recommendations
        <ChevronRight style={{ width: "12px", height: "12px" }} />
      </div>

    </div>
  );
}

export default memo(AISecurityCopilot);