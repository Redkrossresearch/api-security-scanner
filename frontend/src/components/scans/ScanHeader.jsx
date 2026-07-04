import { Search, Calendar, Save, Play, Shield, Activity } from "lucide-react";

export default function ScanHeader({ scan, onStartScan, onSchedule, onTemplate }) {
  const stats = [
    { label: "Total Findings", value: scan ? String(scan.totalFindings) : "127", color: "#3B82F6", glow: "rgba(59, 130, 246, 0.15)" },
    { label: "Critical", value: scan ? String(scan.criticalCount) : "1", color: "#EF4444", glow: "rgba(239, 68, 68, 0.15)" },
    { label: "Coverage", value: scan ? "100%" : "92%", color: "#10B981", glow: "rgba(16, 185, 129, 0.15)" },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #070D1A 0%, #03070E 100%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "22px",
        padding: "26px",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        position: "relative",
      }}
    >
      {/* Top Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* Left Info Column */}
        <div style={{ flex: 1, minWidth: "320px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Shield size={24} color="#F97316" style={{ filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.45))" }} />

            <h1
              style={{
                margin: 0,
                color: "#FFFFFF",
                fontSize: "25px",
                fontWeight: "900",
                letterSpacing: "0.5px"
              }}
            >
              API Security Scan
            </h1>
          </div>

          <p
            style={{
              marginTop: "10px",
              color: "#94A3B8",
              fontSize: "13.5px",
              lineHeight: "1.65",
              maxWidth: "760px",
            }}
          >
            Scan APIs for vulnerabilities, attack surface exposure,
            authentication flaws, authorization weaknesses, misconfigurations,
            and compliance issues.
          </p>

          {/* Badge Stats */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "18px",
              flexWrap: "wrap",
            }}
          >
            {stats.map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "5px 12px",
                  borderRadius: "999px",
                  background: item.glow,
                  border: `1px solid ${item.color}45`,
                  color: item.color,
                  fontSize: "11.5px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxShadow: `0 0 10px ${item.glow}`,
                }}
              >
                {item.value} {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Action Controls */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Search box */}
          <div className="search-glow-container">
            <Search size={16} color="#64748B" />
            <input
              placeholder="Search scans, findings..."
              style={{
                flex: 1,
                marginLeft: "8px",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: "13.5px",
                fontWeight: "500",
              }}
            />
          </div>

          <button
            onClick={onSchedule}
            className="action-btn-custom"
          >
            <Calendar size={14} color="#F97316" />
            Schedule
          </button>

          <button
            onClick={onTemplate}
            className="action-btn-custom"
          >
            <Save size={14} color="#3B82F6" />
            Template
          </button>

          <button
            onClick={onStartScan}
            className="play-scan-glow-btn"
          >
            <Play size={14} fill="currentColor" />
            Start Scan
          </button>
        </div>
      </div>

      {/* Bottom Summary Cards Row */}
      <div
        style={{
          marginTop: "26px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        <div className="summary-indicator-card">
          <div className="summary-card-label">Scan Profile</div>
          <div className="summary-card-value">Full Security Scan</div>
        </div>

        <div className="summary-indicator-card">
          <div className="summary-card-label">Estimated Runtime</div>
          <div className="summary-card-value" style={{ color: "#10B981" }}>~18 Minutes</div>
        </div>

        <div className="summary-indicator-card">
          <div className="summary-card-label">Current Activity</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: scan?.status === "completed" ? "#10B981" : "#F97316",
              marginTop: "5px",
              fontWeight: "800",
              fontSize: "14.5px",
            }}
          >
            <Activity size={14} className={scan?.status !== "completed" && !scan ? "pulse-activity-icon" : ""} />
            {scan?.status === "completed" ? "Scan Completed" : (scan ? "Running Assessment" : "Idle")}
          </div>
        </div>
      </div>

      {/* Styles Injection */}
      <style>{`
        .search-glow-container {
          width: 250px;
          height: 44px;
          background: rgba(3, 6, 14, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          transition: all 0.22s ease;
        }

        .search-glow-container:focus-within {
          border-color: rgba(249, 115, 22, 0.35);
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.1);
          background: rgba(3, 6, 14, 0.85);
        }

        .action-btn-custom {
          height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(3, 6, 14, 0.6);
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.22s ease;
        }

        .action-btn-custom:hover {
          color: #F8FAFC;
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .play-scan-glow-btn {
          height: 44px;
          padding: 0 20px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13.5px;
          transition: all 0.22s ease;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
        }

        .play-scan-glow-btn:hover {
          box-shadow: 0 0 28px rgba(124, 58, 237, 0.55);
          transform: translateY(-1.5px);
        }

        .summary-indicator-card {
          background: rgba(3, 6, 14, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.045);
          border-radius: 14px;
          padding: 14px 18px;
          transition: all 0.22s ease;
        }

        .summary-indicator-card:hover {
          background: rgba(3, 6, 14, 0.6);
          border-color: rgba(255, 255, 255, 0.075);
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.015);
        }

        .summary-card-label {
          color: #64748B;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-card-value {
          color: #F8FAFC;
          marginTop: 5px;
          fontWeight: 800;
          fontSize: 14.5px;
        }

        .pulse-activity-icon {
          animation: pulseIcon 2s infinite ease-in-out;
        }

        @keyframes pulseIcon {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.92); }
        }
      `}</style>
    </div>
  );
}
