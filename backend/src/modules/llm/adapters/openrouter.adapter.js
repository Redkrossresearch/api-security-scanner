const axios = require("axios");
const BaseAdapter = require("../base.adapter");
const config = require("../../../config/env");

class OpenRouterAdapter extends BaseAdapter {
  constructor() {
    super("openrouter", "meta-llama/llama-3.1-8b-instruct:free");
  }

  resolveModel(model) {
    const shorthandMap = {
      openai: config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free",
      claude: config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free",
      deepseek: config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free",
      llama: config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free",
      qwen: config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free",
      pollinations: config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free",
      mock: config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free",
    };
    const key = model?.toLowerCase();
    return shorthandMap[key] || model || config.openRouterModel || this.defaultModel;
  }

  async generate(messages, options = {}) {
    const modelName = this.resolveModel(options.model);
    const apiKey = options.apiKey || config.openRouterApiKey;

    if (!apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    return this.executeResilient(async () => {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: modelName,
          messages,
          temperature: options.temperature || 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: options.timeout || 30000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from OpenRouter");
      }

      return {
        content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0,
        },
      };
    }, modelName);
  }

  async stream(messages, onToken, options = {}) {
    const modelName = this.resolveModel(options.model);
    const apiKey = options.apiKey || config.openRouterApiKey;

    if (!apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    return this.executeResilient(async () => {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: modelName,
          messages,
          temperature: options.temperature || 0.7,
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          responseType: "stream",
          timeout: options.timeout || 30000,
        }
      );

      return new Promise((resolve, reject) => {
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
            usage: {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0,
            },
          });
        });

        response.data.on("error", (err) => {
          reject(err);
        });
      });
    }, modelName);
  }
}

module.exports = OpenRouterAdapter;
