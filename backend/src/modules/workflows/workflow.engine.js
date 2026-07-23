/**
 * workflow.engine.js (Sprint 68 — Saved Workflow Execution Engine)
 * Executes saved workflows in sequence using existing tools and autonomous agents.
 */
const toolRegistry = require("../agents/tools/tool.registry");

class WorkflowEngine {
  async executeWorkflow(workflowDefinition, targetUrl = "https://api.example.com") {
    console.log(`[WorkflowEngine] Executing workflow "${workflowDefinition.name}" with ${workflowDefinition.steps?.length || 0} steps...`);
    const results = [];

    const steps = workflowDefinition.steps || [
      { stepIndex: 1, actionType: "crawl" },
      { stepIndex: 2, actionType: "scan" },
    ];

    for (const step of steps) {
      console.log(`[WorkflowEngine] Executing step ${step.stepIndex}: ${step.actionType}`);
      let stepOutput = null;

      try {
        if (step.actionType === "crawl") {
          stepOutput = await toolRegistry.executeTool("crawl-website", { targetUrl });
        } else if (step.actionType === "scan") {
          stepOutput = await toolRegistry.executeTool("run-scanner-module", { moduleName: "sqli", targetUrl });
        } else if (step.actionType === "rag") {
          stepOutput = await toolRegistry.executeTool("query-rag", { query: "API security vulnerabilities" });
        } else {
          stepOutput = { actionType: step.actionType, status: "completed" };
        }
      } catch (err) {
        stepOutput = { actionType: step.actionType, status: "failed", error: err.message };
      }

      results.push({
        stepIndex: step.stepIndex,
        actionType: step.actionType,
        output: stepOutput,
      });
    }

    return {
      success: true,
      workflowName: workflowDefinition.name,
      totalStepsExecuted: results.length,
      stepResults: results,
    };
  }
}

module.exports = new WorkflowEngine();
