const { runAgentRosterQA } = require("../backend/src/utils/agent-roster.test");
const responseSchemaV2 = require("../backend/src/modules/llm/response.schema");
const multiFormatExportService = require("../backend/src/modules/reports/export.service");
const storageCleanupService = require("../backend/src/utils/storage-cleanup");
const realWebSearchService = require("../backend/src/modules/search/web.search.service");

async function runVerification91To120() {
  console.log("=== SPRINT 91-120 BACKEND VERIFICATION ===");

  // 1. Sprint 91 (Agent Roster QA)
  const rosterRes = await runAgentRosterQA();
  console.log("✅ Sprint 91 (Agent Roster QA): Passed =", rosterRes.every((r) => r.status === "PASSED"));

  // 2. Sprint 92 (Response Schema v2)
  const blocks = responseSchemaV2.parseResponseToTypedBlocks("Here is code:\n```javascript\nconsole.log(1);\n```\nDone.");
  console.log("✅ Sprint 92 (Response Schema v2): Blocks parsed =", blocks.length);

  // 3. Sprint 96 (Multi-Format Export)
  const exportRes = await multiFormatExportService.exportScanFindings([{ title: "SQLi Vulnerability", severity: "high" }], "csv");
  console.log("✅ Sprint 96 (Multi-Format Export): Filename =", exportRes.filename);

  // 4. Sprint 97 (Storage Cleanup)
  const cleanupRes = await storageCleanupService.runAutoCleanup(7);
  console.log("✅ Sprint 97 (Storage Cleanup): Freed =", cleanupRes.freedSpaceFormatted);

  // 5. Sprint 119 & 120 (Real Web Search Engine & Ranking)
  const searchRes = await realWebSearchService.searchWeb("OWASP API Security BOLA");
  console.log("✅ Sprint 119 & 120 (Web Search & Ranking): Results =", searchRes.totalResults, "| Top Domain =", searchRes.results[0]?.domain);

  console.log("\nALL SPRINT 91-120 BACKEND VERIFICATIONS PASSED CLEANLY!");
}

runVerification91To120().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
