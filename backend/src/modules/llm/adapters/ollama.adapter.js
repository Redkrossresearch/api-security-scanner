const axios = require("axios");
const BaseAdapter = require("../base.adapter");

class OllamaAdapter extends BaseAdapter {
  constructor() {
    super("ollama", "llama3");
  }

  async generate(messages, options = {}) {
    const modelName = options.model || this.defaultModel;
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";

    return this.executeResilient(async () => {
      const response = await axios.post(
        `${host}/api/chat`,
        {
          model: modelName,
          messages,
          options: {
            temperature: options.temperature || 0.7,
          },
          stream: false,
        },
        {
          timeout: options.timeout || 30000,
        }
      );

      const content = response.data?.message?.content;
      if (!content) {
        throw new Error("Empty response from Ollama");
      }

      return {
        content,
        usage: {
          promptTokens: response.data.prompt_eval_count || 0,
          completionTokens: response.data.eval_count || 0,
          totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0),
        },
      };
    }, modelName);
  }

  async stream(messages, onToken, options = {}) {
    const modelName = options.model || this.defaultModel;
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";

    return this.executeResilient(async () => {
      const response = await axios.post(
        `${host}/api/chat`,
        {
          model: modelName,
          messages,
          options: {
            temperature: options.temperature || 0.7,
          },
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
            try {
              const parsed = JSON.parse(cleaned);
              const content = parsed.message?.content || "";
              if (content) {
                accumulatedText += content;
                if (onToken) onToken(content);
              }
            } catch (e) {}
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
    const modelName = options.model || "nomic-embed-text";
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";

    return this.executeResilient(async () => {
      const response = await axios.post(
        `${host}/api/embeddings`,
        {
          model: modelName,
          prompt: text,
        },
        {
          timeout: options.timeout || 30000,
        }
      );

      return {
        embedding: response.data?.embedding,
        usage: {
          totalTokens: 0,
        },
      };
    }, modelName);
  }
}

module.exports = OllamaAdapter;
