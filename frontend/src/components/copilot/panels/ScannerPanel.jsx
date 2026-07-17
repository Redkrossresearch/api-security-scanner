import React, { useState, useEffect, useRef } from "react";
import { Play, Activity, CheckCircle, AlertTriangle, RefreshCw, Terminal, Eye } from "lucide-react";
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
    "Running JWT signature attacks...",
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
            setLogs((prev) => [
              ...prev, 
              "[SUCCESS] Scan completed successfully.", 
              `[SUMMARY] Found ${scanData.vulnerabilities?.length || 0} vulnerability findings.`
            ]);
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
          height: 38px;
          border: none;
          border-radius: 8px;
          color: #FFF;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 16px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .scan-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
        }
        .scan-input {
          background: rgba(8, 14, 27, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #FFF;
          font-size: 12px;
          padding: 8px 12px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .scan-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
          background: rgba(13, 20, 37, 0.9);
        }
        .matrix-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 8px;
          text-align: center;
          transition: all 0.2s;
        }
        .matrix-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .console-container {
          flex: 1;
          background: #040811;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 12px;
          font-family: "Fira Code", "Courier New", monospace;
          font-size: 11px;
          color: #10B981;
          overflow-y: auto;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.6);
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", boxSizing: "border-box", overflowY: "auto" }}>
        
        {/* Dynamic Accuracy & Confusion Matrix HUD Dashboard */}
        <div style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Activity size={14} color="#3B82F6" />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>Model Accuracy Matrix</span>
            </div>
            <span style={{ 
              fontSize: "11px", 
              color: parseFloat(metrics.accuracy) >= 80 ? "#10B981" : parseFloat(metrics.accuracy) >= 50 ? "#F59E0B" : "#EF4444", 
              fontWeight: "900",
              background: parseFloat(metrics.accuracy) >= 80 ? "rgba(16,185,129,0.08)" : parseFloat(metrics.accuracy) >= 50 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
              padding: "3px 8px",
              borderRadius: "6px",
              border: `1px solid ${parseFloat(metrics.accuracy) >= 80 ? "rgba(16,185,129,0.2)" : parseFloat(metrics.accuracy) >= 50 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`
            }}>
              Acc: {metrics.accuracy}%
            </span>
          </div>

          {/* 2x2 Confusion Matrix Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div className="matrix-card" style={{ borderLeft: "3px solid #10B981" }}>
              <div style={{ fontSize: "8px", color: "rgba(16, 185, 129, 0.7)", fontWeight: "800", textTransform: "uppercase" }}>True Positive (TP)</div>
              <div style={{ fontSize: "16px", color: "#10B981", fontWeight: "900", marginTop: "2px" }}>{metrics.tp}</div>
            </div>
            <div className="matrix-card" style={{ borderLeft: "3px solid #EF4444" }}>
              <div style={{ fontSize: "8px", color: "rgba(239, 68, 68, 0.7)", fontWeight: "800", textTransform: "uppercase" }}>False Positive (FP)</div>
              <div style={{ fontSize: "16px", color: "#EF4444", fontWeight: "900", marginTop: "2px" }}>{metrics.fp}</div>
            </div>
            <div className="matrix-card" style={{ borderLeft: "3px solid #3B82F6" }}>
              <div style={{ fontSize: "8px", color: "rgba(59, 130, 246, 0.7)", fontWeight: "800", textTransform: "uppercase" }}>True Negative (TN)</div>
              <div style={{ fontSize: "16px", color: "#3B82F6", fontWeight: "900", marginTop: "2px" }}>{metrics.tn}</div>
            </div>
            <div className="matrix-card" style={{ borderLeft: "3px solid #F59E0B" }}>
              <div style={{ fontSize: "8px", color: "rgba(245, 158, 11, 0.7)", fontWeight: "800", textTransform: "uppercase" }}>False Negative (FN)</div>
              <div style={{ fontSize: "16px", color: "#F59E0B", fontWeight: "900", marginTop: "2px" }}>{metrics.fn}</div>
            </div>
          </div>
        </div>

        {/* URL scan inputs bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px", flexShrink: 0 }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Start Vulnerability Scan</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Enter API Endpoint (e.g. https://api.site.com)"
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
                background: isScanning ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                cursor: isScanning ? "not-allowed" : "pointer",
                flexShrink: 0
              }}
            >
              {isScanning ? <RefreshCw size={14} className="spin-loader" /> : <Play size={14} />}
              {isScanning ? "Scanning..." : "Initiate Audit"}
            </button>
          </div>
        </div>

        {/* Live logs console */}
        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", minHeight: 0, marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Terminal size={14} color="#10B981" />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700" }}>Live Audit Console Logs</span>
          </div>
          <div className="console-container">
            {logs.map((log, idx) => (
              <div key={idx} style={{
                color: log.includes("[SUCCESS]") ? "#10B981" : log.includes("[ERROR]") ? "#EF4444" : "#94A3B8",
                marginBottom: "4px",
                lineHeight: "1.4"
              }}>{log}</div>
            ))}
            {logs.length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "30px" }}>
                Console idle. Initiate a scan to collect diagnostics.
              </div>
            )}
          </div>
        </div>

        {/* Scan vulnerabilities findings */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700", marginBottom: "8px" }}>Threat Inventory</span>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {scanStatus === "idle" && (
              <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0", fontSize: "11.5px" }}>
                Initiate scan to populate threat models.
              </div>
            )}

            {scanStatus === "completed" && findings.length === 0 && (
              <div style={{ color: "#10B981", textAlign: "center", padding: "16px 0", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <CheckCircle size={14} />
                Secure! No vulnerabilities discovered.
              </div>
            )}

            {findings.map((finding, idx) => {
              const severity = finding.severity?.toLowerCase() || "medium";
              const sevColor = severity === "critical" || severity === "high" ? "#EF4444" : "#F59E0B";
              const sevBg = severity === "critical" || severity === "high" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)";
              const sevBorder = severity === "critical" || severity === "high" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)";
              
              return (
                <div key={idx} style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.002) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: "9px",
                      background: sevBg,
                      border: `1px solid ${sevBorder}`,
                      borderRadius: "5px",
                      padding: "2px 6px",
                      color: sevColor,
                      fontWeight: "800",
                      textTransform: "uppercase"
                    }}>{severity}</span>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>CVSS: {finding.cvss || "N/A"}</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: "12px", color: "#FFF", fontWeight: "600" }}>{finding.title}</h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.45)", lineHeight: "1.4" }}>{finding.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
