const axios = require("axios");
const BaseAdapter = require("../base.adapter");

class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super("claude", "claude-3-5-sonnet-20241022");
  }

  async generate(messages, options = {}) {
    const modelName = options.model || this.defaultModel;
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const llmRegistry = require("../llm.registry");
      if (process.env.OPENROUTER_API_KEY) {
        console.log(`[claude-adapter] Native key missing. Delegating to OpenRouter.`);
        return llmRegistry.adapters.openrouter.generate(messages, {
          ...options,
          model: "claude"
        });
      } else {
        console.log(`[claude-adapter] Native and OpenRouter keys missing. Delegating to Pollinations.`);
        return llmRegistry.adapters.pollinations.generate(messages, {
          ...options,
          model: "claude"
        });
      }
    }

    return this.executeResilient(async () => {
      const systemMessage = messages.find((m) => m.role === "system");
      const filteredMessages = messages.filter((m) => m.role !== "system");

      const body = {
        model: modelName,
        max_tokens: options.maxTokens || 4096,
        messages: filteredMessages,
        temperature: options.temperature || 0.7,
      };

      if (systemMessage) {
        body.system = systemMessage.content;
      }

      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        body,
        {
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          timeout: options.timeout || 30000,
        }
      );

      const content = response.data?.content?.[0]?.text;
      if (!content) {
        throw new Error("Empty response from Anthropic");
      }

      return {
        content,
        usage: {
          promptTokens: response.data.usage?.input_tokens || 0,
          completionTokens: response.data.usage?.output_tokens || 0,
          totalTokens: (response.data.usage?.input_tokens || 0) + (response.data.usage?.output_tokens || 0),
        },
      };
    }, modelName);
  }

  async stream(messages, onToken, options = {}) {
    const modelName = options.model || this.defaultModel;
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const llmRegistry = require("../llm.registry");
      if (process.env.OPENROUTER_API_KEY) {
        console.log(`[claude-adapter] Native key missing. Delegating streaming to OpenRouter.`);
        return llmRegistry.adapters.openrouter.stream(messages, onToken, {
          ...options,
          model: "claude"
        });
      } else {
        console.log(`[claude-adapter] Native and OpenRouter keys missing. Delegating streaming to Pollinations.`);
        return llmRegistry.adapters.pollinations.stream(messages, onToken, {
          ...options,
          model: "claude"
        });
      }
    }

    return this.executeResilient(async () => {
      const systemMessage = messages.find((m) => m.role === "system");
      const filteredMessages = messages.filter((m) => m.role !== "system");

      const body = {
        model: modelName,
        max_tokens: options.maxTokens || 4096,
        messages: filteredMessages,
        temperature: options.temperature || 0.7,
        stream: true,
      };

      if (systemMessage) {
        body.system = systemMessage.content;
      }

      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        body,
        {
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
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
              try {
                const parsed = JSON.parse(raw);
                if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                  const token = parsed.delta.text;
                  accumulatedText += token;
                  if (onToken) onToken(token);
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

module.exports = ClaudeAdapter;
