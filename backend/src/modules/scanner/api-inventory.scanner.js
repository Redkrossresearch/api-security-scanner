const axios = require("axios");

const OPENAPI_DISCOVERY_PATHS = [
  "/openapi.json",
  "/swagger.json",
  "/api-docs",
  "/v3/api-docs",
  "/api/v1/swagger.json",
  "/api/v2/swagger.json",
];

const AUTH_KEYWORDS = [
  "login",
  "logout",
  "signin",
  "signup",
  "register",
  "auth",
  "token",
  "oauth",
  "refresh",
  "password",
  "jwt",
];

const ADMIN_KEYWORDS = [
  "admin",
  "role",
  "permission",
  "user-management",
  "settings",
  "manage",
  "config",
];

const SENSITIVE_KEYWORDS = [
  "upload",
  "export",
  "import",
  "payment",
  "billing",
  "credit-card",
  "internal",
  "debug",
  "backup",
  "user/delete",
  "user/update",
  "ssn",
  "health",
  "patient",
];

/**
 * Extracts external JS bundle URLs and inline JS script code from target URL HTML content.
 */
async function fetchAndExtractJavaScript(targetUrl) {
  const scriptSources = [];
  const inlineScripts = [];

  try {
    const res = await axios.get(targetUrl, {
      timeout: 7000,
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-API-Security-Scanner/3.0",
      },
    });

    if (typeof res.data !== "string") return { scriptSources, inlineScripts };

    const html = res.data;

    // Match <script src="...">
    const srcRegex = /<script\b[^>]*?\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = srcRegex.exec(html)) !== null) {
      if (match[1]) {
        try {
          const resolvedUrl = new URL(match[1], targetUrl).href;
          scriptSources.push(resolvedUrl);
        } catch (e) {}
      }
    }

    // Match inline <script>...</script>
    const inlineRegex = /<script\b[^>]*?>([\s\S]*?)<\/script>/gi;
    while ((match = inlineRegex.exec(html)) !== null) {
      if (match[1] && match[1].trim().length > 10) {
        inlineScripts.push(match[1]);
      }
    }
  } catch (err) {
    // Graceful fallback on network timeout
  }

  return { scriptSources, inlineScripts };
}

/**
 * Analyzes JS code strings using regex to extract API endpoint paths, HTTP methods, and parameter names.
 */
