import {
  Brain,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Target,
  Activity,
  ChevronRight,
  Clock,
  Zap,
  Shield,
  Server,
  Globe,
  Lock,
} from "lucide-react";

export default function AIHistoricalInsights() {
  return (
    <div
      style={{
        background: "#08111F",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
        height: "auto",
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "rgba(168,85,247,.15)",
            padding: "10px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(168,85,247,.2)",
          }}
        >
          <Brain size={22} color="#A855F7" />
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            AI Historical Insights
          </h3>
          <div style={{ color: "#94A3B8", fontSize: "13px", marginTop: "4px" }}>
            AI-powered security intelligence engine
          </div>
        </div>
      </div>

      {/* ─── Executive AI Summary ───────────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(168,85,247,.08) 0%, rgba(168,85,247,.02) 100%)",
          border: "1px solid rgba(168,85,247,.2)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#C084FC",
            fontWeight: "700",
            marginBottom: "16px",
            fontSize: "12px",
            letterSpacing: "0.5px",
          }}
        >
          <Sparkles size={16} /> EXECUTIVE AI SUMMARY
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {[
            { label: "Critical Findings", val: "↓ 63%", color: "#22C55E" },
            { label: "Risk Exposure", val: "↓ 34%", color: "#22C55E" },
            { label: "MTTR Improved", val: "↑ 18%", color: "#22C55E" },
            { label: "Remediation", val: "↑ 21%", color: "#22C55E" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,.03)",
                padding: "8px 12px",
                borderRadius: "8px",
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: "12px" }}>
                {item.label}
              </span>
              <span
                style={{
                  color: item.color,
                  fontWeight: "800",
                  fontSize: "13px",
                }}
              >
                {item.val}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "rgba(239,68,68,.08)",
            border: "1px solid rgba(239,68,68,.2)",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <AlertTriangle size={18} color="#EF4444" />
          <div>
            <div
              style={{
                color: "#EF4444",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              PRIMARY CONCERN
            </div>
            <div
              style={{
                color: "#FCA5A5",
                fontSize: "13px",
                fontWeight: "600",
                marginTop: "2px",
              }}
            >
              Authorization Weaknesses & BOLA Vulnerabilities
            </div>
          </div>
        </div>
      </div>

      {/* ─── Insights Grid (2x2) ────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {/* 1. Recovery Velocity */}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              <Clock size={16} color="#8B5CF6" /> Recovery Velocity
            </div>
            <span
              style={{
                color: "#8B5CF6",
                fontSize: "10px",
                fontWeight: "700",
                background: "rgba(139,92,246,.15)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              MTTR
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "8px",
            }}
          >
            <span
              style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: "800" }}
            >
              4.2{" "}
              <span style={{ fontSize: "12px", color: "#64748B" }}>Days</span>
            </span>
            <span style={{ color: "#64748B", fontSize: "11px" }}>
              Target: <span style={{ color: "#22C55E" }}>3.0 Days</span>
            </span>
          </div>
          <div
            style={{
              height: "6px",
              background: "rgba(255,255,255,.05)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "72%",
                height: "100%",
                background: "linear-gradient(90deg, #8B5CF6, #A855F7)",
                borderRadius: "3px",
              }}
            />
          </div>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "11px",
              marginTop: "6px",
              textAlign: "right",
            }}
          >
            72% to target
          </div>
        </div>

        {/* 2. Trend Predictor */}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              <TrendingDown size={16} color="#22C55E" /> Risk Trend
            </div>
            <span
              style={{
                color: "#22C55E",
                fontSize: "10px",
                fontWeight: "700",
                background: "rgba(34,197,94,.15)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              ↓ 34%
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "6px",
              height: "40px",
              marginBottom: "8px",
            }}
          >
            {[
              { m: "Jan", h: 100 },
              { m: "Feb", h: 80 },
              { m: "Mar", h: 60 },
              { m: "Apr", h: 40 },
            ].map((b) => (
              <div
                key={b.m}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${b.h}%`,
                    background: "linear-gradient(180deg, #22C55E, #16A34A)",
                    borderRadius: "3px",
                    opacity: 0.8,
                  }}
                />
                <span style={{ color: "#64748B", fontSize: "9px" }}>{b.m}</span>
              </div>
            ))}
          </div>
          <div style={{ color: "#94A3B8", fontSize: "11px" }}>
            Consistent downward trajectory
          </div>
        </div>

        {/* 3. Threat Intelligence */}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              <AlertTriangle size={16} color="#EF4444" /> Threat Intel
            </div>
            <span
              style={{
                color: "#EF4444",
                fontSize: "10px",
                fontWeight: "700",
                background: "rgba(239,68,68,.15)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              TOP PATTERN
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: "800" }}
            >
              BOLA
            </span>
            <span
              style={{ color: "#EF4444", fontSize: "14px", fontWeight: "700" }}
            >
              47%
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "#94A3B8",
            }}
          >
            <span>
              Assets: <span style={{ color: "#E2E8F0" }}>31</span>
            </span>
            <span>
              Recurring: <span style={{ color: "#EF4444" }}>Yes</span>
            </span>
            <span>
              Trend: <span style={{ color: "#EF4444" }}>↑ Inc</span>
            </span>
          </div>
        </div>

        {/* 4. Fix Quality */}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              <ShieldCheck size={16} color="#3B82F6" /> Fix Quality
            </div>
            <span
              style={{
                color: "#3B82F6",
                fontSize: "10px",
                fontWeight: "700",
                background: "rgba(59,130,246,.15)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              SUCCESS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{ color: "#3B82F6", fontSize: "24px", fontWeight: "800" }}
            >
              89%
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
            }}
          >
            <span style={{ color: "#94A3B8" }}>
              Reopened: <span style={{ color: "#F97316" }}>6%</span>
            </span>
            <span style={{ color: "#94A3B8" }}>
              False Pos: <span style={{ color: "#64748B" }}>5%</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Attack Surface Intelligence ────────────────────────────────── */}
      <div
        style={{
          background: "#0B1220",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#FFFFFF",
            fontWeight: "700",
            fontSize: "13px",
            marginBottom: "14px",
          }}
        >
          <Globe size={16} color="#60A5FA" /> Attack Surface Intelligence
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          {[
            {
              label: "Sensitive APIs",
              val: 24,
              icon: <Lock size={12} />,
              color: "#EF4444",
            },
            {
              label: "Public APIs",
              val: 18,
              icon: <Globe size={12} />,
              color: "#FACC15",
            },
            {
              label: "Admin APIs",
              val: 5,
              icon: <Shield size={12} />,
              color: "#A855F7",
            },
          ].map((a) => (
            <div
              key={a.label}
              style={{
                background: "rgba(255,255,255,.03)",
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: a.color,
                  marginBottom: "4px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {a.icon}
              </div>
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: "18px",
                  fontWeight: "800",
                }}
              >
                {a.val}
              </div>
              <div
                style={{ color: "#64748B", fontSize: "10px", marginTop: "2px" }}
              >
                {a.label}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: "rgba(239,68,68,.08)",
            border: "1px solid rgba(239,68,68,.15)",
            borderRadius: "8px",
            padding: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#94A3B8", fontSize: "12px" }}>
            Most Exposed Asset
          </span>
          <span
            style={{
              color: "#EF4444",
              fontSize: "12px",
              fontWeight: "700",
              fontFamily: "monospace",
            }}
          >
            auth.company.com
          </span>
        </div>
      </div>

      {/* ─── AI Forecast Timeline ───────────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(34,197,94,.08) 0%, rgba(34,197,94,.02) 100%)",
          border: "1px solid rgba(34,197,94,.2)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#22C55E",
            fontWeight: "700",
            fontSize: "12px",
            letterSpacing: "0.5px",
            marginBottom: "14px",
          }}
        >
          <Activity size={14} /> AI FORECAST TIMELINE
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "15%",
              right: "15%",
              height: "2px",
              background: "rgba(34,197,94,.2)",
              zIndex: 0,
            }}
          />

          {[
            { days: "30 Days", risk: "6.4", color: "#FACC15" },
            { days: "60 Days", risk: "5.9", color: "#F97316" },
            { days: "90 Days", risk: "5.2", color: "#22C55E" },
          ].map((t) => (
            <div
              key={t.days}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 1,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#08111F",
                  border: `2px solid ${t.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 10px ${t.color}40`,
                }}
              >
                <span
                  style={{
                    color: t.color,
                    fontSize: "12px",
                    fontWeight: "800",
                  }}
                >
                  {t.risk}
                </span>
              </div>
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "11px",
                  marginTop: "8px",
                  fontWeight: "600",
                }}
              >
                {t.days}
              </div>
              <div style={{ color: "#64748B", fontSize: "10px" }}>
                Predicted Risk
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Root Cause Breakdown ───────────────────────────────────────── */}
      <div
        style={{
          background: "#0B1220",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#FFFFFF",
            fontWeight: "700",
            fontSize: "13px",
            marginBottom: "14px",
          }}
        >
          <Target size={16} color="#F97316" /> Root Cause Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { name: "Authorization Weaknesses", val: 68, color: "#EF4444" },
            { name: "Authentication Failures", val: 18, color: "#F97316" },
            { name: "Security Misconfig", val: 10, color: "#FACC15" },
            { name: "Others", val: 4, color: "#64748B" },
          ].map((r) => (
            <div key={r.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "#CBD5E1", fontSize: "12px" }}>
                  {r.name}
                </span>
                <span
                  style={{
                    color: r.color,
                    fontSize: "12px",
                    fontWeight: "800",
                  }}
                >
                  {r.val}%
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  background: "rgba(255,255,255,.05)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${r.val}%`,
                    height: "100%",
                    background: r.color,
                    borderRadius: "3px",
                    boxShadow: `0 0 6px ${r.color}60`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── AI Action Plan (Recommendations) ───────────────────────────── */}
      <div
        style={{
          background: "#0B1220",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#FFFFFF",
            fontWeight: "700",
            fontSize: "13px",
            marginBottom: "14px",
          }}
        >
          <Zap size={16} color="#A855F7" /> AI Action Plan
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            {
              priority: "HIGH",
              text: "Enable automated BOLA detection in scan profiles",
              color: "#EF4444",
              bg: "rgba(239,68,68,.12)",
            },
            {
              priority: "HIGH",
              text: "Prioritize authorization testing across public APIs",
              color: "#EF4444",
              bg: "rgba(239,68,68,.12)",
            },
            {
              priority: "MEDIUM",
              text: "Reduce MTTR below 3 days for critical findings",
              color: "#FACC15",
              bg: "rgba(250,204,21,.12)",
            },
            {
              priority: "LOW",
              text: "Increase endpoint coverage for sensitive assets",
              color: "#3B82F6",
              bg: "rgba(59,130,246,.12)",
            },
          ].map((rec, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255,255,255,.02)",
                border: "1px solid rgba(255,255,255,.05)",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span
                style={{
                  background: rec.bg,
                  color: rec.color,
                  fontSize: "9px",
                  fontWeight: "800",
                  padding: "3px 6px",
                  borderRadius: "4px",
                  letterSpacing: "0.5px",
                  minWidth: "50px",
                  textAlign: "center",
                }}
              >
                {rec.priority}
              </span>
              <span style={{ color: "#CBD5E1", fontSize: "12px", flex: 1 }}>
                {rec.text}
              </span>
              <ChevronRight size={14} color="#475569" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── AI Confidence & Sources ────────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,.08) 0%, rgba(59,130,246,.02) 100%)",
          border: "1px solid rgba(59,130,246,.2)",
          borderRadius: "30px",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#FFFFFF",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            <Brain size={16} color="#60A5FA" /> AI Confidence & Sources
          </div>
          <span
            style={{ color: "#60A5FA", fontSize: "20px", fontWeight: "800" }}
          >
            97%
          </span>
        </div>

        <div
          style={{
            height: "6px",
            background: "rgba(255,255,255,.05)",
            borderRadius: "3px",
            overflow: "hidden",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              width: "97%",
              height: "100%",
              background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
              borderRadius: "3px",
              boxShadow: "0 0 8px rgba(96,165,250,.4)",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
          }}
        >
          {[
            { label: "Scans", val: "245" },
            { label: "Assets", val: "31" },
            { label: "Endpoints", val: "820" },
            { label: "History", val: "12 Mo" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,.03)",
                borderRadius: "8px",
                padding: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#E2E8F0",
                  fontSize: "14px",
                  fontWeight: "800",
                }}
              >
                {s.val}
              </div>
              <div
                style={{ color: "#64748B", fontSize: "10px", marginTop: "2px" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
