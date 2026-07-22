/**
 * research.agent.js (Sprint 34 — Research Agent)
 * Retrieves external knowledge using live Web Search grounding and vector RAG indices.
 */
const BaseAgent = require("./base.agent");
const contextBuilder = require("../llm/rag/context-builder");

class ResearchAgent extends BaseAgent {
  constructor() {
    super(
      "ResearchAgent",
      "Threat Intelligence & Research Analyst",
      `Search vector knowledge bases, OWASP documentation, and live search engines to gather security intelligence, advisories, and technical context for vulnerability findings.`,
      ["rag-query", "web-search-grounding"],
      "gemini"
    );
  }

  async run(context, options = {}) {
    const query = typeof context === "string" ? context : context.query || JSON.stringify(context);
    const ragContext = await contextBuilder.buildContext(query, { limit: 3 });

    const enrichedContext = `${query}\n\n${ragContext.contextText}`;
    const baseResponse = await super.run(enrichedContext, options);

    baseResponse.sources = ragContext.sources || [];
    baseResponse.citations = ragContext.citations || [];
    return baseResponse;
  }
}

module.exports = new ResearchAgent();