function extractEndpointsFromJsCode(jsContent, targetUrl) {
  const endpointsMap = new Map();

  let host = "";
  try {
    host = new URL(targetUrl).origin;
  } catch (e) {}

  // 1. Match path routes like "/api/v1/users", "/auth/login", "/graphql", "/v2/checkout"
  const routeRegex =
    /(?:"|')(\/(?:api|v[0-9]|auth|user|admin|dashboard|graphql|internal|v1|v2|v3|service|graphql)\/[a-zA-Z0-9_\-\/\{\}\:]+)(?:"|')/gi;

  let match;
  while ((match = routeRegex.exec(jsContent)) !== null) {
    const path = match[1];
    if (path.length > 2 && !path.endsWith(".png") && !path.endsWith(".js") && !path.endsWith(".css")) {
      const key = `GET:${path}`;
      if (!endpointsMap.has(key)) {
        endpointsMap.set(key, { path, method: "GET", source: "JS Bundle Extractor" });
      }
    }
  }

  // 2. Match fetch / axios calls with explicit HTTP method: fetch('/path', { method: 'POST' }) or axios.post('/path')
  const axiosMethodRegex =
    /(?:axios|http|client)\.(get|post|put|delete|patch)\s*\(\s*(?:"|')([^"']+)(?:"|')/gi;

  while ((match = axiosMethodRegex.exec(jsContent)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    if (path.startsWith("/")) {
      const key = `${method}:${path}`;
      endpointsMap.set(key, { path, method, source: "Axios JS Analysis" });
    }
  }

  // 3. Match explicit fetch method options
  const fetchMethodRegex =
    /fetch\s*\(\s*(?:"|')([^"']+)(?:"|')\s*,\s*\{\s*method\s*:\s*(?:"|')([A-Z]+)(?:"|')/gi;

  while ((match = fetchMethodRegex.exec(jsContent)) !== null) {
    const path = match[1];
    const method = match[2].toUpperCase();
    if (path.startsWith("/")) {
      const key = `${method}:${path}`;
      endpointsMap.set(key, { path, method, source: "Fetch JS Analysis" });
    }
  }

  return Array.from(endpointsMap.values());
}

const scanApiInventory = async (input) => {
  const findings = [];

  let targetUrl = "";
  let crawledEndpoints = [];

  if (input && typeof input === "object" && input.targetUrl) {
    targetUrl = input.targetUrl;
    crawledEndpoints = input.crawledEndpoints || [];
  } else {
    targetUrl = input || "";
  }

  try {
    let openApiSpec = null;

    // 1. Attempt OpenAPI / Swagger Discovery
    try {
      const response = await axios.get(targetUrl, {
        timeout: 6000,
        validateStatus: () => true,
        headers: {
          "User-Agent": "ATHX-API-Security-Scanner/3.0",
        },
      });

      if (response.data?.paths) {
        openApiSpec = response.data;
      }
    } catch {}

    if (!openApiSpec) {
      for (const path of OPENAPI_DISCOVERY_PATHS) {
        try {
          const response = await axios.get(
            `${targetUrl.replace(/\/+$/, "")}${path}`,
            {
              timeout: 4000,
              validateStatus: () => true,
              headers: {
                "User-Agent": "ATHX-API-Security-Scanner/3.0",
              },
            }
          );

          if (response.data?.paths) {
            openApiSpec = response.data;
            break;
          }
        } catch {}
      }
    }

    const inventory = {
      totalEndpoints: 0,
      totalOperations: 0,
      authEndpoints: [],
      adminEndpoints: [],
      sensitiveEndpoints: [],
      methods: {
        GET: 0,
        POST: 0,
        PUT: 0,
        PATCH: 0,
        DELETE: 0,
      },
      endpoints: [],
    };

    const discoveredMap = new Map();

    // 2. Process OpenAPI Spec if available
    if (openApiSpec?.paths) {
      for (const [path, operations] of Object.entries(openApiSpec.paths)) {
        for (const method of Object.keys(operations)) {
          const upperMethod = method.toUpperCase();
          const key = `${upperMethod}:${path}`;
          discoveredMap.set(key, { path, method: upperMethod, source: "OpenAPI Spec" });
        }
      }
    }

    // 3. Process Crawled Endpoints
    if (Array.isArray(crawledEndpoints) && crawledEndpoints.length > 0) {
      crawledEndpoints.forEach((item) => {
        const epUrl = typeof item === "string" ? item : item.url || targetUrl;
        let path = "/";
        try {
          path = new URL(epUrl, targetUrl).pathname || "/";
        } catch (e) {
          path = item.path || "/";
        }
        const method = (item.method || "GET").toUpperCase();
        const key = `${method}:${path}`;
        if (!discoveredMap.has(key)) {
          discoveredMap.set(key, { path, method, source: "Web Crawler" });
        }
      });
    }

    // 4. Advanced JS Bundle & Inline Script Extractor (Task 159.1)
    if (targetUrl) {
      const { scriptSources, inlineScripts } = await fetchAndExtractJavaScript(targetUrl);

      // Analyze Inline Scripts
      inlineScripts.forEach((code) => {
        const extracted = extractEndpointsFromJsCode(code, targetUrl);
        extracted.forEach((ep) => {
          const key = `${ep.method}:${ep.path}`;
          if (!discoveredMap.has(key)) {
            discoveredMap.set(key, ep);
          }
        });
      });

      // Analyze Up to 5 External JS Bundles
      for (const src of scriptSources.slice(0, 5)) {
        try {
          const jsRes = await axios.get(src, {
            timeout: 5000,
            validateStatus: () => true,
            headers: { "User-Agent": "ATHX-API-Security-Scanner/3.0" },
          });
          if (typeof jsRes.data === "string") {
            const extracted = extractEndpointsFromJsCode(jsRes.data, targetUrl);
            extracted.forEach((ep) => {
              const key = `${ep.method}:${ep.path}`;
              if (!discoveredMap.has(key)) {
                discoveredMap.set(key, ep);
              }
            });
          }
        } catch (e) {}
      }
    }

    // Fallback default if map is empty
    if (discoveredMap.size === 0 && targetUrl) {
      try {
        const path = new URL(targetUrl).pathname || "/";
        discoveredMap.set(`GET:${path}`, { path, method: "GET", source: "Target URL" });
      } catch (e) {}
    }

    // Compile Final Inventory Metrics
    discoveredMap.forEach((item) => {
      inventory.totalEndpoints++;
      inventory.totalOperations++;
      const lowerPath = item.path.toLowerCase();

      const endpointInfo = {
        path: item.path,
        methods: [item.method],
        source: item.source,
        riskScore: 0,
        riskLevel: "Low",
      };

      if (inventory.methods[item.method] !== undefined) {
        inventory.methods[item.method]++;
      } else {
        inventory.methods.GET++;
      }

      inventory.endpoints.push(endpointInfo);

      if (AUTH_KEYWORDS.some((kw) => lowerPath.includes(kw))) {
        inventory.authEndpoints.push(endpointInfo);
      }
      if (ADMIN_KEYWORDS.some((kw) => lowerPath.includes(kw))) {
        inventory.adminEndpoints.push(endpointInfo);
      }
      if (SENSITIVE_KEYWORDS.some((kw) => lowerPath.includes(kw))) {
        inventory.sensitiveEndpoints.push(endpointInfo);
      }
    });

    findings.push({
      title: "API Inventory & JS Bundle Analysis",
      severity: "info",
      category: "API Inventory",
      description: `Extracted ${inventory.totalEndpoints} unique API endpoints via OpenAPI specs, web crawling, and JS bundle analysis.`,
      recommendation:
        "Ensure all discovered endpoints are documented, protected by OAuth2/JWT authentication, and cataloged in the API inventory.",
      inventory,
    });

    return findings;
  } catch (error) {
    console.error("API Inventory Scanner Error:", error.message);
    return findings;
  }
};

module.exports = {
  scanApiInventory,
  fetchAndExtractJavaScript,
  extractEndpointsFromJsCode,
};
