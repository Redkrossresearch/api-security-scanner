/**
 * context-builder.js (Sprint 35 — RAG-LLM Integration)
 * Assembles RAG context chunks, enforces token-budget truncation, and attaches
 * inline citation metadata ([1], [2]) to enrich LLM prompts.
 */
const ragPipeline = require("./rag.pipeline");
const vectorDb = require("./vector.db");

class ContextBuilder {
  /**
   * Builds context block with token-budget aware truncation and citation formatting.
   * @param {string} query User prompt or question
   * @param {Object} options Configuration options (charBudget, limit, includeCitations)
   */
  async buildContext(query, options = {}) {
    const charBudget = options.charBudget || 4000;
    const limit = options.limit || 4;

    try {
      const docs = await vectorDb.query(query, limit * 2);
      if (!docs || docs.length === 0) {
        return { contextText: "", sources: [], citations: [] };
      }

      let currentLength = 0;
      const selectedDocs = [];
      const sources = [];
      const citations = [];

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const snippet = doc.text.slice(0, 800);
        if (currentLength + snippet.length > charBudget) break;

        currentLength += snippet.length;
        const sourceId = i + 1;
        const sourceType = doc.metadata.sourceType || "document";
        const docName = doc.metadata.docName || doc.metadata.filePath || doc.metadata.title || `Source ${sourceId}`;

        selectedDocs.push({
          sourceId,
          sourceType,
          docName,
          text: snippet,
          similarity: doc.similarity,
        });

        sources.push({
          id: sourceId,
          type: sourceType,
          name: docName,
          snippet: snippet.slice(0, 150) + "...",
          similarity: doc.similarity,
        });

        citations.push(`[${sourceId}] ${docName} (${sourceType})`);
      }

      if (selectedDocs.length === 0) {
        return { contextText: "", sources: [], citations: [] };
      }

      const formattedContext = selectedDocs
        .map(
          (d) => `[Source ${d.sourceId}] (${d.sourceType}: ${d.docName}):\n${d.text}`
        )
        .join("\n\n");

      const systemPromptContext = `\n\n================================================================================
## RETRIEVED SECURITY KNOWLEDGE & EVIDENCE (Citations Attached)
Use the following verified context sources to inform your analysis. Cite specific sources using [1], [2], etc. where appropriate.

${formattedContext}
================================================================================\n`;

      return {
        contextText: systemPromptContext,
        sources,
        citations,
        documentCount: selectedDocs.length,
      };
    } catch (err) {
      console.error("[context-builder] Error assembling context:", err.message);
      return { contextText: "", sources: [], citations: [] };
    }
  }
}

module.exports = new ContextBuilder();
