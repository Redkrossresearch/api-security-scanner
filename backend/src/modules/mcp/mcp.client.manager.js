// Global polyfill for EventSource since Node.js lacks native SSE client support
if (typeof global.EventSource === "undefined") {
  try {
    global.EventSource = require("eventsource");
  } catch (err) {
    console.error("[MCP Client Manager] Failed to load 'eventsource' package polyfill:", err.message);
  }
}

const McpConfig = require("./mcp-config.model");

// In-memory cache for active connections
// Key: configId (string) -> Value: { config, client, transport, tools }
const activeClients = new Map();

class McpClientManager {
  /**
   * Dynamically import and return the MCP Client SDK
   */
  async getClientSdk() {
    const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
    return Client;
  }

  /**
   * Load and connect all enabled external MCP servers for a given user
   */
  async initializeAllClients(userId) {
    try {
      console.log(`[MCP Client Manager] Initializing all active servers for user ${userId}...`);
      const configs = await McpConfig.find({ userId, enabled: true });
      for (const config of configs) {
        await this.initializeClient(config).catch((err) => {
          console.error(`[MCP Client Manager] Failed to connect to server '${config.name}':`, err.message);
        });
      }
    } catch (err) {
      console.error("[MCP Client Manager] initializeAllClients error:", err);
    }
  }

  /**
   * Connect to a specific external MCP server configuration
   */
  async initializeClient(config) {
    const configId = config._id.toString();

    // Clean up any existing connection for this ID
    await this.disconnectClient(configId);

    console.log(`[MCP Client Manager] Connecting to server '${config.name}' (${config.type})...`);

    const Client = await this.getClientSdk();
    const client = new Client(
      { name: "api-security-scanner-host", version: "1.0.0" },
      { capabilities: {} }
    );

    let transport;

    if (config.type === "stdio") {
      const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
      
      // Build environments map (convert Mongoose map to standard JS object)
      const configEnv = config.env ? Object.fromEntries(config.env.entries()) : {};
      const mergedEnv = {
        ...process.env,
        ...configEnv
      };

      transport = new StdioClientTransport({
        command: config.command,
        args: config.args || [],
        env: mergedEnv
      });
    } else if (config.type === "sse") {
      const { SSEClientTransport } = await import("@modelcontextprotocol/sdk/client/sse.js");
      transport = new SSEClientTransport(new URL(config.sseUrl));
    } else {
      throw new Error(`Unsupported MCP transport type: ${config.type}`);
    }

    // Connect client to transport
    await client.connect(transport);

    // List tools exported by the server
    const toolsResult = await client.listTools();
    const tools = toolsResult.tools || [];

    activeClients.set(configId, {
      config,
      client,
      transport,
      tools
    });

    console.log(`[MCP Client Manager] Successfully connected to '${config.name}' exposing ${tools.length} tool(s).`);
  }

  /**
   * Gracefully close connection and clean up resources for a server configuration
   */
  async disconnectClient(configId) {
    const active = activeClients.get(configId.toString());
    if (active) {
      console.log(`[MCP Client Manager] Disconnecting from server '${active.config.name}'...`);
      try {
        await active.transport.close();
      } catch (err) {
        console.warn(`[MCP Client Manager] Error closing transport for '${active.config.name}':`, err.message);
      }
      activeClients.delete(configId.toString());
    }
  }

  /**
   * Close all active external connections (useful for server shutdowns)
   */
  async disconnectAll() {
    console.log("[MCP Client Manager] Closing all active connections...");
    for (const configId of activeClients.keys()) {
      await this.disconnectClient(configId);
    }
  }

  /**
   * Retrieve all tools aggregated from all active external MCP connections
   */
  async getConnectedTools(userId) {
    // Lazy initialization if client cache is empty
    if (activeClients.size === 0) {
      await this.initializeAllClients(userId);
    }

    const allTools = [];
    for (const [configId, value] of activeClients.entries()) {
      const { config, tools } = value;
      for (const tool of tools) {
        allTools.push({
          serverName: config.name,
          serverId: configId,
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        });
      }
    }
    return allTools;
  }

  /**
   * Execute a tool on a specific external MCP server
   */
  async executeTool(serverId, toolName, toolArguments) {
    const active = activeClients.get(serverId.toString());
    if (!active) {
      throw new Error("MCP Server connection not found or disconnected. Please re-enable it in Settings.");
    }

    console.log(`[MCP Client Manager] Forwarding tool execution: '${toolName}' to '${active.config.name}'`);
    const result = await active.client.callTool({
      name: toolName,
      arguments: toolArguments
    });
    return result;
  }

  /**
   * Connect to a server temporarily, fetch its tools list, and disconnect.
   * Useful for testing configurations on the frontend settings page.
   */
  async testConnection({ type, command, args, env, sseUrl }) {
    const Client = await this.getClientSdk();
    const client = new Client(
      { name: "mcp-test-client", version: "1.0.0" },
      { capabilities: {} }
    );

    let transport;
    if (type === "stdio") {
      const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
      const configEnv = env ? (typeof env === "object" ? env : {}) : {};
      const mergedEnv = {
        ...process.env,
        ...configEnv
      };

      transport = new StdioClientTransport({
        command,
        args: args || [],
        env: mergedEnv
      });
    } else if (type === "sse") {
      const { SSEClientTransport } = await import("@modelcontextprotocol/sdk/client/sse.js");
      transport = new SSEClientTransport(new URL(sseUrl));
    } else {
      throw new Error(`Unsupported transport type: ${type}`);
    }

    try {
      await client.connect(transport);
      const toolsResult = await client.listTools();
      
      // Graceful disconnect
      await transport.close();
      return toolsResult.tools || [];
    } catch (error) {
      try {
        await transport.close();
      } catch (e) {}
      throw error;
    }
  }
}

module.exports = new McpClientManager();
