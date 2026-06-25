const axios = require("axios");
const https = require("https");

const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanTechnology = async (targetUrl) => {
  const findings = [];

  try {
    const response = await axios.get(targetUrl, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    const headers = response.headers;

    const html = response.data?.toString().toLowerCase() || "";

    const detected = [];

    // Server Header

    const server = headers["server"];

    if (server) {
      if (server.toLowerCase().includes("nginx")) {
        detected.push("Nginx");
      }

      if (server.toLowerCase().includes("apache")) {
        detected.push("Apache");
      }

      if (server.toLowerCase().includes("cloudflare")) {
        detected.push("Cloudflare");
      }
    }

    // X-Powered-By

    const poweredBy = headers["x-powered-by"];

    if (poweredBy && poweredBy.toLowerCase().includes("node")) {
      detected.push("Node.js");
    }

    if (poweredBy) {
      if (poweredBy.toLowerCase().includes("express")) {
        detected.push("Express");
      }

      if (poweredBy.toLowerCase().includes("php")) {
        detected.push("PHP");
      }

      if (poweredBy.toLowerCase().includes("asp.net")) {
        detected.push("ASP.NET");
      }
    }

    // HTML Fingerprints

    if (html.includes("_nuxt")) {
      detected.push("Nuxt.js");
    }

    if (html.includes("__vue")) {
      detected.push("Vue.js");
    }

    if (html.includes("angular")) {
      detected.push("Angular");
    }

    if (html.includes("jquery")) {
      detected.push("jQuery");
    }

    if (html.includes("__next")) {
      detected.push("Next.js");
    }

    if (html.includes("wp-content")) {
      detected.push("WordPress");
    }

    if (html.includes("react")) {
      detected.push("React");
    }

    const unique = [...new Set(detected)].sort();

    unique.forEach((tech) => {
      const finding = createFinding("TECHNOLOGY_DETECTED");

      if (finding) {
        finding.description = `Technology detected: ${tech}`;

        findings.push(finding);
      }
    });
  } catch (error) {
    findings.push({
      title: "Technology Scan Failed",
      severity: "low",
      description: error.message,
    });
  }

  return findings;
};

module.exports = {
  scanTechnology,
};
