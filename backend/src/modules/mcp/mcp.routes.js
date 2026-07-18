const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");
const { createMcpServer } = require("./mcp.server");
const McpConfig = require("./mcp-config.model");
const mcpClientManager = require("./mcp.client.manager");
const { apiLimiter } = require("../../middleware/rateLimiter");
const { z } = require("zod");

// Strict validation schema for external MCP server configurations
const mcpConfigSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["stdio", "sse"]),
  command: z.string().trim().optional().or(z.literal("")),
  args: z.array(z.string()).optional(),
  env: z.record(z.any()).optional(),
  sseUrl: z.string().trim().url("Invalid SSE URL").optional().or(z.literal("")),
  enabled: z.boolean().optional()
}).refine(data => {
  if (data.type === "stdio" && (!data.command || data.command.trim() === "")) return false;
  if (data.type === "sse" && (!data.sseUrl || data.sseUrl.trim() === "")) return false;
  return true;
}, {
  message: "command is required for stdio transport, and sseUrl is required for sse transport"
});

// activeTransports: sessionId (string) -> SSEServerTransport instance
const activeTransports = new Map();
let mcpServerInstance = null;

/**
 * Lazy initialization helper for single MCP Server instance
 */
async function getMcpServer() {
  if (!mcpServerInstance) {
    mcpServerInstance = await createMcpServer();
  }
  return mcpServerInstance;
}

// ──────────────────────────────────────────────────────────
// 1. SSE Connection Handshake
// ──────────────────────────────────────────────────────────
router.get("/sse", async (req, res, next) => {
  // Support authenticate middleware inline so SSE EventSource can connect passing "?token=JWT"
  const token = req.query.token;
  if (token) {
    // Inject token to authorization header for standard authenticate middleware compatibility
    req.headers.authorization = `Bearer ${token}`;
  }

  // Run the authenticate middleware manually
  authenticate(req, res, async (err) => {
    if (res.headersSent) return; // Guard
    if (err || !req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized connection context" });
    }

    try {
      const { SSEServerTransport } = await import("@modelcontextprotocol/sdk/server/sse.js");
      const sessionId = req.query.sessionId || `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      console.log(`[MCP Router] Establishing SSE connection for session: ${sessionId}`);

      // The transport constructor writes headers and leaves connection open.
      // Incoming POST messages for this session should point to: /api/mcp/messages?sessionId=X
      const transport = new SSEServerTransport(`/api/mcp/messages?sessionId=${sessionId}`, res);
      activeTransports.set(sessionId, transport);

      const server = await getMcpServer();
      await server.connect(transport);

      req.on("close", () => {
        activeTransports.delete(sessionId);
        console.log(`[MCP Router] SSE Connection closed for session: ${sessionId}`);
      });
    } catch (error) {
      console.error("[MCP Router SSE Handshake Error]:", error);
      next(error);
    }
  });
});

// ──────────────────────────────────────────────────────────
// 2. SSE Inbound Messages (POST)
// ──────────────────────────────────────────────────────────
router.post("/messages", async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Missing sessionId query parameter" });
    }

    const transport = activeTransports.get(sessionId);
    if (!transport) {
      return res.status(404).json({ success: false, message: `Active SSE session '${sessionId}' not found` });
    }

    // Pass the message payload to the transport handler
    await transport.handlePostMessage(req, res);
  } catch (error) {
    console.error("[MCP Router Messages Error]:", error);
    next(error);
  }
});

// ──────────────────────────────────────────────────────────
// 3. External Configurations CRUD Endpoints
// ──────────────────────────────────────────────────────────
router.get("/configs", apiLimiter, authenticate, async (req, res, next) => {
  try {
    const configs = await McpConfig.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, configs });
  } catch (error) {
    next(error);
  }
});

router.post("/configs", apiLimiter, authenticate, async (req, res, next) => {
  try {
    const parsedBody = mcpConfigSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: parsedBody.error.errors.map(e => e.message).join(", ")
      });
    }

    const { name, type, command, args, env, sseUrl, enabled } = parsedBody.data;

    const config = await McpConfig.create({
      userId: req.user._id,
      name,
      type,
      command,
      args: args || [],
      env: env || {},
      sseUrl,
      enabled: enabled !== false
    });

    if (config.enabled) {
      await mcpClientManager.initializeClient(config).catch((err) => {
        console.error(`[MCP Router] Post-create auto-connect failed for '${name}':`, err.message);
      });
    }

    res.status(201).json({ success: true, config });
  } catch (error) {
    next(error);
  }
});

router.put("/configs/:id", apiLimiter, authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsedBody = mcpConfigSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: parsedBody.error.errors.map(e => e.message).join(", ")
      });
    }

    const { name, type, command, args, env, sseUrl, enabled } = parsedBody.data;

    // Remove active client connection first
    await mcpClientManager.disconnectClient(id);

    const config = await McpConfig.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { name, type, command, args: args || [], env: env || {}, sseUrl, enabled },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ success: false, message: "Configuration not found" });
    }

    if (config.enabled) {
      await mcpClientManager.initializeClient(config).catch((err) => {
        console.error(`[MCP Router] Post-update auto-connect failed for '${name}':`, err.message);
      });
    }

    res.json({ success: true, config });
  } catch (error) {
    next(error);
  }
});

router.delete("/configs/:id", apiLimiter, authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await mcpClientManager.disconnectClient(id);
    const config = await McpConfig.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!config) {
      return res.status(404).json({ success: false, message: "Configuration not found" });
    }
    res.json({ success: true, message: "Configuration removed successfully" });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────────────────
// 4. Temporary Configuration Testing Endpoint
// ──────────────────────────────────────────────────────────
router.post("/configs/test", apiLimiter, authenticate, async (req, res, next) => {
  try {
    const mcpTestSchema = mcpConfigSchema.omit({ name: true });
    const parsedBody = mcpTestSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: parsedBody.error.errors.map(e => e.message).join(", ")
      });
    }

    const { type, command, args, env, sseUrl } = parsedBody.data;

    console.log(`[MCP Router] Testing temporary connection for type: ${type}`);
    const tools = await mcpClientManager.testConnection({ type, command, args, env, sseUrl });
    
    res.json({ success: true, tools });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET active tools compiled from all outbound client configs
router.get("/tools", apiLimiter, authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tools = await mcpClientManager.getConnectedTools(userId);
    res.json({
      success: true,
      tools
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
