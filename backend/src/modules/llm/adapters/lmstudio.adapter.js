const axios = require("axios");
const BaseAdapter = require("../base.adapter");

class LMStudioAdapter extends BaseAdapter {
  constructor() {
    super("lmstudio", "meta-llama-3-8b-instruct");
  }

  async generate(messages, options = {}) {
    const modelName = options.model || this.defaultModel;
    const host = process.env.LMSTUDIO_HOST || "http://localhost:1234";

    return this.executeResilient(async () => {
      const response = await axios.post(
        `${host}/v1/chat/completions`,
        {
          model: modelName,
          messages,
          temperature: options.temperature || 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: options.timeout || 30000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from LM Studio");
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
    const modelName = options.model || this.defaultModel;
    const host = process.env.LMSTUDIO_HOST || "http://localhost:1234";

    return this.executeResilient(async () => {
      const response = await axios.post(
        `${host}/v1/chat/completions`,
        {
          model: modelName,
          messages,
          temperature: options.temperature || 0.7,
          stream: true,
        },
        {
          headers: {
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

module.exports = LMStudioAdapter;
