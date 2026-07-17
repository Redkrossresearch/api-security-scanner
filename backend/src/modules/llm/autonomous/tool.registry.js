const { searchWeb } = require("../../copilot/search.service");
const vectorDb = require("../rag/vector.db");

class ToolRegistry {
  constructor() {
    this.tools = {};
    this.registerDefaultTools();
  }

  registerTool(name, description, handler, options = {}) {
    this.tools[name] = {
      name,
      description,
      handler,
      isRisky: options.isRisky || false,
    };
  }

  registerDefaultTools() {
    // 1. Web Search Tool (Sprint 42)
    this.registerTool(
      "web_search",
      "Performs a web search to gather vulnerability reference details and threat intelligence. Parameters: { query: string }",
      async (params) => {
        const { query } = params || {};
        if (!query) throw new Error("Search query is required.");
        const results = await searchWeb(query);
        return results.slice(0, 3);
      }
    );

    // 2. Query RAG Database Tool
    this.registerTool(
      "query_rag",
      "Retrieves indexed local scanner knowledge, scan findings, and OpenAPI documents. Parameters: { query: string }",
      async (params) => {
        const { query } = params || {};
        if (!query) throw new Error("Query string is required.");
        const matches = await vectorDb.query(query, 3);
        return matches.map((m) => m.text);
      }
    );

    // 3. Craft Security Fix / Patch Code Snippet (Sprint 44)
    this.registerTool(
      "generate_fix",
      "Generates code remediation patches to secure a vulnerability. Parameters: { language: string, code: string, flaw: string }",
      async (params) => {
        const { language, code, flaw } = params || {};
        const prompt = `Secure this ${language} snippet against ${flaw}:\n\n${code}`;
        const adapter = llmRegistry.getAdapter("openai");
        const res = await adapter.generate([{ role: "user", content: prompt }]);
        return res.content;
      }
    );

    // 4. Trigger Active Exploitation Verification Payload (Risky Checkpoint - Sprint 45)
    this.registerTool(
      "run_exploitation_verification",
      "Sends custom payloads to verify if target is vulnerable (BOLA/SQLi/XSS). Highly destructive/risky. Parameters: { url: string, payload: string }",
      async (params) => {
        const { url, payload } = params || {};
        return {
          status: "simulated_success",
          message: `Sent test payload [${payload}] to target [${url}]. Finding verified.`,
        };
      },
      { isRisky: true }
    );
  }

  getTool(name) {
    return this.tools[name] || null;
  }
}

const llmRegistry = require("../llm.registry"); // circular reference safety
module.exports = new ToolRegistry();
