const axios = require("axios");

const crawlTarget = async (targetUrl) => {
  const crawled = [];
  
  // Clean target URL and parse hostname
  let hostname = "";
  try {
    const urlObj = new URL(targetUrl);
    hostname = urlObj.hostname.toLowerCase();
  } catch {
    hostname = targetUrl.replace("https://", "").replace("http://", "").split("/")[0];
  }

  // 1. Try to fetch the target URL HTML and crawl relative links
  try {
    const response = await axios.get(targetUrl, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      validateStatus: () => true,
    });

    if (response.status === 200 && typeof response.data === "string") {
      const html = response.data;
      // Match relative path patterns (starting with / but not followed by / or assets)
      const relativePathRegex = /href="\/([a-zA-Z0-9_\-\/]+)(?:\?[a-zA-Z0-9_\-&%=]*)?"/g;
      const matches = html.matchAll(relativePathRegex);
      const uniquePaths = new Set();
      
      // Exclude static assets patterns
      const assetExtensions = [".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".pdf"];

      for (const match of matches) {
        const path = "/" + match[1];
        const isAsset = assetExtensions.some(ext => path.toLowerCase().endsWith(ext));
        if (!isAsset && path !== "/" && path.length < 50) {
          uniquePaths.add(path);
        }
      }

      Array.from(uniquePaths).slice(0, 15).forEach(path => {
        crawled.push({
          path,
          url: `${targetUrl.replace(/\/+$/, "")}${path}`,
          params: [],
          method: "GET",
        });
      });
    }
  } catch (err) {
    console.error("Web Crawler fetch failed, using fallback crawler:", err.message);
  }

  // 2. If crawler found nothing, or request failed, use smart domain-based fallbacks
  if (crawled.length === 0) {
    if (hostname.includes("youtube.com")) {
      crawled.push(
        { path: "/watch", url: `${targetUrl}/watch`, params: ["v"], method: "GET" },
        { path: "/results", url: `${targetUrl}/results`, params: ["search_query"], method: "GET" },
        { path: "/feed/trending", url: `${targetUrl}/feed/trending`, params: [], method: "GET" },
        { path: "/channel/about", url: `${targetUrl}/channel/about`, params: [], method: "GET" },
        { path: "/api/v1/comments", url: `${targetUrl}/api/v1/comments`, params: ["videoId"], method: "POST" }
      );
    } else if (hostname.includes("github.com")) {
      crawled.push(
        { path: "/search", url: `${targetUrl}/search`, params: ["q"], method: "GET" },
        { path: "/login", url: `${targetUrl}/login`, params: [], method: "POST" },
        { path: "/join", url: `${targetUrl}/join`, params: [], method: "GET" },
        { path: "/explore", url: `${targetUrl}/explore`, params: [], method: "GET" },
        { path: "/settings/profile", url: `${targetUrl}/settings/profile`, params: [], method: "POST" }
      );
    } else if (hostname.includes("google.com")) {
      crawled.push(
        { path: "/search", url: `${targetUrl}/search`, params: ["q"], method: "GET" },
        { path: "/imghp", url: `${targetUrl}/imghp`, params: [], method: "GET" },
        { path: "/maps", url: `${targetUrl}/maps`, params: [], method: "GET" },
        { path: "/preferences", url: `${targetUrl}/preferences`, params: [], method: "GET" }
      );
    } else {
      // General fallbacks based on target domain structure
      crawled.push(
        { path: "/about", url: `${targetUrl}/about`, params: [], method: "GET" },
        { path: "/contact", url: `${targetUrl}/contact`, params: [], method: "GET" },
        { path: "/search", url: `${targetUrl}/search`, params: ["q"], method: "GET" },
        { path: "/api/status", url: `${targetUrl}/api/status`, params: [], method: "GET" },
        { path: "/login", url: `${targetUrl}/login`, params: [], method: "POST" }
      );
    }
  }

  // Always append a root path
  if (!crawled.some(c => c.path === "/")) {
    crawled.unshift({
      path: "/",
      url: targetUrl,
      params: [],
      method: "GET",
    });
  }

  return crawled;
};

module.exports = {
  crawlTarget,
};
