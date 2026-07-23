const axios = require("axios");
const BaseAdapter = require("./base.adapter");

class GeminiAdapter extends BaseAdapter {
  constructor() {
    super("gemini", { defaultModel: "gemini-flash-latest" });
    this.defaultModel = "gemini-flash-latest";
  }

  async generate(messages, options = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const llmRegistry = require("../llm.registry");
      if (process.env.OPENROUTER_API_KEY) {
        return llmRegistry.adapters.openrouter.generate(messages, { ...options, model: "gemini" });
      } else {
        return llmRegistry.adapters.pollinations.generate(messages, { ...options, model: "gemini" });
      }
    }

    let contents = [];
    if (typeof messages === "string") {
      contents = [{ parts: [{ text: messages }] }];
    } else if (Array.isArray(messages)) {
      contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
      }));
    }

    const candidateModels = [
      options.model,
      "gemini-flash-latest",
      "gemini-2.0-flash",
      "gemini-pro-latest",
      "gemini-2.5-flash",
    ].filter(Boolean);

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await axios.post(
          url,
          { contents },
          { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );

        const candidateText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return {
            content: candidateText,
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            provider: "gemini",
            model,
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("Failed to generate content with Gemini API");
  }

  async stream(messages, onToken, options = {}) {
    const res = await this.generate(messages, options);
    const content = res.content || "";

    if (typeof onToken === "function" && content) {
      // Simulate smooth streaming tokens if chunking text
      const chunks = content.match(/.{1,12}/g) || [content];
      for (const chunk of chunks) {
        onToken(chunk);
      }
    }

    return res;
  }
}

module.exports = GeminiAdapter;
