/**
 * planner.agent.js (Sprint 31 — Planner Agent)
 * Decomposes complex security goals into ordered DAG sub-tasks.
 */
const BaseAgent = require("./base.agent");

class PlannerAgent extends BaseAgent {
  constructor() {
    super(
      "PlannerAgent",
      "Lead Security Architect & Planner",
      `Decompose the high-level security goal or request into a step-by-step ordered plan of sub-tasks.
Output a JSON execution graph containing an array of steps. Each step must include:
{
  "id": 1,
  "agent": "SecurityAgent" | "PentestingAgent" | "ResearchAgent" | "CVEAnalystAgent",
  "task": "Specific task description",
  "dependsOn": []
}`,
      ["decomposeGoal", "buildTaskDAG"],
      "openai"
    );
  }

  async run(context, options = {}) {
    const baseResponse = await super.run(context, options);
    if (!baseResponse.success) return baseResponse;

    // Try to parse structured plan steps from result
    try {
      const match = baseResponse.result.match(/\[[\s\S]*\]/);
      if (match) {
        baseResponse.planSteps = JSON.parse(match[0]);
      }
    } catch (e) {
      // Fallback default plan steps
      baseResponse.planSteps = [
        { id: 1, agent: "SecurityAgent", task: "Analyze security posture and endpoints", dependsOn: [] },
        { id: 2, agent: "PentestingAgent", task: "Evaluate potential exploit vectors", dependsOn: [1] },
        { id: 3, agent: "ResearchAgent", task: "Search RAG & knowledge base for OWASP/CVE references", dependsOn: [1] },
      ];
    }

    return baseResponse;
  }
}

module.exports = new PlannerAgent();
