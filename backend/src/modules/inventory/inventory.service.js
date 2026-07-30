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

      // Calculate risk score based on matched findings
      let riskScore = "Low";
      const severities = matchedFindings.map((f) => (f.severity || "").toLowerCase());
      if (severities.includes("critical")) riskScore = "Critical";
      else if (severities.includes("high")) riskScore = "High";
      else if (severities.includes("medium")) riskScore = "Medium";
      else if (matchedFindings.length === 0) riskScore = "Secure";

      // Detect Data Sensitivity Tags
      const sensitivityTags = ["Public"];
      const lowerPath = path.toLowerCase();
      if (/user|profile|email|account|person|ssn|health|patient/.test(lowerPath)) {
        sensitivityTags.push("PII");
      }
      if (/card|pay|billing|checkout|bank|wallet|invoice/.test(lowerPath)) {
        sensitivityTags.push("Financial");
      }
      if (/auth|token|login|password|secret|jwt|session|key/.test(lowerPath)) {
        sensitivityTags.push("AuthToken");
      }

      // Detect Auth Type
      let authType = "Public / Unauthenticated";
      if (/auth|login|token|admin|dashboard|user|api\/v/.test(lowerPath)) {
        authType = "Bearer JWT";
      }

      // Detect Status (Shadow vs Active)
      let status = "Active";
      if (/internal|legacy|old|test|dev|staging|sandbox/.test(lowerPath)) {
        status = "Shadow API";
      } else if (/v1\/.*(?:user|auth)/.test(lowerPath) && /v2/.test(lowerPath)) {
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
 * Import OpenAPI 3.0 / Swagger specification object into ApiEndpoint database.
 */
async function importOpenApiSpec(specObj, targetHost = "https://api.example.com") {
  if (!specObj || typeof specObj !== "object") {
    throw new Error("Invalid OpenAPI specification format.");
  }

  const pathsObj = specObj.paths || {};
  const importedHost = specObj.servers && specObj.servers[0]?.url ? specObj.servers[0].url : targetHost;

  let count = 0;
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

  return { success: true, importedCount: count, host: importedHost };
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
  getInventoryStats,
  getFilteredEndpoints,
  getEndpointDetails,
  updateEndpointMetadata,
  importOpenApiSpec,
  generateOpenApiSpec,
};
