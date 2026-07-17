require("dotenv").config({ path: "../../../../.env" });
const vectorDb = require("../rag/vector.db");
const ragPipeline = require("../rag/rag.pipeline");
const externalSources = require("../rag/external.sources");

async function runTest() {
  console.log("=== Testing Enterprise RAG Engine (Phase 6) ===");

  // 1. Seed Threat Intelligence Catalog
  await externalSources.seedThreatCatalog();

  // 2. Index OpenAPI spec
  const sampleOpenApi = {
    openapi: "3.0.0",
    paths: {
      "/api/v1/users": {
        get: {
          summary: "Get users profile details without authentication",
          parameters: [{ name: "id", in: "query", required: true }],
          responses: { "200": { description: "User object" } }
        }
      }
    }
  };
  console.log("\nIndexing Sample OpenAPI Spec...");
  await ragPipeline.ingestOpenApiSpec(JSON.stringify(sampleOpenApi), "test-openapi.json");

  // 3. Query RAG index for matching context
  const query = "Is there broken authorization in the users list path?";
  console.log(`\nQuerying RAG index for: "${query}"`);
  const context = await ragPipeline.retrieveContext(query, 2);
  console.log(context);

  console.log("=== Phase 6 RAG engine checks complete ===");
}

runTest().catch(console.error);
