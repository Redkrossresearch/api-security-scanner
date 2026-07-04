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

  return (
    <div
      style={{
        background:
          "radial-gradient(140px circle at top left, rgba(249,115,22,0.12), transparent 90%), linear-gradient(180deg,#090d16 0%,#030712 100%)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "20px",
        height: "360px",
        position: "relative",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
      }}
    >
      <h3
        style={{
          color: "#fff",
          fontSize: "15px",
          fontWeight: "800",
          margin: 0,
          marginBottom: "16px",
          background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        Vulnerability Distribution
      </h3>

      <div
        style={{
          display: "flex",
          height: "260px",
          alignItems: "center",
          gap: "16px"
        }}
      >
        {/* Pie chart container */}
        <div
          style={{
            flex: 1.2,
            height: "100%",
            position: "relative",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={58}
                outerRadius={84}
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
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748B", letterSpacing: "0.5px" }}>TOTAL</span>
            <span style={{ fontSize: "28px", fontWeight: "900", color: "#FFFFFF", marginTop: "2px" }}>{total}</span>
          </div>
        </div>

        {/* Legend listing */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
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
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#E2E8F0",
                  fontSize: "13px",
                  fontWeight: "600",
                  padding: "6px 10px",
                  borderRadius: "8px",
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
    </div>
  );
}