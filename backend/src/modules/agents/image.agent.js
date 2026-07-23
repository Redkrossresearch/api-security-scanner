/**
 * image.agent.js (Sprint 64 — Image Agent Backend Generation Logic)
 * Generates structured node/edge JSON diagrams for architecture and network requests.
 * Contract-first output compatible with DiagramRenderer.jsx.
 */
class ImageAgent {
  async generateDiagramStructure(prompt) {
    console.log(`[ImageAgent] Generating structured diagram for prompt: "${prompt}"`);
    const lower = prompt.toLowerCase();

    if (lower.includes("api") || lower.includes("architecture")) {
      return {
        title: "API Microservices Architecture",
        nodes: [
          { id: "1", type: "user", label: "Client Frontend" },
          { id: "2", type: "api", label: "API Gateway (/api/v1)" },
          { id: "3", type: "service", label: "Auth Service" },
          { id: "4", type: "service", label: "Scanner Engine" },
          { id: "5", type: "database", label: "MongoDB Cluster" },
        ],
        edges: [
          { from: "1", to: "2", label: "HTTPS Request" },
          { from: "2", to: "3", label: "Validate JWT" },
          { from: "2", to: "4", label: "Trigger Scan" },
          { from: "4", to: "5", label: "Save Findings" },
        ],
      };
    }

    return {
      title: "System Flowchart",
      nodes: [
        { id: "1", type: "user", label: "User Session" },
        { id: "2", type: "service", label: "Application Logic" },
        { id: "3", type: "database", label: "Database Store" },
      ],
      edges: [
        { from: "1", to: "2", label: "User Input" },
        { from: "2", to: "3", label: "Database Query" },
      ],
    };
  }
}

module.exports = new ImageAgent();
