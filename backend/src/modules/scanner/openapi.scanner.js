const axios = require("axios");
const yamlParser = require("js-yaml");

const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const OPENAPI_PATHS = [
  "/openapi.json",
  "/swagger.json",
  "/api-docs",
  "/v3/api-docs",
  "/v2/api-docs",
  "/swagger-ui",
  "/swagger-ui.html",
  "/openapi.yml",
  "/swagger.yml",
  "/redoc",
  "/redoc.html",
  "/docs",
  "/swagger/index.html",
  "/openapi.yaml",
  "/swagger.yaml",
  "/v3/openapi.json",
  "/api/openapi.json",
  "/api/swagger.json",
  "/api/docs",
  "/v1/api-docs",
  "/v2/swagger.json",
  "/v3/swagger.json",
  "/swagger-ui/index.html",
];

const auditOpenApiSchema = (doc, targetUrl) => {
  const schemaFindings = [];
  if (!doc || typeof doc !== "object") return schemaFindings;

  const servers = doc.servers || [];
  const paths = doc.paths || {};
  const globalSecurity = doc.security || [];

  // Helper to check if authentication is defined
  const isAuthRequired = (operationSecurity) => {
    const security =
      operationSecurity !== undefined ? operationSecurity : globalSecurity;
    return Array.isArray(security) && security.length > 0;
  };

  // Rule 1: Weak Server Protocol (HTTP)
  const insecureServers = servers.filter(
    (s) => s.url && s.url.startsWith("http://"),
  );
  if (insecureServers.length > 0) {
    schemaFindings.push({
      title: "Insecure Communication Protocol in API Servers",
      severity: "medium",
      category: "Security Misconfiguration",
      description: `The API schema defines insecure server URL endpoint schemes: ${insecureServers.map((s) => s.url).join(", ")}. Using unencrypted HTTP allows intercepting traffic (CWE-319).`,
      recommendation:
        "Ensure all server endpoints defined in the API specification use secure HTTPS communication.",
      owasp: "API5:2023 Security Misconfiguration",
      cwe: "CWE-319",
      cvss: 5.9,
      remediationSteps: [
        "Change the scheme of server URLs from http:// to https://.",
        "Configure servers to reject unencrypted traffic and enforce TLS.",
      ],
      endpoint: "/servers",
      evidence: JSON.stringify(insecureServers),
      verified: true,
    });
  }

  let unauthStateChanges = [];
  let bolaRisks = [];
  let piiExposures = [];
  let hasRateLimitingResponse = false;

  for (const [path, operations] of Object.entries(paths)) {
    if (!operations || typeof operations !== "object") continue;

    for (const [method, operation] of Object.entries(operations)) {
      if (!operation || typeof operation !== "object") continue;
      const lowerMethod = method.toLowerCase();

      // Skip non-HTTP methods like parameters or summary extensions
      if (
        !["get", "post", "put", "patch", "delete", "options", "head"].includes(
          lowerMethod,
        )
      ) {
        continue;
      }

      // Check if this method has a rate limit status code documented
      const responses = operation.responses || {};
      if (responses["429"]) {
        hasRateLimitingResponse = true;
      }

      const authRequired = isAuthRequired(operation.security);

      // Rule 2: Unauthenticated State-Changing Operations
      if (
        ["post", "put", "patch", "delete"].includes(lowerMethod) &&
        !authRequired
      ) {
        unauthStateChanges.push(`${lowerMethod.toUpperCase()} ${path}`);
      }

      // Rule 3: BOLA / Parameterized Authorization Lacking
      const hasPathParameters = path.includes("{");
      if (hasPathParameters && !authRequired) {
        bolaRisks.push(`${lowerMethod.toUpperCase()} ${path}`);
      }

      // Rule 4: PII / Sensitive data exposure in request parameters or response body schemas
      const searchForSensitiveKeys = (obj, pathTracker = []) => {
        if (!obj || typeof obj !== "object") return;

        const sensitiveKeys = [
          "password",
          "ssn",
          "social_security",
          "socialsecurity",
          "creditcard",
          "credit_card",
          "cardnumber",
          "cvv",
          "secret",
          "privatekey",
          "private_key",
          "authtoken",
          "auth_token",
        ];

        for (const [key, val] of Object.entries(obj)) {
          if (sensitiveKeys.includes(key.toLowerCase())) {
            piiExposures.push({
              path: `${lowerMethod.toUpperCase()} ${path}`,
              property: [...pathTracker, key].join("."),
            });
          }
          if (typeof val === "object") {
            searchForSensitiveKeys(val, [...pathTracker, key]);
          }
        }
      };

      if (operation.parameters) {
        searchForSensitiveKeys(operation.parameters);
      }
      if (responses) {
        searchForSensitiveKeys(responses);
      }
      if (operation.requestBody) {
        searchForSensitiveKeys(operation.requestBody);
      }
    }
  }

  if (unauthStateChanges.length > 0) {
    schemaFindings.push({
      title: "Missing Authentication for State-Changing API Endpoints",
      severity: "high",
      category: "Broken Authentication",
      description: `The specification documents ${unauthStateChanges.length} state-changing operations that do not require any security credentials or token validations: \n${unauthStateChanges.slice(0, 5).join(", ")}${unauthStateChanges.length > 5 ? "..." : ""}. Unauthenticated access to state-changing operations allows critical logic execution without identity proof (CWE-306).`,
      recommendation:
        "Define a security requirement block globally or per-operation in the OpenAPI schema, and implement backend verification.",
      owasp: "API2:2023 Broken Authentication",
      cwe: "CWE-306",
      cvss: 8.5,
      remediationSteps: [
        "Register security schemes (e.g. BearerToken, OAuth2) in components/securitySchemes.",
        "Add security arrays to enforce authentication globally or on sensitive operations.",
      ],
      endpoint: unauthStateChanges[0].split(" ")[1],
      evidenceSnippet: unauthStateChanges.join("\n"),
      verified: true,
    });
  }

  if (bolaRisks.length > 0) {
    schemaFindings.push({
      title: "Broken Object Level Authorization (BOLA) Exposure",
      severity: "high",
      category: "Broken Object Level Authorization",
      description: `API schema documents ${bolaRisks.length} parameterized reference routes without requiring authentication filters: \n${bolaRisks.slice(0, 5).join(", ")}${bolaRisks.length > 5 ? "..." : ""}. This allows attackers to access/modify resources dynamically by altering identifiers (CWE-639).`,
      recommendation:
        "Configure these endpoints to require authorization verification and authenticate the requesting user's session.",
      owasp: "API1:2023 Broken Object Level Authorization",
      cwe: "CWE-639",
      cvss: 8.1,
      remediationSteps: [
        "Enforce token verification checks on all parameterized routes.",
        "Verify ownership of the requested resource identifiers at the controller level.",
      ],
      endpoint: bolaRisks[0].split(" ")[1],
      evidenceSnippet: bolaRisks.join("\n"),
      verified: true,
    });
  }

  if (piiExposures.length > 0) {
    const uniqExposures = piiExposures.filter(
      (v, i, a) =>
        a.findIndex((t) => t.path === v.path && t.property === v.property) ===
        i,
    );
    schemaFindings.push({
      title: "Sensitive Property Level Data Exposure in API Spec",
      severity: "medium",
      category: "Broken Object Property Level Authorization",
      description: `Found ${uniqExposures.length} schema fields exposing potential sensitive details (such as tokens, passwords, or PII) in API request parameters or response payloads: \n${uniqExposures
        .slice(0, 5)
        .map((e) => `${e.path} (${e.property})`)
        .join(", ")}${uniqExposures.length > 5 ? "..." : ""}. (CWE-200)`,
      recommendation:
        "Ensure sensitive parameters are filtered, encrypted, or omitted from public schemas unless absolutely required.",
      owasp: "API3:2023 Broken Object Property Level Authorization",
      cwe: "CWE-200",
      cvss: 6.5,
      remediationSteps: [
        "Omit fields like cleartext passwords, tokens, or SSNs from API response models.",
        "Enforce strict read/write property schema filters.",
      ],
      endpoint: uniqExposures[0].path.split(" ")[1],
      evidenceSnippet: uniqExposures
        .map((e) => `${e.path} -> ${e.property}`)
        .join("\n"),
      verified: true,
    });
  }

  if (!hasRateLimitingResponse && Object.keys(paths).length > 0) {
    schemaFindings.push({
      title: "Missing Rate-Limiting Documented Status Code",
      severity: "low",
      category: "Unrestricted Resource Consumption",
      description:
        "The API specification does not document any HTTP 429 (Too Many Requests) rate limit responses for its endpoints (CWE-770).",
      recommendation:
        "Implement rate limiting policies on API endpoints and document HTTP 429 responses in the specification.",
      owasp: "API4:2023 Unrestricted Resource Consumption",
      cwe: "CWE-770",
      cvss: 3.2,
      remediationSteps: [
        "Configure rate limiters (e.g. rate-limit middleware or gateway rules).",
        "Add a 429 response schema object under the paths definitions.",
      ],
      endpoint: "/rate-limiting",
      verified: true,
    });
  }

  return schemaFindings;
};

