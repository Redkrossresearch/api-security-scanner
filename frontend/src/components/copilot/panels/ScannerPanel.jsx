import React, { useState, useEffect, useRef } from "react";
import { Play, Activity, CheckCircle, AlertTriangle, RefreshCw, Server } from "lucide-react";
import { scanService } from "../../../services/scanService";
import toast from "react-hot-toast";

export default function ScannerPanel() {
  const [targetUrl, setTargetUrl] = useState("https://api.example.com");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("idle"); // idle, scanning, completed, failed
  const [findings, setFindings] = useState([]);
  const [logs, setLogs] = useState([]);
  const pollingIntervalRef = useRef(null);
  const logsIntervalRef = useRef(null);

  const mockLogStatements = [
    "Initializing crawler...",
    "Crawling endpoints in parallel...",
    "Scanning headers for missing policies...",
    "Probing parameters for SQL injections...",
    "Testing for BOLA vulnerabilities on routes...",
    "Checking CORS origin rules...",
    "Running JWT signature signature attacks...",
    "Validating secure cookie flags...",
    "Compiling threat report...",
  ];

  const handleStartScan = async () => {
    if (!targetUrl) {
      toast.error("Please enter a target URL");
      return;
    }
    setIsScanning(true);
    setScanStatus("scanning");
    setFindings([]);
    setLogs(["[SCAN INITIATED] Target: " + targetUrl]);

    try {
      const scanRes = await scanService.createScan(targetUrl);
      const scanId = scanRes._id;

      // Start log simulation
      let logIndex = 0;
      logsIntervalRef.current = setInterval(() => {
        if (logIndex < mockLogStatements.length) {
          setLogs((prev) => [...prev, `[INFO] ${mockLogStatements[logIndex]}`]);
          logIndex++;
        }
      }, 1500);

      // Start status polling
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await scanService.getScanStatus(scanId);
          if (statusRes.status === "completed") {
            clearInterval(pollingIntervalRef.current);
            clearInterval(logsIntervalRef.current);
            
            const scanData = await scanService.getScanById(scanId);
            setFindings(scanData.vulnerabilities || []);
            setScanStatus("completed");
            setIsScanning(false);
            setLogs((prev) => [...prev, "[SUCCESS] Scan completed successfully.", `[SUMMARY] Found ${scanData.vulnerabilities?.length || 0} vulnerability findings.`]);
            toast.success("Scan completed!");
          } else if (statusRes.status === "failed") {
            clearInterval(pollingIntervalRef.current);
            clearInterval(logsIntervalRef.current);
            setScanStatus("failed");
            setIsScanning(false);
            setLogs((prev) => [...prev, "[ERROR] Scan failed."]);
            toast.error("Scan failed");
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);

    } catch (err) {
      setScanStatus("failed");
      setIsScanning(false);
      setLogs((prev) => [...prev, "[ERROR] Initialisation failed: " + err.message]);
      toast.error(err.message || "Failed to start scan");
    }
  };

  const handleUpdateClassification = (idx, value) => {
    setFindings((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], classification: value };
      return updated;
    });
    toast.success(`Classified as ${value.toUpperCase().replace("_", " ")}`);
  };

  const handleUpdatePatchStatus = (idx, value) => {
    setFindings((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], patchStatus: value };
      return updated;
    });
    toast.success(`Patch Strategy set to: ${value.toUpperCase()}`);
  };

  // Compute Confusion Matrix metrics dynamically from findings list state
  const metrics = (() => {
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;
    findings.forEach((f) => {
      const cls = f.classification || "true_positive";
      if (cls === "true_positive") tp++;
      else if (cls === "false_positive") fp++;
      else if (cls === "true_negative") tn++;
      else if (cls === "false_negative") fn++;
    });
    const total = tp + fp + tn + fn;
    const accuracy = total > 0 ? ((tp + tn) / total) * 100 : 100;
    return { tp, fp, tn, fn, accuracy: accuracy.toFixed(1) };
  })();

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (logsIntervalRef.current) clearInterval(logsIntervalRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        .scan-btn {
          height: 34px;
          border: none;
          border-radius: 6px;
          color: #FFF;
          font-weight: 600;
          font-size: 11.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 12px;
          transition: all 0.2s;
        }
        .scan-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #FFF;
          font-size: 12px;
          padding: 6px 10px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        .vuln-badge {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", boxSizing: "border-box", overflowY: "auto" }}>
        
        {/* Dynamic Accuracy & Confusion Matrix HUD Dashboard */}
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "8px",
          padding: "10px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>Model Accuracy Matrix</span>
            <span style={{ 
              fontSize: "11px", 
              color: parseFloat(metrics.accuracy) >= 80 ? "#10B981" : parseFloat(metrics.accuracy) >= 50 ? "#F59E0B" : "#EF4444", 
              fontWeight: "900",
              background: parseFloat(metrics.accuracy) >= 80 ? "rgba(16,185,129,0.1)" : parseFloat(metrics.accuracy) >= 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
              padding: "2px 6px",
              borderRadius: "4px",
              border: `1px solid ${parseFloat(metrics.accuracy) >= 80 ? "rgba(16,185,129,0.2)" : parseFloat(metrics.accuracy) >= 50 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`
            }}>
              Acc: {metrics.accuracy}%
            </span>
          </div>

          {/* 2x2 Confusion Matrix Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {/* TP */}
            <div style={{ background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.12)", borderRadius: "6px", padding: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "8px", color: "rgba(16, 185, 129, 0.7)", fontWeight: "800", textTransform: "uppercase" }}>True Positive (TP)</div>
              <div style={{ fontSize: "16px", color: "#10B981", fontWeight: "900", marginTop: "2px" }}>{metrics.tp}</div>
            </div>
            {/* FP */}
            <div style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.12)", borderRadius: "6px", padding: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "8px", color: "rgba(239, 68, 68, 0.7)", fontWeight: "800", textTransform: "uppercase" }}>False Positive (FP)</div>
              <div style={{ fontSize: "16px", color: "#EF4444", fontWeight: "900", marginTop: "2px" }}>{metrics.fp}</div>
            </div>
            {/* TN */}
            <div style={{ background: "rgba(59, 130, 246, 0.03)", border: "1px solid rgba(59, 130, 246, 0.12)", borderRadius: "6px", padding: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "8px", color: "rgba(59, 130, 246, 0.7)", fontWeight: "800", textTransform: "uppercase" }}>True Negative (TN)</div>
              <div style={{ fontSize: "16px", color: "#3B82F6", fontWeight: "900", marginTop: "2px" }}>{metrics.tn}</div>
            </div>
            {/* FN */}
            <div style={{ background: "rgba(245, 158, 11, 0.03)", border: "1px solid rgba(245, 158, 11, 0.12)", borderRadius: "6px", padding: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "8px", color: "rgba(245, 158, 11, 0.7)", fontWeight: "800", textTransform: "uppercase" }}>False Negative (FN)</div>
              <div style={{ fontSize: "16px", color: "#F59E0B", fontWeight: "900", marginTop: "2px" }}>{metrics.fn}</div>
            </div>
          </div>
        </div>

        {/* URL scan inputs bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", flexShrink: 0 }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Start Vulnerability Scan</span>
          <input
            type="text"
            placeholder="Target URL..."
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            disabled={isScanning}
            className="scan-input"
          />
          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="scan-btn"
            style={{
              background: isScanning ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #7C3AED, #2563EB)",
              cursor: isScanning ? "not-allowed" : "pointer"
            }}
          >
            {isScanning ? <RefreshCw size={12} className="spin-loader" /> : <Play size={12} />}
            {isScanning ? "Scanning Target..." : "Initiate Audit"}
          </button>
        </div>

        {/* Live logs console */}
        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", minHeight: 0, marginBottom: "16px" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700", marginBottom: "6px" }}>Live Audit Logs</span>
          <div style={{
            flex: 1,
            background: "#080D1A",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "10px",
            fontFamily: "monospace",
            fontSize: "10px",
            color: "#10B981",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
            {logs.length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "20px" }}>
                No active audit process logs.
              </div>
            )}
          </div>
        </div>

        {/* Scan vulnerabilities findings */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700", marginBottom: "6px" }}>Threat Inventory</span>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
            {scanStatus === "completed" && findings.length === 0 && (
              <div style={{ color: "#10B981", textAlign: "center", padding: "16px 0", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <CheckCircle size={14} />
                No vulnerabilities discovered!
              </div>
            )}

            {findings.map((finding, idx) => {
              const severity = finding.severity?.toLowerCase() || "medium";
              const sevColor = severity === "critical" || severity === "high" ? "#EF4444" : "#F59E0B";
              const sevBg = severity === "critical" || severity === "high" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)";
              
              return (
                <div key={idx} style={{
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  <div style={{ display: "flex", justifySpace: "between", alignItems: "center" }}>
                    <span style={{
                      color: sevColor,
                      background: sevBg,
                      border: `1px solid rgba(255,255,255,0.04)`
                    }} className="vuln-badge">{finding.severity || "medium"}</span>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{finding.cwe || "CWE"}</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: "12.5px", color: "#FFF", fontWeight: "600" }}>{finding.title}</h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.45)", wordBreak: "break-all" }}>{finding.endpoint}</p>
                  
                  {/* Accuracy Tuning & Patch Strategy Selectors */}
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "6px",
                    marginTop: "6px",
                    paddingTop: "6px",
                    borderTop: "1px dashed rgba(255,255,255,0.06)"
                  }}>
                    {/* Classification Selector */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: "600" }}>Classification:</span>
                      <select
                        value={finding.classification || "true_positive"}
                        onChange={(e) => handleUpdateClassification(idx, e.target.value)}
                        style={{
                          background: "#080D1A",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "4px",
                          color: "rgba(255,255,255,0.75)",
                          fontSize: "9px",
                          padding: "2px 4px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="true_positive">🟢 True Positive (TP)</option>
                        <option value="false_positive">🔴 False Positive (FP)</option>
                        <option value="true_negative">🔵 True Negative (TN)</option>
                        <option value="false_negative">🟡 False Negative (FN)</option>
                      </select>
                    </div>

                    {/* Patch Strategy Selector */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: "600" }}>Patch Option:</span>
                      <select
                        value={finding.patchStatus || "none"}
                        onChange={(e) => handleUpdatePatchStatus(idx, e.target.value)}
                        style={{
                          background: "#080D1A",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "4px",
                          color: "rgba(255,255,255,0.75)",
                          fontSize: "9px",
                          padding: "2px 4px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="none">⚠️ Unpatched</option>
                        <option value="temp">⏳ Temporary Patch</option>
                        <option value="permanent">🛡️ Permanent Patch</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}

            {scanStatus === "idle" && (
              <div style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "20px" }}>
                Initiate a scan to collect threats.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
