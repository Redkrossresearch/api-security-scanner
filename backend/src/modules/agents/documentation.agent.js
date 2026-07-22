/**
 * documentation.agent.js (Sprint 36 — Documentation Agent)
 * Converts raw scanner findings and agent outputs into clean executive markdown reports.
 */
const BaseAgent = require("./base.agent");

class DocumentationAgent extends BaseAgent {
  constructor() {
    super(
      "DocumentationAgent",
      "Lead Technical Documentation Writer",
      `Synthesize multi-agent security outputs, technical scan findings, and architectural recommendations into beautifully formatted executive markdown reports, developer remediation guides, and compliance summaries.`,
      ["markdown-generation", "executive-summary", "compliance-documentation"],
      "gemini"
    );
  }
}

module.exports = new DocumentationAgent();
