const axios = require("axios");
const BaseAdapter = require("./base.adapter");
const config = require("../../../config/env");

class OpenRouterAdapter extends BaseAdapter {
  constructor() {
    super("openrouter", { defaultModel: "openrouter/free" });
    this.defaultModel = "openrouter/free";
  }

  resolveModel(model) {
    const shorthandMap = {
      openai: "openrouter/free",
      claude: "nvidia/nemotron-nano-9b-v2:free",
      deepseek: "poolside/laguna-xs-2.1:free",
      gemini: "openrouter/free",
      llama: "openrouter/free",
      qwen: "poolside/laguna-xs-2.1:free",
      mistral: "nvidia/nemotron-nano-9b-v2:free",
      pollinations: "openrouter/free",
      mock: "openrouter/free",
    };
    const key = model?.toLowerCase();
    return shorthandMap[key] || model || config.openRouterModel || this.defaultModel;
  }

  async generate(messages, options = {}) {
    const primaryModel = this.resolveModel(options.model);
    const apiKey = options.apiKey || config.openRouterApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    const candidateModels = [
      primaryModel,
      "openrouter/free",
      "nvidia/nemotron-nano-9b-v2:free",
      "poolside/laguna-xs-2.1:free",
    ].filter(Boolean);

    let lastError = null;

    for (const modelName of Array.from(new Set(candidateModels))) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: modelName,
            messages: Array.isArray(messages) ? messages : [{ role: "user", content: String(messages) }],
            temperature: options.temperature || 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: options.timeout || 15000,
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
          return {
            content,
            model: modelName,
            provider: "openrouter",
            usage: {
              promptTokens: response.data.usage?.prompt_tokens || 0,
              completionTokens: response.data.usage?.completion_tokens || 0,
              totalTokens: response.data.usage?.total_tokens || 0,
            },
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("All OpenRouter fast free models failed");
  }

  async stream(messages, onToken, options = {}) {
    const primaryModel = this.resolveModel(options.model);
    const apiKey = options.apiKey || config.openRouterApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    const candidateModels = [
      primaryModel,
      "openrouter/free",
      "nvidia/nemotron-nano-9b-v2:free",
      "poolside/laguna-xs-2.1:free",
    ].filter(Boolean);

    let lastError = null;

    for (const modelName of Array.from(new Set(candidateModels))) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: modelName,
            messages: Array.isArray(messages) ? messages : [{ role: "user", content: String(messages) }],
            temperature: options.temperature || 0.7,
            stream: true,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            responseType: "stream",
            timeout: options.timeout || 20000,
          }
        );

        return await new Promise((resolve, reject) => {
          let accumulatedText = "";
          let buffer = "";

          response.data.on("data", (chunk) => {
            buffer += chunk.toString();
            let lines = buffer.split("\n");
            buffer = lines.pop();

            for (const line of lines) {
              const cleaned = line.trim();
              if (!cleaned) continue;
              if (cleaned.startsWith("data:")) {
                const raw = cleaned.slice(5).trim();
                if (raw === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(raw);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    accumulatedText += content;
                    if (onToken) onToken(content);
                  }
                } catch (e) {}
              }
            }
          });

          response.data.on("end", () => {
            resolve({
              content: accumulatedText,
              model: modelName,
              provider: "openrouter",
              usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            });
          });

          response.data.on("error", (err) => {
            reject(err);
          });
        });
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("All OpenRouter fast free stream models failed");
  }
}

module.exports = OpenRouterAdapter;
