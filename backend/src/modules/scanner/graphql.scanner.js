const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanGraphQL = async (targetUrl) => {
  const findings = [];
  try {
    const urlObj = new URL(targetUrl);
    const graphqlEndpoint = `${urlObj.origin}/graphql`;

    const response = await axios.post(
      graphqlEndpoint,
      {
        query: "{ __schema { types { name } } }",
      },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Content-Type": "application/json",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 8000,
        validateStatus: () => true,
      }
    );

    if (
      response.status === 200 &&
      response.data?.data?.__schema?.types
    ) {
      const finding = createFinding("GRAPHQL_INTROSPECTION_ENABLED");
      if (finding) {
        finding.description = `GraphQL Introspection is publicly enabled on ${graphqlEndpoint}, exposing entire schema definitions.`;
        findings.push(finding);
      }
    }
  } catch (err) {
    console.warn(`[graphql-scanner] Exception scanning ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanGraphQL };
