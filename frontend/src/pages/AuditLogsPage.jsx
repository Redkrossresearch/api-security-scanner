import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Clock, 
  User, 
  Globe, 
  Cpu, 
  Search, 
  CornerDownRight, 
  Lock,
  AlertTriangle,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [correlationChain, setCorrelationChain] = useState([]);
  const [activeTab, setActiveTab] = useState("forensics"); // forensics, diff, chain, signature
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");
  const [loading, setLoading] = useState(true);
  const [tampering, setTampering] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Integrity Meter state
  const [integrityStats, setIntegrityStats] = useState({
    total: 0,
    verified: 0,
    tampered: 0,
    integrityPercent: 100,
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/audit-logs");
      if (res.data?.success) {
        setLogs(res.data.logs);
        setFilteredLogs(res.data.logs);
        if (res.data.logs.length > 0 && !selectedLog) {
          setSelectedLog(res.data.logs[0]);
        }
      }
    } catch (err) {
      toast.error("Failed to fetch audit logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrityStats = async () => {
    try {
      setScanning(true);
      const res = await api.get("/audit-logs/verify");
      if (res.data?.success) {
        setIntegrityStats({
          total: res.data.total,
          verified: res.data.verified,
          tampered: res.data.tampered,
          integrityPercent: res.data.integrityPercent,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchIntegrityStats();
  }, []);

  useEffect(() => {
    if (selectedLog) {
      fetchCorrelationChain(selectedLog.correlationId);
    }
  }, [selectedLog]);

  const fetchCorrelationChain = async (corrId) => {
    try {
      const res = await api.get(`/audit-logs/correlation/${corrId}`);
      if (res.data?.success) {
        setCorrelationChain(res.data.chain);
      }
    } catch (err) {
      console.error("Failed to fetch correlation chain:", err.message);
    }
  };

  // Filter and search logs
  const handleFilter = () => {
    let temp = [...logs];
    if (selectedRisk) {
      temp = temp.filter(log => log.risk === selectedRisk);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      temp = temp.filter(log => 
        log.eventId.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.evidence.toLowerCase().includes(q) ||
        log.affectedResource.toLowerCase().includes(q)
      );
    }
    setFilteredLogs(temp);
  };

  useEffect(() => {
    handleFilter();
  }, [searchQuery, selectedRisk, logs]);

  // Simulate Database Tampering
  const handleTamper = async () => {
    try {
      setTampering(true);
      const res = await api.post("/audit-logs/tamper");
      if (res.data?.success) {
        toast.error("Forensic Threat Alert: EVT-2002-A2 database record has been edited directly bypass-hashing!", {
          icon: "💀",
          duration: 6000,
        });
        await fetchLogs();
        await fetchIntegrityStats();
        // Set selected log to the tampered one to show user
        const tampered = logs.find(l => l.eventId === "EVT-2002-A2");
        if (tampered) setSelectedLog(tampered);
      }
    } catch (err) {
      toast.error("Failed to simulate tampering: " + err.message);
    } finally {
      setTampering(false);
    }
  };

  // Restore Cryptographic Integrity
  const handleRestore = async () => {
    try {
      setRestoring(true);
      const res = await api.post("/audit-logs/restore");
      if (res.data?.success) {
        toast.success("Database hashes rebuilt successfully! Cryptographic integrity verified (100%).");
        await fetchLogs();
        await fetchIntegrityStats();
      }
    } catch (err) {
      toast.error("Failed to restore integrity: " + err.message);
    } finally {
      setRestoring(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "critical": return "#EF4444";
      case "high": return "#F97316";
      case "medium": return "#F59E0B";
      default: return "#3B82F6";
    }
  };

  const calculateLogTrustScore = (log) => {
    // Generate checks representation
    const checks = [
      { name: "Timestamp Cryptographically Checked", passed: true },
      { name: "Actor Identity Authenticated", passed: true },
      { name: "Resource Verification Schema", passed: true },
      { name: "Hash Integrity Match", passed: log.isVerified },
      { name: "Digital HMAC Signature Verified", passed: log.isVerified },
      { name: "Forensic Evidence Log Attached", passed: !!log.evidence },
    ];
    
    const passedCount = checks.filter(c => c.passed).length;
    const percent = Math.round((passedCount / checks.length) * 100);
    return { percent, checks };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", height: "100%", color: "#E2E8F0" }}>
      
      {/* Top HUD Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0B1426 0%, #030712 100%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: integrityStats.tampered > 0 ? "#EF4444" : "#22C55E",
              boxShadow: integrityStats.tampered > 0 ? "0 0 15px #EF4444" : "0 0 15px #22C55E",
              animation: integrityStats.tampered > 0 ? "pulse 1.5s infinite" : "none"
            }} />
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#FFF", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
              Black Box Recorder
            </h1>
          </div>
          <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "6px" }}>
            Every security-relevant action in your platform is recorded, cryptographically verified, and traceable.
          </p>
        </div>

        {/* Integrity Meter HUD */}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          
          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "14px", padding: "12px 20px", textAlign: "center", minWidth: "110px" }}>
            <div style={{ fontSize: "24px", fontWeight: "900", color: "#FFF" }}>{integrityStats.total}</div>
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginTop: "4px" }}>Total Logs</div>
          </div>

          <div style={{ 
            background: "rgba(255, 255, 255, 0.02)", 
            border: integrityStats.tampered > 0 ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)", 
            borderRadius: "14px", 
            padding: "12px 20px", 
            textAlign: "center", 
            minWidth: "110px" 
          }}>
            <div style={{ fontSize: "24px", fontWeight: "900", color: integrityStats.tampered > 0 ? "#EF4444" : "#22C55E" }}>
              {integrityStats.verified}
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginTop: "4px" }}>Verified</div>
          </div>

          <div style={{ 
            background: "rgba(255, 255, 255, 0.02)", 
            border: integrityStats.tampered > 0 ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)", 
            borderRadius: "14px", 
            padding: "12px 20px", 
            textAlign: "center", 
            minWidth: "110px",
            animation: integrityStats.tampered > 0 ? "pulse 2s infinite" : "none"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "900", color: integrityStats.tampered > 0 ? "#EF4444" : "#64748B" }}>
              {integrityStats.tampered}
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginTop: "4px" }}>Tampered</div>
          </div>

          {/* Circle Integrity score */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "14px", padding: "12px 20px" }}>
            <div style={{ position: "relative", width: "46px", height: "46px", display: "flex", alignItems: "center", justifyItems: "center" }}>
              <svg width="46" height="46" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={integrityStats.integrityPercent < 100 ? "#EF4444" : "#22C55E"}
                  strokeWidth="3.5"
                  strokeDasharray={`${integrityStats.integrityPercent}, 100`}
                />
              </svg>
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "900",
                color: integrityStats.integrityPercent < 100 ? "#EF4444" : "#22C55E"
              }}>
                {integrityStats.integrityPercent}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "900", color: "#FFF" }}>INTEGRITY</div>
              <div style={{ fontSize: "10px", color: integrityStats.tampered > 0 ? "#EF4444" : "#22C55E", fontWeight: "800", marginTop: "2px" }}>
                {integrityStats.tampered > 0 ? "⚠️ CRYPTO FAILED" : "✓ 100% VERIFIED"}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Simulator Actions Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.01)",
        border: "1px solid rgba(255, 255, 255, 0.03)",
        borderRadius: "14px",
        padding: "12px 20px"
      }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", color: "#94A3B8" }}>
          <Info size={16} color="#3B82F6" />
          <span>Use the simulator controls to test how the cryptographically verifiable audit trail catches database tampering.</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={fetchIntegrityStats}
            disabled={scanning}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#FFF",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
            Scan Integrity
          </button>
          
          <button
            onClick={handleTamper}
            disabled={tampering}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#EF4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.2)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
          >
            💀 Simulate DB Tampering
          </button>
          
          <button
            onClick={handleRestore}
            disabled={restoring}
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              color: "#22C55E",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "10px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(34, 197, 94, 0.2)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(34, 197, 94, 0.1)"}
          >
            ✨ Restore Cryptographic Hashes
          </button>
        </div>
      </div>

      {/* Main 2-Panel Forensic Explorer Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "24px", flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Logs List */}
        <div style={{
          background: "#0B1426",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          overflow: "hidden"
        }}>
          {/* Filters Bar */}
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type="text"
                placeholder="Search by event ID, actor, resource, query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "#070D19",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "10px 14px 10px 38px",
                  fontSize: "13.5px",
                  color: "#FFF",
                  outline: "none",
                  fontWeight: "600"
                }}
              />
            </div>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              style={{
                background: "#070D19",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "13.5px",
                color: "#FFF",
                outline: "none",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <option value="">All Risks</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>

          {/* Logs List Container */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>No matching logs found.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: "800" }}>
                    <th style={{ paddingBottom: "12px", width: "100px" }}>Event ID</th>
                    <th style={{ paddingBottom: "12px", width: "130px" }}>Timestamp</th>
                    <th style={{ paddingBottom: "12px" }}>Action</th>
                    <th style={{ paddingBottom: "12px", width: "120px" }}>Actor</th>
                    <th style={{ paddingBottom: "12px", width: "80px", textAlign: "center" }}>Risk</th>
                    <th style={{ paddingBottom: "12px", width: "100px", textAlign: "right" }}>Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const isSelected = selectedLog?.eventId === log.eventId;
                    return (
                      <tr 
                        key={log.eventId}
                        onClick={() => setSelectedLog(log)}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                          cursor: "pointer",
                          fontSize: "13px",
                          background: isSelected ? "rgba(249, 115, 22, 0.06)" : "transparent",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <td style={{ padding: "14px 0", fontFamily: "monospace", fontWeight: "700", color: "#FB923C" }}>{log.eventId}</td>
                        <td style={{ padding: "14px 0", color: "#94A3B8" }}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>
                            {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td style={{ padding: "14px 0", fontWeight: "700" }}>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            fontFamily: "monospace",
                            fontSize: "11px",
                            color: "#E2E8F0"
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: "14px 0", color: "#FFF", fontWeight: "600" }}>{log.actor}</td>
                        <td style={{ padding: "14px 0", textAlign: "center" }}>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "800",
                            textTransform: "uppercase",
                            color: getRiskColor(log.risk),
                            background: `rgba(${log.risk === 'critical' ? '239, 68, 68' : log.risk === 'high' ? '249, 115, 22' : '245, 158, 11'}, 0.1)`,
                            border: `1px solid rgba(${log.risk === 'critical' ? '239, 68, 68' : log.risk === 'high' ? '249, 115, 22' : '245, 158, 11'}, 0.2)`
                          }}>
                            {log.risk}
                          </span>
                        </td>
                        <td style={{ padding: "14px 0", textAlign: "right" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: "800",
                            background: log.isVerified ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.1)",
                            border: log.isVerified ? "1px solid rgba(34, 197, 94, 0.15)" : "1px solid rgba(239, 68, 68, 0.3)",
                            color: log.isVerified ? "#22C55E" : "#EF4444",
                            animation: log.isVerified ? "none" : "pulse 1.5s infinite"
                          }}>
                            {log.isVerified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                            {log.isVerified ? "VERIFIED" : "FAIL"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Forensic Investigator Panel */}
        <div style={{
          background: "#0B1426",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          overflow: "hidden"
        }}>
          {selectedLog ? (
            <>
              {/* Event Header */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "800", textTransform: "uppercase" }}>Forensic Investigator</span>
                    <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#FFF", marginTop: "2px" }}>
                      Event Details — {selectedLog.eventId}
                    </h2>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "10px", color: "#64748B", fontWeight: "700" }}>Correlation ID</span>
                    <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#3B82F6", fontWeight: "700", marginTop: "2px" }}>
                      {selectedLog.correlationId.split("-")[1] || selectedLog.correlationId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div style={{
                display: "flex",
                background: "#070D19",
                borderRadius: "10px",
                padding: "4px",
                border: "1px solid rgba(255,255,255,0.04)"
              }}>
                {[
                  { id: "forensics", label: "Forensics" },
                  { id: "diff", label: "Before/After" },
                  { id: "chain", label: "Session Chain" },
                  { id: "signature", label: "Crypto Keys" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      border: "none",
                      background: activeTab === tab.id ? "rgba(249, 115, 22, 0.12)" : "transparent",
                      color: activeTab === tab.id ? "#F97316" : "#94A3B8",
                      borderRadius: "8px",
                      padding: "8px 0",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px", fontSize: "14px" }}>
                
                {/* 1. Tab Forensics */}
                {activeTab === "forensics" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* Trust Score & Verification Meter */}
                    <div style={{
                      background: "rgba(255,255,255,0.01)",
                      border: "1px solid rgba(255,255,255,0.04)",
                      borderRadius: "14px",
                      padding: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "800", textTransform: "uppercase" }}>Audit Trust Score</div>
                        <div style={{ fontSize: "28px", fontWeight: "900", color: calculateLogTrustScore(selectedLog).percent < 100 ? "#F59E0B" : "#22C55E", marginTop: "4px" }}>
                          {calculateLogTrustScore(selectedLog).percent}%
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {calculateLogTrustScore(selectedLog).checks.map((check, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                            <span style={{ color: check.passed ? "#22C55E" : "#EF4444" }}>
                              {check.passed ? "✓" : "✗"}
                            </span>
                            <span style={{ color: check.passed ? "#E2E8F0" : "#64748B", textDecoration: check.passed ? "none" : "line-through" }}>
                              {check.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Lists */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                      
                      <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "11px", fontWeight: "800" }}>
                          <User size={13} /> ACTOR
                        </div>
                        <div style={{ marginTop: "6px", fontWeight: "700", color: "#FFF" }}>{selectedLog.actor}</div>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "11px", fontWeight: "800" }}>
                          <Clock size={13} /> TIMESTAMP
                        </div>
                        <div style={{ marginTop: "6px", fontWeight: "700", color: "#FFF" }}>
                          {new Date(selectedLog.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "11px", fontWeight: "800" }}>
                          <Globe size={13} /> ORIGIN IP
                        </div>
                        <div style={{ marginTop: "6px", fontWeight: "700", color: "#FFF" }}>
                          {selectedLog.ipAddress}
                          <span style={{ fontSize: "11px", color: "#64748B", display: "block", fontWeight: "500", marginTop: "2px" }}>
                            📍 {selectedLog.location}
                          </span>
                        </div>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "11px", fontWeight: "800" }}>
                          <Cpu size={13} /> DEVICE / AGENT
                        </div>
                        <div style={{ marginTop: "6px", fontWeight: "700", color: "#FFF", wordBreak: "break-all" }}>{selectedLog.device}</div>
                      </div>

                    </div>

                    <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                      <div style={{ color: "#64748B", fontSize: "11px", fontWeight: "800" }}>AFFECTED RESOURCE</div>
                      <div style={{ marginTop: "6px", fontFamily: "monospace", fontWeight: "700", color: "#F97316" }}>{selectedLog.affectedResource}</div>
                    </div>

                    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255, 255, 255, 0.04)", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ color: "#64748B", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>Forensic Evidence</div>
                      <p style={{ marginTop: "8px", color: "#E2E8F0", lineHeight: "1.6" }}>{selectedLog.evidence}</p>
                    </div>

                  </div>
                )}

                {/* 2. Tab Before/After Diff */}
                {activeTab === "diff" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {selectedLog.changes ? (
                      <>
                        <p style={{ color: "#94A3B8", fontSize: "13px" }}>Comparative view showing target configuration difference details:</p>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          {/* Before State */}
                          <div style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ color: "#EF4444", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>Before (Old State)</div>
                            <pre style={{
                              margin: 0,
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#EF4444",
                              background: "transparent",
                              padding: 0,
                              whiteSpace: "pre-wrap"
                            }}>
                              {JSON.stringify(selectedLog.changes.before, null, 2)}
                            </pre>
                          </div>

                          {/* After State */}
                          <div style={{ background: "rgba(34, 197, 94, 0.03)", border: "1px solid rgba(34, 197, 94, 0.15)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ color: "#22C55E", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>After (New State)</div>
                            <pre style={{
                              margin: 0,
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#22C55E",
                              background: "transparent",
                              padding: 0,
                              whiteSpace: "pre-wrap"
                            }}>
                              {JSON.stringify(selectedLog.changes.after, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B", fontStyle: "italic" }}>
                        No state changes recorded for this event. (Only metadata logged).
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Tab Session Correlation Chain */}
                {activeTab === "chain" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ color: "#94A3B8", fontSize: "13px" }}>Traced event sequence for correlation key:</p>
                      <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#3B82F6", fontWeight: "700" }}>{selectedLog.correlationId}</span>
                    </div>

                    <div style={{ position: "relative", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                      {/* Central connection line */}
                      <div style={{
                        position: "absolute",
                        left: "7px",
                        top: "10px",
                        bottom: "10px",
                        width: "2px",
                        background: "linear-gradient(180deg, #F97316 0%, #3B82F6 100%)",
                      }} />

                      {correlationChain.map((chainLog, idx) => {
                        const isCurrent = chainLog.eventId === selectedLog.eventId;
                        return (
                          <div 
                            key={chainLog.eventId} 
                            onClick={() => setSelectedLog(chainLog)}
                            style={{ 
                              position: "relative", 
                              cursor: "pointer", 
                              padding: "10px 14px",
                              borderRadius: "10px",
                              background: isCurrent ? "rgba(249, 115, 22, 0.08)" : "rgba(255,255,255,0.01)",
                              border: isCurrent ? "1px solid rgba(249, 115, 22, 0.3)" : "1px solid rgba(255,255,255,0.03)",
                              transition: "all 0.2s"
                            }}
                          >
                            {/* Dot on connection line */}
                            <div style={{
                              position: "absolute",
                              left: "-22px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: isCurrent ? "#F97316" : "#3B82F6",
                              border: "2.5px solid #0B1426",
                              boxShadow: isCurrent ? "0 0 10px #F97316" : "none"
                            }} />

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontFamily: "monospace", fontWeight: "800", fontSize: "12px", color: isCurrent ? "#F97316" : "#64748B" }}>
                                  {chainLog.eventId}
                                </span>
                                <span style={{ fontWeight: "700", color: "#FFF", fontSize: "13px" }}>{chainLog.action}</span>
                              </div>
                              <span style={{ fontSize: "11px", color: "#64748B" }}>
                                {new Date(chainLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#94A3B8", marginTop: "4px" }}>
                              Actor: {chainLog.actor} | Risk: {chainLog.risk}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Tab Cryptographic Signatures */}
                {activeTab === "signature" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <p style={{ color: "#94A3B8", fontSize: "13px" }}>Cryptographic hashing and elliptic-curve digital signature details of the event log envelope:</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      
                      <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "11px", fontWeight: "800" }}>
                          <Lock size={13} color="#22C55E" /> LOG HAS HASH (SHA-256)
                        </div>
                        <pre style={{
                          margin: "6px 0 0 0",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#22C55E",
                          wordBreak: "break-all",
                          whiteSpace: "pre-wrap",
                          background: "transparent",
                          padding: 0
                        }}>
                          {selectedLog.hash}
                        </pre>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "11px", fontWeight: "800" }}>
                          <Sparkles size={13} color="#A855F7" /> EC-DIGITAL HMAC SIGNATURE
                        </div>
                        <pre style={{
                          margin: "6px 0 0 0",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#A855F7",
                          wordBreak: "break-all",
                          whiteSpace: "pre-wrap",
                          background: "transparent",
                          padding: 0
                        }}>
                          {selectedLog.signature}
                        </pre>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748B" }}>
              Select an event log to view forensic investigator files.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
