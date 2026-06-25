import {
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Crown,
  Sparkles,
  Award,
  Minus,
} from "lucide-react";

// ─── Helper Functions ───────────────────────────────────────────────────────
const getGrade = (score) => {
  if (score >= 95) return { grade: "A+", color: "#22C55E" };
  if (score >= 90) return { grade: "A", color: "#22C55E" };
  if (score >= 85) return { grade: "B+", color: "#3B82F6" };
  if (score >= 80) return { grade: "B", color: "#3B82F6" };
  if (score >= 75) return { grade: "C+", color: "#FACC15" };
  if (score >= 70) return { grade: "C", color: "#FACC15" };
  if (score >= 60) return { grade: "D", color: "#F97316" };
  return { grade: "F", color: "#EF4444" };
};

const getScoreColor = (score) => {
  if (score >= 90) return "#22C55E";
  if (score >= 80) return "#3B82F6";
  if (score >= 70) return "#FACC15";
  return "#EF4444";
};

const getCriticalityStyle = (level) => {
  const styles = {
    "Mission Critical": { bg: "rgba(239,68,68,.12)", color: "#EF4444", border: "rgba(239,68,68,.25)" },
    "Business Critical": { bg: "rgba(249,115,22,.12)", color: "#F97316", border: "rgba(249,115,22,.25)" },
    Internal: { bg: "rgba(59,130,246,.12)", color: "#3B82F6", border: "rgba(59,130,246,.25)" },
    "Low Impact": { bg: "rgba(100,116,139,.12)", color: "#94A3B8", border: "rgba(100,116,139,.25)" },
  };
  return styles[level] || styles["Internal"];
};

// ─── Mini Sparkline Component ───────────────────────────────────────────────
const Sparkline = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 64;
  const height = 22;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ─── Movement Indicator Component ───────────────────────────────────────────
