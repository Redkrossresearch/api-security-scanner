const Scan = require("../scans/scan.model");
const Vulnerability = require("../vulnerabilities/vulnerability.model");
const scanService = require("../scans/scan.service");
const User = require("../auth/auth.model");
const { z } = require("zod");

async function createMcpServer() {
  // Dynamically import ES Module packages
  const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

  const server = new McpServer({
    name: "api-security-scanner",
    version: "1.0.0"
  });

  // 1. Tool: list_scans
  server.registerTool(
    "list_scans",
    "List recent API vulnerability scans with their status, target URL, and vulnerability counts.",
    {
      limit: z.number().optional().default(10).describe("Maximum number of scans to return (default: 10)")
    },
    async ({ limit }) => {
      try {
        const queryLimit = Math.min(Math.max(1, limit), 100); // Guard rails
        const scans = await Scan.find()
          .sort({ createdAt: -1 })
          .limit(queryLimit)
          .lean();

        const text = JSON.stringify(
          scans.map((s) => ({
            scanId: s.scanId,
            targetUrl: s.targetUrl,
            status: s.status,
            securityScore: s.securityScore,
            riskLevel: s.riskLevel,
            findings: {
              critical: s.criticalCount || 0,
              high: s.highCount || 0,
              medium: s.mediumCount || 0,
              low: s.lowCount || 0
            },
            startedAt: s.startedAt,
            completedAt: s.completedAt
          })),
          null,
          2
        );

        return {
          content: [{ type: "text", text }]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list scans: ${err.message}` }]
        };
      }
    }
  );

  // 2. Tool: start_scan
  server.registerTool(
    "start_scan",
    "Start a new API vulnerability scan for a target URL.",
    {
      targetUrl: z.string().describe("The API endpoint or website URL to scan (e.g., https://example.com/api)")
    },
    async ({ targetUrl }) => {
      try {
        if (!targetUrl || typeof targetUrl !== "string") {
          return {
            isError: true,
            content: [{ type: "text", text: "Invalid targetUrl: targetUrl must be a valid URL string." }]
          };
        }

        // Find default owner for stdio/unauthenticated context scans
        const systemUser = await User.findOne({ role: "admin" }) || await User.findOne();
        if (!systemUser) {
          return {
            isError: true,
            content: [{ type: "text", text: "No user found in the database. A scan must be associated with a valid user." }]
          };
        }

        const scan = await scanService.createScan(systemUser._id, targetUrl);
        return {
          content: [
            {
              type: "text",
              text: `Scan successfully triggered.\nTarget URL: ${targetUrl}\nScan ID: ${scan.scanId}\nStatus: ${scan.status}\nYou can monitor progress using the 'get_scan_progress' tool.`
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to start scan: ${err.message}` }]
        };
      }
    }
  );

  // 3. Tool: get_scan_progress
  server.registerTool(
    "get_scan_progress",
    "Retrieve real-time progress percentage and status of an active or completed scan.",
    {
      scanId: z.string().describe("The unique identifier of the scan (e.g. SCAN-XXXXXXXXX)")
    },
    async ({ scanId }) => {
      try {
        const scan = await Scan.findOne({ scanId }).lean();
        if (!scan) {
          return {
            isError: true,
            content: [{ type: "text", text: `Scan with ID '${scanId}' not found.` }]
          };
        }

        // Check in-memory queue progress
        const activeProgress = scanService.getActiveScanProgress(scan._id);
        const progress = activeProgress
          ? activeProgress.progress
          : scan.status === "completed"
          ? 100
          : 0;

        const result = {
          scanId: scan.scanId,
          targetUrl: scan.targetUrl,
          status: scan.status,
          progress,
          score: scan.securityScore || 0,
          grade: scan.grade || "A",
          findings: {
            critical: scan.criticalCount || 0,
            high: scan.highCount || 0,
            medium: scan.mediumCount || 0,
            low: scan.lowCount || 0
          },
          startedAt: scan.startedAt,
          completedAt: scan.completedAt
        };

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to retrieve scan progress: ${err.message}` }]
        };
      }
    }
  );

  // 4. Tool: list_vulnerabilities
  server.registerTool(
    "list_vulnerabilities",
    "List vulnerabilities discovered during scans, filterable by severity or scanId.",
    {
      scanId: z.string().optional().describe("Filter vulnerabilities to a specific Scan ID"),
      severity: z.enum(["critical", "high", "medium", "low", "info"]).optional().describe("Filter by severity level"),
      limit: z.number().optional().default(20).describe("Maximum results to return (default: 20)")
    },
    async ({ scanId, severity, limit }) => {
      try {
        const query = {};
        if (scanId) {
          const scan = await Scan.findOne({ scanId });
          if (!scan) {
            return {
              isError: true,
              content: [{ type: "text", text: `Scan with ID '${scanId}' not found.` }]
            };
          }
          query.scanId = scan._id;
        }

        if (severity) {
          query.severity = severity.toLowerCase();
        }

        const queryLimit = Math.min(Math.max(1, limit), 100);
        const vulns = await Vulnerability.find(query)
          .sort({ cvss: -1, createdAt: -1 })
          .limit(queryLimit)
          .lean();

        const text = JSON.stringify(
          vulns.map((v) => ({
            id: v._id.toString(),
            title: v.title,
            severity: v.severity,
            category: v.category,
            cvss: v.cvss || 0,
            endpoint: v.endpoint || "",
            status: v.status || "open"
          })),
          null,
          2
        );

        return {
          content: [{ type: "text", text }]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list vulnerabilities: ${err.message}` }]
        };
      }
    }
  );

  // 5. Tool: get_vulnerability_details
  server.registerTool(
    "get_vulnerability_details",
    "Retrieve full details for a specific vulnerability, including recommendations and remediation steps.",
    {
      vulnerabilityId: z.string().describe("The unique database ID of the vulnerability")
    },
    async ({ vulnerabilityId }) => {
      try {
        const vuln = await Vulnerability.findById(vulnerabilityId).lean();
        if (!vuln) {
          return {
            isError: true,
            content: [{ type: "text", text: `Vulnerability with ID '${vulnerabilityId}' not found.` }]
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(vuln, null, 2) }]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to retrieve vulnerability details: ${err.message}` }]
        };
      }
    }
  );

  return server;
}

module.exports = { createMcpServer };
