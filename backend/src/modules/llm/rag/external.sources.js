const axios = require("axios");
const vectorDb = require("./vector.db");

class ExternalKnowledgeSources {
  constructor() {
    this.threatCatalog = [
      {
        id: "owasp-a01",
        text: "OWASP A01:2021-Broken Access Control. Applications must enforce access control checks on the server-side. Common vulnerabilities include IDOR, privilege escalation, and CORS misconfigurations.",
        metadata: { source: "OWASP", category: "access-control" },
      },
      {
        id: "owasp-a03",
        text: "OWASP A03:2021-Injection. This includes SQL Injection, NoSQL Injection, Command Injection, and LDAP Injection. Mitigation: Use parameterized queries, object-relational mapping (ORMs), and input validation.",
        metadata: { source: "OWASP", category: "injection" },
      },
      {
        id: "cwe-89",
        text: "CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection'). Exposing raw database query concatenation to user input leads to unauthorized data access and deletion.",
        metadata: { source: "CWE", category: "sql-injection" },
      },
      {
        id: "cwe-79",
        text: "CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). Injecting unsanitized input into HTML responses allows session hijacking and UI redirection.",
        metadata: { source: "CWE", category: "xss" },
      },
    ];
  }

  /**
   * Seed static catalog entries into the RAG vector database
   */
  async seedThreatCatalog() {
    console.log("[knowledge-sources] Seeding static threat catalog into vector database...");
    for (const entry of this.threatCatalog) {
      await vectorDb.addDocument(entry.id, entry.text, {
        sourceType: "threat_intelligence",
        ...entry.metadata,
      });
    }
  }

  /**
   * Sync recent security advisories from GitHub public security advisory API (Sprint 35)
   */
  async syncGitHubAdvisories() {
    console.log("[knowledge-sources] Syncing latest security advisories from GitHub...");
    try {
      const response = await axios.get(
        "https://api.github.com/advisories",
        {
          headers: {
            "User-Agent": "api-security-scanner",
            Accept: "application/vnd.github.v3+json",
          },
          timeout: 10000,
        }
      );

      const advisories = response.data || [];
      console.log(`[knowledge-sources] Fetched ${advisories.length} GitHub advisories.`);

      for (const adv of advisories.slice(0, 10)) {
        const docId = `github-adv-${adv.ghsa_id}`;
        const contentText = `GHSA ID: ${adv.ghsa_id}
CVE ID: ${adv.cve_id || "N/A"}
Title: ${adv.summary}
Severity: ${adv.severity}
Description: ${adv.description || ""}
References: ${JSON.stringify(adv.references || [])}`;

        await vectorDb.addDocument(docId, contentText, {
          sourceType: "github_advisory",
          ghsaId: adv.ghsa_id,
          cveId: adv.cve_id,
          severity: adv.severity,
        });
      }
      console.log("[knowledge-sources] GitHub advisories indexing complete.");
    } catch (err) {
      console.warn(
        "[knowledge-sources] Failed to sync GitHub advisories (rate limit or network issue):",
        err.message
      );
    }
  }
}

module.exports = new ExternalKnowledgeSources();
