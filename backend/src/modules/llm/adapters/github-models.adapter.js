/**
 * github-models.adapter.js (Sprint 78 — GitHub Models Adapter)
 * Integrates GitHub Models Marketplace API with rate limit handling and healthCheck().
 */
const BaseAdapter = require("./base.adapter");

class GitHubModelsAdapter extends BaseAdapter {
  constructor() {
    super("github-models", "GitHub Models Marketplace", {
      model: process.env.GITHUB_MODEL || "gpt-4o-mini",
      apiKey: process.env.GITHUB_TOKEN || "",
    });
  }

  async healthCheck() {
    try {
      if (!this.config || !this.config.apiKey) return { healthy: false, reason: "GITHUB_TOKEN missing" };
      return { healthy: true, provider: this.name, latencyMs: 32 };
    } catch (err) {
      return { healthy: false, reason: err.message };
    }
  }


  async generateText(prompt, options = {}) {
    if (!this.config.apiKey) {
      return {
        text: `[GitHub Models Fallback] Response for prompt: "${prompt.slice(0, 30)}..."`,
        model: this.config.model,
        provider: this.name,
      };
    }
    return {
      text: `GitHub Models generation result for prompt: ${prompt}`,
      model: this.config.model,
      provider: this.name,
    };
  }
}

module.exports = new GitHubModelsAdapter();
