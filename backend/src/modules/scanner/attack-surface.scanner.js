const axios = require("axios");

const scanAttackSurface = async (targetUrl) => {
  const findings = [];

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        "User-Agent": "API-Security-Scanner/1.0",
      },
    });

    const data = response.data;

    if (!data || !data.paths) {
      return findings;
    }

    const paths = Object.entries(data.paths);

    let adminCount = 0;
    let authCount = 0;
    let sensitiveCount = 0;
    let dangerousMethodCount = 0;

    const dangerousMethods = ["delete", "put", "patch"];

    for (const [path, methods] of paths) {
      const lowerPath = path.toLowerCase();

      /*
       * Admin endpoints
       */
      if (
        lowerPath.includes("admin") ||
        lowerPath.includes("management") ||
        lowerPath.includes("system")
      ) {
        adminCount++;
      }

      /*
       * Auth endpoints
       */
      if (
        lowerPath.includes("login") ||
        lowerPath.includes("logout") ||
        lowerPath.includes("register") ||
        lowerPath.includes("auth") ||
        lowerPath.includes("token") ||
        lowerPath.includes("oauth")
      ) {
        authCount++;
      }

      /*
       * Sensitive endpoints
       */
      if (
        lowerPath.includes("upload") ||
        lowerPath.includes("export") ||
        lowerPath.includes("import") ||
        lowerPath.includes("debug") ||
        lowerPath.includes("internal") ||
        lowerPath.includes("config") ||
        lowerPath.includes("backup")
      ) {
        sensitiveCount++;
      }

      /*
       * Dangerous methods
       */
      const methodNames = Object.keys(methods || {});

      for (const method of methodNames) {
        if (dangerousMethods.includes(method.toLowerCase())) {
          dangerousMethodCount++;
        }
      }
    }

    if (adminCount > 0) {
      findings.push({
        title: "Administrative Endpoints Discovered",
        severity: "medium",
        category: "Attack Surface",
        description: `${adminCount} administrative endpoints discovered.`,
        recommendation:
          "Verify administrative endpoints require strong authentication and authorization.",
      });
    }

    if (authCount > 0) {
      findings.push({
        title: "Authentication Endpoints Discovered",
        severity: "info",
        category: "Attack Surface",
        description: `${authCount} authentication endpoints discovered.`,
        recommendation:
          "Verify authentication endpoints enforce MFA, rate limiting, and account lockout protections.",
      });
    }

    if (sensitiveCount > 0) {
      findings.push({
        title: "Sensitive Endpoints Discovered",
        severity: "medium",
        category: "Attack Surface",
        description: `${sensitiveCount} potentially sensitive endpoints discovered.`,
        recommendation:
          "Review access controls, logging, and data exposure risks.",
      });
    }

    if (dangerousMethodCount > 0) {
      findings.push({
        title: "State-Changing Operations Discovered",
        severity: "info",
        category: "Attack Surface",
        description: `${dangerousMethodCount} PUT/PATCH/DELETE operations discovered.`,
        recommendation:
          "Verify authorization checks, audit logging, and object-level access controls.",
      });
    }

    return findings;
  } catch (error) {
    return findings;
  }
};

module.exports = {
  scanAttackSurface,
};
