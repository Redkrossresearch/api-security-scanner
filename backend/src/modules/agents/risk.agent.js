/**
 * risk.agent.js (Sprint 37 — Risk Assessor Agent)
 * Evaluates business impact, calculates CVSS 3.1 ratings, and ranks financial risk.
 */
const BaseAgent = require("./base.agent");
const { calculateCvssScore } = require("../../utils/cvss.util");


class RiskAgent extends BaseAgent {
  constructor() {
    super(
      "RiskAgent",
      "Chief Information Security & Risk Officer",
      `Evaluate security findings through a business-risk lens. Wrap CVSS 3.1 calculation engines, asset criticality metrics, and data exposure severity to rank vulnerabilities by financial and compliance impact.`,
      ["cvss-v3-calculator", "business-impact-scoring", "compliance-risk-mapping"],
      "gemini"
    );
  }

  async run(taskDescription, context = {}) {
    const baseResult = await super.run(taskDescription, context);
    if (context.vectorString) {
      baseResult.result.cvssDetails = calculateCvssScore(context.vectorString);
    }
    return baseResult;
  }
}

module.exports = new RiskAgent();
