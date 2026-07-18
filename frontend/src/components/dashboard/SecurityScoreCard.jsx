import { TrendingUp, Play, FileText, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function SecurityScoreCard({
    userName = "Security Operator",
    securityScore = 85,
    riskLevel = "Low",
    weeklyChange = 12.4,
    lastScan = "Today",
}) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // Semi-circle gauge calculation (radius: 40 => circumference: ~251.3 => half-circle: ~125.6)
    const arcLength = 125.6;
    const scoreVal = Math.min(Math.max(0, securityScore), 100);
    const strokeDashoffset = arcLength - (arcLength * scoreVal) / 100;

    // Dynamic HSL color mapping for status lights and speedometer scores
    // Red (0) to Green (120) based on score
    const scoreHue = (scoreVal * 1.25).toFixed(0);
    const scoreColor = `hsl(${scoreHue}, 80%, 50%)`;

    return (
        <div
            style={{
                background: "radial-gradient(220px circle at top left, rgba(139,92,246,0.12), transparent 95%), linear-gradient(180deg, #090d16 0%, #030712 100%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
                padding: "32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "32px",
                flexWrap: "wrap",
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)",
            }}
        >
            <div style={{ flex: "1 1 500px" }}>
                <p
                    style={{
                        color: "rgba(255, 255, 255, 0.45)",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                    }}
                >
                    {getGreeting().toUpperCase()}, {userName.toUpperCase()} 👋
                </p>

                <h1
                    style={{
                        color: "#FFFFFF",
                        fontSize: "30px",
                        margin: 0,
                        fontWeight: 800,
                        lineHeight: "1.25",
                        letterSpacing: "-0.5px",
                        background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}
                >
                    Security posture remains healthy
                </h1>

                <p
                    style={{
                        color: "#94A3B8",
                        marginTop: "12px",
                        fontSize: "14.5px",
                        lineHeight: "1.6",
                    }}
                >
                    Passive crawler assessment monitors threat triggers continuously. No active authentication bypasses or database leaks have been verified in the last sweep.
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "20px",
                        flexWrap: "wrap",
                    }}
                >
                    <div
                        style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            fontSize: "12.5px",
                            color: "#E2E8F0"
                        }}
                    >
                        Last Sync: <strong>{lastScan}</strong>
                    </div>

                    <div
                        style={{
                            background: "rgba(16, 185, 129, 0.08)",
                            border: "1px solid rgba(16, 185, 129, 0.15)",
                            color: "#34D399",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            fontSize: "12.5px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: "600"
                        }}
                    >
                        <TrendingUp size={14} />
                        +{weeklyChange}% this week
                    </div>
                </div>

                {/* Actions buttons linking to actual pages */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "24px",
                    }}
                >
                    <button
                        onClick={() => window.location.href = "/scan"}
                        style={{
                            background: "linear-gradient(90deg, #7C3AED, #4F46E5)",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "12px",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
                            transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                        <Play size={14} fill="currentColor" />
                        Run New Scan
                    </button>

                    <button
                        onClick={() => window.location.href = "/reports"}
                        style={{
                            background: "transparent",
                            color: "#E2E8F0",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "10px 20px",
                            borderRadius: "12px",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                            e.currentTarget.style.transform = "scale(1.03)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        <FileText size={14} />
                        View Reports
                    </button>
                </div>
            </div>

            {/* Right Column: Speedometer SVG and Metrics */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "20px",
                    width: "280px",
                    flexShrink: 0
                }}
            >
                {/* SVG Speed Dial Gauge */}
                <div style={{ position: "relative", width: "220px", height: "130px" }}>
                    <svg width="220" height="130" viewBox="0 0 100 60">
                        {/* Background track path */}
                        <path 
                            d="M 10 50 A 40 40 0 0 1 90 50" 
                            fill="none" 
                            stroke="rgba(255, 255, 255, 0.05)" 
                            strokeWidth="8" 
                            strokeLinecap="round"
                        />
                        {/* Interactive dynamic color-coded fill arc */}
                        <path 
                            d="M 10 50 A 40 40 0 0 1 90 50" 
                            fill="none" 
                            stroke="url(#speed-gradient)" 
                            strokeDasharray={arcLength} 
                            strokeDashoffset={strokeDashoffset} 
                            strokeWidth="8" 
                            strokeLinecap="round"
                            style={{ 
                                transition: "stroke-dashoffset 1s ease-out-in",
                                filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))"
                            }}
                        />
                        <defs>
                            <linearGradient id="speed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#EF4444" />
                                <stop offset="50%" stopColor="#FACC15" />
                                <stop offset="100%" stopColor="#10B981" />
                            </linearGradient>
                        </defs>
                        {/* Score text overlay */}
                        <text 
                            x="50" 
                            y="44" 
                            textAnchor="middle" 
                            fontWeight="800" 
                            fill="#FFFFFF" 
                            fontSize="14"
                        >
                            {scoreVal}%
                        </text>
                        <text 
                            x="50" 
                            y="56" 
                            textAnchor="middle" 
                            fontWeight="700" 
                            fill="rgba(255, 255, 255, 0.35)" 
                            fontSize="5.5" 
                            letterSpacing="0.3"
                        >
                            SECURITY POSTURE
                        </text>
                    </svg>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        width: "100%"
                    }}
                >
                    <Metric title="Threat Level" value={riskLevel} color={scoreColor} />
                    <Metric title="Monitored APIs" value="48" />
                </div>
            </div>
        </div>
    );
}

function Metric({ title, value, color = "#FFF" }) {
    return (
        <div
            style={{
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                borderRadius: "14px",
                padding: "12px 14px",
                textAlign: "center"
            }}
        >
            <div
                style={{
                    color: "rgba(255, 255, 255, 0.35)",
                    fontSize: "11px",
                    fontWeight: "600",
                    letterSpacing: "0.2px",
                    textTransform: "uppercase",
                    marginBottom: "4px"
                }}
            >
                {title}
            </div>

            <div
                style={{
                    color: color,
                    fontSize: "20px",
                    fontWeight: "800",
                }}
            >
                {value}
            </div>
        </div>
    );
}
