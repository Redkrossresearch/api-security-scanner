/**
 * fix.agent.js (Sprint 40 — Autonomous Code Fix Agent)
 * Generates concrete, drop-in defensive code patch snippets to remediate security vulnerabilities.
 */
const BaseAgent = require("./base.agent");

class FixAgent extends BaseAgent {
  constructor() {
    super(
      "FixAgent",
      "Autonomous Remediation & Patch Engineer",
      `Generate secure, production-ready code patches and defensive configuration snippets (Node.js, Express, Python, SQL) to resolve identified security vulnerabilities.`,
      ["patch-generation", "defensive-refactoring", "secure-coding-fix"],
      "gemini"
    );
  }
}

module.exports = new FixAgent();
