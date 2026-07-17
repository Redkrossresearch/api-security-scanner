const llmRegistry = require("../llm.registry");

class VectorDatabase {
  constructor() {
    this.vectors = []; // In-memory database of { id, text, embedding, metadata }
  }

  /**
   * Helper to generate mock embeddings if API key is not configured
   */
  generateMockEmbedding(text) {
    const dim = 1536; // Standard OpenAI embedding dimensions
    const vec = new Array(dim).fill(0);
    for (let i = 0; i < text.length; i++) {
      const idx = i % dim;
      vec[idx] += text.charCodeAt(i) / 255;
    }
    // Normalize vector
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map((v) => v / mag);
  }

  /**
   * Fetch embedding from registry or fallback to mock
   */
  async getEmbedding(text) {
    try {
      const adapter = llmRegistry.getAdapter("openai");
      const result = await adapter.embed(text);
      if (result && result.embedding) {
        return result.embedding;
      }
    } catch (e) {
      // Graceful fallback to mock embedding to avoid crashing RAG setup
    }
    return this.generateMockEmbedding(text);
  }

  /**
   * Add a chunked text document
   */
  async addDocument(id, text, metadata = {}) {
    const embedding = await this.getEmbedding(text);
    this.vectors.push({
      id,
      text,
      embedding,
      metadata,
    });
    console.log(`[vector-db] Document added: ${id} | Total index count: ${this.vectors.length}`);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Query vector database and return top K matches
   */
  async query(queryText, limit = 5) {
    const queryEmbedding = await this.getEmbedding(queryText);
    const scored = this.vectors.map((doc) => ({
      ...doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // Sort by similarity descending
    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit);
  }

  /**
   * Clear database
   */
  clear() {
    this.vectors = [];
  }

  /**
   * Return index summary for frontend statistics and citation panel
   */
  getIndexSummary() {
    return this.vectors.map((v) => {
      let title = v.id;
      if (v.metadata?.sourceType === "threat_intelligence" || v.metadata?.sourceType === "github_advisory") {
        const firstLine = v.text.split("\n")[0] || "";
        title = firstLine.replace(/^(GHSA ID:|CVE ID:|OWASP|CWE-?\d+:)\s*/i, "").trim() || v.id;
      }
      return {
        id: v.id,
        title: title,
        sourceType: v.metadata?.sourceType || "generic",
        metadata: v.metadata,
      };
    });
  }
}

module.exports = new VectorDatabase();
