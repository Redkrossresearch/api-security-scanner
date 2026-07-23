/**
 * autonomous-scanner.agent.js (Sprint 56 — Autonomous Scan-and-Verify Flow)
 * Reads target -> crawl -> analyze -> generate payloads -> retry variations -> verify -> stop condition.
 * Wraps existing scanner modules as tools inside an autonomous loop.
 */
const AutonomousTaskLoop = require("./autonomous.loop");
const toolRegistry = require("./tools/tool.registry");

class AutonomousScannerAgent {
  async executeAutonomousScan(targetUrl, highLevelGoal = "Find SQL Injection and API vulnerabilities") {
    console.log(`[AutonomousScannerAgent] Starting autonomous scan flow for target: ${targetUrl}`);
    const loop = new AutonomousTaskLoop({ maxIterations: 5, costCap: 0.15 });

    // Step 1: Crawl Target via Tool Registry
    const crawlResult = await toolRegistry.executeTool("crawl-website", { targetUrl });

    // Step 2: Run SQLi & Scanner Modules via Tool Registry
    const sqliResult = await toolRegistry.executeTool("run-scanner-module", { moduleName: "sqli", targetUrl });
    const jwtResult = await toolRegistry.executeTool("run-scanner-module", { moduleName: "jwt", targetUrl });

    // Step 3: Run Goal Loop to synthesize findings & verify payloads
    const loopResult = await loop.run(highLevelGoal, {
      targetUrl,
      crawledEndpoints: crawlResult.endpoints,
      discoveredSqli: sqliResult.findings,
      discoveredJwt: jwtResult.findings,
    });

    const totalFindings = (sqliResult.findings || []).concat(jwtResult.findings || []);

    return {
      success: true,
      targetUrl,
      highLevelGoal,
      endpointsDiscovered: crawlResult.totalDiscovered,
      findingsVerified: totalFindings.length,
      findings: totalFindings,
      autonomousTrace: loopResult.trace,
      summary: `Autonomous scan completed for ${targetUrl}: discovered ${crawlResult.totalDiscovered} endpoints and verified ${totalFindings.length} findings across ${loopResult.iterations} iteration loops.`,
    };
  }
}

module.exports = new AutonomousScannerAgent();
