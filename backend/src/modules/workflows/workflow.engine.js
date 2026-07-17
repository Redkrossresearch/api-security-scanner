const Workflow = require("./workflow.model");
const agentOrchestrator = require("../agents/agent.orchestrator");
const { dispatchScanNotification } = require("../settings/notification.service");

class WorkflowEngine {
  constructor() {
    this.activeRuns = {}; // runId -> { status, steps }
  }

  /**
   * Execute a workflow steps configuration graph (DAG)
   */
  async executeWorkflow(workflowId, userId, initialInput = "") {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found.`);
    }

    const runId = `run-${Date.now()}`;
    console.log(`[workflow-engine] Starting run ${runId} for workflow "${workflow.name}"`);
    
    this.activeRuns[runId] = {
      name: workflow.name,
      status: "running",
      steps: workflow.steps.map((s) => ({ id: s.id, status: "pending", output: null })),
    };

    // Helper to run step logic
    const executeStep = async (step) => {
      console.log(`[workflow-engine] [${runId}] Executing step: ${step.id} (${step.stepType})`);
      const runStep = this.activeRuns[runId].steps.find((s) => s.id === step.id);
      runStep.status = "running";
      
      try {
        let output = "";
        
        switch (step.stepType) {
          case "scan":
            // Trigger pentester agent reasoning
            const pentestResult = await agentOrchestrator.executePipeline(initialInput, userId);
            output = pentestResult.finalReport;
            break;
            
          case "cve_search":
            const cveAgent = require("../agents/cve.agent");
            const cveRes = await cveAgent.run({ scanFinding: initialInput });
            output = cveRes.output;
            break;

          case "owasp_mapping":
            const reviewerAgent = require("../agents/reviewer.agent");
            const revRes = await reviewerAgent.run({ scanFinding: initialInput });
            output = revRes.output;
            break;

          case "notify":
            // Triggers notifications (Sprint 50)
            await dispatchScanNotification({
              userId,
              status: "completed",
              targetUrl: "Automated Workflow: " + workflow.name,
              scanId: runId,
              totalFindings: 0,
              criticalCount: 0,
              highCount: 0,
              mediumCount: 0,
              lowCount: 0,
            });
            output = "Notification sent.";
            break;

          default:
            output = `Executed safe default for ${step.stepType}`;
        }

        runStep.status = "completed";
        runStep.output = output;
      } catch (err) {
        console.error(`[workflow-engine] Step ${step.id} failed:`, err.message);
        runStep.status = "failed";
        runStep.output = `Error: ${err.message}`;
      }
    };

    // Build a topological execution plan based on 'dependsOn' array (Sprint 50 & 51 task graph)
    const runGraph = async () => {
      const completed = new Set();
      const pending = [...workflow.steps];

      while (pending.length > 0) {
        // Find steps that have all dependencies met
        const ready = pending.filter((step) => 
          step.dependsOn.every((depId) => completed.has(depId))
        );

        if (ready.length === 0) {
          console.warn("[workflow-engine] Circular dependency detected in workflow steps configuration!");
          break;
        }

        // Execute ready steps parallelly (Sprint 49 parallel task graph execution!)
        const promises = ready.map(async (step) => {
          await executeStep(step);
          completed.add(step.id);
          // Remove from pending
          const idx = pending.findIndex((p) => p.id === step.id);
          if (idx !== -1) pending.splice(idx, 1);
        });

        await Promise.all(promises);
      }

      this.activeRuns[runId].status = "completed";
      console.log(`[workflow-engine] Workflow run ${runId} finished.`);

      // Final complete notification alert (Sprint 50)
      await dispatchScanNotification({
        userId,
        status: "completed",
        targetUrl: "Automated Workflow Result: " + workflow.name,
        scanId: runId,
        totalFindings: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
      });
    };

    // Run execution loop asynchronously to avoid blocking HTTP threads
    runGraph().catch((err) => {
      console.error(`[workflow-engine] Workflow run ${runId} crashed:`, err.message);
      this.activeRuns[runId].status = "failed";
    });

    return {
      runId,
      status: "started",
    };
  }
}

module.exports = new WorkflowEngine();
