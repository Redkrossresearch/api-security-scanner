import { TrendingUp } from "lucide-react";

export default function SecurityScoreCard({
    userName,
    securityScore,
    riskLevel,
    weeklyChange,
    lastScan,
}) {
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div
            style={{
                background:
                    "linear-gradient(135deg,#FFFFFF 0%,#FFF7ED 100%)",
                border: "1px solid #E5E7EB",
                borderRadius: "24px",
                padding: "32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "32px",
                flexWrap: "wrap",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            }}
        >
            <div>
                <p
                    style={{
                        color: "#64748B",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        letterSpacing: "0.3px",
                    }}
                >
                    {getGreeting()}, {userName} 👋
                </p>

                <h1
                    style={{
                        color: "#0F172A",
                        fontSize: "36px",
                        margin: 0,
                        fontWeight: 800,
                        lineHeight: "1.2",
                    }}
                >
                    Security posture remains healthy
                </h1>

                <p
                    style={{
                        color: "#64748B",
                        marginTop: "12px",
                        fontSize: "16px",
                        lineHeight: "1.6",
                    }}
                >
                    2 critical vulnerabilities require review. No active authentication or endpoint exposure risks detected.
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "16px",
                        marginTop: "18px",
                        flexWrap: "wrap",
                    }}
                >
                    <div
                        style={{
                            background: "#F8FAFC",
                            padding: "10px 14px",
                            borderRadius: "12px",
                        }}
                    >
                        Last Scan: {lastScan}
                    </div>

                    <div
                        style={{
                            background: "#ECFDF5",
                            color: "#22C55E",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <TrendingUp size={16} />
                        +{weeklyChange}% this week
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "24px",
                    }}
                >
                    <button
                        style={{
                            background: "#F97316",
                            color: "white",
                            border: "none",
                            padding: "12px 20px",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        Run New Scan
                    </button>

                    <button
                        style={{
                            background: "#FFFFFF",
                            color: "#0F172A",
                            border: "1px solid #E5E7EB",
                            padding: "12px 20px",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        View Reports
                    </button>
                </div>
            </div>

<div
    style={{
        width: "340px",
        flexShrink: 0,
    }}
>
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
        }}
    >
        <Metric title="Security Score" value={securityScore} />
        <Metric title="Risk Level" value={riskLevel} />
        <Metric title="Protected APIs" value="48" />
        <Metric title="Endpoints" value="376" />
    </div>
</div>

        </div>
    );
}

function Metric({ title, value }) {
    return (
        <div
            style={{
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                borderRadius: "18px",
                padding: "18px",
            }}
        >
            <div
                style={{
                    color: "#64748B",
                    fontSize: "13px",
                    marginBottom: "6px",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    color: "#0F172A",
                    fontSize: "28px",
                    fontWeight: "800",
                }}
            >
                {value}
            </div>
        </div>
    );
}
    
  
