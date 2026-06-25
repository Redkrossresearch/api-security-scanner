import MarkdownRenderer from "../common/MarkdownRenderer";
import { BarChart3 } from "lucide-react";
export default function BusinessImpactCard({
    data,
}) {
    return (
        <div
            style={{
                background: "#0F172A",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: "16px",
                padding: "20px",
                minHeight: "220px",
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
                <BarChart3
                    size={22}
                    color="#F97316"
                />

                <h3
                    style={{
                        margin: 0,
                        fontSize: "24px",
                        fontWeight: "700",
                    }}
                >
                    Business Impact
                </h3>
            </div>

            <div
                style={{
                    color: "#CBD5E1",
                    lineHeight: "1.7",
                    fontSize: "15px",
                }}
            >
                <MarkdownRenderer
                    content={data}
                />
            </div>
        </div>
    );
}