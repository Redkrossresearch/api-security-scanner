/**
 * Agent Roster Export (Sprints 28, 31, 32, 34)
 */
const BaseAgent = require("./base.agent");
const plannerAgent = require("./planner.agent");
const securityAgent = require("./security.agent");
const pentestingAgent = require("./pentesting.agent");
const researchAgent = require("./research.agent");
const cveAgent = require("./cve.agent");

module.exports = {
  BaseAgent,
  plannerAgent,
  securityAgent,
  pentestingAgent,
  researchAgent,
  cveAgent,
};
