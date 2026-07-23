const MockAdapter = require("./adapters/mock.adapter");
const OpenAIAdapter = require("./adapters/openai.adapter");
const ClaudeAdapter = require("./adapters/claude.adapter");
const GeminiAdapter = require("./adapters/gemini.adapter");
const OllamaAdapter = require("./adapters/ollama.adapter");
const OpenRouterAdapter = require("./adapters/openrouter.adapter");
const LMStudioAdapter = require("./adapters/lmstudio.adapter");
const GroqAdapter = require("./adapters/groq.adapter");
const DeepSeekAdapter = require("./adapters/deepseek.adapter");
const TogetherAdapter = require("./adapters/together.adapter");
const MistralAdapter = require("./adapters/mistral.adapter");
const CohereAdapter = require("./adapters/cohere.adapter");
const PollinationsAdapter = require("./adapters/pollinations.adapter");

class LLMRegistry {
  constructor() {
    this.adapters = {
      mock: new MockAdapter(),
      openai: new OpenAIAdapter(),
      claude: new ClaudeAdapter(),
      gemini: new GeminiAdapter(),
      ollama: new OllamaAdapter(),
      openrouter: new OpenRouterAdapter(),
      lmstudio: new LMStudioAdapter(),
      groq: new GroqAdapter(),
      deepseek: new DeepSeekAdapter(),
      together: new TogetherAdapter(),
      mistral: new MistralAdapter(),
      cohere: new CohereAdapter(),
      pollinations: new PollinationsAdapter(),
    };
  }

  isProviderConfigured(provider) {
    return true;
  }

  getAdapter(providerName) {
    const provider = providerName?.toLowerCase();
    const adapter = this.adapters[provider];
    
    if (adapter) {
      return adapter;
    }
    
    const chain = this.getFallbackChain();
    if (chain.length > 0) {
      return this.adapters[chain[0]];
    }

    return this.adapters.gemini;
  }

  getFallbackChain() {
    const list = [
      process.env.GEMINI_API_KEY ? "gemini" : null,
      process.env.GROQ_API_KEY ? "groq" : null,
      process.env.OPENAI_API_KEY ? "openai" : null,
      process.env.OPENROUTER_API_KEY ? "openrouter" : null,
      "gemini",
      "openrouter",
      "openai",
      "claude",
      "groq",
      "deepseek",
      "together",
      "mistral",
      "cohere",
      "ollama",
      "lmstudio",
      "pollinations",
      "mock",
    ].filter(Boolean);

    const cb = require("./router/llm.circuitbreaker");
    return Array.from(new Set(list)).filter((p) => cb.isAvailable(p));
  }
}

module.exports = new LLMRegistry();
