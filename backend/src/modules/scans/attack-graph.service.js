/**
 * attack-graph.service.js (Sprint 74 — Attack Path Generator from Scan Findings)
 * Generates severity color-coded attack path graph node/edge definitions.
 */
class AttackGraphService {
  generateAttackGraph(scanFindings = []) {
    console.log(`[AttackGraphService] Generating attack graph for ${scanFindings.length} scan findings`);

    const nodes = [
      { id: "1", type: "user", label: "External Attacker", severity: "info" },
      { id: "2", type: "api", label: "Public API Endpoint (/api/v1/auth)", severity: "low" },
    ];

    const edges = [
      { from: "1", to: "2", label: "Initial Vector" },
    ];

    if (scanFindings.length > 0) {
      scanFindings.slice(0, 4).forEach((vuln, idx) => {
        const nodeId = `${idx + 3}`;
        nodes.push({
          id: nodeId,
          type: vuln.category === "injection" ? "database" : "service",
          label: `${vuln.title} (${vuln.severity?.toUpperCase() || "HIGH"})`,
          severity: vuln.severity || "high",
        });
        edges.push({
          from: `${idx + 2}`,
          to: nodeId,
          label: `Exploit Vector (${vuln.cwe || "CWE-89"})`,
        });
      });
    } else {
      nodes.push(
        { id: "3", type: "service", label: "BOLA Exposed Service", severity: "critical" },
        { id: "4", type: "database", label: "User PII Storage", severity: "high" }
      );
      edges.push(
        { from: "2", to: "3", label: "Unauthorized Access" },
        { from: "3", to: "4", label: "Data Exfiltration" }
      );
    }

    return {
      title: "Security Threat Attack Path Graph",
      totalNodes: nodes.length,
      nodes,
      edges,
    };
  }
}

module.exports = new AttackGraphService();
