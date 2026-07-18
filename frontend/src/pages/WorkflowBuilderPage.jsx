import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { Plus, Play, Trash2, ArrowRight, CheckCircle, Clock, Zap } from "lucide-react";
import useSocketEvent from "../sockets/useSocketEvent";

export default function WorkflowBuilderPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Workflow Editor State
  const [workflowName, setWorkflowName] = useState("Custom Security Audit Pipeline");
  const [steps, setSteps] = useState([
    { id: "step1", stepType: "scan", dependsOn: [], config: { targetUrl: "http://localhost:5000/api" } },
    { id: "step2", stepType: "notify", dependsOn: ["step1"], config: { channel: "slack" } },
  ]);

  // Active Execution Run State
  const [activeRun, setActiveRun] = useState(null);
  const [runLogs, setRunLogs] = useState([]);

  // Live Agent WebSocket logs subscription
  useSocketEvent("agent:started", (data) => {
    setRunLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] 🚀 Agent '${data.agent}' started execution.`]);
  });

  useSocketEvent("agent:thinking", (data) => {
    setRunLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] 🤔 Agent '${data.agent}' is reasoning...`]);
  });

  useSocketEvent("agent:result", (data) => {
    if (data.error) {
      setRunLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Agent '${data.agent}' failed: ${data.error}`]);
    } else {
      const summary = data.output && data.output.length > 120 ? data.output.slice(0, 120) + "..." : (data.output || "");
      setRunLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ Agent '${data.agent}' finished:`,
        `   "${summary}"`
      ]);
    }
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.get("/workflows");
      if (res.data?.success) {
        setWorkflows(res.data.workflows || []);
      }
    } catch (err) {
      console.error("Failed to load workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const newId = `step${steps.length + 1}`;
    const lastStepId = steps.length > 0 ? steps[steps.length - 1].id : null;
    
    setSteps([
      ...steps,
      {
        id: newId,
        stepType: "cve_search",
        dependsOn: lastStepId ? [lastStepId] : [],
        config: {},
      },
    ]);
    toast.success(`Step ${newId} added to pipeline`);
  };

  const removeStep = (id) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStepType = (id, type) => {
    setSteps(
      steps.map((s) => (s.id === id ? { ...s, stepType: type } : s))
    );
  };

  const updateStepConfig = (id, key, val) => {
    setSteps(
      steps.map((s) =>
        s.id === id
          ? { ...s, config: { ...s.config, [key]: val } }
          : s
      )
    );
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error("Please provide a workflow name.");
      return;
    }

    try {
      const res = await api.post("/workflows", {
        name: workflowName,
        steps,
      });

      if (res.data?.success) {
        toast.success(`Workflow "${workflowName}" saved successfully!`);
        fetchWorkflows();
      }
    } catch (err) {
      toast.error("Failed to save workflow config.");
    }
  };

  const triggerWorkflow = async (workflowId) => {
    setRunLogs([]);
    const toastId = toast.loading("Launching topological workflow engine execution...");
    try {
      const res = await api.post(`/workflows/${workflowId}/run`, {
        input: "Target exposing vulnerable MongoDB parameters inside web logs.",
      });

      if (res.data?.success) {
        toast.success("Workflow execution triggered in background!", { id: toastId });
        setActiveRun({
          runId: res.data.runId,
          status: "running",
          steps: steps.map((s) => ({ id: s.id, status: "pending", stepType: s.stepType })),
        });
        
        // Start polling execution progress
        pollRunStatus(res.data.runId);
      }
    } catch (err) {
      toast.error("Failed to start workflow engine run.", { id: toastId });
    }
  };

  const pollRunStatus = (runId) => {
    let iterations = 0;
    const interval = setInterval(async () => {
      iterations++;
      try {
        const res = await api.get(`/workflows/run/${runId}`);
        if (res.data?.success && res.data.run) {
          setActiveRun(res.data.run);
          if (res.data.run.status === "completed" || res.data.run.status === "failed" || iterations >= 10) {
            clearInterval(interval);
            toast.success(`Workflow pipeline run finished with status: ${res.data.run.status.toUpperCase()}`);
          }
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 4000);
  };

  const deleteWorkflow = async (id) => {
    try {
      const res = await api.delete(`/workflows/${id}`);
      if (res.data?.success) {
        toast.success("Workflow configuration removed.");
        fetchWorkflows();
      }
    } catch (err) {
      toast.error("Failed to delete workflow.");
    }
  };

  return (
    <div style={{ color: "#FFF", padding: "10px" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Zap size={22} style={{ color: "#F97316" }} />
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900" }}>Custom Automated Workflows</h2>
        </div>
        <p style={{ margin: 0, color: "#94A3B8", fontSize: "13px" }}>
          Design dependency-aware execution graphs (DAGs) tying security scans, CVE threat mappings, and Slack alert integrations.
        </p>
      </div>

      <div style={{ display: "flex", gap: "24px", flexDirection: "row", flexWrap: "wrap" }}>
        
        {/* Left Column: List of saved workflows */}
        <div style={{ flex: 1, minWidth: "320px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#FFF", marginBottom: "16px" }}>ACTIVE WORKFLOW TEMPLATES</h3>
          {loading ? (
            <div style={{ color: "#64748B", fontSize: "13px" }}>Loading templates...</div>
          ) : workflows.length === 0 ? (
            <div style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px dashed rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              color: "#64748B"
            }}>
              No workflows saved. Build your first workflow pipeline on the right.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {workflows.map((wf) => (
                <div key={wf._id} style={{
                  background: "#090F1B",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#FFF" }}>{wf.name}</h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748B" }}>
                      Steps: {wf.steps?.map(s => s.stepType).join(" ➔ ")}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => triggerWorkflow(wf._id)}
                      style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        color: "#10B981",
                        fontSize: "11px",
                        fontWeight: "750",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <Play size={12} /> Run
                    </button>
                    <button
                      onClick={() => deleteWorkflow(wf._id)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        color: "#EF4444",
                        fontSize: "11px",
                        fontWeight: "750",
                        cursor: "pointer"
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active run monitor */}
          {activeRun && (
            <div style={{
              marginTop: "24px",
              background: "rgba(139, 92, 246, 0.05)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
              borderRadius: "14px",
              padding: "18px"
            }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#A78BFA", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Live Execution Run Status: {activeRun.status.toUpperCase()}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activeRun.steps.map((step) => (
                  <div key={step.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255, 255, 255, 0.02)",
                    padding: "8px 12px",
                    borderRadius: "8px"
                  }}>
                    <span style={{ fontSize: "12px", fontFamily: "monospace" }}>[{step.id}] {step.stepType.toUpperCase()}</span>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: step.status === "completed" ? "#10B981" : step.status === "running" ? "#F59E0B" : "#64748B"
                    }}>
                      {step.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Terminal Logs Panel */}
              {runLogs.length > 0 && (
                <div style={{
                  marginTop: "16px",
                  background: "#020617",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "12px",
                  maxHeight: "180px",
                  overflowY: "auto",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  lineHeight: "1.5",
                  color: "#38BDF8",
                  boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.8)"
                }}>
                  <div style={{
                    color: "#64748B",
                    fontSize: "10px",
                    fontWeight: "800",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    paddingBottom: "4px",
                    textTransform: "uppercase"
                  }}>
                    Orchestration Agent Thought Logs
                  </div>
                  {runLogs.map((log, idx) => (
                    <div key={idx} style={{ marginBottom: "6px", wordBreak: "break-all" }}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Workflow Creator Editor */}
        <div style={{ flex: 1.5, minWidth: "320px", background: "#070D19", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px" }}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ fontSize: "10px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>Workflow Name</label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              style={{
                width: "100%",
                background: "#020617",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#FFF",
                fontSize: "13.5px",
                fontWeight: "600",
                marginTop: "6px",
                outline: "none"
              }}
            />
          </div>

          <h3 style={{ fontSize: "12px", fontWeight: "800", color: "#94A3B8", marginBottom: "12px" }}>EXECUTION PIPELINE STEPS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {steps.map((step, idx) => (
              <div key={step.id} style={{
                background: "#020617",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                padding: "16px",
                position: "relative"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", color: "#F97316", fontWeight: "750", fontFamily: "monospace" }}>STEP {idx + 1} ({step.id})</span>
                  <button onClick={() => removeStep(step.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "11px" }}>Remove</button>
                </div>

                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "10px", color: "#64748B" }}>Step Type</label>
                    <select
                      value={step.stepType}
                      onChange={(e) => updateStepType(step.id, e.target.value)}
                      style={{
                        width: "100%",
                        background: "#090F1B",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "8px",
                        color: "#FFF",
                        marginTop: "4px"
                      }}
                    >
                      <option value="scan">🛡️ Security Scan Audit</option>
                      <option value="cve_search">🔍 CVE Threat Analysis</option>
                      <option value="owasp_mapping">🔖 OWASP Core Mapping</option>
                      <option value="notify">📤 Alert Integration Notification</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "10px", color: "#64748B" }}>Depends On</label>
                    <input
                      type="text"
                      placeholder="e.g. step1"
                      value={step.dependsOn.join(", ")}
                      onChange={(e) => {
                        const deps = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                        setSteps(steps.map((s) => (s.id === step.id ? { ...s, dependsOn: deps } : s)));
                      }}
                      style={{
                        width: "100%",
                        background: "#090F1B",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "8px",
                        color: "#FFF",
                        marginTop: "4px"
                      }}
                    />
                  </div>
                </div>

                {/* Conditional parameters based on type */}
                {step.stepType === "scan" && (
                  <div>
                    <label style={{ fontSize: "10px", color: "#64748B" }}>Scan Target URL</label>
                    <input
                      type="text"
                      value={step.config.targetUrl || ""}
                      onChange={(e) => updateStepConfig(step.id, "targetUrl", e.target.value)}
                      style={{
                        width: "100%",
                        background: "#090F1B",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "8px",
                        color: "#FFF",
                        marginTop: "4px"
                      }}
                    />
                  </div>
                )}

                {step.stepType === "notify" && (
                  <div>
                    <label style={{ fontSize: "10px", color: "#64748B" }}>Notification Channel</label>
                    <select
                      value={step.config.channel || "slack"}
                      onChange={(e) => updateStepConfig(step.id, "channel", e.target.value)}
                      style={{
                        width: "100%",
                        background: "#090F1B",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "8px",
                        color: "#FFF",
                        marginTop: "4px"
                      }}
                    >
                      <option value="slack">Slack Alert Webhook</option>
                      <option value="discord">Discord Alert Webhook</option>
                      <option value="jira">Jira Ticket Endpoint</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              onClick={addStep}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255, 255, 255, 0.15)",
                borderRadius: "10px",
                padding: "10px",
                color: "#FFF",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              <Plus size={14} /> Add Step
            </button>

            <button
              onClick={saveWorkflow}
              style={{
                flex: 1.2,
                background: "linear-gradient(135deg, #FF7A1A 0%, #F97316 100%)",
                border: "none",
                borderRadius: "10px",
                padding: "10px",
                color: "#FFF",
                fontSize: "12.5px",
                fontWeight: "850",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(249, 115, 22, 0.25)"
              }}
            >
              Save Pipeline Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
