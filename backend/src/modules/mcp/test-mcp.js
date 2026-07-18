/**
 * MCP Verification Script
 * This script runs a full end-to-end local test of the stdio transport wrapper
 * and the client connection manager.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const mcpClientManager = require("./mcp.client.manager");

// Fallback to local MongoDB URI if env is not defined
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/api-security-scanner";

async function runTest() {
  console.log("=== STARTING END-TO-END MCP TEST ===");
  console.log("1. Connecting to Database...");
  
  await mongoose.connect(MONGO_URI);
  console.log("   ✓ Database connected.");

  console.log("2. Spawning Local Stdio Wrapper...");
  // Create a mock config configuration pointing to our local stdio entrypoint
  const stdioScriptPath = path.resolve(__dirname, "mcp-stdio.mjs");
  
  const mockConfig = {
    _id: "test-mcp-server-id-123",
    name: "Local Scan Test Engine",
    type: "stdio",
    command: "node",
    args: [stdioScriptPath],
    env: new Map([["NODE_ENV", "test"]]),
    enabled: true
  };

  try {
    console.log("3. Connecting Client Manager to stdio server...");
    await mcpClientManager.initializeClient(mockConfig);
    console.log("   ✓ Connected successfully.");

    console.log("4. Listing Discovered Tools...");
    const tools = await mcpClientManager.getConnectedTools("test-user-id");
    
    console.log(`   ✓ Found ${tools.length} active tool(s):`);
    tools.forEach((t) => {
      console.log(`     - [${t.serverName}] ${t.name}: ${t.description || "No description"}`);
    });

    console.log("5. Testing Local Connection Disconnection...");
    await mcpClientManager.disconnectClient("test-mcp-server-id-123");
    console.log("   ✓ Client disconnected cleanly.");
    
    console.log("=== MCP TEST PASSED SUCCESSFULLY ===");
    process.exit(0);
  } catch (error) {
    console.error("❌ MCP TEST FAILED:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTest();
