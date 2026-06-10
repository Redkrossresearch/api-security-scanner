import { motion } from "framer-motion";

export default function StatCard({
  icon,
  title,
  value,
  trend,
  trendColor = "#22C55E",
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.01,
      }}
      transition={{
        duration: 0.2,
      }}
      style={{
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        minHeight: "160px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,.25)",
      }}
    >
      {/* Icon */}

      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "rgba(249,115,22,.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F97316",
          marginBottom: "16px",
        }}
      >
        {icon}
      </div>

      {/* Title */}

      <div
        style={{
          color: "#94A3B8",
          fontSize: "14px",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      {/* Value */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          marginTop: "6px",
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: "42px",
            fontWeight: "700",
            lineHeight: 1,
          }}
        >
          {value}
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            background:
              trendColor === "#EF4444"
                ? "rgba(239,68,68,.12)"
                : "rgba(34,197,94,.12)",
            color: trendColor,
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "4px",
            whiteSpace: "nowrap",
          }}
        >
          {trend}
        </div>
      </div>

      {/* Fake Sparkline */}

      <svg
        width="100%"
        height="50"
        viewBox="0 0 240 50"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          opacity: 0.8,
        }}
      >
        <path
          d="M0 35 C25 30, 40 40, 60 34 C90 24, 110 42, 140 28 C170 14, 190 35, 240 18"
          fill="none"
          stroke="#F97316"
          strokeWidth="2"
        />
      </svg>
    </motion.div>
  );
}