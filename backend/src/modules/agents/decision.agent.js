/**
 * decision.agent.js (Sprint 39 — Final Decision Agent)
 * Synthesizes outputs from all prior agents to resolve conflicts and output a single unified verdict.
 */
const BaseAgent = require("./base.agent");

class DecisionAgent extends BaseAgent {
  constructor() {
    super(
      "DecisionAgent",
      "Executive Decision Synthesizer",
      `Synthesize inputs from Security, Pentesting, Research, CodeReview, Risk, and Reviewer agents. Resolve contradictions, weigh consensus evidence, and output a authoritative final verdict with consolidated confidence score and evidence chain.`,
      ["consensus-synthesis", "conflict-resolution", "final-verdict-generation"],
      "claude"
    );
  }
}

module.exports = new DecisionAgent();
