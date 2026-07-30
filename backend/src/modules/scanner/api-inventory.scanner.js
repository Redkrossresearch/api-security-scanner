const axios = require("axios");

const OPENAPI_DISCOVERY_PATHS = [
  "/openapi.json",
  "/swagger.json",
  "/api-docs",
  "/v3/api-docs",
  "/api/v1/swagger.json",
  "/api/v2/swagger.json",
  "/api-docs.json",
  "/swagger/v1/swagger.json",
];

// High-Yield Common API Endpoints Wordlist for Active Probing (Concept 1)
const HIGH_YIELD_API_PATHS = [
  "/api",
  "/api/v1",
  "/api/v2",
  "/api/v3",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/me",
  "/api/v1/auth/refresh",
  "/api/v1/users",
  "/api/v1/user/profile",
  "/api/v1/users/me",
  "/api/v1/account",
  "/api/v1/admin",
  "/api/v1/admin/users",
  "/api/v1/admin/settings",
  "/api/v1/dashboard",
  "/api/v1/payments",
  "/api/v1/billing",
  "/api/v1/checkout",
  "/api/v1/orders",
  "/api/v1/upload",
  "/api/v1/export",
  "/api/v1/import",
  "/api/v1/reports",
  "/api/v1/config",
  "/api/v1/health",
  "/api/v1/metrics",
  "/api/v1/status",
  "/graphql",
  "/graphiql",
  "/api/graphql",
  "/internal/api",
  "/internal/v1",
  "/dev/api",
  "/test/api",
  "/staging/api",
  "/v1/legacy",
  "/api/v1/keys",
  "/api/v1/tokens",
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
  "session",
];

const ADMIN_KEYWORDS = [
  "admin",
  "role",
  "permission",
  "user-management",
  "settings",
  "manage",
  "config",
  "dashboard",
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
  "card",
  "checkout",
];

/**
 * Concept 2 & 3: Extracts JS Bundles, Preload Scripts, Form Actions & DOM Elements from HTML content.
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

    // 1. Match <script src="...">
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

    // 2. Match <link rel="modulepreload" href="..."> & <link rel="preload" as="script" href="...">
    const linkRegex = /<link\b[^>]*?\bhref=["']([^"']+\.js[^"']*)["']/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      if (match[1]) {
        try {
          const resolvedUrl = new URL(match[1], targetUrl).href;
          if (!scriptSources.includes(resolvedUrl)) {
            scriptSources.push(resolvedUrl);
          }
        } catch (e) {}
      }
    }

    // 3. Match Next.js / Vite manifest scripts (_next/static/chunks/*.js)
    const nextRegex = /["'](\/_next\/static\/chunks\/[^"']+\.js)["']/gi;
    while ((match = nextRegex.exec(html)) !== null) {
      if (match[1]) {
        try {
          const resolvedUrl = new URL(match[1], targetUrl).href;
          if (!scriptSources.includes(resolvedUrl)) {
            scriptSources.push(resolvedUrl);
          }
        } catch (e) {}
      }
    }

    // 4. Match inline <script>...</script>
    const inlineRegex = /<script\b[^>]*?>([\s\S]*?)<\/script>/gi;
    while ((match = inlineRegex.exec(html)) !== null) {
      if (match[1] && match[1].trim().length > 10) {
        inlineScripts.push(match[1]);
      }
    }

    // 5. Match HTML <form action="...">
    const formRegex = /<form\b[^>]*?\baction=["']([^"']+)["']/gi;
    while ((match = formRegex.exec(html)) !== null) {
      if (match[1] && match[1].startsWith("/")) {
        inlineScripts.push(`fetch('${match[1]}', { method: 'POST' })`);
      }
    }
  } catch (err) {
    // Graceful fallback on network timeout
  }

  return { scriptSources, inlineScripts };
}

/**
 * Concept 2: Analyzes JS code strings using regex to extract API endpoint paths, HTTP methods, and parameter names.
 */
