const ApiEndpoint = require("./api-endpoint.model");
const Vulnerability = require("../vulnerabilities/vulnerability.model");

/**
 * Automatically ingests and upserts endpoints from a completed Scan object into ApiEndpoint inventory.
 */
async function ingestEndpointsFromScan(scan) {
  if (!scan || !scan.targetUrl) return;

  try {
    const rawTarget = scan.targetUrl;
    let urlObj;
    try {
      urlObj = new URL(rawTarget);
    } catch (e) {
      return;
    }

    const host = urlObj.origin;
    const scanIdStr = scan.scanId || String(scan._id);

    // Get list of discovered endpoints from scan (fallback to target pathname if empty)
    let endpointsToProcess = [];
    if (Array.isArray(scan.crawledEndpoints) && scan.crawledEndpoints.length > 0) {
      endpointsToProcess = scan.crawledEndpoints;
    } else {
      endpointsToProcess = [{ url: rawTarget, method: "GET" }];
    }

    // Map findings by path to associate vulnerabilities
    const findings = Array.isArray(scan.findings) ? scan.findings : [];

    for (const ep of endpointsToProcess) {
      const epUrlStr = typeof ep === "string" ? ep : ep.url || rawTarget;
      let epObj;
      try {
        epObj = new URL(epUrlStr, host);
      } catch (err) {
        continue;
      }

      const path = epObj.pathname || "/";
      const method = (ep.method || "GET").toUpperCase();

      // Find findings matching this endpoint path
      const matchedFindings = findings.filter((f) => {
        if (!f.endpoint) return false;
        return f.endpoint.includes(path);
      });

      // Calculate risk score based on matched findings and CWE vulnerability density
      let riskScore = "Low";
      const severities = matchedFindings.map((f) => (f.severity || "").toLowerCase());
      const cwes = matchedFindings.map((f) => (f.cwe || "").toLowerCase());

      if (severities.includes("critical") || cwes.some((cwe) => cwe.includes("cwe-89") || cwe.includes("cwe-79") || cwe.includes("cwe-918"))) {
        riskScore = "Critical";
      } else if (severities.includes("high") || matchedFindings.length >= 3) {
        riskScore = "High";
      } else if (severities.includes("medium") || matchedFindings.length >= 1) {
        riskScore = "Medium";
      } else if (matchedFindings.length === 0) {
        riskScore = "Secure";
      }

      // Hardened Data Sensitivity & PII Tagging Algorithm (Task 159.2)
      const sensitivityTags = ["Public"];
      const lowerPath = path.toLowerCase();

      if (/user|profile|email|account|person|ssn|health|patient|dob|phone|mobile|address|identity|customer|member/.test(lowerPath)) {
        sensitivityTags.push("PII");
      }
      if (/card|pay|billing|checkout|bank|wallet|invoice|transaction|credit|debit|stripe|paypal/.test(lowerPath)) {
        sensitivityTags.push("Financial");
      }
      if (/auth|token|login|password|secret|jwt|session|key|credential|bearer|oauth|api-key|private-key/.test(lowerPath)) {
        sensitivityTags.push("AuthToken");
      }
      if (/internal|admin|system|config|metric|log|telemetry|debug/.test(lowerPath)) {
        sensitivityTags.push("Internal");
      }

      // Detect Auth Type
      let authType = "Public / Unauthenticated";
      if (/auth|login|token|admin|dashboard|user|api\/v|checkout|billing|profile/.test(lowerPath)) {
        authType = "Bearer JWT";
      }

      // Hardened Shadow & Zombie API Classification Engine (Task 159.2)
      let status = "Active";
      if (
        /internal|legacy|old|test|dev|staging|sandbox|beta|private|draft|temp|experimental|deprecated/.test(lowerPath)
      ) {
        status = "Shadow API";
      } else if (
        (/v1\/.*(?:user|auth|payment|order)/.test(lowerPath) && !/v2/.test(lowerPath)) ||
        /deprecated|legacy/.test(lowerPath)
      ) {
        status = "Zombie Endpoint";
      }

      // Extract parameters from query params
      const parameters = [];
      epObj.searchParams.forEach((val, key) => {
        parameters.push({
          name: key,
          location: "query",
          paramType: "string",
          required: false,
          description: `Discovered query parameter: ${key}`,
        });
      });

      // Find matching Vulnerability documents in DB if available
      const vulnDocs = await Vulnerability.find({
        $or: [{ scanId: scanIdStr }, { scanId: scan._id }],
        endpoint: { $regex: path, $options: "i" },
      }).select("_id");
      const vulnIds = vulnDocs.map((v) => v._id);

      await ApiEndpoint.findOneAndUpdate(
        { host, path, method },
        {
          $set: {
            host,
            path,
            method,
            protocol: "REST",
            authType,
            status,
            riskScore,
            dataSensitivity: Array.from(new Set(sensitivityTags)),
            vulnerabilitiesCount: matchedFindings.length,
            lastScannedAt: new Date(),
          },
          $addToSet: {
            scannedInScans: scanIdStr,
            vulnerabilities: { $each: vulnIds },
            parameters: { $each: parameters },
          },
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("[inventory.service] Error ingesting scan endpoints:", error);
  }
}

/**
 * Returns summary KPI metrics for API Inventory dashboard.
 */
async function getInventoryStats(hostFilter) {
  const filter = hostFilter ? { host: { $regex: hostFilter, $options: "i" } } : {};

  const totalEndpoints = await ApiEndpoint.countDocuments(filter);
  const shadowApis = await ApiEndpoint.countDocuments({ ...filter, status: "Shadow API" });
  const zombieEndpoints = await ApiEndpoint.countDocuments({ ...filter, status: "Zombie Endpoint" });
  const publicUnauthenticated = await ApiEndpoint.countDocuments({
    ...filter,
    authType: "Public / Unauthenticated",
  });
  const criticalRisk = await ApiEndpoint.countDocuments({ ...filter, riskScore: "Critical" });
  const highRisk = await ApiEndpoint.countDocuments({ ...filter, riskScore: "High" });

  const piiEndpointsCount = await ApiEndpoint.countDocuments({
    ...filter,
    dataSensitivity: { $in: ["PII", "Financial", "AuthToken"] },
  });

  const publicPercent = totalEndpoints > 0 ? Math.round((publicUnauthenticated / totalEndpoints) * 100) : 0;

  return {
    totalEndpoints,
    shadowApis,
    zombieEndpoints,
    publicUnauthenticated,
    publicPercent,
    criticalRisk,
    highRisk,
    highRiskTotal: criticalRisk + highRisk,
    piiEndpointsCount,
  };
}

/**
 * Returns grouped website target cards (Domain-First Hierarchy).
 */
async function getTargetWebsites() {
  const targets = await ApiEndpoint.aggregate([
    {
      $group: {
        _id: "$host",
        host: { $first: "$host" },
        totalEndpoints: { $sum: 1 },
        shadowApisCount: {
          $sum: { $cond: [{ $eq: ["$status", "Shadow API"] }, 1, 0] },
        },
        zombieEndpointsCount: {
          $sum: { $cond: [{ $eq: ["$status", "Zombie Endpoint"] }, 1, 0] },
        },
        publicCount: {
          $sum: { $cond: [{ $eq: ["$authType", "Public / Unauthenticated"] }, 1, 0] },
        },
        criticalCount: {
          $sum: { $cond: [{ $eq: ["$riskScore", "Critical"] }, 1, 0] },
        },
        highCount: {
          $sum: { $cond: [{ $eq: ["$riskScore", "High"] }, 1, 0] },
        },
        piiCount: {
          $sum: {
            $cond: [{ $gt: [{ $size: { $setIntersection: ["$dataSensitivity", ["PII", "Financial", "AuthToken"]] } }, 0] }, 1, 0],
          },
        },
        lastScannedAt: { $max: "$lastScannedAt" },
      },
    },
    { $sort: { lastScannedAt: -1 } },
  ]);

  return targets;
}

/**
 * Search and filter inventory endpoints with pagination.
 */
async function getFilteredEndpoints(query = {}) {
  const {
    search = "",
    method = "",
    protocol = "",
    authType = "",
    status = "",
    riskScore = "",
    resourceType = "",
    verifiedOnly = false,
    host = "",
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { path: { $regex: search, $options: "i" } },
      { host: { $regex: search, $options: "i" } },
      { "parameters.name": { $regex: search, $options: "i" } },
      { owner: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (method && method !== "ALL") filter.method = method.toUpperCase();
  if (protocol && protocol !== "ALL") filter.protocol = protocol;
  if (authType && authType !== "ALL") filter.authType = authType;
  if (status && status !== "ALL") filter.status = status;
  if (riskScore && riskScore !== "ALL") filter.riskScore = riskScore;
  if (resourceType && resourceType !== "ALL") filter.resourceType = resourceType;
  if (verifiedOnly === "true" || verifiedOnly === true) filter.isVerifiedApi = true;
  if (host) filter.host = { $regex: host, $options: "i" };

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const parsedLimit = parseInt(limit);

  const endpoints = await ApiEndpoint.find(filter)
    .sort({ riskScore: 1, vulnerabilitiesCount: -1, updatedAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .populate("vulnerabilities", "title severity cve cvssScore");

  const total = await ApiEndpoint.countDocuments(filter);

  return {
    endpoints,
    pagination: {
      total,
      page: parseInt(page),
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit) || 1,
    },
  };
}

/**
 * Get endpoint detail by ID.
 */
async function getEndpointDetails(id) {
  return await ApiEndpoint.findById(id).populate("vulnerabilities");
}

/**
 * Update metadata (notes, owner, tags, status, riskScore).
 */
async function updateEndpointMetadata(id, updates) {
  return await ApiEndpoint.findByIdAndUpdate(id, { $set: updates }, { new: true });
}

/**
 * Trigger an instant target scan directly from /inventory dashboard and ingest findings.
 */
async function triggerDirectTargetScan(targetUrl) {
  const { scanApiInventory } = require("../scanner/api-inventory.scanner");

  if (!targetUrl) throw new Error("Target URL is required for inventory scan.");

  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch (e) {
    throw new Error("Invalid Target URL format.");
  }

  const host = urlObj.origin;

  // Run Multi-Vector Scanner Engine (Fuzzer, Prober, JS Bundle Extractor)
  const findings = await scanApiInventory({ targetUrl, crawledEndpoints: [{ url: targetUrl, method: "GET" }] });

  const inventoryData = findings.find((f) => f.category === "API Inventory")?.inventory;
  const discoveredEndpoints = inventoryData?.endpoints || [{ path: urlObj.pathname || "/", methods: ["GET"], source: "Direct Scan", httpStatus: 200 }];

  const ingested = [];

  for (const ep of discoveredEndpoints) {
    const path = ep.path || "/";
    const methods = Array.isArray(ep.methods) ? ep.methods : [ep.method || "GET"];

    for (const rawMethod of methods) {
      const method = rawMethod.toUpperCase();
      const lowerPath = path.toLowerCase();

      // Intelligent Auth Scheme Categorization
      let authType = "Public / Unauthenticated";
      if (ep.isProtected || [401, 403].includes(ep.httpStatus)) {
        authType = "Bearer JWT";
      } else if (/auth|login|token|me|user|profile|account|admin|dashboard|billing|payment|checkout|settings|keys/.test(lowerPath)) {
        authType = "Bearer JWT";
      } else if (/api-key|key|token|private/.test(lowerPath)) {
        authType = "API Key";
      }

      // Hardened Data Sensitivity Tags
      const sensitivityTags = ["Public"];
      if (/user|profile|email|account|person|ssn|health|patient|dob|phone|mobile|address|customer|member/.test(lowerPath)) {
        sensitivityTags.push("PII");
      }
      if (/card|pay|billing|checkout|bank|wallet|invoice|stripe|paypal|transaction|credit/.test(lowerPath)) {
        sensitivityTags.push("Financial");
      }
      if (/auth|token|login|password|secret|jwt|session|key|credential|bearer|oauth/.test(lowerPath)) {
        sensitivityTags.push("AuthToken");
      }
      if (/internal|admin|system|config|metric|log|telemetry|debug/.test(lowerPath)) {
        sensitivityTags.push("Internal");
      }

      // Hardened Status Classification
      let status = "Active";
      if (/internal|legacy|old|test|dev|staging|sandbox|beta|draft|temp|experimental|private/.test(lowerPath)) {
        status = "Shadow API";
      } else if (/v1\/.*(?:user|auth|payment|order)/.test(lowerPath) && !/v2/.test(lowerPath)) {
        status = "Zombie Endpoint";
      }

      // Risk Score Determination
      let riskScore = "Low";
      if (status === "Shadow API" || (sensitivityTags.includes("PII") && authType === "Public / Unauthenticated")) {
        riskScore = "Critical";
      } else if (authType !== "Public / Unauthenticated" || sensitivityTags.includes("Financial")) {
        riskScore = "High";
      } else if (sensitivityTags.includes("AuthToken")) {
        riskScore = "Medium";
      }

      const doc = await ApiEndpoint.findOneAndUpdate(
        { host, path, method },
        {
          $set: {
            host,
            path,
            method,
            protocol: lowerPath.includes("graphql") || ep.isGraphQL ? "GraphQL" : "REST",
            authType,
            status,
            riskScore,
            dataSensitivity: Array.from(new Set(sensitivityTags)),
            resourceType: ep.resourceType || (lowerPath.includes("sitemap") ? "Sitemap" : lowerPath.includes("graphql") ? "GraphQL" : "REST API"),
            isVerifiedApi: ep.isVerifiedApi !== undefined ? ep.isVerifiedApi : !lowerPath.includes("sitemap") && !lowerPath.endsWith(".html"),
            technology: ep.technology || "Express / Node.js",
            contentType: ep.contentType || "application/json",
            apiVersion: lowerPath.match(/\/v[0-9]\//)?.[0]?.replace(/\//g, "") || "v1",
            responseTimeMs: ep.responseTimeMs || 120,
            corsEnabled: ep.corsEnabled || false,
            rateLimitPresent: ep.rateLimitPresent || false,
            cdnGateway: ep.cdnGateway || "Direct Server",
            isSwagger: ep.isSwagger || false,
            isGraphQL: ep.isGraphQL || false,
            jsonSchema: ep.jsonSchema || null,
            sampleResponse: ep.sampleResponse || null,
            lastScannedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
      ingested.push(doc);
    }
  }

  return { success: true, count: ingested.length, host, endpoints: ingested };
}

/**
 * Import OpenAPI 3.0 / Swagger / Postman v2.1 Collection specification into ApiEndpoint database.
 */
async function importOpenApiSpec(specObj, targetHost = "https://api.example.com") {
  if (!specObj || typeof specObj !== "object") {
    throw new Error("Invalid specification format.");
  }

  let count = 0;
  const importedHost = specObj.servers && specObj.servers[0]?.url ? specObj.servers[0].url : targetHost;

  // Handle Postman v2.1 Collection Format (Task 160.2)
  if (Array.isArray(specObj.item) || specObj.info?.schema?.includes("collection")) {
    const parsePostmanItems = async (items) => {
      for (const item of items) {
        if (item.request) {
          const method = (item.request.method || "GET").toUpperCase();
          let rawUrl = typeof item.request.url === "string" ? item.request.url : item.request.url?.raw || "/";
          let path = "/";
          let host = importedHost;
          try {
            const u = new URL(rawUrl, importedHost);
            path = u.pathname || "/";
            host = u.origin;
          } catch (e) {
            path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
          }

          const parameters = (item.request.url?.query || []).map((q) => ({
            name: q.key,
            location: "query",
            paramType: "string",
            required: false,
            description: q.description || "",
          }));

          await ApiEndpoint.findOneAndUpdate(
            { host, path, method },
            {
              $set: {
                host,
                path,
                method,
                protocol: "REST",
                status: "Active",
                notes: item.name || "",
                parameters,
                lastScannedAt: new Date(),
              },
            },
            { upsert: true, new: true }
          );
          count++;
        }
        if (Array.isArray(item.item)) {
          await parsePostmanItems(item.item);
        }
      }
    };

    await parsePostmanItems(specObj.item);
    return { success: true, importedCount: count, host: importedHost, format: "Postman Collection v2.1" };
  }

  // Standard OpenAPI / Swagger Spec Format
  const pathsObj = specObj.paths || {};

  for (const [pathKey, methods] of Object.entries(pathsObj)) {
    for (const [methodKey, details] of Object.entries(methods)) {
      const method = methodKey.toUpperCase();
      if (!["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(method)) continue;

      const summary = details.summary || details.description || "";
      const parameters = (details.parameters || []).map((p) => ({
        name: p.name,
        location: p.in || "query",
        paramType: p.schema?.type || "string",
        required: !!p.required,
        description: p.description || "",
      }));

      await ApiEndpoint.findOneAndUpdate(
        { host: importedHost, path: pathKey, method },
        {
          $set: {
            host: importedHost,
            path: pathKey,
            method,
            protocol: "REST",
            status: "Active",
            notes: summary,
            parameters,
            lastScannedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
      count++;
    }
  }

  return { success: true, importedCount: count, host: importedHost, format: "OpenAPI Spec 3.0" };
}

/**
 * Generate OpenAPI 3.0.3 specification JSON from database inventory.
 */
async function generateOpenApiSpec(hostFilter) {
  const filter = hostFilter ? { host: { $regex: hostFilter, $options: "i" } } : {};
  const endpoints = await ApiEndpoint.find(filter);

  const paths = {};

  endpoints.forEach((ep) => {
    if (!paths[ep.path]) {
      paths[ep.path] = {};
    }

    const methodKey = ep.method.toLowerCase();
    paths[ep.path][methodKey] = {
      summary: ep.notes || `${ep.method} ${ep.path}`,
      description: `Security Risk: ${ep.riskScore} | Auth: ${ep.authType} | Discovered via ATHX Scanner`,
      tags: ep.dataSensitivity || ["API"],
      parameters: (ep.parameters || []).map((p) => ({
        name: p.name,
        in: p.location || "query",
        required: p.required || false,
        schema: { type: p.paramType || "string" },
        description: p.description || "",
      })),
      responses: {
        200: {
          description: "Successful Operation",
        },
        401: {
          description: "Unauthorized / Missing Authentication",
        },
        500: {
          description: "Internal Server Error",
        },
      },
    };
  });

  return {
    openapi: "3.0.3",
    info: {
      title: "ATHX Discovered API Inventory",
      version: "3.0.0",
      description: "Auto-generated OpenAPI specification compiled from live security scanner telemetry.",
    },
    servers: [
      {
        url: hostFilter || "https://api.target.com",
        description: "Target Host",
      },
    ],
    paths,
  };
}

module.exports = {
  ingestEndpointsFromScan,
  triggerDirectTargetScan,
  getInventoryStats,
  getTargetWebsites,
  getFilteredEndpoints,
  getEndpointDetails,
  updateEndpointMetadata,
  importOpenApiSpec,
  generateOpenApiSpec,
};
