const axios = require("axios");

/**
 * Clean conversational filler words from user query to produce optimized search keywords
 * @param {string} query 
 * @returns {string}
 */
const cleanSearchQuery = (query) => {
  if (!query) return "";
  let clean = query.toLowerCase();
  
  // Remove conversational prefix and suffix phrases
  const patterns = [
    /explain\s+(?:what\s+is|what|how|about)?/gi,
    /tell\s+me\s+(?:about|what\s+is|what|how)?/gi,
    /find\s+out\s+(?:about|what\s+is|what|how)?/gi,
    /show\s+me\s+(?:about|what\s+is|what|how)?/gi,
    /search\s+(?:for|about)?/gi,
    /what\s+is\s+a\s+/gi,
    /what\s+is\s+/gi,
    /who\s+is\s+/gi,
    /how\s+do\s+i\s+/gi,
    /how\s+to\s+/gi,
    /based\s+on\s+web\s+search/gi,
    /using\s+web\s+search/gi,
    /web\s+search/gi,
    /\?/g
  ];

  for (const pattern of patterns) {
    clean = clean.replace(pattern, " ");
  }

  // Clean extra spaces and punctuation
  clean = clean.replace(/\s+/g, " ").trim();

  return clean || query;
};

/**
 * Perform a parallel web search using Wikipedia API and DuckDuckGo Instant Answers API
 * @param {string} query 
 * @returns {Promise<Array<{title: string, url: string, snippet: string}>>}
 */
const searchWeb = async (query) => {
  if (!query || query.trim() === "") return [];
  
  const searchQuery = cleanSearchQuery(query);
  console.log(`[search] Initiating parallel web search. Raw: "${query}" -> Cleaned: "${searchQuery}"`);
  const results = [];

  const promises = [
    // 1. Search Wikipedia API
    (async () => {
      try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
        const response = await axios.get(url, {
          headers: { "User-Agent": "ATHX-Security-Scanner/1.0 (contact@athx.ai)" },
          timeout: 8000,
        });
        const searchResults = response.data?.query?.search || [];
        searchResults.slice(0, 3).forEach(res => {
          results.push({
            title: res.title,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(res.title)}`,
            snippet: res.snippet.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').trim(),
          });
        });
      } catch (err) {
        console.warn("[search] Wikipedia endpoint failed:", err.message);
      }
    })(),

    // 2. Search DuckDuckGo Instant Answer API
    (async () => {
      try {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`;
        const response = await axios.get(url, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          timeout: 6000,
        });
        const data = response.data;
        if (data?.AbstractText) {
          results.push({
            title: data.Heading || "DuckDuckGo Abstract",
            url: data.AbstractURL || "https://duckduckgo.com",
            snippet: data.AbstractText,
          });
        }
      } catch (err) {
        console.warn("[search] DuckDuckGo API failed:", err.message);
      }
    })()
  ];

  await Promise.allSettled(promises);
  console.log(`[search] Completed web search. Total results collected: ${results.length}`);
  return results;
};

module.exports = { searchWeb };
