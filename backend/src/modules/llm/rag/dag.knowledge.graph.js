/**
 * Directed Acyclic Graph (DAG) Security Knowledge Graph
 * Maps relationships between OWASP API Top 10 categories, CWE taxonomies,
 * attack vectors, and remediation code patterns for deep RAG enrichment.
 */
class DAGSecurityKnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacency = new Map();

    this.initializeKnowledgeGraph();
  }

  addNode(id, label, type, data = {}) {
    this.nodes.set(id, { id, label, type, data });
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
    if (!this.reverseAdjacency.has(id)) {
      this.reverseAdjacency.set(id, []);
    }
  }

  addEdge(sourceId, targetId, relationship) {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return;

    const sourceEdges = this.adjacencyList.get(sourceId) || [];
    sourceEdges.push({ targetId, relationship });
    this.adjacencyList.set(sourceId, sourceEdges);

    const targetEdges = this.reverseAdjacency.get(targetId) || [];
    targetEdges.push({ sourceId, relationship });
    this.reverseAdjacency.set(targetId, targetEdges);
  }

  initializeKnowledgeGraph() {
    // 1. OWASP API Top 10 Categories
    this.addNode("api1_bola", "API1:2023 Broken Object Level Authorization (BOLA)", "owasp_category", {
      cwe: "CWE-284 / CWE-639",
      severity: "CRITICAL",
      description: "APIs expose endpoints that handle object identifiers, creating a wide attack surface for object level access control flaws.",
    });

    this.addNode("api2_auth", "API2:2023 Broken Authentication", "owasp_category", {
      cwe: "CWE-287 / CWE-307",
      severity: "HIGH",
      description: "Authentication mechanisms are often implemented incorrectly, allowing attackers to compromise tokens or exploit implementation flaws.",
    });

    this.addNode("api3_bopla", "API3:2023 Broken Object Property Level Authorization", "owasp_category", {
      cwe: "CWE-213 / CWE-915",
      severity: "HIGH",
      description: "Focuses on unauthorized exposure or manipulation of specific object properties (Mass Assignment & Excessive Data Exposure).",
    });

    this.addNode("api4_resource", "API4:2023 Unrestricted Resource Consumption", "owasp_category", {
      cwe: "CWE-400 / CWE-770",
      severity: "MEDIUM",
      description: "APIs do not restrict rate limits, payload sizes, or execution timeouts, leading to Denial of Service (DoS) or resource exhaustion.",
    });

    this.addNode("api5_bfla", "API5:2023 Broken Function Level Authorization (BFLA)", "owasp_category", {
      cwe: "CWE-285",
      severity: "CRITICAL",
      description: "Complex access control policies with different roles/groups lead to administrative functions being exposed to non-admin users.",
    });

    this.addNode("api6_business_flow", "API6:2023 Unrestricted Access to Sensitive Business Flows", "owasp_category", {
      cwe: "CWE-799",
      severity: "HIGH",
      description: "Exposing business flows (like purchasing, ticket booking, posting reviews) without automated abuse protection.",
    });

    this.addNode("api7_ssrf", "API7:2023 Server Side Request Forgery (SSRF)", "owasp_category", {
      cwe: "CWE-918",
      severity: "CRITICAL",
      description: "API fetches remote resources without validating the target URI, allowing attackers to access internal cloud metadata endpoints.",
    });

    this.addNode("api8_misconfig", "API8:2023 Security Misconfiguration", "owasp_category", {
      cwe: "CWE-16 / CWE-942",
      severity: "MEDIUM",
      description: "Unprotected HTTP headers, overly permissive CORS (`Access-Control-Allow-Origin: *`), verbose stack trace leaks.",
    });

    this.addNode("api9_inventory", "API9:2023 Improper Inventory Management", "owasp_category", {
      cwe: "CWE-1059",
      severity: "MEDIUM",
      description: "Old/deprecated API versions (v1/v2) left running without patches alongside current production endpoints.",
    });

    this.addNode("api10_unsafe_consumption", "API10:2023 Unsafe Consumption of APIs", "owasp_category", {
      cwe: "CWE-20",
      severity: "HIGH",
      description: "Blindly trusting data received from third-party APIs without sanitization or strict schema verification.",
    });

    // 2. Attack Vectors & Exploits
    this.addNode("exploit_idor", "IDOR / Parameter Tampering", "attack_vector", {
      technique: "Iterating numeric or UUID object IDs in URL paths or request JSON payloads.",
      example: "GET /api/orders/1001 -> GET /api/orders/1002",
    });

    this.addNode("exploit_jwt_none", "JWT None Algorithm / Weak Secret Crack", "attack_vector", {
      technique: "Modifying JWT header to `{ \"alg\": \"none\" }` or brute-forcing secret key.",
      example: "Authorization: Bearer eyJhbGciOiJub25lIn0...",
    });

    this.addNode("exploit_sqli", "SQL / NoSQL Injection", "attack_vector", {
      technique: "Injecting database payload parameters in API query string or JSON payload.",
      example: "{ \"username\": { \"$gt\": \"\" } }",
    });

    this.addNode("exploit_metadata_ssrf", "AWS / GCP Metadata SSRF", "attack_vector", {
      technique: "Triggering API to fetch internal IP `169.254.169.254` to leak IAM credentials.",
      example: "POST /api/webhook { \"url\": \"http://169.254.169.254/latest/meta-data/\" }",
    });

    // 3. Remediation & Code Mitigation Nodes
    this.addNode("fix_object_acl", "Explicit Object Access Control Checks", "remediation", {
      codePattern: "if (document.ownerId.toString() !== req.user.id) return res.status(403).json({ error: 'Access Denied' });",
    });

    this.addNode("fix_jwt_verification", "Strict JWT Signature & Algorithm Verification", "remediation", {
      codePattern: "jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256', 'RS256'] });",
    });

    this.addNode("fix_input_sanitization", "Parameter Validation & Parameterized Queries", "remediation", {
      codePattern: "const schema = z.object({ id: z.string().uuid() }); const clean = schema.parse(req.body);",
    });

    this.addNode("fix_ssrf_allowlist", "URL Whitelisting & Internal IP Blocking", "remediation", {
      codePattern: "if (ip.isPrivate(targetIp)) throw new Error('Access to private network forbidden');",
    });

    this.addNode("fix_rate_limiting", "Express Rate Limiter & Redis Token Bucket", "remediation", {
      codePattern: "app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));",
    });

    // 4. Connect Directed Edges (DAG Structure)
    this.addEdge("api1_bola", "exploit_idor", "exploited_via");
    this.addEdge("exploit_idor", "fix_object_acl", "remediated_by");

    this.addEdge("api2_auth", "exploit_jwt_none", "exploited_via");
    this.addEdge("exploit_jwt_none", "fix_jwt_verification", "remediated_by");

    this.addEdge("api3_bopla", "exploit_sqli", "exploited_via");
    this.addEdge("exploit_sqli", "fix_input_sanitization", "remediated_by");

    this.addEdge("api7_ssrf", "exploit_metadata_ssrf", "exploited_via");
    this.addEdge("exploit_metadata_ssrf", "fix_ssrf_allowlist", "remediated_by");

    this.addEdge("api4_resource", "fix_rate_limiting", "remediated_by");
  }

  /**
   * Traverse the DAG graph to retrieve relevant concepts, attacks, and code fixes (2-hop traversal)
   */
  queryGraph(userQuery) {
    if (!userQuery) return "";
    const q = userQuery.toLowerCase();
    const matchedNodes = [];

    for (const [id, node] of this.nodes.entries()) {
      if (
        id.toLowerCase().includes(q) ||
        node.label.toLowerCase().includes(q) ||
        (node.data.cwe && node.data.cwe.toLowerCase().includes(q)) ||
        (node.data.description && node.data.description.toLowerCase().includes(q)) ||
        (q.includes("bola") && id === "api1_bola") ||
        (q.includes("idor") && id === "api1_bola") ||
        (q.includes("auth") && id === "api2_auth") ||
        (q.includes("jwt") && id === "api2_auth") ||
        (q.includes("ssrf") && id === "api7_ssrf") ||
        (q.includes("rate") && id === "api4_resource") ||
        (q.includes("sql") && id === "api3_bopla") ||
        (q.includes("header") && id === "api8_misconfig")
      ) {
        matchedNodes.push(node);
      }
    }

    if (matchedNodes.length === 0) return "";

    let graphContext = `\n================================================================================\n## DAG SECURITY KNOWLEDGE GRAPH TRAVERSAL\n`;

    matchedNodes.slice(0, 3).forEach((node) => {
      graphContext += `\n▶ NODE: [${node.type.toUpperCase()}] ${node.label}\n`;
      if (node.data.cwe) graphContext += `   Taxonomy: ${node.data.cwe} | Severity: ${node.data.severity || "N/A"}\n`;
      if (node.data.description) graphContext += `   Overview: ${node.data.description}\n`;

      // Traverse 1st hop outgoing edges
      const outgoing = this.adjacencyList.get(node.id) || [];
      outgoing.forEach((edge) => {
        const targetNode = this.nodes.get(edge.targetId);
        if (targetNode) {
          graphContext += `   └─ (--> ${edge.relationship.toUpperCase()}) ${targetNode.label}\n`;
          if (targetNode.data.codePattern) {
            graphContext += `      Recommended Fix Pattern: ${targetNode.data.codePattern}\n`;
          }

          // Traverse 2nd hop outgoing edges (e.g. OWASP -> Attack -> Remediation)
          const secondHop = this.adjacencyList.get(targetNode.id) || [];
          secondHop.forEach((edge2) => {
            const node2 = this.nodes.get(edge2.targetId);
            if (node2) {
              graphContext += `      └─ (--> ${edge2.relationship.toUpperCase()}) ${node2.label}\n`;
              if (node2.data.codePattern) {
                graphContext += `         Fix Code Pattern: ${node2.data.codePattern}\n`;
              }
            }
          });
        }
      });
    });

    graphContext += `================================================================================\n`;
    return graphContext;
  }
}

module.exports = new DAGSecurityKnowledgeGraph();
