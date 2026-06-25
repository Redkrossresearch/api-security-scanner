import MarkdownRenderer from "../common/MarkdownRenderer";
import { Swords } from "lucide-react";
export default function AttackScenarioCard({
    data,
}) {
    return (
        <div
            style={{
                background:
                    "linear-gradient(180deg,#0F172A,#0B1220)",
                border:
                    "1px solid rgba(255,255,255,.08)",
                borderRadius: "18px",
                padding: "24px",
                boxShadow:
                    "0 8px 30px rgba(0,0,0,.25)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "18px",
                }}
            >

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "18px",
                    }}
                >
                    <Swords
                        size={22}
                        color="#EF4444"
                    />

                    <h3
                        style={{
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: "700",
                        }}
                    >
                        Attack Scenario
                    </h3>
                </div>
            </div>

            <div
                className="athx-scroll"
                style={{
                    maxHeight: "500px",
                    overflowY: "auto",
                    color: "#CBD5E1",
                    lineHeight: "2",
                    fontSize: "15px",
                    paddingRight: "8px",
                }}
            >
                <MarkdownRenderer
                    content={data}
                />
            </div>
        </div>
    );
}