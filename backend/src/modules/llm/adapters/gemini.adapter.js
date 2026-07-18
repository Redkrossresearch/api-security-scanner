const axios = require("axios");
const BaseAdapter = require("../base.adapter");

class GeminiAdapter extends BaseAdapter {
  constructor() {
    super("gemini", "gemini-1.5-flash");
  }

  async generate(messages, options = {}) {
    const modelName = options.model || this.defaultModel;
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is missing");
    }

    return this.executeResilient(async () => {
      const payload = {
        model: modelName,
        messages,
        temperature: options.temperature || 0.7,
      };

      if (options.tools && options.tools.length > 0) {
        payload.tools = options.tools;
        payload.tool_choice = options.tool_choice || "auto";
      }

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        payload,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: options.timeout || 30000,
        }
      );

      const message = response.data?.choices?.[0]?.message;
      const content = message?.content || "";
      const toolCalls = message?.tool_calls;

      if (!content && !toolCalls) {
        throw new Error("Empty response from Gemini");
      }

      return {
        content,
        toolCalls,
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
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is missing");
    }

    return this.executeResilient(async () => {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
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

  async embed(text, options = {}) {
    const modelName = options.model || "text-embedding-004";
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is missing");
    }

    return this.executeResilient(async () => {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/openai/embeddings",
        {
          model: modelName,
          input: text,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: options.timeout || 30000,
        }
      );

      return {
        embedding: response.data?.data?.[0]?.embedding,
        usage: {
          totalTokens: response.data.usage?.total_tokens || 0,
        },
      };
    }, modelName);
  }

  async vision(imageBuffer, messages, options = {}) {
    const modelName = options.model || "gemini-1.5-flash";
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is missing");
    }

    return this.executeResilient(async () => {
      const base64Image = imageBuffer.toString("base64");
      const mimeType = options.mimeType || "image/png";

      const visionMessages = messages.map(m => {
        if (m.role === "user") {
          return {
            role: "user",
            content: [
              { type: "text", text: m.content },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          };
        }
        return m;
      });

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          model: modelName,
          messages: visionMessages,
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
        throw new Error("Empty response from Gemini Vision");
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
}

module.exports = GeminiAdapter;
