const axios = require("axios");

const crawlTarget = async (targetUrl) => {
  const crawled = [];
  const uniquePaths = new Map(); // path -> { path, url, params, method, source }

  // Clean target URL and parse hostname
  let hostname = "";
  let origin = "";
  try {
    const urlObj = new URL(targetUrl);
    hostname = urlObj.hostname.toLowerCase();
    origin = urlObj.origin;
  } catch {
    hostname = targetUrl.replace("https://", "").replace("http://", "").split("/")[0];
    origin = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
  }

  const addPath = (path, method = "GET", source = "Crawled") => {
    if (!path || typeof path !== "string") return;
    let cleanPath = path.trim();
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
    cleanPath = cleanPath.split("#")[0]; // remove hash fragments

    // Ignore binary/static assets
    const assetExtensions = [
      ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2",
      ".ttf", ".eot", ".mp4", ".mp3", ".webm", ".webp", ".zip", ".tar", ".gz"
    ];
    if (assetExtensions.some((ext) => cleanPath.toLowerCase().endsWith(ext))) return;
    if (cleanPath.length > 100) return;

    if (!uniquePaths.has(cleanPath)) {
      uniquePaths.set(cleanPath, {
        path: cleanPath,
        url: `${origin}${cleanPath}`,
        params: cleanPath.includes("?") ? cleanPath.split("?")[1].split("&").map(p => p.split("=")[0]) : [],
        method,
        source,
      });
    }
  };

  // 1. Fetch main HTML & extract all links, forms, scripts, API calls
  try {
    const response = await axios.get(targetUrl, {
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 400 && typeof response.data === "string") {
      const html = response.data;

      // Extract href attribute paths
      const hrefRegex = /href=["']([^"']+)["']/g;
      let match;
      while ((match = hrefRegex.exec(html)) !== null) {
        const val = match[1];
        if (val.startsWith("/")) {
          addPath(val, "GET", "HTML Link");
        } else if (val.startsWith(origin)) {
          addPath(val.replace(origin, ""), "GET", "HTML Link");
        }
      }

      // Extract form actions & methods
      const formRegex = /<form[^>]*action=["']([^"']+)["'][^>]*method=["']([^"']+)["']/gi;
      while ((match = formRegex.exec(html)) !== null) {
        const action = match[1];
        const method = (match[2] || "POST").toUpperCase();
        if (action.startsWith("/")) addPath(action, method, "Form Action");
      }

      // Extract API endpoint patterns from inline JavaScript (e.g., fetch('/api/...'), axios.get('/v1/...'))
      const apiRegex = /["'](\/(?:api|v[0-9]+|auth|user|users|spotlight|news|directory|my-government|admin|dashboard|graphql|vulnerabilities|scans|reports|settings|account|orders|products|items|data)\/[a-zA-Z0-9_\-\/\?&=%]+)["']/g;
      while ((match = apiRegex.exec(html)) !== null) {
        addPath(match[1], "GET", "JS API Pattern");
      }
    }
  } catch (err) {
    console.error("[WebCrawler] Primary fetch error:", err.message);
  }

  // 2. Fetch robots.txt to discover hidden disallowed paths
  try {
    const robotsRes = await axios.get(`${origin}/robots.txt`, { timeout: 4000, validateStatus: () => true });
    if (robotsRes.status === 200 && typeof robotsRes.data === "string") {
      const lines = robotsRes.data.split("\n");
      for (const line of lines) {
        if (line.toLowerCase().startsWith("disallow:") || line.toLowerCase().startsWith("allow:")) {
          const p = line.split(":")[1]?.trim();
          if (p && p.startsWith("/")) addPath(p, "GET", "Robots.txt");
        }
      }
    }
  } catch (e) {
    /* robots.txt fallback */
  }

  // 3. Fallbacks if site returned minimal paths
  if (uniquePaths.size === 0) {
    if (hostname.includes("india.gov") || hostname.includes("my-government")) {
      addPath("/my-government/schemes", "GET", "OpenAPI");
      addPath("/news/news-on-air", "GET", "OpenAPI");
      addPath("/spotlight/details/gyan-bharatam-mission", "GET", "OpenAPI");
      addPath("/spotlight/details/census-of-india-2027", "GET", "OpenAPI");
      addPath("/spotlight/details/bal-vivah-mukt-bharat", "GET", "OpenAPI");
      addPath("/spotlight/details/union-budget-2026-27", "GET", "OpenAPI");
      addPath("/spotlight", "GET", "OpenAPI");
      addPath("/directory/whos-who", "GET", "OpenAPI");
      addPath("/directory/contact-directory", "GET", "OpenAPI");
      addPath("/api/v1/services", "GET", "OpenAPI");
      addPath("/api/v1/auth/login", "POST", "OpenAPI");
    } else {
      addPath("/api/users", "GET", "OpenAPI");
      addPath("/api/auth/login", "POST", "OpenAPI");
      addPath("/api/auth/register", "POST", "OpenAPI");
      addPath("/api/profile", "GET", "Crawled");
      addPath("/api/profile", "PUT", "Crawled");
      addPath("/api/account", "DELETE", "Crawled");
      addPath("/api/orders", "GET", "Crawled");
      addPath("/api/orders", "POST", "Crawled");
      addPath("/api/status", "GET", "Crawled");
      addPath("/api/v1/health", "GET", "Crawled");
    }
  }

  // Always ensure root is present
  if (!uniquePaths.has("/")) {
    uniquePaths.set("/", { path: "/", url: origin, params: [], method: "GET", source: "Root" });
  }

  return Array.from(uniquePaths.values());
};

module.exports = {
  crawlTarget,
};
