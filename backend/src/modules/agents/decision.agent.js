const BaseAgent = require("./base.agent");

class DecisionAgent extends BaseAgent {
  constructor() {
    super(
      "FinalDecisionAgent",
      "You are the Final Decision Agent. Your role is to synthesize all findings, claims, and audit critiques from the other agents into a unified, coherent, and action-oriented Markdown Security Report. Format the report with clear severity levels, remediation steps, and evidence links.",
      "openrouter" // Sprint 30 target provider
    );
  }
}

module.exports = new DecisionAgent();
