const axios = require("axios");
const BaseAdapter = require("./base.adapter");

class GroqAdapter extends BaseAdapter {
  constructor() {
    super("groq", { defaultModel: "llama-3.3-70b-versatile" });
    this.defaultModel = "llama-3.3-70b-versatile";
  }

  resolveModel(model) {
    const shorthandMap = {
      llama: "llama-3.3-70b-versatile",
      groq: "llama-3.3-70b-versatile",
      fast: "llama-3.1-8b-instant",
    };
    const key = model?.toLowerCase();
    return shorthandMap[key] || model || this.defaultModel;
  }

  async generate(messages, options = {}) {
    const apiKey = options.apiKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
      const llmRegistry = require("../llm.registry");
      return llmRegistry.adapters.gemini.generate(messages, options);
    }

    const candidateModels = [
      this.resolveModel(options.model),
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
    ].filter(Boolean);

    let lastError = null;

    for (const modelName of Array.from(new Set(candidateModels))) {
      try {
        const response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
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
            provider: "groq",
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

    throw lastError || new Error("Groq generation failed");
  }

  async stream(messages, onToken, options = {}) {
    const apiKey = options.apiKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
      const llmRegistry = require("../llm.registry");
      return llmRegistry.adapters.gemini.stream(messages, onToken, options);
    }

    const candidateModels = [
      this.resolveModel(options.model),
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
    ].filter(Boolean);

    let lastError = null;

    for (const modelName of Array.from(new Set(candidateModels))) {
      try {
        const response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
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
            timeout: options.timeout || 15000,
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
              provider: "groq",
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

    throw lastError || new Error("Groq streaming failed");
  }
}

module.exports = GroqAdapter;
