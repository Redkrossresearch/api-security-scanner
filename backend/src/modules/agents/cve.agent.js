/**
 * cve.agent.js (Sprint 34 — CVE Analyst Agent)
 * Specializes in CVE lookup, CVSS 3.1 score calculation, and NVD/OWASP taxonomy mapping.
 */
const BaseAgent = require("./base.agent");

class CVEAnalystAgent extends BaseAgent {
  constructor() {
    super(
      "CVEAnalystAgent",
      "CVE & CVSS Scoring Analyst",
      `Map identified security vulnerabilities to canonical CVE identifiers, calculate CVSS 3.1 vector strings, and assign exploitability scores based on NVD and OWASP standards.`,
      ["cve-database-lookup", "cvss-calculator"],
      "groq"
    );
  }
}

module.exports = new CVEAnalystAgent();
