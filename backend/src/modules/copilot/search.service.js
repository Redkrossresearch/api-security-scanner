const axios = require("axios");

/* ─────────────────────────────────────────────────────────
   ATHX Search Service — Multi-Engine Real Web Search
   Engines: DDG Lite (primary) + Bing (secondary) + page extraction
   ───────────────────────────────────────────────────────── */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ── Helpers ──────────────────────────────────────────────
const stripHtml = (s = "") =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c))
    .replace(/\s+/g, " ")
    .trim();

const cleanSearchQuery = (q) => {
  if (!q) return "";
  let c = q;
  const stop = [
    /\bexplain\s+(?:what\s+is|what|how|about)?\b/gi,
    /\btell\s+me\s+(?:about|what\s+is|what|how)?\b/gi,
    /\bfind\s+out\s+(?:about|what\s+is|what|how)?\b/gi,
    /\bshow\s+me\s+(?:about|what\s+is|what|how)?\b/gi,
    /\bsearch\s+(?:for|about)?\b/gi,
    /\bwhat\s+is\s+(?:a|an|the)?\b/gi,
    /\bwho\s+is\b/gi,
    /\bhow\s+do\s+i\b/gi,
    /\bhow\s+to\b/gi,
    /\bbased\s+on\s+web\s+search\b/gi,
    /\busing\s+web\s+search\b/gi,
    /\bweb\s+search\b/gi,
    /\?/g,
  ];
  stop.forEach((p) => (c = c.replace(p, " ")));
  return c.replace(/\s+/g, " ").trim() || q;
};

