/**
 * reranker.service.js (Sprint 51 — Enterprise RAG Reranking Engine)
 * Takes top-20 vector + BM25 search candidates and applies secondary relevance scoring
 * to select top-5 candidates with peak precision.
 */
class RerankerService {
  /**
   * Compute BM25-style keyword matching score between query and document
   */
  computeBM25Score(query, text) {
    if (!query || !text) return 0;
    const queryTokens = query.toLowerCase().split(/\W+/).filter(Boolean);
    const docTokens = text.toLowerCase().split(/\W+/).filter(Boolean);
    if (queryTokens.length === 0 || docTokens.length === 0) return 0;

    let matchCount = 0;
    const docFreqMap = new Map();
    docTokens.forEach((t) => docFreqMap.set(t, (docFreqMap.get(t) || 0) + 1));

    queryTokens.forEach((term) => {
      const tf = docFreqMap.get(term) || 0;
      if (tf > 0) {
        // BM25 term frequency saturation formula (k1 = 1.5, b = 0.75)
        const k1 = 1.5;
        const b = 0.75;
        const avgDl = 100;
        const dl = docTokens.length;
        const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgDl)));
        matchCount += tfNorm;
      }
    });

    return matchCount / queryTokens.length;
  }

  /**
   * Rerank candidates: Combine Cosine Similarity (vector) + BM25 (keyword) + Recency/Authority
   * @param {Array} candidates Array of top document matches ({ id, text, similarity, metadata })
   * @param {String} query Original user search query
   * @param {Number} topK Final result count (default 5)
   */
  async rerank(candidates, query, topK = 5) {
    if (!candidates || candidates.length === 0) return [];

    const scoredCandidates = candidates.map((candidate) => {
      const vectorScore = candidate.similarity || 0;
      const bm25Score = this.computeBM25Score(query, candidate.text);
      
      // Authority boost if source is OWASP / CVE official advisory
      let authorityBoost = 0;
      if (candidate.metadata?.sourceType === "owasp_catalog" || candidate.metadata?.sourceType === "github_advisory") {
        authorityBoost = 0.1;
      }

      // Hybrid composite score: 60% Vector + 30% BM25 + 10% Authority
      const compositeScore = vectorScore * 0.6 + bm25Score * 0.3 + authorityBoost;

      return {
        ...candidate,
        rerankScore: Number(compositeScore.toFixed(4)),
        scores: {
          vectorScore: Number(vectorScore.toFixed(4)),
          bm25Score: Number(bm25Score.toFixed(4)),
          authorityBoost,
        },
      };
    });

    // Sort descending by composite rerankScore
    scoredCandidates.sort((a, b) => b.rerankScore - a.rerankScore);

    return scoredCandidates.slice(0, topK);
  }
}

module.exports = new RerankerService();
