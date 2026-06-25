export default function VerdictCard({ data }) {

    if (!data) return null;

    return (
        <div
            style={{
                background:
                    "linear-gradient(180deg,#0F172A,#0B1220)",
                border:
                    "1px solid rgba(255,255,255,.08)",
                borderRadius: "18px",
                padding: "28px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "28px",
                }}
            >
                <div
                    style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#22C55E",
                    }}
                />

                <h3
                    style={{
                        margin: 0,
                        fontSize: "24px",
                        fontWeight: "700",
                    }}
                >
                    ATHX Security Verdict
                </h3>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "14px",
                    marginBottom: "20px",
                }}
            >

                <div>
                    <div style={{ color: "#94A3B8" }}>
                        Priority
                    </div>

                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: "18px",
                        }}
                    >
                        {data.priority}
                    </div>
                </div>

                <div>
                    <div style={{ color: "#94A3B8" }}>
                        Recommended SLA
                    </div>

                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: "18px",
                        }}
                    >
                        {data.recommendedSLA}
                    </div>
                </div>

                <div>
                    <div style={{ color: "#94A3B8" }}>
                        Business Criticality
                    </div>

                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: "18px",
                        }}
                    >
                        {data.businessCriticality}
                    </div>
                </div>

                <div>
                    <div style={{ color: "#94A3B8" }}>
                        Exploitability
                    </div>

                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: "18px",
                        }}
                    >
                        {data.exploitability}
                    </div>
                </div>

            </div>

            <div
                style={{
                    background: "#111827",
                    borderRadius: "12px",
                    padding: "16px",
                    color: "#CBD5E1",
                    lineHeight: "1.8",
                }}
            >
                {data.summary}
            </div>
        </div>
    );
}