function extractEndpointsFromJsCode(jsContent, targetUrl) {
  const endpointsMap = new Map();

  // Match routes like "/api/v1/users", "/auth/login", "/graphql", "/v2/checkout", "/user/profile"
  const routeRegex =
    /(?:"|')(\/(?:api|v[0-9]|auth|user|users|admin|dashboard|graphql|internal|v1|v2|v3|service|payment|billing|account|settings)\/[a-zA-Z0-9_\-\/\{\}\:]+)(?:"|')/gi;

  let match;
  while ((match = routeRegex.exec(jsContent)) !== null) {
    const path = match[1];
    if (
      path.length > 2 &&
      !path.endsWith(".png") &&
      !path.endsWith(".js") &&
      !path.endsWith(".css") &&
      !path.endsWith(".svg") &&
      !path.endsWith(".jpg")
    ) {
      const key = `GET:${path}`;
      if (!endpointsMap.has(key)) {
        endpointsMap.set(key, { path, method: "GET", source: "JS Bundle Extractor", httpStatus: 200 });
      }
    }
  }

  // Match axios calls: axios.post('/api/v1/login')
  const axiosMethodRegex =
    /(?:axios|http|client)\.(get|post|put|delete|patch)\s*\(\s*(?:"|')([^"']+)(?:"|')/gi;

  while ((match = axiosMethodRegex.exec(jsContent)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    if (path.startsWith("/")) {
      const key = `${method}:${path}`;
      endpointsMap.set(key, { path, method, source: "Axios JS Analysis", httpStatus: 200 });
    }
  }

  // Match fetch calls: fetch('/api/v1/user', { method: 'POST' })
  const fetchMethodRegex =
    /fetch\s*\(\s*(?:"|')([^"']+)(?:"|')\s*,\s*\{\s*method\s*:\s*(?:"|')([A-Z]+)(?:"|')/gi;

  while ((match = fetchMethodRegex.exec(jsContent)) !== null) {
    const path = match[1];
    const method = match[2].toUpperCase();
    if (path.startsWith("/")) {
      const key = `${method}:${path}`;
      endpointsMap.set(key, { path, method, source: "Fetch JS Analysis", httpStatus: 200 });
    }
  }

  return Array.from(endpointsMap.values());
}

/**
 * Concept 1: Active Fuzzer - Probes common API paths asynchronously with fast timeout.
 */
async function probeCommonApiEndpoints(targetUrl) {
  const discovered = [];

  let origin = "";
  try {
    origin = new URL(targetUrl).origin;
  } catch (e) {
    return discovered;
  }

  // Asynchronously probe high-yield paths in parallel batches of 8
  const batchSize = 8;
  for (let i = 0; i < HIGH_YIELD_API_PATHS.length; i += batchSize) {
    const batch = HIGH_YIELD_API_PATHS.slice(i, i + batchSize);

    const promises = batch.map(async (path) => {
      const fullUrl = `${origin}${path}`;
      try {
        const res = await axios.get(fullUrl, {
          timeout: 2500,
          validateStatus: () => true,
          headers: {
            "User-Agent": "ATHX-API-Security-Scanner/3.0",
          },
        });

        // HTTP status codes that indicate endpoint EXISTENCE
        if ([200, 201, 204, 301, 302, 400, 401, 403, 405, 422].includes(res.status)) {
          const isProtected = [401, 403].includes(res.status);
          const isJson = (res.headers["content-type"] || "").includes("application/json");

          return {
            path,
            method: "GET",
            source: isProtected ? "Protected API Probe (Auth Required)" : "Active API Fuzzer",
            httpStatus: res.status,
            isProtected,
            isJson,
          };
        }
      } catch (err) {
        // Endpoint offline or unreachable
      }
      return null;
    });

    const results = await Promise.all(promises);
    results.forEach((item) => {
      if (item) discovered.push(item);
    });
  }

  return discovered;
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
        timeout: 5000,
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
              timeout: 3000,
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
          discoveredMap.set(key, { path, method: upperMethod, source: "OpenAPI Spec", httpStatus: 200 });
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
          discoveredMap.set(key, { path, method, source: "Web Crawler", httpStatus: 200 });
        }
      });
    }

    // 4. Advanced JS Bundle & Inline Script Extractor (Concept 2 & 3)
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

      // Analyze Up to 10 External JS Bundles & Preload Chunks
      for (const src of scriptSources.slice(0, 10)) {
        try {
          const jsRes = await axios.get(src, {
            timeout: 4500,
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

      // 5. Concept 1: High-Yield Active API Endpoint Probing
      const probedEndpoints = await probeCommonApiEndpoints(targetUrl);
      probedEndpoints.forEach((ep) => {
        const key = `${ep.method}:${ep.path}`;
        if (!discoveredMap.has(key)) {
          discoveredMap.set(key, ep);
        }
      });
    }

    // Fallback default if map is empty
    if (discoveredMap.size === 0 && targetUrl) {
      try {
        const path = new URL(targetUrl).pathname || "/";
        discoveredMap.set(`GET:${path}`, { path, method: "GET", source: "Target URL", httpStatus: 200 });
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
        httpStatus: item.httpStatus || 200,
        isProtected: item.isProtected || false,
        riskScore: item.isProtected ? "High" : "Low",
        riskLevel: item.isProtected ? "High" : "Low",
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
      title: "Deep Multi-Vector API Discovery & Inventory Analysis",
      severity: "info",
      category: "API Inventory",
      description: `Discovered ${inventory.totalEndpoints} API endpoints across OpenAPI specs, active probing, and JS bundle analysis.`,
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
  probeCommonApiEndpoints,
};
