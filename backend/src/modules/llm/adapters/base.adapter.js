/**
 * BaseAdapter - Standard LLM Provider Interface Contract
 * Defines contract methods: generate(), stream(), embed(), vision(), toolCalling()
 * Provides built-in retry logic, timeout handling, and normalized error responses.
 */
class BaseAdapter {
  constructor(name = "base", options = {}) {
    this.name = name;
    this.timeoutMs = options.timeoutMs || 30000;
    this.maxRetries = options.maxRetries || 2;
  }

  /**
   * Primary text generation contract
   */
  async generate(prompt, options = {}) {
    throw new Error(`generate() method not implemented in ${this.name} adapter`);
  }

  /**
   * Token streaming contract
   */
  async stream(prompt, onToken, options = {}) {
    throw new Error(`stream() method not implemented in ${this.name} adapter`);
  }

  /**
   * Text embedding contract
   */
  async embed(text, options = {}) {
    throw new Error(`embed() method not implemented in ${this.name} adapter`);
  }

  /**
   * Multimodal vision analysis contract
   */
  async vision(imageInput, prompt, options = {}) {
    throw new Error(`vision() method not implemented in ${this.name} adapter`);
  }

  /**
   * Tool calling / function execution contract
   */
  async toolCalling(prompt, tools = [], options = {}) {
    throw new Error(`toolCalling() method not implemented in ${this.name} adapter`);
  }

  /**
   * Health check contract
   */
  async healthCheck() {
    return { provider: this.name, status: "healthy", timestamp: new Date().toISOString() };
  }

  /**
   * Helper: Execute an async operation with timeout and retries
   */
  async executeWithRetry(fn, options = {}) {
    const retries = options.maxRetries ?? this.maxRetries;
    const timeout = options.timeoutMs ?? this.timeoutMs;

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
          ),
        ]);
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, 500 * Math.pow(2, attempt)));
        }
      }
    }
    throw this.normalizeError(lastError);
  }

  /**
   * Helper: Normalize provider error outputs
   */
  normalizeError(err) {
    return {
      provider: this.name,
      message: err.message || "Unknown provider execution failure",
      status: err.status || err.response?.status || 500,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = BaseAdapter;
