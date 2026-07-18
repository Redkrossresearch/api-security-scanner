import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from backend root directory
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Intercept console.log and route to stderr before connecting database
// This ensures that any standard out logging doesn't corrupt the stdio transport channel
const originalLog = console.log;
console.log = (...args) => {
  console.error("[MCP Log Redirect]:", ...args);
};

const connectDB = require("../../config/db");
const { createMcpServer } = require("./mcp.server");

async function main() {
  try {
    // 1. Establish database connection
    console.error("[MCP] Connecting to MongoDB Database...");
    await connectDB();
    console.error("[MCP] MongoDB connected successfully.");

    // 2. Initialize the MCP server
    console.error("[MCP] Initializing server instance...");
    const server = await createMcpServer();

    // 3. Connect using Stdio Transport
    const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
    const transport = new StdioServerTransport();

    console.error("[MCP] Attaching Stdio Server Transport...");
    await server.connect(transport);
    console.error("[MCP] Stdio MCP Server is running and listening.");
  } catch (error) {
    console.error("[MCP Fatal Error]:", error);
    process.exit(1);
  }
}

main();
