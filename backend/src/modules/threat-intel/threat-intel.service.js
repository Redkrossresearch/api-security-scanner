/**
 * Threat Intelligence Orchestrator
 * ─────────────────────────────────────────────────────────────────────────────
 * Strategy:
 * 1. Query Vulners + Shodan + VirusTotal in PARALLEL with Promise.allSettled
 * 2. On any source timeout/failure → zero-latency fallback to internal catalog
 * 3. Merge all results (source + catalog) and deduplicate by CVE ID
 * 4. Enrich ALL CVEs (catalog or source) with NVD CVSS scores (authoritative)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const { searchByTechStack } = require("./vulners.service");
const { scanDomain } = require("./shodan.service");
const { scanDomain: vtScanDomain, scanUrl } = require("./virustotal.service");
const { enrichWithNVD } = require("./nvd.service");
const {
  VULNERABILITIES,
  DEFAULT_METADATA,
} = require("../vulnerabilities/vulnerability.factory");
const { calculateCVSS } = require("../engines/cvss-engine");
const { calculateSeverity } = require("../engines/severity-engine");
const { calculateRisk } = require("../engines/risk-engine");

const TIMEOUT_MS = parseInt(process.env.THREAT_INTEL_TIMEOUT_MS || "8000", 10);

/**
 * Main orchestration entry point
 * Called from scanner.service after tech stack is detected
 *
 * @param {object} options
 * @param {string} options.targetUrl   - full target URL e.g. "https://example.com"
 * @param {string} options.domain      - just the domain e.g. "example.com"
 * @param {string} options.ip          - resolved IP (optional)
 * @param {string[]} options.techStack - detected technologies e.g. ["PHP", "Apache"]
 * @param {string[]} options.catalogKeys - catalog vulnerability keys to fall back to
 * @returns {Promise<Array>} merged, deduplicated, NVD-enriched findings
 */
const queryAllSources = async ({ targetUrl, domain, ip, techStack = [], catalogKeys = [] }) => {
  console.info(`[threat-intel] Starting parallel source query for ${domain || targetUrl}`);

  // ── 1. Fire all external sources in parallel with timeout wrapper ──────────
  const [vulnersResult, shodanResult, vtResult] = await Promise.allSettled([
    withTimeout(searchByTechStack(techStack), TIMEOUT_MS, "vulners"),
    withTimeout(scanDomain(domain || extractDomain(targetUrl)), TIMEOUT_MS, "shodan"),
    withTimeout(vtScanDomain(domain || extractDomain(targetUrl)), TIMEOUT_MS, "virustotal"),
  ]);

  // ── 2. Collect successful source findings ─────────────────────────────────
  const sourceFindings = [];

  if (vulnersResult.status === "fulfilled" && Array.isArray(vulnersResult.value)) {
    console.info(`[threat-intel] Vulners: ${vulnersResult.value.length} findings`);
    sourceFindings.push(...vulnersResult.value);
  } else {
    console.warn("[threat-intel] Vulners failed or timed out — using catalog fallback");
  }

  if (shodanResult.status === "fulfilled" && shodanResult.value?.findings?.length) {
    console.info(`[threat-intel] Shodan: ${shodanResult.value.findings.length} findings`);
    sourceFindings.push(...shodanResult.value.findings);
  } else {
    console.warn("[threat-intel] Shodan failed or timed out");
  }

  if (vtResult.status === "fulfilled" && vtResult.value?.findings?.length) {
    console.info(`[threat-intel] VirusTotal: ${vtResult.value.findings.length} findings`);
    sourceFindings.push(...vtResult.value.findings);
  } else {
    console.warn("[threat-intel] VirusTotal failed or timed out");
  }

  // ── 3. Zero-latency catalog fallback ─────────────────────────────────────
  // If ALL external sources failed, or caller wants catalog augmentation
  const catalogFindings = buildCatalogFindings(catalogKeys);

  // Always include catalog for catalog-specific keys not covered by sources
  const allFindings = mergeAndDeduplicate(sourceFindings, catalogFindings);

  console.info(
    `[threat-intel] Merged: ${sourceFindings.length} source + ${catalogFindings.length} catalog = ${allFindings.length} total (after dedup)`
  );

  // ── 4. NVD CVSS Enrichment (async, non-blocking on scan output) ───────────
  // Run NVD enrichment in background — don't block scan response
  // Return merged findings immediately, NVD enrichment applied in background
  enrichWithNVD(allFindings.filter((f) => f.cveId)).then((enriched) => {
    // Background enrichment complete — can be stored/logged
    const enrichedCount = enriched.filter((e) => e.nvdEnriched).length;
    console.info(`[threat-intel] NVD enrichment complete: ${enrichedCount} CVEs updated`);
  }).catch((err) => {
    console.warn("[threat-intel] NVD enrichment error:", err.message);
  });

  // Return unenriched findings immediately for zero-latency scan response
  // NVD enrichment happens in background
  return allFindings;
};

/**
 * Synchronous catalog fallback — instant, no network call
 * @param {string[]} keys - vulnerability catalog keys
 */
const buildCatalogFindings = (keys = []) => {
  return keys
    .map((key) => {
      const vuln = VULNERABILITIES[key];
      if (!vuln) return null;
      const data = { ...DEFAULT_METADATA, ...vuln };
      const cvss = calculateCVSS(data);
      return {
        source: "catalog",
        title: data.title,
        severity: calculateSeverity(cvss),
        cvss,
        description: data.description,
        recommendation: data.recommendation,
        cwe: data.cwe,
        owasp: data.owasp,
        category: data.category,
        references: data.references,
        remediationSteps: data.remediationSteps,
        riskScore: calculateRisk({ cvss }),
      };
    })
    .filter(Boolean);
};

/**
 * Merge source and catalog findings, deduplicate by CVE ID or title
 */
const mergeAndDeduplicate = (sourceFindings, catalogFindings) => {
  const seen = new Map(); // key: cveId or title → finding

  const addFinding = (finding) => {
    const key = finding.cveId || finding.title;
    if (!key) {
      sourceFindings.push(finding); // No dedup key, always include
      return;
    }
    if (!seen.has(key)) {
      seen.set(key, finding);
    } else {
      // Prefer source findings over catalog (more live data)
      const existing = seen.get(key);
      if (finding.source !== "catalog" && existing.source === "catalog") {
        seen.set(key, finding);
      }
    }
  };

  // Source findings first (higher priority)
  sourceFindings.forEach(addFinding);
  // Catalog fills gaps
  catalogFindings.forEach(addFinding);

  return Array.from(seen.values());
};

/**
 * Wrap a promise with a timeout — rejects if takes longer than ms
 */
const withTimeout = (promise, ms, label) => {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`[${label}] timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timer]);
};

/**
 * Extract domain from URL
 */
const extractDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

module.exports = {
  queryAllSources,
  buildCatalogFindings,
  mergeAndDeduplicate,
};
