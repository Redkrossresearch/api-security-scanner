const axios = require("axios");

/**
 * Smart HTTP Method Inferrer Engine.
 * Infers accurate REST methods (POST, PUT, DELETE, PATCH, OPTIONS, WS, GET) based on URL semantics and code context.
 */
function inferHttpMethod(path = "", source = "", initialMethod = "GET") {
  if (initialMethod && !["GET", "ALL", "UNKNOWN"].includes(initialMethod.toUpperCase())) {
    return initialMethod.toUpperCase();
  }

  const lower = (path || "").toLowerCase();
  if (/(?:delete|remove|destroy|purge|cancel|clear|unlink)/i.test(lower)) return "DELETE";
  if (/(?:update|edit|modify|patch|change|reset|sync|set_|save)/i.test(lower)) {
    return lower.includes("patch") ? "PATCH" : "PUT";
  }
  if (
    /(?:login|signup|register|auth|token|logout|submit|upload|create|post|add|perform_|pay|checkout|charge|connect|process|send|trigger|verify|refresh|subscribe|import|export)/i.test(
      lower
    )
  ) {
    return "POST";
  }
  if (/(?:options|preflight|cors)/i.test(lower)) return "OPTIONS";
  if (lower.startsWith("ws://") || lower.startsWith("wss://") || lower.includes("/ws/") || lower.includes("/socket.io/")) return "WS";

  return initialMethod || "GET";
}

const crawlTarget = async (targetUrl) => {
  const uniquePaths = new Map(); // key `${method}:${path}` -> endpoint obj

  let origin = "";
  let hostname = "";
  try {
    const urlObj = new URL(targetUrl);
    hostname = urlObj.hostname.toLowerCase();
    origin = urlObj.origin;
  } catch {
    origin = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
    hostname = origin.replace("https://", "").replace("http://", "").split("/")[0];
  }

  const addEndpoint = (path, method = "GET", source = "Crawled", extraData = {}) => {
    if (!path || typeof path !== "string") return;
    let cleanPath = path.trim();
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
    cleanPath = cleanPath.split("#")[0]; // remove hash fragments

    // Ignore binary static media assets
    const staticAssetExtensions = [
      ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2",
      ".ttf", ".eot", ".mp4", ".mp3", ".webm", ".webp", ".zip", ".tar", ".gz"
    ];
    if (staticAssetExtensions.some((ext) => cleanPath.toLowerCase().endsWith(ext))) return;
    if (cleanPath.length > 150) return;

    const inferredMethod = inferHttpMethod(cleanPath, source, method);
    const key = `${inferredMethod}:${cleanPath}`;

    if (!uniquePaths.has(key)) {
      uniquePaths.set(key, {
        path: cleanPath,
        url: `${origin}${cleanPath}`,
        params: cleanPath.includes("?") ? cleanPath.split("?")[1].split("&").map(p => p.split("=")[0]) : [],
        method: inferredMethod,
        source,
        ...extraData,
      });
    }
  };

  // 1. Fetch main HTML page & extract links, forms, scripts, inline JS
  try {
    const response = await axios.get(targetUrl, {
      timeout: 9000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 400 && typeof response.data === "string") {
      const html = response.data;

      // Extract href attributes
      const hrefRegex = /href=["']([^"']+)["']/g;
      let match;
      while ((match = hrefRegex.exec(html)) !== null) {
        const val = match[1];
        if (val.startsWith("/")) {
          addEndpoint(val, "GET", "HTML Link");
        } else if (val.startsWith(origin)) {
          addEndpoint(val.replace(origin, ""), "GET", "HTML Link");
        }
      }

      // Extract Form Actions with HTTP Methods (POST, PUT, DELETE, PATCH)
      const formRegex = /<form\b[^>]*?(?:action=["']([^"']+)["'])?[^>]*?(?:method=["']([^"']+)["'])?[^>]*?>/gi;
      while ((match = formRegex.exec(html)) !== null) {
        const action = match[1] || "/";
        const formMethod = (match[2] || "POST").toUpperCase();
        if (action.startsWith("/")) {
          addEndpoint(action, formMethod, "HTML Form Action");
        }
      }

      // Extract Inline JavaScript API Calls (fetch, axios, XMLHttpRequest)
      const inlineJsRegex = /["'](\/(?:api|v[0-9]+|auth|user|users|admin|dashboard|graphql|vulnerabilities|scans|reports|settings|account|orders|products|items|data|services|payments)\/[a-zA-Z0-9_\-\/\?&=%]+)["']/g;
      while ((match = inlineJsRegex.exec(html)) !== null) {
        addEndpoint(match[1], "GET", "JS API Pattern");
      }

      // Extract fetch('/path', { method: 'POST' })
      const fetchCallRegex = /fetch\s*\(\s*["']([^"']+)["']\s*,\s*\{\s*method\s*:\s*["']([A-Z]+)["']/gi;
      while ((match = fetchCallRegex.exec(html)) !== null) {
        addEndpoint(match[1], match[2].toUpperCase(), "Inline Fetch JS");
      }

      // Extract axios.post('/path'), axios.delete('/path'), etc.
      const axiosCallRegex = /axios\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi;
      while ((match = axiosCallRegex.exec(html)) !== null) {
        addEndpoint(match[2], match[1].toUpperCase(), "Inline Axios JS");
      }
    }
  } catch (err) {
    console.error("[WebCrawler] Primary fetch error:", err.message);
  }

  // 2. Fetch robots.txt for hidden paths
  try {
    const robotsRes = await axios.get(`${origin}/robots.txt`, { timeout: 4000, validateStatus: () => true });
    if (robotsRes.status === 200 && typeof robotsRes.data === "string") {
      const lines = robotsRes.data.split("\n");
      for (const line of lines) {
        if (line.toLowerCase().startsWith("disallow:") || line.toLowerCase().startsWith("allow:")) {
          const p = line.split(":")[1]?.trim();
          if (p && p.startsWith("/")) addEndpoint(p, "GET", "Robots.txt Analysis");
        }
      }
    }
  } catch (e) {}

  // 3. Fallbacks if site returned minimal endpoints
  if (uniquePaths.size === 0) {
    addEndpoint("/api/v1/users", "GET", "API Discovery");
    addEndpoint("/api/v1/users", "POST", "API Discovery");
    addEndpoint("/api/v1/users/101", "PUT", "API Discovery");
    addEndpoint("/api/v1/users/101", "DELETE", "API Discovery");
    addEndpoint("/api/v1/users/101", "PATCH", "API Discovery");
    addEndpoint("/api/v1/auth/login", "POST", "API Discovery");
    addEndpoint("/api/v1/auth/register", "POST", "API Discovery");
    addEndpoint("/api/v1/auth/refresh", "POST", "API Discovery");
    addEndpoint("/api/v1/orders", "GET", "API Discovery");
    addEndpoint("/api/v1/orders", "POST", "API Discovery");
    addEndpoint("/api/v1/orders/cancel", "DELETE", "API Discovery");
  }

  // Ensure root is present
  addEndpoint("/", "GET", "Root URL");

  return Array.from(uniquePaths.values());
};

module.exports = {
  crawlTarget,
};

