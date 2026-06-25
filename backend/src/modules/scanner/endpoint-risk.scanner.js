const axios = require("axios");

const OPENAPI_DISCOVERY_PATHS = [
  "/openapi.json",
  "/swagger.json",
  "/api-docs",
  "/v3/api-docs",
];

const scanEndpointRisk = async (targetUrl) => {
  const findings = [];

  try {
    let openApiSpec = null;

    try {
      const response = await axios.get(targetUrl, {
        timeout: 10000,
        validateStatus: () => true,
        headers: {
          "User-Agent": "API-Security-Scanner/1.0",
        },
      });

      if (response.data?.paths) {
        openApiSpec = response.data;
      }
    } catch {}

    if (!openApiSpec) {
      for (const path of OPENAPI_DISCOVERY_PATHS) {
        try {
          const response = await axios.get(`${targetUrl}${path}`, {
            timeout: 5000,
            validateStatus: () => true,
            headers: {
              "User-Agent": "API-Security-Scanner/1.0",
            },
          });

          if (response.data?.paths) {
            openApiSpec = response.data;
            break;
          }
        } catch {}
      }
    }

    if (!openApiSpec?.paths) {
      return findings;
    }

    const riskyEndpoints = [];

    for (const [path, operations] of Object.entries(openApiSpec.paths)) {
      const lowerPath = path.toLowerCase();

      let riskScore = 0;

      if (
        lowerPath.includes("admin") ||
        lowerPath.includes("role") ||
        lowerPath.includes("permission")
      ) {
        riskScore += 40;
      }

      if (
        lowerPath.includes("auth") ||
        lowerPath.includes("login") ||
        lowerPath.includes("register") ||
        lowerPath.includes("token")
      ) {
        riskScore += 20;
      }

      if (
        lowerPath.includes("payment") ||
        lowerPath.includes("billing") ||
        lowerPath.includes("upload") ||
        lowerPath.includes("export") ||
        lowerPath.includes("internal") ||
        lowerPath.includes("debug")
      ) {
        riskScore += 30;
      }

      const methods = Object.keys(operations).map((m) => m.toUpperCase());

      if (methods.includes("DELETE")) {
        riskScore += 25;
      }

      if (methods.includes("PUT") || methods.includes("PATCH")) {
        riskScore += 15;
      }

      let riskLevel = "Low";

      if (riskScore >= 70) {
        riskLevel = "Critical";
      } else if (riskScore >= 50) {
        riskLevel = "High";
      } else if (riskScore >= 25) {
        riskLevel = "Medium";
      }

      if (riskScore >= 25) {
        riskyEndpoints.push({
          path,
          methods,
          riskScore,
          riskLevel,
        });
      }
    }

    if (riskyEndpoints.length > 0) {
      findings.push({
        title: "High Risk API Endpoints Discovered",
        severity: "medium",

        category: "Attack Surface",

        description: `${riskyEndpoints.length} risky API endpoints identified.`,

        recommendation:
          "Review authorization, input validation, audit logging, and access controls on sensitive endpoints.",

        inventory: {
          riskyEndpoints,
        },
      });
    }

    return findings;
  } catch (error) {
    console.error("Endpoint Risk Scanner Error:", error.message);

    return findings;
  }
};

module.exports = {
  scanEndpointRisk,
};
