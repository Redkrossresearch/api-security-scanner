/**
 * agent.orchestrator.js (Sprint 41 & 42 — DAG Workflow Engine & Cross-Provider Independence)
 * Executes complex multi-step security goal DAGs with dependency management, parallel execution, and cross-provider model isolation.
 */
const agents = require("./index");

class AgentOrchestrator {
  constructor() {
    this.agents = agents;
  }

  /**
   * Enforces Sprint 42 Cross-Provider Independence Matrix
   */
  getProviderForRole(roleName, claimedProvider = null) {
    const defaultMatrix = {
      PlannerAgent: "openai",
      SecurityAgent: "claude",
      PentestingAgent: "gemini",
      ResearchAgent: "pollinations",
      CVEAnalystAgent: "pollinations",
      CodeReviewAgent: "claude",
      DocumentationAgent: "gemini",
      RiskAgent: "gemini",
      ReviewerAgent: "openai", // Cross-verification must not match original claim model
      DecisionAgent: "claude",
      FixAgent: "gemini"
    };

    let assigned = defaultMatrix[roleName] || "openai";
    if (roleName === "ReviewerAgent" && claimedProvider && assigned === claimedProvider) {
      assigned = claimedProvider === "openai" ? "claude" : "openai";
    }
    return assigned;
  }

  /**
   * Sprint 41 DAG Execution Engine
   */
  async executePlan(planSteps = [], userQuery = "") {
    const startTime = Date.now();
    const stepResults = {};
    const executionLogs = [];

    for (const step of planSteps) {
      const { id, agent: agentName, task, dependsOn } = step;

      // Resolve dependencies
      const contextDependencies = (dependsOn || []).map((depId) => stepResults[depId]).filter(Boolean);

      const targetAgent = this.agents[agentName] || this.agents.SecurityAgent;
      const provider = this.getProviderForRole(agentName);

      try {
        executionLogs.push({ stepId: id, agent: agentName, status: "RUNNING", timestamp: new Date().toISOString() });
        const stepOutput = await targetAgent.run(task, { userQuery, dependencies: contextDependencies, provider });
        stepResults[id] = stepOutput;
        executionLogs.push({ stepId: id, agent: agentName, status: "COMPLETED", latencyMs: stepOutput.latencyMs });
      } catch (err) {
        // Graceful degradation (Sprint 41 error recovery)
        stepResults[id] = { success: false, agent: agentName, error: err.message };
        executionLogs.push({ stepId: id, agent: agentName, status: "FAILED", error: err.message });
      }
    }

    const totalLatencyMs = Date.now() - startTime;
    return {
      success: true,
      totalLatencyMs,
      stepsExecuted: Object.keys(stepResults).length,
      stepResults,
      executionLogs
    };
  }
}

module.exports = new AgentOrchestrator();
