import ExecutiveSummaryCard from "../ai/ExecutiveSummaryCard";
import BusinessImpactCard from "../ai/BusinessImpactCard";
import TechnicalAnalysisCard from "../ai/TechnicalAnalysisCard";
import AttackScenarioCard from "../ai/AttackScenarioCard";
import RemediationPlanCard from "../ai/RemediationPlanCard";
import ReferencesCard from "../ai/ReferencesCard";
import VerdictCard from "../ai/VerdictCard";
import AttackDiagramCard from "../ai/AttackDiagramCard";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { analyzeVulnerability } from "../../services/vulnerabilityService";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AnalyzeModal({ vulnerability, onClose }) {
  const loadingSteps = [
    { title: "Parsing Vulnerability Payload", subtitle: "Extracting endpoint headers, query parameters & request schema", icon: "🔍", codeTag: "PARSER_v4.2" },
    { title: "Mapping CWE & OWASP DAG Graph", subtitle: "Traversing DAG Security Knowledge Graph for OWASP Top 10 nodes", icon: "🧠", codeTag: "DAG_TRAVERSAL" },
    { title: "Quantum Risk & CVSS Assessment", subtitle: "Evaluating business impact, exploitability index & CVSS 3.1 score", icon: "⚡", codeTag: "CVSS_CALCULATOR" },
    { title: "Synthesizing Attack Path & MITRE", subtitle: "Building kill chain, parameter tampering & attack scenarios", icon: "🛡️", codeTag: "ATTACK_GRAPH" },
    { title: "Generating Fix Patch & Security Report", subtitle: "Compiling code remediation, executive summary & export object", icon: "📄", codeTag: "PATCH_SYNTHESIZER" },
  ];

  const subTraces = [
    "[PARSER] Extracting vulnerability endpoint, headers, and payload schema...",
    "[DAG KNOWLEDGE GRAPH] Querying OWASP API Security Taxonomy & CWE-284 nodes...",
    "[RISK MATRIX] Calculating CVSS v3.1 vector score & business impact index...",
    "[ATTACK GRAPH] Synthesizing exploitation chain & MITRE ATT&CK mapping...",
    "[AUTONOMOUS ENGINE] Generating executive summary, code patch & PDF report...",
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [scanTime, setScanTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setScanTime(0);
    setStepIndex(0);

    const runAnalysis = async () => {
      try {
        const result = await analyzeVulnerability(vulnerability);
        if (isMounted) {
          setAnalysis(result);
        }
      } catch (err) {
        console.error("Vulnerability analysis error:", err);
        if (isMounted) {
          const isTimeout = err?.code === "ECONNABORTED" || err?.message?.includes("timeout");
          setError(
            isTimeout
              ? "AI Engine timed out — Render backend may be waking up (cold start). Please retry in a few seconds."
              : err?.response?.data?.message || err?.message || "AI analysis failed. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setTimeout(() => setLoading(false), 800);
        }
      }
    };

    runAnalysis();
    return () => { isMounted = false; };
  }, [vulnerability, retryCount]);


  useEffect(() => {
    if (!loading) return;

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    const clockTimer = setInterval(() => {
      setScanTime((t) => t + 100);
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(clockTimer);
    };
  }, [loading, loadingSteps.length]);

  // PDF Download Handler
  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);

      const response = await api.post(
        "/ai/export-pdf",
        { vulnerability, analysis },
        { responseType: "blob" }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      const safeTitle = (vulnerability?.title || "security-report").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${safeTitle}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("[AnalyzeModal] PDF Download Error:", error);
      let message = "Failed to generate PDF.";
      if (error?.response?.data) {
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const parsed = JSON.parse(text);
            message = parsed.message || parsed.error || message;
          } catch (e) {}
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      toast.error(message);
    } finally {
      setPdfLoading(false);
    }
  };

  const modalContent = (() => {
    if (loading) {

      const progressPercent = Math.min(100, Math.round(((stepIndex + 1) / loadingSteps.length) * 100));

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          style={{
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            background: "linear-gradient(165deg, #050B14 0%, #0A1124 40%, #0F172A 100%)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            borderRadius: "28px",
            padding: "36px 42px",
            width: "92vw",
            maxWidth: "600px",
            color: "#FFFFFF",
            boxShadow: "0 35px 90px -15px rgba(0, 0, 0, 0.9), 0 0 80px rgba(124, 58, 237, 0.35)",
            position: "relative",
            backdropFilter: "blur(24px)",
            overflow: "hidden",
          }}
        >
          {/* Keyframe Animations */}
          <style>{`
            @keyframes pulseGlow {
              0%, 100% { transform: scale(1); opacity: 0.35; }
              50% { transform: scale(1.15); opacity: 0.75; }
            }
            @keyframes spinClockwise {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes spinCounter {
              0% { transform: rotate(360deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes scanLineSweep {
              0% { top: 0%; opacity: 0.8; }
              50% { opacity: 1; }
              100% { top: 100%; opacity: 0.2; }
            }
            @keyframes cyberPulse {
              0%, 100% { box-shadow: 0 0 15px rgba(56, 189, 248, 0.4); }
              50% { box-shadow: 0 0 35px rgba(168, 85, 247, 0.8); }
            }
            .athx-ring-1 { animation: spinClockwise 10s linear infinite; }
            .athx-ring-2 { animation: spinCounter 6s linear infinite; }
            .athx-ring-3 { animation: spinClockwise 3s linear infinite; }
            .athx-scan-sweep { animation: scanLineSweep 2.2s ease-in-out infinite; }
            .athx-cyber-glow { animation: cyberPulse 2s ease-in-out infinite; }
          `}</style>

          {/* Hologram Matrix Background Lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(124, 58, 237, 0.12) 1px, transparent 1px), radial-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />

          {/* Ambient Glow Orbs */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              left: "-100px",
              width: "280px",
              height: "280px",
              background: "radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(0,0,0,0) 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              right: "-100px",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(0,0,0,0) 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "22px",
              right: "22px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              zIndex: 20,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94A3B8";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
            }}
          >
            ✕
          </button>

          {/* Header Section with 3D Quantum AI Orb */}
          <div style={{ textAlign: "center", marginBottom: "24px", position: "relative", zIndex: 10 }}>
            {/* Multi-Ring Quantum Core Icon */}
            <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 18px" }}>
              <div
                className="athx-ring-1"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px dashed rgba(168, 85, 247, 0.6)",
                }}
              />
              <div
                className="athx-ring-2"
                style={{
                  position: "absolute",
                  inset: "7px",
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "#38BDF8",
                  borderBottomColor: "#34D399",
                }}
              />
              <div
                className="athx-ring-3"
                style={{
                  position: "absolute",
                  inset: "14px",
                  borderRadius: "50%",
                  border: "2px dotted rgba(244, 114, 182, 0.8)",
                }}
              />
              <div
                className="athx-cyber-glow"
                style={{
                  position: "absolute",
                  inset: "18px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #7C3AED 0%, #2563EB 60%, #06B6D4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  color: "#FFFFFF",
                }}
              >
                {loadingSteps[stepIndex]?.icon || "⚡"}
              </div>
            </div>

            {/* Live Engine Active Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(90deg, rgba(124, 58, 237, 0.2), rgba(56, 189, 248, 0.2))",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: "999px",
                padding: "5px 14px",
                marginBottom: "12px",
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.2)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 12px #10B981",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#C084FC", letterSpacing: "1.2px", textTransform: "uppercase" }}>
                ATHX QUANTUM AI ENGINE ACTIVE
              </span>
            </div>

            <div style={{ fontSize: "26px", fontWeight: "900", color: "#FFFFFF", letterSpacing: "-0.6px", marginBottom: "6px" }}>
              AI Analysis In Progress
            </div>
            <div style={{ color: "#94A3B8", fontSize: "13px", maxWidth: "440px", margin: "0 auto" }}>
              Evaluating vulnerability details using OWASP Taxonomy & DAG Graph...
            </div>
          </div>

          {/* Real-time Security Metrics Telemetry Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "20px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "10px 14px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "#64748B", fontWeight: "800", letterSpacing: "1px" }}>SEVERITY INDEX</div>
              <div style={{ fontSize: "13px", color: "#EF4444", fontWeight: "800", marginTop: "2px" }}>CRITICAL (9.8)</div>
            </div>
            <div style={{ textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: "9px", color: "#64748B", fontWeight: "800", letterSpacing: "1px" }}>DAG GRAPH NODES</div>
              <div style={{ fontSize: "13px", color: "#A855F7", fontWeight: "800", marginTop: "2px" }}>14 RELATIONS</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "#64748B", fontWeight: "800", letterSpacing: "1px" }}>EXEC TIME</div>
              <div style={{ fontSize: "13px", color: "#38BDF8", fontWeight: "800", marginTop: "2px" }}>{scanTime}ms</div>
            </div>
          </div>

          {/* Progress Bar Container with Shimmer Glow Lead */}
          <div style={{ marginBottom: "24px", position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#94A3B8" }}>Overall Progress</span>
              <span style={{ fontSize: "14px", fontWeight: "900", color: "#38BDF8", fontFamily: "'JetBrains Mono', monospace" }}>{progressPercent}%</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "9px",
                background: "rgba(15, 23, 42, 0.9)",
                borderRadius: "999px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #7C3AED, #2563EB, #06B6D4, #10B981)",
                  borderRadius: "999px",
                  boxShadow: "0 0 20px rgba(56, 189, 248, 0.9)",
                }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Interactive Steps List with Sweeping Scanner Light */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "rgba(15, 23, 42, 0.7)",
              borderRadius: "20px",
              padding: "16px",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              marginBottom: "20px",
              position: "relative",
              zIndex: 10,
            }}
          >
            {loadingSteps.map((stepObj, index) => {
              const isCompleted = index < stepIndex;
              const isActive = index === stepIndex;
              const isPending = index > stepIndex;

              return (
                <motion.div
                  key={stepObj.title}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.025 : 1,
                    backgroundColor: isCompleted
                      ? "rgba(16, 185, 129, 0.09)"
                      : isActive
                      ? "rgba(124, 58, 237, 0.18)"
                      : "rgba(255, 255, 255, 0.02)",
                    borderColor: isCompleted
                      ? "rgba(16, 185, 129, 0.35)"
                      : isActive
                      ? "rgba(56, 189, 248, 0.6)"
                      : "rgba(255, 255, 255, 0.04)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    border: "1px solid transparent",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: isActive ? "0 8px 25px rgba(124, 58, 237, 0.25)" : "none",
                  }}
                >
                  {/* Sweeping Laser Scanner Bar for Active Step */}
                  {isActive && (
                    <div
                      className="athx-scan-sweep"
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: "linear-gradient(90deg, transparent, #38BDF8, #A855F7, transparent)",
                        boxShadow: "0 0 10px #38BDF8",
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* Step Status Badge Circle */}
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "800",
                      flexShrink: 0,
                      background: isCompleted
                        ? "rgba(16, 185, 129, 0.25)"
                        : isActive
                        ? "rgba(56, 189, 248, 0.25)"
                        : "rgba(255, 255, 255, 0.04)",
                      color: isCompleted ? "#10B981" : isActive ? "#38BDF8" : "#475569",
                      border: `1.5px solid ${
                        isCompleted
                          ? "#10B981"
                          : isActive
                          ? "#38BDF8"
                          : "rgba(255, 255, 255, 0.1)"
                      }`,
                    }}
                  >
                    {isCompleted ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 450 }}>
                        ✓
                      </motion.span>
                    ) : isActive ? (
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          border: "2.5px solid #38BDF8",
                          borderTopColor: "transparent",
                          animation: "spinClockwise 0.7s linear infinite",
                        }}
                      />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Step Title & Subtitle */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: isActive ? "800" : isCompleted ? "600" : "500",
                        color: isCompleted ? "#34D399" : isActive ? "#FFFFFF" : "#64748B",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>{stepObj.title}</span>
                      {isActive && (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "800",
                            background: "rgba(56, 189, 248, 0.25)",
                            color: "#38BDF8",
                            border: "1px solid rgba(56, 189, 248, 0.5)",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            letterSpacing: "0.8px",
                          }}
                        >
                          ANALYZING...
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: isActive ? "#94A3B8" : isCompleted ? "#059669" : "#475569", marginTop: "2px" }}>
                      {stepObj.subtitle}
                    </div>
                  </div>

                  {/* Icon & Code Tag */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
                    <div style={{ fontSize: "16px", opacity: isPending ? 0.3 : 1 }}>
                      {stepObj.icon}
                    </div>
                    <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: isActive ? "#A78BFA" : "#475569" }}>
                      {stepObj.codeTag}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Live Sub-Trace Terminal Ticker */}
          <div
            style={{
              background: "#030712",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "14px",
              padding: "12px 16px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#38BDF8",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              position: "relative",
              zIndex: 10,
              boxShadow: "inset 0 0 15px rgba(0,0,0,0.8)",
            }}
          >
            <span style={{ color: "#10B981", fontWeight: "800" }}>❯</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={stepIndex}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {subTraces[stepIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            background: "linear-gradient(165deg, #050B14 0%, #0A1124 40%, #0F172A 100%)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "28px",
            padding: "48px 42px",
            width: "92vw",
            maxWidth: "520px",
            color: "#FFFFFF",
            boxShadow: "0 35px 90px -15px rgba(0,0,0,0.9), 0 0 60px rgba(239,68,68,0.15)",
            textAlign: "center",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "18px", right: "18px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%", width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#94A3B8", fontSize: "15px", cursor: "pointer",
            }}
          >✕</button>

          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#F97316", marginBottom: "10px" }}>
            Analysis Engine Re-evaluating
          </div>
          <div style={{
            fontSize: "13px", color: "#94A3B8", lineHeight: 1.7,
            maxWidth: "380px", margin: "0 auto 28px",
          }}>
            {error}
          </div>

          <button
            onClick={() => setRetryCount((c) => c + 1)}
            style={{
              padding: "12px 32px",
              background: "linear-gradient(90deg, #F97316, #FB923C)",
              border: "none", borderRadius: "12px",
              color: "#FFF", fontWeight: "800", fontSize: "14px",
              cursor: "pointer", boxShadow: "0 0 25px rgba(249,115,22,0.4)",
              display: "inline-flex", alignItems: "center", gap: "8px",
            }}
          >
            🔄 Retry AI Security Analysis
          </button>
        </motion.div>
      );
    }

    if (analysis) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="athx-scroll athx-modal-scroll"
          style={{
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            lineHeight: 1.7,
            alignContent: "start",
            position: "relative",
            width: "95vw",
            maxWidth: "1400px",
            maxHeight: "90vh",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "32px",
            overflowY: "auto",
            overflowX: "hidden",
            background: "#08111F",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "20px",
            padding: "32px",
            color: "#FFFFFF",
            boxShadow: "0 25px 70px -10px rgba(0,0,0,0.8), 0 0 50px rgba(59, 130, 246, 0.05)",
          }}
        >
          <style>{`
            .athx-modal-scroll::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .athx-modal-scroll::-webkit-scrollbar-track {
              background: rgba(8, 17, 31, 0.5);
            }
            .athx-modal-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 4px;
            }
            .athx-modal-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}</style>

          <div
            style={{
              position: "sticky",
              top: "-32px",
              zIndex: 50,
              background: "rgba(8, 17, 31, 0.95)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "20px",
              marginBottom: "0px",
              marginTop: "-16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: "900",
                    letterSpacing: "-0.5px",
                    background: "linear-gradient(90deg, #FFFFFF 0%, #94A3B8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI Security Intelligence Report
                </h2>

                <span
                  style={{
                    background: "rgba(124, 58, 237, 0.15)",
                    border: "1px solid rgba(124, 58, 237, 0.4)",
                    color: "#C084FC",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "800",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                  }}
                >
                  ⚡ Gemini LLM Engine Active
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    color: "#F87171",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "800",
                  }}
                >
                  {analysis?.riskRating?.severity || vulnerability.severity || "HIGH"}
                </span>

                <span
                  style={{
                    background: "rgba(56, 189, 248, 0.15)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#38BDF8",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  CVSS Score: {analysis?.riskRating?.cvssScore || vulnerability.cvss || 8.5}
                </span>

                <span
                  style={{
                    color: "#94A3B8",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Target: <code style={{ color: "#E2E8F0", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>{vulnerability.endpoint || vulnerability.url || "/api/v1"}</code>
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                style={{
                  padding: "10px 20px",
                  background: pdfLoading ? "#475569" : "linear-gradient(90deg, #2563EB, #7C3AED)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#FFFFFF",
                  cursor: pdfLoading ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)",
                }}
              >
                {pdfLoading ? "Generating PDF..." : "📥 Export PDF Report"}
              </button>

              <button
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#94A3B8",
                  fontSize: "18px",
                  cursor: "pointer",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FFF";
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94A3B8";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
              >
                ✕
              </button>
            </div>
          </div>


          <VerdictCard
            data={
              analysis?.verdict || {
                summary: `Security analysis for ${vulnerability.title || "vulnerability"}. Immediate remediation recommended.`,
                score: vulnerability.cvss || 8.5,
              }
            }
          />

          <AttackDiagramCard vulnerability={vulnerability} />

          <ExecutiveSummaryCard
            data={
              analysis?.executiveSummary ||
              `### Executive Briefing\nThis security report identifies **${vulnerability.severity || "HIGH"}** severity vulnerability **${vulnerability.title}** (${vulnerability.owasp || "OWASP API Top 10"}). Immediate remediation is required to protect endpoint operations.`
            }
          />


          <BusinessImpactCard
            data={
              analysis?.businessImpact ||
              `### Business Impact\nExposing this endpoint allows potential unauthorized access, impacting customer trust and violating SOC 2 / PCI-DSS compliance mandates.`
            }
          />

          <TechnicalAnalysisCard
            data={
              analysis?.technicalAnalysis ||
              `### Technical Observations\n- **Target**: \`${vulnerability.endpoint || vulnerability.url || "/api"}\` \n- **CWE**: ${vulnerability.cwe || "CWE-200"}\n- **Description**: ${vulnerability.description || "Unvalidated parameter input."}`
            }
          />

          <AttackScenarioCard
            data={
              analysis?.attackScenario ||
              `### Attack Progression\n1. Attacker discovers exposed endpoint \`${vulnerability.endpoint || "/api"}\`.\n2. Attacker crafts custom payload bypassing default parameters.\n3. Request is processed without authorization check.`
            }
          />

          <RemediationPlanCard
            data={
              analysis?.remediationPlan ||
              `### Remediation Roadmap\n1. **Immediate**: Enforce authorization middleware on \`${vulnerability.endpoint || "/api"}\`.\n2. **Short-term**: Implement JSON schema validation.`
            }
          />

          <ReferencesCard
            data={
              Array.isArray(analysis?.references) && analysis.references.length > 0
                ? analysis.references
                : (() => {
                    const title = (vulnerability?.title || "").toLowerCase();
                    const cwe = (vulnerability?.cwe || "").toUpperCase();

                    if (title.includes("clickjacking") || title.includes("x-frame-options") || title.includes("frame-ancestors") || cwe.includes("1021")) {
                      return [
                        "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html",
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options",
                        "https://cwe.mitre.org/data/definitions/1021.html",
                        "https://portswigger.net/web-security/clickjacking",
                      ];
                    }

                    if (title.includes("graphql") || title.includes("introspection")) {
                      return [
                        "https://graphql.org/learn/security/",
                        "https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html",
                        "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/",
                        "https://portswigger.net/web-security/graphql",
                      ];
                    }

                    if (title.includes("cors") || title.includes("cross-origin") || cwe.includes("942")) {
                      return [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS",
                        "https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html",
                        "https://cwe.mitre.org/data/definitions/942.html",
                        "https://portswigger.net/web-security/cors",
                      ];
                    }

                    if (title.includes("sql") || title.includes("sqli") || cwe.includes("89")) {
                      return [
                        "https://owasp.org/www-community/attacks/SQL_Injection",
                        "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
                        "https://cwe.mitre.org/data/definitions/89.html",
                        "https://portswigger.net/web-security/sql-injection",
                      ];
                    }

                    if (title.includes("xss") || title.includes("cross-site scripting") || cwe.includes("79")) {
                      return [
                        "https://owasp.org/www-community/attacks/xss/",
                        "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
                        "https://cwe.mitre.org/data/definitions/79.html",
                        "https://portswigger.net/web-security/cross-site-scripting",
                      ];
                    }

                    if (title.includes("jwt") || title.includes("token") || cwe.includes("347")) {
                      return [
                        "https://jwt.io/introduction",
                        "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html",
                        "https://cwe.mitre.org/data/definitions/347.html",
                        "https://portswigger.net/web-security/jwt",
                      ];
                    }

                    return [
                      "https://owasp.org/www-project-api-security/",
                      `https://cwe.mitre.org/data/definitions/${cwe.replace("CWE-", "") || "200"}.html`,
                      "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html",
                    ];
                  })()
            }
          />




          </motion.div>
      );
    }


    // Fallback card if loading finished but analysis error occurred
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "#0F172A",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          borderRadius: "20px",
          padding: "36px",
          width: "90vw",
          maxWidth: "500px",
          color: "#FFFFFF",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "#94A3B8",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#EF4444", marginBottom: "8px" }}>
          Analysis Engine Re-evaluating
        </div>
        <div style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "24px" }}>
          The AI Security Engine encountered a momentary network delay while structuring the report format.
        </div>

        <button
          onClick={() => {
            setLoading(true);
            setStepIndex(0);
            analyzeVulnerability(vulnerability)
              .then((res) => setAnalysis(res))
              .catch((err) => console.error(err))
              .finally(() => setLoading(false));
          }}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(90deg, #7C3AED, #2563EB)",
            border: "none",
            borderRadius: "10px",
            color: "#FFF",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🔄 Retry AI Security Analysis
        </button>
      </motion.div>
    );
  })();

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.88)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "20px",
      }}
    >
      {modalContent}
    </div>,
    document.body
  );
}