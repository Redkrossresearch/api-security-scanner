/**
 * rag.routes.js (Sprint 25, 30 & 35)
 * REST Endpoints for RAG file uploads (PDF/ZIP/Docs), Knowledge Base ingestion,
 * and contextual retrieval queries.
 */
const express = require("express");
const router = express.Router();
const ragPipeline = require("./rag.pipeline");
const contextBuilder = require("./context-builder");

/**
 * POST /api/rag/upload-doc
 * Ingests base64/buffer payload of PDF or ZIP project file
 */
router.post("/upload-doc", async (req, res) => {
  try {
    const { fileName, fileData, fileType } = req.body;
    if (!fileData || !fileName) {
      return res.status(400).json({ error: "fileName and fileData (base64) are required" });
    }

    const buffer = Buffer.from(fileData, "base64");
    const nameLower = fileName.toLowerCase();

    if (nameLower.endsWith(".pdf") || fileType === "pdf") {
      const result = await ragPipeline.ingestPdf(buffer, fileName);
      return res.json({ success: true, message: `PDF "${fileName}" ingested successfully`, ...result });
    }

    if (nameLower.endsWith(".zip") || fileType === "zip") {
      const result = await ragPipeline.ingestZip(buffer, fileName);
      return res.json({ success: true, message: `ZIP project "${fileName}" ingested successfully`, ...result });
    }

    // Default plain text / doc ingestion
    const textContent = buffer.toString("utf-8");
    await ragPipeline.ingestDocument(`doc-${Date.now()}-${fileName}`, textContent, {
      sourceType: "user_upload_text",
      fileName,
    });

    return res.json({ success: true, message: `Document "${fileName}" ingested as text` });
  } catch (err) {
    console.error("[rag-routes] Document upload error:", err);
    return res.status(500).json({ error: err.message || "Failed to process document ingestion" });
  }
});

/**
 * POST /api/rag/ingest-kb
 * Ingests custom Knowledge Base entry
 */
router.post("/ingest-kb", async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required for Knowledge Base entry" });
    }

    const result = await ragPipeline.ingestKnowledgeBase(title, content, { category: category || "general" });
    return res.json({ success: true, message: `Knowledge Base entry "${title}" created`, ...result });
  } catch (err) {
    console.error("[rag-routes] KB ingestion error:", err);
    return res.status(500).json({ error: err.message || "Failed to ingest Knowledge Base entry" });
  }
});

/**
 * POST /api/rag/query
 * Queries RAG index and returns assembled context + citation sources
 */
router.post("/query", async (req, res) => {
  try {
    const { query, charBudget, limit } = req.body;
    if (!query) {
      return res.status(400).json({ error: "query string is required" });
    }

    const result = await contextBuilder.buildContext(query, { charBudget, limit });
    return res.json({ success: true, query, ...result });
  } catch (err) {
    console.error("[rag-routes] RAG query error:", err);
    return res.status(500).json({ error: err.message || "Failed to execute RAG query" });
  }
});

module.exports = router;
