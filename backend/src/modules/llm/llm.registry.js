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

const config = require("../../config/env");

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

  /**
   * Check if a given provider is configured in environment config
   */
  isProviderConfigured(provider) {
    // We always return true because all provider adapters are equipped with dynamic
    // keyless/OpenRouter free fallbacks when their native API keys are missing.
    return true;
  }

  /**
   * Fetch active adapter by name, falling back to mock if not found/unconfigured
   */
  getAdapter(providerName) {
    const provider = providerName?.toLowerCase();
    const adapter = this.adapters[provider];
    
    if (adapter && this.isProviderConfigured(provider)) {
      return adapter;
    }
    
    // Fall back to first configured provider
    const chain = this.getFallbackChain();
    if (chain.length > 0) {
      return this.adapters[chain[0]];
    }

    return this.adapters.mock;
  }

  /**
   * Return ordered array of active/configured provider names
   */
  getFallbackChain() {
    const list = [
      "openrouter",
      "openai",
      "gemini",
      "claude",
      "groq",
      "deepseek",
      "together",
      "mistral",
      "cohere",
      "ollama",
      "lmstudio",
      "pollinations",
      "mock"
    ];
    const cb = require("./router/llm.circuitbreaker");
    return list.filter((p) => this.isProviderConfigured(p) && cb.isAvailable(p));
  }
}

module.exports = new LLMRegistry();
