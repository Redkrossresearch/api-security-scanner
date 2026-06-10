import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ScanTrendChart({
  data = [],
  range,
  setRange,
}) {
  const chartData = data.map((item) => ({
    day: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: item.score,
  }));

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg,#0B1220,#07101F)",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: "24px",
        padding: "24px",
        height: "360px",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: "20px",
          color: "#0F172A",
        }}
      >
        Security Posture Trend
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            color: "#94A3B8",
            fontSize: "13px",
          }}
        >
          Score
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          {["24H", "7D", "30D", "90D"].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              style={{
                background:
                  item === range
                    ? "#111827"
                    : "transparent",

                color:
                  item === range
                    ? "#FFFFFF"
                    : "#64748B",

                border:
                  "1px solid rgba(255,255,255,.08)",

                borderRadius: "8px",

                padding: "6px 12px",

                fontSize: "12px",

                cursor: "pointer",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="78%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id="scanGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#F97316"
                stopOpacity={0.45}
              />

              <stop
                offset="100%"
                stopColor="#F97316"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,.08)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="day"
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "12px",
              color: "#fff",
            }}
          />

          <Area
            dot={false}
            activeDot={{ r: 6, fill: "#F97316", }}
            type="natural"
            dataKey="score"
            stroke="#F97316"
            strokeWidth={3}
            fill="url(#scanGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}