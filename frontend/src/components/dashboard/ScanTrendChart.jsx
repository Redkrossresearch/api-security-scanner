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

  const activeColor = "#8B5CF6";
  const activeColorSecondary = "#EC4899";

  return (
    <div
      style={{
        background:
          "radial-gradient(140px circle at top left, rgba(139,92,246,0.12), transparent 90%), linear-gradient(180deg,#090d16 0%,#030712 100%)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
        height: "360px",
        position: "relative",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
      }}
    >
      <style>{`
        .range-btn {
          background: rgba(255,255,255,0.02);
          color: #64748B;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .range-btn:hover {
          color: #FFF;
          border-color: rgba(255,255,255,.2);
          background: rgba(255,255,255,.05);
        }
        .range-btn-active {
          background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.25)) !important;
          color: #FFFFFF !important;
          border: 1px solid #8B5CF6 !important;
          box-shadow: 0 0 16px rgba(139,92,246,0.45);
          text-shadow: 0 0 4px rgba(255,255,255,0.4);
        }
      `}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: "800",
            background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Security Posture Trend
        </h3>

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
              className={item === range ? "range-btn range-btn-active" : "range-btn"}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          color: "#94A3B8",
          fontSize: "12px",
          fontWeight: "700",
          marginBottom: "8px",
          letterSpacing: "0.5px"
        }}
      >
        SCORE OVER TIME
      </div>

      <ResponsiveContainer width="100%" height={210}>
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
                stopColor={activeColor}
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor={activeColorSecondary}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,.04)"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            tick={{ fill: "#64748B", fontSize: 11, fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 11, fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />

          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(139,92,246,.25)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
            }}
          />

          <Area
            dot={false}
            activeDot={{ r: 6, fill: activeColor, stroke: "#FFF", strokeWidth: 2 }}
            type="monotone"
            dataKey="score"
            stroke={activeColor}
            strokeWidth={3}
            fill="url(#scanGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}