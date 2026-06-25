const axios = require("axios");

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