const MovementBadge = ({ movement }) => {
  if (movement === "↔" || movement === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748B",
          fontSize: "10px",
          fontWeight: "700",
          gap: "2px",
        }}
      >
        <Minus size={10} />
      </div>
    );
  }
  const isUp = movement > 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        color: isUp ? "#22C55E" : "#EF4444",
        fontSize: "10px",
        fontWeight: "700",
      }}
    >
      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(movement)}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AssetSecurityLeaderboard() {
  const assets = [
    {
      rank: 1,
      asset: "auth.company.com",
      score: 96,
      findings: 2,
      status: "Most Secure",
      criticality: "Mission Critical",
      movement: 0,
      sparkline: [88, 90, 92, 93, 95, 96],
      mttr: "1.8d",
      compliance: 98,
    },
    {
      rank: 2,
      asset: "api.company.com",
      score: 88,
      findings: 7,
      status: "Improving",
      criticality: "Mission Critical",
      movement: 2,
      sparkline: [72, 75, 79, 82, 85, 88],
    },
    {
      rank: 3,
      asset: "orders.company.com",
      score: 81,
      findings: 12,
      status: "Stable",
      criticality: "Business Critical",
      movement: -1,
      sparkline: [85, 84, 83, 82, 81, 81],
    },
    {
      rank: 4,
      asset: "users.company.com",
      score: 72,
      findings: 19,
      status: "Needs Attention",
      criticality: "Business Critical",
      movement: 1,
      sparkline: [68, 70, 69, 71, 72, 72],
    },
    {
      rank: 5,
      asset: "payments.company.com",
      score: 61,
      findings: 34,
      status: "High Risk",
      criticality: "Mission Critical",
      movement: -2,
      sparkline: [75, 72, 69, 66, 63, 61],
    },
  ];

  const topAsset = assets[0];

  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
        height: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "20px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Award size={20} color="#FACC15" />
            Asset Security Leaderboard
          </h3>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            Security ranking across monitored APIs
          </div>
        </div>

        <div
          style={{
            background: "rgba(34,197,94,.12)",
            border: "1px solid rgba(34,197,94,.25)",
            color: "#22C55E",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          28 Assets
        </div>
      </div>

      {/* ─── Leaderboard Summary Strip ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        {[
          { label: "Top 5 Avg Score", value: "79", color: "#3B82F6" },
          { label: "Improving Assets", value: "18", color: "#22C55E" },
          { label: "At Risk Assets", value: "4", color: "#EF4444" },
          { label: "Protected Assets", value: "24", color: "#A855F7" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#0B1220",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: "12px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: item.color,
                fontSize: "20px",
                fontWeight: "800",
                lineHeight: 1,
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                color: "#64748B",
                fontSize: "10px",
                fontWeight: "600",
                marginTop: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Top Protected Asset (Upgraded) ─────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(135deg,rgba(124,58,237,.15),rgba(236,72,153,.08))",
          border: "1px solid rgba(168,85,247,.25)",
          borderRadius: "18px",
          padding: "18px",
          marginBottom: "18px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "120px",
            height: "120px",
            background: "radial-gradient(circle, rgba(250,204,21,.15) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
            position: "relative",
          }}
        >
          <div
            style={{
              background: "rgba(250,204,21,.2)",
              padding: "8px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Crown size={18} color="#FACC15" />
          </div>
          <span style={{ color: "#FFFFFF", fontWeight: "700", fontSize: "14px" }}>
            Top Protected Asset
          </span>
        </div>

        <div
          style={{
            color: "#C084FC",
            fontWeight: "700",
            fontSize: "18px",
            marginBottom: "14px",
            position: "relative",
          }}
        >
          {topAsset.asset}
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            position: "relative",
          }}
        >
          {[
            { label: "Security Score", value: topAsset.score, color: "#22C55E" },
            { label: "Open Findings", value: topAsset.findings, color: "#60A5FA" },
            { label: "MTTR", value: topAsset.mttr, color: "#A855F7" },
            { label: "Compliance", value: `${topAsset.compliance}%`, color: "#FACC15" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(0,0,0,.2)",
                borderRadius: "10px",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: stat.color,
                  fontSize: "18px",
                  fontWeight: "800",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "9px",
                  fontWeight: "600",
                  marginTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Leaderboard List ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        {assets.map((item) => {
          const grade = getGrade(item.score);
          const critStyle = getCriticalityStyle(item.criticality);
          const scoreColor = getScoreColor(item.score);

          return (
            <div
              key={item.asset}
              style={{
                background: "#0B1220",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: "14px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr auto auto auto",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                {/* Rank + Movement */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background:
                        item.rank === 1
                          ? "rgba(250,204,21,.15)"
                          : item.rank === 2
                          ? "rgba(148,163,184,.15)"
                          : item.rank === 3
                          ? "rgba(217,119,6,.15)"
                          : "rgba(59,130,246,.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color:
                        item.rank === 1
                          ? "#FACC15"
                          : item.rank === 2
                          ? "#CBD5E1"
                          : item.rank === 3
                          ? "#F59E0B"
                          : "#60A5FA",
                      fontWeight: "800",
                      fontSize: "13px",
                    }}
                  >
                    #{item.rank}
                  </div>
                  <MovementBadge movement={item.movement} />
                </div>

                {/* Asset Info */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "600",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.asset}
                    </div>
                    <span
                      style={{
                        background: critStyle.bg,
                        border: `1px solid ${critStyle.border}`,
                        color: critStyle.color,
                        fontSize: "9px",
                        fontWeight: "700",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {item.criticality}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: "11px",
                    }}
                  >
                    {item.findings} Findings • {item.status}
                  </div>
                </div>

                {/* Sparkline */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Sparkline data={item.sparkline} color={scoreColor} />
                </div>

                {/* Score + Grade */}
                <div style={{ textAlign: "right", minWidth: "60px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "flex-end",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        color: scoreColor,
                        fontWeight: "800",
                        fontSize: "18px",
                        lineHeight: 1,
                      }}
                    >
                      {item.score}
                    </span>
                    <span
                      style={{
                        color: grade.color,
                        fontSize: "11px",
                        fontWeight: "800",
                        background: `${grade.color}20`,
                        padding: "2px 5px",
                        borderRadius: "4px",
                      }}
                    >
                      {grade.grade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Bar */}
              <div
                style={{
                  marginTop: "12px",
                  height: "4px",
                  background: "rgba(255,255,255,.05)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.score}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})`,
                    borderRadius: "999px",
                    boxShadow: `0 0 8px ${scoreColor}60`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── AI Security Champion ───────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(168,85,247,.12) 0%, rgba(59,130,246,.06) 100%)",
          border: "1px solid rgba(168,85,247,.3)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <div
            style={{
              background: "rgba(168,85,247,.2)",
              padding: "10px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(168,85,247,.25)",
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} color="#A855F7" />
          </div>
          <div>
            <div
              style={{
                color: "#A855F7",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}
            >
              AI SECURITY CHAMPION
            </div>
            <div style={{ color: "#E2E8F0", fontSize: "12px", lineHeight: "1.5" }}>
              <span style={{ color: "#C084FC", fontWeight: "700" }}>{topAsset.asset}</span> is projected to maintain{" "}
              <span style={{ color: "#FACC15", fontWeight: "700" }}>#1 position</span> for the next 60 days.
            </div>
          </div>
        </div>
        <div
          style={{
            background: "rgba(168,85,247,.15)",
            border: "1px solid rgba(168,85,247,.35)",
            borderRadius: "10px",
            padding: "8px 12px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ color: "#94A3B8", fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px" }}>
            CONFIDENCE
          </div>
          <div style={{ color: "#A855F7", fontSize: "18px", fontWeight: "800", lineHeight: 1, marginTop: "2px" }}>
            94%
          </div>
        </div>
      </div>

      {/* ─── Leaderboard Insights (Replaces Footer) ─────────────────────── */}
      <div
        style={{
          background: "#0B1220",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: "14px",
          padding: "16px",
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ShieldCheck size={14} color="#22C55E" />
          Leaderboard Insights
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <div style={{ color: "#64748B", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Top Asset
            </div>
            <div style={{ color: "#22C55E", fontSize: "13px", fontWeight: "700", marginTop: "4px", fontFamily: "monospace" }}>
              {assets[0].asset}
            </div>
          </div>

          <div>
            <div style={{ color: "#64748B", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Risk Asset
            </div>
            <div style={{ color: "#EF4444", fontSize: "13px", fontWeight: "700", marginTop: "4px", fontFamily: "monospace" }}>
              {assets[assets.length - 1].asset}
            </div>
          </div>

          <div>
            <div style={{ color: "#64748B", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Score Gap
            </div>
            <div style={{ color: "#FACC15", fontSize: "13px", fontWeight: "800", marginTop: "4px" }}>
              {assets[0].score - assets[assets.length - 1].score} Points
            </div>
          </div>

          <div>
            <div style={{ color: "#64748B", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Improvement Rate
            </div>
            <div style={{ color: "#22C55E", fontSize: "13px", fontWeight: "800", marginTop: "4px" }}>
              +18%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}