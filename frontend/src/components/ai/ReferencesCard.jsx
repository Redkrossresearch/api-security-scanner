import { BookOpen } from "lucide-react";
export default function ReferencesCard({
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
                    <BookOpen
                        size={22}
                        color="#A855F7"
                    />

                    <h3
                        style={{
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: "700",
                        }}
                    >
                        Knowledge Sources
                    </h3>
                </div>
            </div>

            <div
                className="athx-scroll"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    paddingRight: "6px",
                }}
            >
                {data?.map((item, index) => {

                    const isUrl =
                        item?.startsWith("http");

                    return (
                        <a
                            key={index}
                            href={isUrl ? item : "#"}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                textDecoration: "none",
                                background: "#111827",
                                border:
                                    "1px solid rgba(255,255,255,.08)",
                                borderRadius: "14px",
                                padding: "20px",
                                color: "#E2E8F0",
                                transition: "0.2s",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#94A3B8",
                                    marginBottom: "6px",
                                }}
                            >
                                Reference
                            </div>

                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    wordBreak: "break-word",
                                }}
                            >
                                {item}
                            </div>
                        </a>
                    );

                })}
            </div>
        </div>
    );
}