const scanOpenAPI = async (targetUrl) => {
  const findings = [];

  const lowerUrl = targetUrl.toLowerCase();

  const isDirectOpenApiUrl =
    lowerUrl.includes("openapi.json") ||
    lowerUrl.includes("swagger.json") ||
    lowerUrl.includes("/api-docs") ||
    lowerUrl.includes("/v3/api-docs") ||
    lowerUrl.includes("openapi.yaml") ||
    lowerUrl.includes("swagger.yaml") ||
    lowerUrl.includes("openapi.yml") ||
    lowerUrl.includes("swagger.yml") ||
    lowerUrl.includes("/v2/swagger.json") ||
    lowerUrl.includes("/v3/swagger.json");

  const parseAndAudit = (data) => {
    let doc = null;
    try {
      if (typeof data === "object") {
        doc = data;
      } else {
        try {
          doc = JSON.parse(data);
        } catch {
          doc = yamlParser.load(data);
        }
      }
    } catch (e) {
      console.error("OpenAPI parser error:", e.message);
    }
    if (doc) {
      return auditOpenApiSchema(doc, targetUrl);
    }
    return [];
  };

  if (isDirectOpenApiUrl) {
    try {
      const response = await axios.get(targetUrl, {
        timeout: 5000,
        validateStatus: () => true,
        maxRedirects: 5,
        headers: {
          "User-Agent": "API-Security-Scanner/1.0",
        },
      });

      const data = response.data;

      const isOpenApiDocument =
        (typeof data === "object" &&
          (data.openapi || data.swagger || data.paths)) ||
        (typeof data === "string" &&
          (data.includes("openapi:") || data.includes("swagger:")));

      if (lowerUrl.includes("redoc") || lowerUrl.includes("/docs")) {
        const swaggerFinding = createFinding("SWAGGER_UI_EXPOSED");

        if (swaggerFinding) {
          findings.push(swaggerFinding);
        }
      }

      if (isOpenApiDocument) {
        const finding = createFinding("OPENAPI_EXPOSED");

        if (lowerUrl.includes("swagger") || lowerUrl.includes("swagger-ui")) {
          const swaggerFinding = createFinding("SWAGGER_UI_EXPOSED");

          if (swaggerFinding) {
            findings.push(swaggerFinding);
          }
        }

        if (finding) {
          findings.push(finding);
        }

        const schemaFindings = parseAndAudit(data);
        findings.push(...schemaFindings);

        return findings;
      }
    } catch {}

    return findings;
  }

  for (const path of OPENAPI_PATHS) {
    try {
      const response = await axios.get(`${targetUrl}${path}`, {
        timeout: 5000,
        validateStatus: () => true,
        maxRedirects: 10,
        headers: {
          "User-Agent": "API-Security-Scanner/1.0",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const content =
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data);

        const isOpenApiDocument =
          content.includes('"openapi"') ||
          content.includes('"swagger"') ||
          content.includes("openapi:") ||
          content.includes("swagger:") ||
          content.includes("/components/schemas") ||
          content.includes('"paths"');

        if (isOpenApiDocument) {
          const finding = createFinding("OPENAPI_EXPOSED");

          if (
            path.includes("swagger") ||
            path.includes("swagger-ui") ||
            path.includes("redoc")
          ) {
            const swaggerFinding = createFinding("SWAGGER_UI_EXPOSED");

            if (swaggerFinding) {
              findings.push(swaggerFinding);
            }
          }

          if (finding) {
            findings.push(finding);
          }

          const schemaFindings = parseAndAudit(response.data);
          findings.push(...schemaFindings);

          break;
        }
      }
    } catch {
      continue;
    }
  }

  return findings;
};

module.exports = {
  scanOpenAPI,
};
