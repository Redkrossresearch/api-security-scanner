/**
 * base.agent.js (Sprint 28 — Agent Framework Core)
 * Unified Base Class for all autonomous security agents.
 * Defines standard contract: run(context), tool execution, and JSON output schema.
 */
const llmRegistry = require("../llm/llm.registry");

class BaseAgent {
  constructor(name, role, systemPrompt, tools = [], model = null) {
    this.name = name;
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.tools = tools;
    this.model = model || "gemini";
  }

  /**
   * Execute agent reasoning cycle given a context
   * @param {Object|string} context User goal, scan finding, or conversation state
   * @param {Object} options Additional runtime options
   */
  async run(context, options = {}) {
    const startTime = Date.now();
    const contextText = typeof context === "object" ? JSON.stringify(context, null, 2) : String(context);

    console.log(`[agent:${this.name}] Starting execution phase as ${this.role}...`);

    try {
      const adapter = llmRegistry.getAdapter(this.model);
      const messages = [
        {
          role: "system",
          content: `You are ${this.name}, an expert ${this.role}.
${this.systemPrompt}

Available Tools: ${this.tools.map((t) => t.name || t).join(", ") || "None"}

Produce a structured, professional, action-oriented result.`,
        },
        {
          role: "user",
          content: `TASK / CONTEXT:\n${contextText}`,
        },
      ];

      const llmResult = await adapter.generate(messages, options);
      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        result: llmResult.content,
        reasoning: `Executed reasoning via model '${adapter.name}' in ${latencyMs}ms`,
        toolsUsed: this.tools.map((t) => t.name || t),
        latencyMs,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error(`[agent:${this.name}] Execution error:`, err.message);
      return {
        success: false,
        agent: this.name,
        role: this.role,
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = BaseAgent;