// ── Engine 1: DuckDuckGo Lite — extracts real URLs from uddg= params ─────────
const searchDDGLite = async (query) => {
  const results = [];
  try {
    const r = await axios.get(
      `https://lite.duckduckgo.com/lite?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": UA,
          "Accept-Language": "en-US,en;q=0.9",
          Accept: "text/html",
        },
        timeout: 10000,
      },
    );
    const html = r.data;

    const linkRegex =
      /<a[^>]+href="[^"]*uddg=([^&"']+)[^"]*"[^>]*class=['"]result-link['"][^>]*>([\s\S]*?)<\/a>/gi;
    const linkMatches = [...html.matchAll(linkRegex)];

    const snippetRegex =
      /<td[^>]+class=['"]result-snippet['"][^>]*>([\s\S]*?)<\/td>/gi;
    const snippetMatches = [...html.matchAll(snippetRegex)].map((m) =>
      stripHtml(m[1]),
    );

    linkMatches.forEach((match, i) => {
      const rawUrl = decodeURIComponent(match[1]);
      const title = stripHtml(match[2]);
      const snippet = snippetMatches[i] || "Click the link for more details.";

      let domain = "Web";
      try {
        domain = new URL(rawUrl).hostname.replace("www.", "");
      } catch {}

      if (rawUrl && !rawUrl.includes("duckduckgo.com")) {
        results.push({
          title: title || domain,
          url: rawUrl,
          snippet,
          source: "DuckDuckGo",
          domain,
        });
      }
    });

    console.log(`[search] DDG Lite extracted ${results.length} results`);
    return results;
  } catch (e) {
    console.warn("[search] DDG Lite failed:", e.message);
    return [];
  }
};

// ── Engine 2: Bing HTML Scraper ───────────────────────────────────────────────
const searchBing = async (query) => {
  const results = [];
  try {
    const r = await axios.get(
      `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10&setlang=en-US`,
      {
        headers: {
          "User-Agent": UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
        },
        timeout: 12000,
      },
    );
    const html = r.data;

    let pos = 0;
    let count = 0;
    while (pos < html.length && count < 12) {
      const blockStart = html.indexOf('class="b_algo"', pos);
      if (blockStart === -1) break;
      const blockEnd = html.indexOf("</li>", blockStart);
      if (blockEnd === -1) break;
      const block = html.slice(blockStart, blockEnd + 5);
      pos = blockEnd + 5;
      count++;

      const titleAnchor = block.match(
        /<h2[^>]*><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/,
      );
      const citeMatch = block.match(/<cite[^>]*>([\s\S]*?)<\/cite>/);
      const snippetMatch =
        block.match(
          /<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/,
        ) ||
        block.match(/<p[^>]*class="[^"]*b_para[^"]*"[^>]*>([\s\S]*?)<\/p>/) ||
        block.match(/<p\s*>([\s\S]*?)<\/p>/);

      if (!titleAnchor) continue;

      const bingClickUrl = titleAnchor[1];
      const title = stripHtml(titleAnchor[2]);
      const citeUrl = citeMatch ? stripHtml(citeMatch[1]) : "";
      const snippet = snippetMatch
        ? stripHtml(snippetMatch[1])
        : "See source for details.";

      let realUrl = "";
      if (bingClickUrl.startsWith("https://www.bing.com/ck/")) {
        const cleanCite = citeUrl.replace(/\s*›\s*/g, "/").replace(/\s+/g, "");
        if (cleanCite.startsWith("http")) {
          realUrl = cleanCite;
        } else {
          realUrl = "https://" + cleanCite;
        }
      } else {
        realUrl = bingClickUrl;
      }

      if (!realUrl || realUrl.includes("bing.com")) continue;

      let domain = "Web";
      try {
        domain = new URL(realUrl).hostname.replace("www.", "");
      } catch {}

      results.push({ title, url: realUrl, snippet, source: "Bing", domain });
    }

    console.log(`[search] Bing extracted ${results.length} results`);
  } catch (e) {
    console.warn("[search] Bing failed:", e.message.slice(0, 80));
  }
  return results;
};

// ── Engine 3: Fetch & Extract page content from top results ──────────────────
const extractPageContent = async (url) => {
  try {
    const r = await axios.get(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 6000,
      maxRedirects: 3,
    });
    const html = r.data;
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return cleaned.slice(0, 600);
  } catch {
    return "";
  }
};

// ── Deduplication ─────────────────────────────────────────────────────────────
const dedupe = (arr) => {
  const seen = new Set();
  return arr.filter((r) => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
};

// ── Dynamic Relevance Filter ──────────────────────────────────────────────────
const filterRelevantResults = (results, query) => {
  const queryClean = cleanSearchQuery(query).toLowerCase();
  const queryWords = queryClean.split(/\s+/).filter((w) => w.length > 2);
  if (queryWords.length === 0) return results;

  return results.filter((r) => {
    const title = r.title.toLowerCase();
    const snippet = r.snippet.toLowerCase();
    const url = r.url.toLowerCase();

    // Calculate match count
    let matchCount = 0;
    queryWords.forEach((word) => {
      if (
        title.includes(word) ||
        snippet.includes(word) ||
        url.includes(word)
      ) {
        matchCount++;
      }
    });

    // If query has 3+ words, require at least 2 words to match. Otherwise, 1 word.
    const minRequired = queryWords.length >= 3 ? 2 : 1;
    return matchCount >= minRequired;
  });
};

/**
 * Main search function — DDG Lite + Bing + page content extraction
 * Returns results with title, url, snippet, source, domain
 */
const searchWeb = async (query) => {
  if (!query?.trim()) return [];

  const searchQuery = cleanSearchQuery(query);
  console.log(`[search] Query: "${query}" → cleaned: "${searchQuery}"`);

  // Run DDG and Bing in parallel
  const [ddgRes, bingRes] = await Promise.allSettled([
    searchDDGLite(searchQuery),
    searchBing(searchQuery),
  ]);

  const ddgResults = ddgRes.status === "fulfilled" ? ddgRes.value : [];
  const bingResults = bingRes.status === "fulfilled" ? bingRes.value : [];

  // Merge: DDG first (it's cleaner), then Bing for additional results
  let all = dedupe([...ddgResults, ...bingResults]);

  // Apply Relevance Filter to drop unrelated results
  let filtered = filterRelevantResults(all, query);
  console.log(
    `[search] Filtered: ${all.length} -> ${filtered.length} relevant results`,
  );

  // Enrich top 5 results with actual page content
  const topResults = filtered.slice(0, 5);
  const enriched = await Promise.allSettled(
    topResults.map(async (result) => {
      if (result.snippet && result.snippet.length > 80) {
        return result;
      }
      const content = await extractPageContent(result.url);
      if (content) {
        return { ...result, snippet: content };
      }
      return result;
    }),
  );

  const enrichedResults = enriched.map((r, i) =>
    r.status === "fulfilled" ? r.value : topResults[i],
  );

  const final = dedupe([...enrichedResults, ...filtered.slice(5)]).slice(0, 12);

  console.log(`[search] Done. ${final.length} results.`);
  const sources = {};
  final.forEach((r) => {
    sources[r.source] = (sources[r.source] || 0) + 1;
  });
  console.log("[search] Sources:", sources);

  return final;
};

module.exports = { searchWeb, cleanSearchQuery };
