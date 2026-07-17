const BaseAgent = require("./base.agent");

class DocumentationAgent extends BaseAgent {
  constructor() {
    super(
      "DocumentationAgent",
      "You are a Documentation Agent. Your role is to format and compile findings into structured, clean, and professional compliance templates (such as SOC2, PCI-DSS, or ISO 27001 evidence packages). Make sure the output is readable and contains exact remediation snippets.",
      "gemini"
    );
  }
}

module.exports = new DocumentationAgent();
