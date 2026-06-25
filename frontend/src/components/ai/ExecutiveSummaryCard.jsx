import MarkdownRenderer from "../common/MarkdownRenderer";
export default function ExecutiveSummaryCard({
    data,
}) {
    return (
        <div
            style={{
                gridColumn: "1 / -1",
                background: "#0F172A",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "8px",
            }}
        >
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "12px",
                    fontSize: "22px",
                    fontWeight: "700",
                }}
            >
                Executive Summary
            </h3>

            <div
                style={{
                    color: "#CBD5E1",
                    lineHeight: "1.8",
                    fontSize: "15px",
                    margin: 0,
                }}
            >
                <MarkdownRenderer
                    content={data}
                />
            </div>

        </div>
    );
}