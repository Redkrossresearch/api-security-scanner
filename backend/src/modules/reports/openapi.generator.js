/**
 * Generates an OpenAPI specification v3.0 dynamically from scanned routes.
 */

const generateOpenApiSpec = (scan, vulnerabilities = []) => {
  const inventoryFinding = vulnerabilities.find(
    (v) =>
      v.category === "API Inventory" || v.title === "API Inventory Analysis",
  );

  const paths = {};
  const targetUrl = scan.targetUrl || "http://example.com";

  if (
    inventoryFinding &&
    inventoryFinding.inventory &&
    inventoryFinding.inventory.endpoints
  ) {
    inventoryFinding.inventory.endpoints.forEach((ep) => {
      const pathKey = ep.path.startsWith("/") ? ep.path : `/${ep.path}`;
      const operations = {};

      const methods =
        ep.methods && ep.methods.length > 0 ? ep.methods : ["GET"];
      methods.forEach((m) => {
        operations[m.toLowerCase()] = {
          summary: `Auto-discovered ${m} operation`,
          description: `Identified by the crawler under endpoint path: ${ep.path}. Risk level is evaluated as ${ep.riskLevel || "Low"}.`,
          responses: {
            200: {
              description: "Successful response returning data structures.",
            },
            400: {
              description: "Bad Request. Parameter validation failure.",
            },
            401: {
              description: "Unauthorized. Missing authorization token.",
            },
          },
        };
      });

      paths[pathKey] = operations;
    });
  } else {
    // Fallback default endpoint
    paths["/"] = {
      get: {
        summary: "Target base path",
        description: "Base API route mapped during crawler fallback sequence.",
        responses: {
          200: {
            description: "Success",
          },
        },
      },
    };
  }

  const spec = {
    openapi: "3.0.0",
    info: {
      title: `ATHX Security - Reconstructed Spec (${scan.assetName || "Target"})`,
      version: "1.0.0",
      description: `API Specification reverse-engineered from ATHX Security Web Crawler endpoints inventory.\nScan ID: ${scan._id || "N/A"}\nGenerated: ${new Date().toISOString()}`,
    },
    servers: [
      {
        url: targetUrl,
      },
    ],
    paths,
  };

  return spec;
};

module.exports = {
  generateOpenApiSpec,
};
