const fs = require("fs");
const path = require("path");
const vectorDb = require("./vector.db");
const Scan = require("../../scans/scan.model");
const CopilotMessage = require("../../copilot/copilot.model").CopilotMessage;

class RAGPipelineManager {
  /**
   * Helper to split large texts into overlapping chunks
   */
  chunkText(text, chunkSize = 500, overlap = 100) {
    if (!text) return [];
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      const end = start + chunkSize;
      chunks.push(text.slice(start, end));
      start += chunkSize - overlap;
    }
    return chunks;
  }

  /**
   * Ingest generic document chunking
   */
  async ingestDocument(docId, text, metadata = {}) {
    const chunks = this.chunkText(text);
    for (let i = 0; i < chunks.length; i++) {
      await vectorDb.addDocument(`${docId}-chunk-${i}`, chunks[i], {
        ...metadata,
        originalDocId: docId,
        chunkIndex: i,
      });
    }
  }

  /**
   * Ingest completed security scans (Sprint 32)
   */
  async ingestScan(scanId) {
    try {
      const scan = await Scan.findById(scanId).lean();
      if (!scan) return;

      const scanDump = `Scan ID: ${scan._id}
Target URL: ${scan.targetUrl}
Findings count: ${scan.findingsCount || 0}
Critical vulnerability findings: ${JSON.stringify(scan.findings || [])}`;

      await this.ingestDocument(`scan-${scanId}`, scanDump, {
        sourceType: "security_scan",
        scanId: scanId.toString(),
      });
      console.log(`[rag-pipeline] Ingested scan findings for scanId: ${scanId}`);
    } catch (e) {
      console.error("[rag-pipeline] Scan ingestion error:", e.message);
    }
  }

  /**
   * Ingest OpenAPI Spec endpoint declarations (Sprint 34)
   */
  async ingestOpenApiSpec(specText, specName = "openapi.json") {
    try {
      const parsed = JSON.parse(specText);
      const paths = parsed.paths || {};
      for (const [pathKey, methods] of Object.entries(paths)) {
        for (const [method, detail] of Object.entries(methods)) {
          const endpointText = `API Endpoint: [${method.toUpperCase()}] ${pathKey}
Summary: ${detail.summary || "None"}
Parameters: ${JSON.stringify(detail.parameters || [])}
Responses: ${JSON.stringify(detail.responses || {})}`;

          await vectorDb.addDocument(`${specName}-${method}-${pathKey}`, endpointText, {
            sourceType: "openapi_endpoint",
            path: pathKey,
            method: method.toUpperCase(),
          });
        }
      }
      console.log(`[rag-pipeline] Ingested OpenAPI spec endpoints from ${specName}`);
    } catch (e) {
      // If parsing fails, ingest as raw text chunks
      await this.ingestDocument(specName, specText, { sourceType: "openapi_raw" });
    }
  }

  /**
   * Ingest chat conversation history (Sprint 36)
   */
  async ingestChatHistory(conversationId) {
    try {
      const messages = await CopilotMessage.find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();
      
      if (!messages || messages.length === 0) return;

      const conversationText = messages
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
        .join("\n");

      await this.ingestDocument(`chat-${conversationId}`, conversationText, {
        sourceType: "chat_history",
        conversationId: conversationId.toString(),
      });
      console.log(`[rag-pipeline] Ingested chat history for conversation: ${conversationId}`);
    } catch (e) {
      console.error("[rag-pipeline] Chat history ingestion error:", e.message);
    }
  }

  /**
   * Retrieve relevant chunks and rerank (Sprint 37)
   */
  async retrieveContext(query, limit = 3) {
    console.log(`[rag-pipeline] Querying RAG index for query: "${query}"`);
    const results = await vectorDb.query(query, limit * 2);

    if (results.length === 0) {
      return "";
    }

    // Rerank step: Simple sorting by score (can be extended with custom rank weighting)
    const topMatches = results.slice(0, limit);

    const contextBlock = topMatches
      .map((doc, idx) => `[Source ${idx + 1}] (${doc.metadata.sourceType || "Document"}):
${doc.text}`)
      .join("\n\n");

    return `\n\n================================================================================
## ENTERPRISE RAG CONTEXT (Retrieved Security Knowledge)
${contextBlock}
================================================================================\n`;
  }
}

module.exports = new RAGPipelineManager();
