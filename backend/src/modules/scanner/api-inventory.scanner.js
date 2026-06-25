const axios = require("axios");

const OPENAPI_DISCOVERY_PATHS = [
  "/openapi.json",
  "/swagger.json",
  "/api-docs",
  "/v3/api-docs",
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
];

const ADMIN_KEYWORDS = [
  "admin",
  "role",
  "permission",
  "user-management",
  "settings",
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
  "admin",
];

const scanApiInventory = async (targetUrl) => {
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

    for (const [path, operations] of Object.entries(openApiSpec.paths)) {
      inventory.totalEndpoints++;

      const lowerPath = path.toLowerCase();

      const endpointInfo = {
        path,
        methods: [],
        riskScore: 0,
        riskLevel: "Low",
      };

      for (const method of Object.keys(operations)) {
        const upperMethod = method.toUpperCase();

        endpointInfo.methods.push(upperMethod);

        inventory.totalOperations++;

        if (inventory.methods[upperMethod] !== undefined) {
          inventory.methods[upperMethod]++;
        }
      }

      inventory.endpoints.push(endpointInfo);

      if (AUTH_KEYWORDS.some((keyword) => lowerPath.includes(keyword))) {
        inventory.authEndpoints.push(endpointInfo);
      }

      if (ADMIN_KEYWORDS.some((keyword) => lowerPath.includes(keyword))) {
        inventory.adminEndpoints.push(endpointInfo);
      }

      if (SENSITIVE_KEYWORDS.some((keyword) => lowerPath.includes(keyword))) {
        inventory.sensitiveEndpoints.push(endpointInfo);
      }
    }

    findings.push({
      title: "API Inventory Analysis",

      severity: "info",

      category: "API Inventory",

      description: `Discovered ${inventory.totalEndpoints} endpoints and ${inventory.totalOperations} operations.`,

      recommendation:
        "Review exposed API inventory and restrict unnecessary endpoints.",

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
};
