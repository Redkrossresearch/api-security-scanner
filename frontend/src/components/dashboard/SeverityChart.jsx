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
          "linear-gradient(180deg,#071126,#020617)",
        border:
          "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "20px",
        height: "360px",
      }}
    >
      <h3
        style={{
          color: "#fff",
          marginBottom: "20px",
        }}
      >
        Vulnerability Distribution
      </h3>

      <div
        style={{
          display: "flex",
          height: "260px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "100%",
          }}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
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
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {chartData.map((item) => {
            const percent =
              total > 0
                ? Math.round(
                    (item.value / total) * 100
                  )
                : 0;

            return (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  color: "#E2E8F0",
                  fontSize: "14px",
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
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: item.color,
                    }}
                  />

                  {item.name}
                </div>

                <div>
                  {item.value} ({percent}%)
                </div>
              </div>
            );
          })}

          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop:
                "1px solid rgba(255,255,255,.08)",
              color: "#fff",
              display: "flex",
              justifyContent:
                "space-between",
            }}
          >
            <span>Total</span>
            <span>{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}