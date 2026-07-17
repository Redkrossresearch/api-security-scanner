const axios = require("axios");
const BaseAdapter = require("../base.adapter");

class PollinationsAdapter extends BaseAdapter {
  constructor() {
    super("pollinations", "openai");
  }

  async generate(messages, options = {}) {
    const modelName = options.model || this.defaultModel;
    const temp = Math.min(Math.max(parseFloat(options.temperature) || 0.7, 0.1), 1.5);

    return this.executeResilient(async () => {
      const response = await axios.post(
        "https://text.pollinations.ai/",
        {
          messages,
          model: modelName,
          temperature: temp,
        },
        {
          timeout: options.timeout || 30000,
        }
      );

      // Pollinations returns text directly in response.data when jsonMode is not set
      let content = "";
      if (typeof response.data === "string" && response.data.trim().length > 0) {
        content = response.data;
      } else if (response.data && typeof response.data === "object") {
        content = response.data.response || response.data.choices?.[0]?.message?.content;
      }

      if (!content) {
        throw new Error("Empty response from Pollinations");
      }

      return {
        content,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    }, modelName);
  }

  async stream(messages, onToken, options = {}) {
    const modelName = options.model || this.defaultModel;
    const temp = Math.min(Math.max(parseFloat(options.temperature) || 0.7, 0.1), 1.5);

    return this.executeResilient(async () => {
      const response = await axios.post(
        "https://text.pollinations.ai/",
        {
          messages,
          model: modelName,
          temperature: temp,
          stream: true,
        },
        {
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
                const content = parsed.choices?.[0]?.delta?.content || parsed.response || "";
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

module.exports = PollinationsAdapter;
