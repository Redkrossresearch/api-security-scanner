import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : "139, 92, 246";
};

export default function StatCard({
  icon,
  title,
  value,
  trend,
  trendColor = "#8B5CF6",
  sparklinePath = "M0 35 C25 30, 40 40, 60 34 C90 24, 110 42, 140 28 C170 14, 190 35, 240 18",
  id = "stat"
}) {
  const rgb = hexToRgb(trendColor);
  const [displayVal, setDisplayVal] = useState("0");

  // Dynamic count-up simulation
  useEffect(() => {
    const rawString = String(value);
    const numVal = parseInt(rawString.replace(/[^0-9]/g, ""), 10);
    
    if (isNaN(numVal)) {
      setDisplayVal(rawString);
      return;
    }

    let current = 0;
    const duration = 1200; // 1.2s
    const frameRate = 30; // 30fps
    const totalFrames = Math.round(duration / (1000 / frameRate));
    const increment = Math.ceil(numVal / totalFrames) || 1;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numVal) {
        clearInterval(timer);
        setDisplayVal(rawString);
      } else {
        // preserve non-digits like % or +
        const suffix = rawString.replace(/[0-9]/g, "");
        setDisplayVal(current + suffix);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.015,
        boxShadow: `0 12px 30px rgba(${rgb}, 0.12)`,
        borderColor: `rgba(${rgb}, 0.25)`
      }}
      transition={{
        duration: 0.2,
      }}
      style={{
        background: `radial-gradient(130px circle at top left, rgba(${rgb}, 0.12), transparent 90%), linear-gradient(180deg, #090d16 0%, #030712 100%)`,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        minHeight: "150px",
        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      {/* Top row: Icon & Trend */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: `rgba(${rgb}, .12)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: trendColor,
            border: `1px solid rgba(${rgb}, .2)`
          }}
        >
          {icon}
        </div>

        {trend && (
          <div
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              background: `rgba(${rgb}, .1)`,
              color: trendColor,
              fontSize: "11px",
              fontWeight: "700",
              border: `1px solid rgba(${rgb}, .2)`
            }}
          >
            {trend}
          </div>
        )}
      </div>

      {/* Main Info */}
      <div style={{ zIndex: 2, marginTop: "16px" }}>
        <div
          style={{
            color: "#94A3B8",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.8px",
            textTransform: "uppercase"
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#FFFFFF",
            fontSize: "36px",
            fontWeight: "900",
            marginTop: "6px",
            lineHeight: 1,
            fontFamily: "Outfit, Inter, sans-serif"
          }}
        >
          {displayVal}
        </div>
      </div>

      {/* Premium Gradient Sparkline */}
      <svg
        width="100%"
        height="48"
        viewBox="0 0 240 48"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          opacity: 0.65,
          zIndex: 1
        }}
      >
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Filled Path */}
        <path
          d={`${sparklinePath} L240 48 L0 48 Z`}
          fill={`url(#grad-${id})`}
        />

        {/* Stroke Line */}
        <path
          d={sparklinePath}
          fill="none"
          stroke={trendColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

    </motion.div>
  );
}