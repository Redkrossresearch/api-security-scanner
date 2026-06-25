import { Search, Calendar, Save, Play, Shield, Activity } from "lucide-react";

export default function ScanHeader() {
  const stats = [
    { label: "Endpoints", value: "127", color: "#3B82F6" },
    { label: "Critical", value: "1", color: "#EF4444" },
    { label: "Coverage", value: "92%", color: "#22C55E" },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(180deg,#071126,#020617)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
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
        {/* Left */}
        <div style={{ flex: 1, minWidth: "320px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Shield size={28} color="#3B82F6" />

            <h1
              style={{
                margin: 0,
                color: "#FFFFFF",
                fontSize: "30px",
                fontWeight: 700,
              }}
            >
              API Security Scan
            </h1>
          </div>

          <p
            style={{
              marginTop: "10px",
              color: "#94A3B8",
              fontSize: "14px",
              maxWidth: "760px",
            }}
          >
            Scan APIs for vulnerabilities, attack surface exposure,
            authentication flaws, authorization weaknesses, misconfigurations,
            and compliance issues.
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            {stats.map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}40`,
                  color: item.color,
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {item.value} {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div
            style={{
              width: "320px",
              height: "50px",
              background: "#0F172A",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
            }}
          >
            <Search size={18} color="#94A3B8" />

            <input
              placeholder="Search scans, findings..."
              style={{
                flex: 1,
                marginLeft: "10px",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            style={{
              height: "50px",
              padding: "0 16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,.08)",
              background: "#0F172A",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <Calendar size={16} />
            Schedule
          </button>

          <button
            style={{
              height: "50px",
              padding: "0 16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,.08)",
              background: "#0F172A",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <Save size={16} />
            Template
          </button>

          <button
            style={{
              height: "50px",
              padding: "0 22px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(90deg,#7C3AED,#F97316)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 10px 30px rgba(124,58,237,.25)",
            }}
          >
            <Play size={16} />
            Start Scan
          </button>
        </div>
      </div>

      {/* Bottom Summary */}
      <div
        style={{
          marginTop: "22px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "14px",
        }}
      >
        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "16px",
            padding: "14px",
          }}
        >
          <div style={{ color: "#64748B", fontSize: "12px" }}>Scan Profile</div>

          <div
            style={{
              color: "#FFFFFF",
              marginTop: "6px",
              fontWeight: 700,
            }}
          >
            Full Security Scan
          </div>
        </div>

        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "16px",
            padding: "14px",
          }}
        >
          <div style={{ color: "#64748B", fontSize: "12px" }}>
            Estimated Runtime
          </div>

          <div
            style={{
              color: "#22C55E",
              marginTop: "6px",
              fontWeight: 700,
            }}
          >
            ~18 Minutes
          </div>
        </div>

        <div
          style={{
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "16px",
            padding: "14px",
          }}
        >
          <div style={{ color: "#64748B", fontSize: "12px" }}>
            Current Activity
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#F97316",
              marginTop: "6px",
              fontWeight: 700,
            }}
          >
            <Activity size={16} />
            Authentication Testing
          </div>
        </div>
      </div>
    </div>
  );
}
