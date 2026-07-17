const llmRegistry = require("../llm/llm.registry");

class BaseAgent {
  constructor(role, systemPrompt, defaultProvider = "openai") {
    if (this.constructor === BaseAgent) {
      throw new TypeError("Abstract class 'BaseAgent' cannot be instantiated directly.");
    }
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.provider = defaultProvider;
  }

  /**
   * Execute the agent's prompt reasoning loop
   */
  async run(context = {}, options = {}) {
    console.log(`[agent-core] Executing agent [${this.role}] using provider [${this.provider}]`);

    const adapter = llmRegistry.getAdapter(options.provider || this.provider);
    const messages = [
      {
        role: "system",
        content: this.systemPrompt,
      },
      {
        role: "user",
        content: typeof context === "string" ? context : JSON.stringify(context, null, 2),
      },
    ];

    try {
      const result = await adapter.generate(messages, {
        temperature: options.temperature || 0.7,
      });

      return {
        role: this.role,
        provider: this.provider,
        success: true,
        output: result.content,
      };
    } catch (err) {
      console.error(`[agent-core] Agent [${this.role}] failed: ${err.message}`);
      return {
        role: this.role,
        provider: this.provider,
        success: false,
        error: err.message,
      };
    }
  }
}

module.exports = BaseAgent;
