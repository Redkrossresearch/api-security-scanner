const { retryWithBackoff } = require("../copilot/ai.resilience");

class BaseAdapter {
  constructor(providerName, defaultModel) {
    if (this.constructor === BaseAdapter) {
      throw new TypeError("Abstract class 'BaseAdapter' cannot be instantiated directly.");
    }
    this.providerName = providerName;
    this.defaultModel = defaultModel;
  }

  /**
   * Helper utility to wrap logic with standard retry and observability limits
   */
  async executeResilient(operation, modelName) {
    const start = Date.now();
    const providerAndModel = `${this.providerName}:${modelName}`;
    try {
      const result = await retryWithBackoff(operation, providerAndModel, 2, 500);
      const latency = Date.now() - start;
      console.log(`[llm-adapter] [SUCCESS] Provider: ${this.providerName} | Model: ${modelName} | Latency: ${latency}ms`);
      
      const llmMetrics = require("./llm.metrics");
      llmMetrics.recordSuccess(providerAndModel, latency, result?.usage || {});

      const cb = require("./router/llm.circuitbreaker");
      cb.recordSuccess(this.providerName);

      return result;
    } catch (err) {
      const latency = Date.now() - start;
      console.error(`[llm-adapter] [FAILURE] Provider: ${this.providerName} | Model: ${modelName} | Latency: ${latency}ms | Error: ${err.message}`);
      
      const llmMetrics = require("./llm.metrics");
      llmMetrics.recordFailure(providerAndModel, latency);

      const cb = require("./router/llm.circuitbreaker");
      cb.recordFailure(this.providerName);

      throw err;
    }
  }

  async generate(messages, options = {}) {
    throw new Error("Method 'generate(messages, options)' must be implemented by adapter subclasses.");
  }

  async stream(messages, onToken, options = {}) {
    throw new Error("Method 'stream(messages, onToken, options)' must be implemented by adapter subclasses.");
  }

  async embed(text, options = {}) {
    throw new Error("Method 'embed(text, options)' must be implemented by adapter subclasses.");
  }

  async vision(imageBuffer, messages, options = {}) {
    throw new Error("Method 'vision(imageBuffer, messages, options)' must be implemented by adapter subclasses.");
  }

  async toolCalling(messages, tools, options = {}) {
    throw new Error("Method 'toolCalling(messages, tools, options)' must be implemented by adapter subclasses.");
  }
}

module.exports = BaseAdapter;
