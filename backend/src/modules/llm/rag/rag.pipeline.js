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
   * Ingest PDF document (Sprint 25)
   */
  async ingestPdf(pdfBuffer, docName = "document.pdf", metadata = {}) {
    try {
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(pdfBuffer);
      const text = pdfData.text || "";
      console.log(`[rag-pipeline] Extracted ${text.length} chars from PDF: ${docName}`);

      await this.ingestDocument(`pdf-${Date.now()}-${docName}`, text, {
        sourceType: "pdf_document",
        docName,
        pages: pdfData.numpages || 1,
        ...metadata,
      });
      return { success: true, pages: pdfData.numpages, charCount: text.length };
    } catch (err) {
      console.error(`[rag-pipeline] PDF ingestion error for ${docName}:`, err.message);
      // Fallback: treat buffer as text if plain text disguised as pdf
      const textFallback = pdfBuffer.toString("utf-8");
      await this.ingestDocument(`pdf-fallback-${Date.now()}`, textFallback, { sourceType: "pdf_fallback", docName });
      return { success: true, charCount: textFallback.length };
    }
  }

  /**
   * Ingest ZIP project repository (Sprint 25)
   */
  async ingestZip(zipBuffer, zipName = "project.zip", metadata = {}) {
    try {
      const AdmZip = require("adm-zip");
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      let fileCount = 0;

      const allowedExtensions = [".js", ".jsx", ".ts", ".tsx", ".py", ".json", ".yaml", ".yml", ".sql", ".md", ".env.example", ".html", ".css"];

      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;
        const ext = path.extname(entry.entryName).toLowerCase();
        if (allowedExtensions.includes(ext) || entry.entryName.includes("Dockerfile")) {
          const content = entry.getData().toString("utf-8");
          if (content.trim().length > 0) {
            await this.ingestDocument(`zip-${zipName}-${entry.entryName}`, `File: ${entry.entryName}\n\n${content}`, {
              sourceType: "zip_project_file",
              filePath: entry.entryName,
              zipName,
              ...metadata,
            });
            fileCount++;
          }
        }
      }
      console.log(`[rag-pipeline] Ingested ${fileCount} files from ZIP project: ${zipName}`);
      return { success: true, fileCount };
    } catch (err) {
      console.error(`[rag-pipeline] ZIP ingestion error for ${zipName}:`, err.message);
      throw err;
    }
  }

  /**
   * Ingest custom Knowledge Base text (Sprint 30)
   */
  async ingestKnowledgeBase(title, content, metadata = {}) {
    const kbId = `kb-${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, "_")}`;
    await this.ingestDocument(kbId, `Title: ${title}\n\n${content}`, {
      sourceType: "knowledge_base",
      title,
      ...metadata,
    });
    console.log(`[rag-pipeline] Ingested Knowledge Base entry: "${title}"`);
    return { success: true, kbId };
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
   * Retrieve relevant chunks and rerank (Sprint 51 — Hybrid BM25 + Vector + Reranking)
   * Retrieves top-20 candidates and reranks down to top-5 candidates
   */
  async retrieveContext(query, limit = 5) {
    console.log(`[rag-pipeline] Querying RAG index for query: "${query}"`);
    const rerankerService = require("./reranker.service");

    // Top-20 initial candidates
    let results = await vectorDb.query(query, 20);

    // Auto-growing RAG: If local matches are sparse or have low similarity, trigger web search query
    const topScore = results.length > 0 ? results[0].similarity : 0;
    if (results.length === 0 || topScore < 0.55) {
      console.log(`[rag-pipeline] Low local similarity (${topScore.toFixed(2)}). Triggering dynamic web search integration...`);
      try {
        const { searchWeb } = require("../../copilot/search.service");
        const webMatches = await searchWeb(query);
        
        if (webMatches && webMatches.length > 0) {
          for (let i = 0; i < Math.min(3, webMatches.length); i++) {
            const match = webMatches[i];
            const textChunk = `Web Search Title: ${match.title}
Source URL: ${match.url}
Extract: ${match.snippet}`;
            
            const docId = `web-cache-${Date.now()}-${i}`;
            await vectorDb.addDocument(docId, textChunk, {
              sourceType: "web_search_cache",
              url: match.url,
              query: query,
            });
          }

          // Re-query vector DB to include newly ingested web cache vectors
          results = await vectorDb.query(query, 20);
        }
      } catch (err) {
        console.warn("[rag-pipeline] Dynamic web search integration failed:", err.message);
      }
    }

    // Query DAG Security Knowledge Graph for graph traversal context
    let dagContext = "";
    try {
      const dagGraph = require("./dag.knowledge.graph");
      dagContext = dagGraph.queryGraph(query);
    } catch (dagErr) {
      console.warn("[rag-pipeline] DAG graph traversal error:", dagErr.message);
    }

    if (results.length === 0) {
      return dagContext;
    }

    // Sprint 51: Reranking Step — Score top-20 candidates with BM25 + Vector composite weighting
    const rerankedMatches = await rerankerService.rerank(results, query, limit);

    const contextBlock = rerankedMatches
      .map((doc, idx) => `[Source ${idx + 1}] (${doc.metadata.sourceType || "Document"} | Score: ${doc.rerankScore}):
${doc.text}`)
      .join("\n\n");

    return `\n\n================================================================================
## ENTERPRISE RAG CONTEXT (Hybrid Retrieved & Reranked Knowledge)
${contextBlock}
================================================================================\n${dagContext}`;
  }



  /**
   * Ingest Completed Scan Findings (Sprint 46)
   */
  async ingestScanFindings(scanId, findings = []) {

    for (let i = 0; i < findings.length; i++) {
      const f = findings[i];
      const text = `Vulnerability Finding: ${f.title || f.name}
Severity: ${f.severity || "UNKNOWN"}
Description: ${f.description || ""}
Endpoint: ${f.endpoint || f.url || "N/A"}
Remediation: ${f.remediation || "N/A"}`;
      await vectorDb.addDocument(`scan-${scanId}-finding-${i}`, text, {
        sourceType: "scan_finding",
        scanId,
        severity: f.severity,
        cve: f.cve
      });
    }
  }

  /**
   * Ingest OpenAPI / Swagger Specifications (Sprint 48)
   */
  async ingestOpenApiSpec(specId, openapiJson = {}) {
    const paths = openapiJson.paths || {};
    let count = 0;
    for (const [pathUrl, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        count++;
        const text = `OpenAPI Endpoint: ${method.toUpperCase()} ${pathUrl}
Summary: ${details.summary || details.description || "N/A"}
Auth Required: ${details.security ? "YES" : "NO"}
Parameters: ${JSON.stringify(details.parameters || [])}`;
        await vectorDb.addDocument(`openapi-${specId}-${count}`, text, {
          sourceType: "openapi_endpoint",
          specId,
          pathUrl,
          method: method.toUpperCase(),
          authRequired: !!details.security
        });
      }
    }
  }
}

module.exports = new RAGPipelineManager();

