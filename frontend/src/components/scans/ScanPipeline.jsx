import { CheckCircle2, Loader2, Circle } from "lucide-react";

export default function ScanPipeline() {
  const stages = [
    {
      name: "Recon",
      status: "completed",
      info: "24 Endpoints",
    },
    {
      name: "Discovery",
      status: "completed",
      info: "127 APIs",
    },
    {
      name: "Authentication",
      status: "running",
      info: "3 Findings",
    },
    {
      name: "Authorization",
      status: "pending",
      info: "Waiting",
    },
    {
      name: "Testing",
      status: "pending",
      info: "Waiting",
    },
    {
      name: "Report",
      status: "pending",
      info: "Waiting",
    },
  ];

  const getColor = (status) => {
    if (status === "completed") return "#22C55E";
    if (status === "running") return "#F97316";
    return "#475569";
  };

  const renderIcon = (status) => {
    if (status === "completed") {
      return <CheckCircle2 size={22} color="#22C55E" />;
    }

    if (status === "running") {
      return <Loader2 size={22} color="#F97316" className="animate-spin" />;
    }

    return <Circle size={20} color="#475569" />;
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg,#08111F,#050B16)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "24px",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "20px",
            }}
          >
            Scan Execution Pipeline
          </h3>

          <div
            style={{
              color: "#64748B",
              fontSize: "12px",
              marginTop: "4px",
            }}
          >
            Real-time API security assessment workflow
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: "rgba(249,115,22,.12)",
            border: "1px solid rgba(249,115,22,.25)",
            color: "#F97316",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Authentication Running
        </div>
      </div>

      {/* Metrics */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "127 Endpoints", color: "#3B82F6" },
          { label: "52 Findings", color: "#EF4444" },
          { label: "67% Coverage", color: "#22C55E" },
          { label: "12m Runtime", color: "#A855F7" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: `${item.color}15`,
              border: `1px solid ${item.color}40`,
              color: item.color,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Pipeline */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        {stages.map((stage, index) => (
          <div
            key={stage.name}
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                minWidth: "120px",
                background: "#0B1220",
                border: `1px solid ${getColor(stage.status)}40`,
                borderRadius: "14px",
                padding: "12px",
                textAlign: "center",
                boxShadow:
                  stage.status === "running"
                    ? "0 0 20px rgba(249,115,22,.15)"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {renderIcon(stage.status)}
              </div>

              <div
                style={{
                  color: "#FFFFFF",
                  marginTop: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {stage.name}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  color: getColor(stage.status),
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {stage.status.toUpperCase()}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  color: "#94A3B8",
                  fontSize: "11px",
                }}
              >
                {stage.info}
              </div>
            </div>

            {index !== stages.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "3px",
                  margin: "0 8px",
                  background: index < 2 ? "#22C55E" : "rgba(255,255,255,.08)",
                  borderRadius: "999px",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
