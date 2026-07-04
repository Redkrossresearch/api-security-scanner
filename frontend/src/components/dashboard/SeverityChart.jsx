import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function SeverityChart({ data = {} }) {
  const chartData = [
    {
      name: "Critical",
      value: data.critical || 0,
      color: "#EF4444",
    },
    {
      name: "High",
      value: data.high || 0,
      color: "#F97316",
    },
    {
      name: "Medium",
      value: data.medium || 0,
      color: "#FACC15",
    },
    {
      name: "Low",
      value: data.low || 0,
      color: "#22C55E",
    },
  ];

  const total =
    (data.critical || 0) +
    (data.high || 0) +
    (data.medium || 0) +
    (data.low || 0);

  const threatScore = total > 0 
    ? Math.round((( (data.critical || 0) + (data.high || 0) ) / total) * 100) 
    : 0;

  return (
    <div
      style={{
        background:
          "radial-gradient(140px circle at top left, rgba(249,115,22,0.12), transparent 90%), linear-gradient(180deg,#090d16 0%,#030712 100%)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "22px",
        height: "360px",
        position: "relative",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <style>{`
        .legend-row-item {
          display: flex;
          justify-content: space-between;
          color: #E2E8F0;
          fontSize: 13px;
          font-weight: 600;
          padding: 7px 11px;
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .legend-row-item:hover {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        @keyframes donut-pulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.15; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.35; }
          100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.15; }
        }
      `}</style>

      <div>
        <h3
          style={{
            color: "#fff",
            fontSize: "15px",
            fontWeight: "800",
            margin: 0,
            background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Vulnerability Distribution
        </h3>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginTop: "10px"
        }}
      >
        {/* Pie chart container */}
        <div
          style={{
            flex: 1.2,
            height: "200px",
            position: "relative",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                stroke="rgba(3,7,18,0.8)"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Pulsing ring behind center counter */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "90px",
              height: "90px",
              border: `2px dashed ${threatScore > 20 ? "#EF4444" : "#22C55E"}`,
              borderRadius: "50%",
              animation: "donut-pulse 3s infinite linear",
              pointerEvents: "none"
            }}
          />

          {/* Centered Donut Counter */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none"
            }}
          >
            <span style={{ fontSize: "9px", fontWeight: "800", color: "#64748B", letterSpacing: "0.8px" }}>TOTAL</span>
            <span style={{ fontSize: "26px", fontWeight: "900", color: "#FFFFFF", marginTop: "1px", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>{total}</span>
          </div>
        </div>

        {/* Legend listing */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {chartData.map((item) => {
            const percent =
              total > 0
                ? Math.round((item.value / total) * 100)
                : 0;

            const rgbMap = {
              "Critical": "239, 68, 68",
              "High": "249, 115, 22",
              "Medium": "250, 204, 21",
              "Low": "34, 197, 94"
            };
            const rgb = rgbMap[item.name] || "139, 92, 246";

            return (
              <div
                key={item.name}
                className="legend-row-item"
                style={{
                  background: `rgba(${rgb}, 0.04)`,
                  border: `1px solid rgba(${rgb}, 0.08)`
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: item.color,
                      boxShadow: `0 0 8px ${item.color}`
                    }}
                  />
                  {item.name}
                </div>

                <div style={{ color: "#F1F5F9", fontWeight: "700" }}>
                  {item.value} <span style={{ fontSize: "10px", color: "#64748B", fontWeight: "600" }}>({percent}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic bottom status bar to fill the space */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
          padding: "10px 14px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "700",
          color: "#94A3B8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "12px"
        }}
      >
        <span style={{ color: "#64748B" }}>
          Threat Ratio: <strong style={{ color: threatScore > 20 ? "#EF4444" : "#EAB308" }}>{threatScore}% Actionable</strong>
        </span>
        <span
          style={{
            color: threatScore > 15 ? "#EF4444" : "#10B981",
            textShadow: threatScore > 15 ? "0 0 8px rgba(239,68,68,0.4)" : "0 0 8px rgba(16,185,129,0.4)",
            fontWeight: "800",
            fontSize: "10px"
          }}
        >
          {threatScore > 15 ? "🚨 ACTION REQUIRED" : "🛡️ SECURITY COMPLIANT"}
        </span>
      </div>
    </div>
  );
}