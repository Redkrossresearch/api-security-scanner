/**
 * Agent Roster Export (Sprints 28, 31, 32, 34)
 */
const baseAgent = require("./base.agent");
const plannerAgent = require("./planner.agent");
const securityAgent = require("./security.agent");
const pentestingAgent = require("./pentesting.agent");
const researchAgent = require("./research.agent");
const cveAgent = require("./cve.agent");
const codeReviewAgent = require("./code-review.agent");
const documentationAgent = require("./documentation.agent");
const riskAgent = require("./risk.agent");
const reviewerAgent = require("./reviewer.agent");
const decisionAgent = require("./decision.agent");
const fixAgent = require("./fix.agent");

module.exports = {
  BaseAgent: baseAgent,
  PlannerAgent: plannerAgent,
  SecurityAgent: securityAgent,
  PentestingAgent: pentestingAgent,
  ResearchAgent: researchAgent,
  CVEAnalystAgent: cveAgent,
  CodeReviewAgent: codeReviewAgent,
  DocumentationAgent: documentationAgent,
  RiskAgent: riskAgent,
  ReviewerAgent: reviewerAgent,
  DecisionAgent: decisionAgent,
  FixAgent: fixAgent
};
