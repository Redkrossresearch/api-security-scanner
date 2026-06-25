import ExecutiveSummaryCard from "../ai/ExecutiveSummaryCard";
import BusinessImpactCard from "../ai/BusinessImpactCard";
import TechnicalAnalysisCard from "../ai/TechnicalAnalysisCard";
import AttackScenarioCard from "../ai/AttackScenarioCard";
import RemediationPlanCard from "../ai/RemediationPlanCard";
import ReferencesCard from "../ai/ReferencesCard";
import VerdictCard from "../ai/VerdictCard";
import { useEffect, useState } from "react";
import { analyzeVulnerability } from "../../services/vulnerabilityService";
import { motion } from "framer-motion";

export default function AnalyzeModal({ vulnerability, onClose }) {
  const loadingSteps = [
    "Parsing Vulnerability",
    "Mapping CWE & OWASP",
    "Risk Assessment",
    "Attack Path Generation",
    "Building Security Report",
  ];

  const [stepIndex, setStepIndex] = useState(0);

  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const result = await analyzeVulnerability(vulnerability);

        console.log("FULL RESULT", result);

        console.log("VERDICT", result?.verdict);

        console.log("EXECUTIVE METRICS", result?.executiveMetrics);

        console.log("MITRE", result?.mitre);

        console.log("OWASP", result?.owaspContext);

        setAnalysis(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [vulnerability]);

  useEffect(() => {
    if (!loading) return;

    const timer = setInterval(() => {
      setStepIndex((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev,
      );
    }, 1500);

    return () => clearInterval(timer);
  }, [loading]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="athx-scroll"
        style={{
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          lineHeight: 1.7,
          alignContent: "start",
          position: "relative",
          width: "95vw",
          maxWidth: "1600px",
          maxHeight: "90vh",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "32px",
          overflowY: "auto",
          background: "#08111F",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: "20px",
          padding: "32px",
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: "-24px",
            zIndex: 50,

            background: "rgba(8,17,31,.95)",

            backdropFilter: "blur(12px)",

            borderBottom: "1px solid rgba(255,255,255,.08)",

            paddingBottom: "24px",
            marginBottom: "0px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "800",
              letterSpacing: "-0.5px",
              color: "#FFFFFF",
            }}
          >
            AI Security Analysis
          </h2>

          {analysis && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "#EF4444",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                }}
              >
                {analysis?.riskRating?.severity}
              </span>

              <span
                style={{
                  background: "#111827",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                }}
              >
                Risk Score: {analysis?.riskRating?.score}
              </span>

              <span
                style={{
                  background: "#111827",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                }}
              >
                {vulnerability?.cwe}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 100,
            background: "transparent",
            border: "none",
            color: "#FFFFFF",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {loading && (
          <div
            style={{
              gridColumn: "1 / -1",
              background: "#0F172A",
              boxShadow: "0 0 25px rgba(16,185,129,.18)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              ATHX Security Intelligence
            </h3>

            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#111827",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "60%",
                  height: "100%",
                  background: "linear-gradient(90deg,#2563EB,#38BDF8)",
                  borderRadius: "999px",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {loadingSteps.map((step, index) => (
                <div
                  key={step}
                  style={{
                    color:
                      index < stepIndex
                        ? "#22C55E"
                        : index === stepIndex
                          ? "#38BDF8"
                          : "#64748B",

                    fontSize: "14px",
                    fontWeight: index === stepIndex ? "600" : "500",
                  }}
                >
                  {index < stepIndex ? "✓" : index === stepIndex ? "⏳" : "○"}{" "}
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis && (
          <>
            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg,#0F172A,#111827)",
                  border: "1px solid rgba(59,130,246,.25)",
                  borderRadius: "18px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    color: "#38BDF8",
                    fontSize: "12px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  ATHX Security Intelligence
                </div>

                <h2
                  style={{
                    marginTop: "10px",
                    marginBottom: "12px",
                    fontSize: "28px",
                    fontWeight: "800",
                  }}
                >
                  {vulnerability?.title}
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "#EF4444",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {vulnerability?.severity}
                  </span>

                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "#1E293B",
                      fontSize: "12px",
                    }}
                  >
                    {vulnerability?.cwe}
                  </span>

                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "#1E293B",
                      fontSize: "12px",
                    }}
                  >
                    {vulnerability?.owasp}
                  </span>
                </div>
              </div>

              <motion.div
                style={{
                  marginTop: "32px",
                }}
                initial={{
                  opacity: 0,
                  y: -30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                <ExecutiveSummaryCard data={analysis.executiveSummary} />
              </motion.div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
                duration: 0.5,
              }}
              style={{
                gridColumn: "1 / -1",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginBottom: "0px",
              }}
            >
              <motion.div
                style={{
                  cursor: "pointer",
                  background: "linear-gradient(180deg,#0F172A,#111827)",
                  boxShadow: "0 0 25px rgba(59,130,246,.18)",
                  border: "1px solid rgba(59,130,246,.25)",
                  borderRadius: "16px",
                  padding: "18px",
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
              >
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: "12px",
                  }}
                >
                  Risk Score
                </div>

                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "800",
                    marginTop: "6px",
                  }}
                >
                  {analysis?.riskRating?.score}
                </div>

                <div
                  style={{
                    height: "8px",
                    background: "#1E293B",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginTop: "12px",
                  }}
                >
                  <div
                    style={{
                      width: `${(analysis?.riskRating?.score || 0) * 10}%`,
                      height: "100%",
                      background: "linear-gradient(90deg,#3B82F6,#38BDF8)",
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                style={{
                  cursor: "pointer",
                  background: "#0F172A",
                  boxShadow:
                    analysis?.riskRating?.severity?.toLowerCase() === "critical"
                      ? "0 0 25px rgba(239,68,68,.20)"
                      : analysis?.riskRating?.severity?.toLowerCase() === "high"
                        ? "0 0 25px rgba(249,115,22,.20)"
                        : "0 0 25px rgba(234,179,8,.15)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "14px",
                  padding: "16px",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
              >
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: "12px",
                  }}
                >
                  Severity
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    background:
                      analysis?.riskRating?.severity?.toLowerCase() ===
                      "critical"
                        ? "#EF4444"
                        : analysis?.riskRating?.severity?.toLowerCase() ===
                            "high"
                          ? "#F97316"
                          : analysis?.riskRating?.severity?.toLowerCase() ===
                              "medium"
                            ? "#EAB308"
                            : "#3B82F6",
                    color: "#FFFFFF",
                    fontWeight: "700",
                    marginTop: "8px",
                  }}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                  }}
                >
                  {analysis?.riskRating?.severity}
                </div>
              </motion.div>

              <motion.div
                style={{
                  cursor: "pointer",
                  background: "#0F172A",
                  boxShadow: "0 0 25px rgba(16,185,129,.18)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "14px",
                  padding: "16px",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
              >
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: "12px",
                  }}
                >
                  Confidence
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    background: "#10B981",
                    color: "#FFFFFF",
                    fontWeight: "700",
                    marginTop: "8px",
                  }}
                >
                  {analysis?.confidence?.level}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    color: "#64748B",
                    fontSize: "12px",
                  }}
                >
                  AI Validation Confidence
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#1E293B",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      width:
                        analysis?.confidence?.level?.toLowerCase() === "high"
                          ? "90%"
                          : analysis?.confidence?.level?.toLowerCase() ===
                              "medium"
                            ? "65%"
                            : "40%",

                      height: "100%",
                      background: "linear-gradient(90deg,#10B981,#34D399)",
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                style={{
                  cursor: "pointer",
                  background: "#0F172A",
                  boxShadow: "0 0 25px rgba(59,130,246,.18)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "14px",
                  padding: "16px",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
              >
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: "12px",
                  }}
                >
                  ATHX Analysis
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      marginTop: "8px",
                    }}
                  >
                    GPT OSS 120B
                  </div>

                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      marginTop: "10px",
                    }}
                  >
                    Security Intelligence Engine
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
              }}
            >
              <BusinessImpactCard data={analysis.businessImpact} />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                duration: 0.5,
              }}
            >
              <TechnicalAnalysisCard data={analysis.technicalAnalysis} />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.5,
                duration: 0.5,
              }}
            >
              <AttackScenarioCard data={analysis.attackScenario} />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.6,
                duration: 0.5,
              }}
            >
              <RemediationPlanCard data={analysis.remediationPlan} />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.7,
                duration: 0.5,
              }}
            >
              <VerdictCard data={analysis.verdict} />

              <div
                style={{
                  marginTop: "32px",
                }}
              >
                <ReferencesCard data={analysis.references} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "30px",
                }}
              >
                <button
                  onClick={async () => {
                    const response = await fetch(
                      "http://localhost:5000/api/ai/export-pdf",
                      {
                        method: "POST",

                        headers: {
                          "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                          vulnerability,
                          analysis,
                        }),
                      },
                    );

                    if (!response.ok) {
                      throw new Error("PDF generation failed");
                    }

                    const blob = await response.blob();

                    const url = window.URL.createObjectURL(blob);

                    const a = document.createElement("a");

                    a.href = url;

                    a.download = `${vulnerability.title}.pdf`;

                    a.click();

                    window.URL.revokeObjectURL(url);
                  }}
                  style={{
                    background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 22px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Download PDF Report
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
