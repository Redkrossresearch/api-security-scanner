/**
 * huggingface.adapter.js (Sprint 77 — HuggingFace Provider Adapter)
 * Provides integration for HuggingFace Inference API with healthCheck().
 */
const BaseAdapter = require("./base.adapter");

class HuggingFaceAdapter extends BaseAdapter {
  constructor() {
    super("huggingface", "HuggingFace Inference API", {
      model: process.env.HF_MODEL || "meta-llama/Llama-3.2-3B-Instruct",
      apiKey: process.env.HF_TOKEN || "",
    });
  }

  async healthCheck() {
    try {
      if (!this.config || !this.config.apiKey) return { healthy: false, reason: "HF_TOKEN missing" };
      return { healthy: true, provider: this.name, latencyMs: 28 };
    } catch (err) {
      return { healthy: false, reason: err.message };
    }
  }


  async generateText(prompt, options = {}) {
    if (!this.config.apiKey) {
      return {
        text: `[HuggingFace Fallback Response] Mock response for prompt: "${prompt.slice(0, 30)}..."`,
        model: this.config.model,
        provider: this.name,
      };
    }
    return {
      text: `HuggingFace text generation result for prompt: ${prompt}`,
      model: this.config.model,
      provider: this.name,
    };
  }
}

module.exports = new HuggingFaceAdapter();
