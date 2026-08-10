/**
 * NVD (National Vulnerability Database) API Service
 * Official CVE data + CVSS v3.1 scores from NIST
 * Docs: https://nvd.nist.gov/developers/vulnerabilities
 */
const axios = require("axios");

const NVD_API_KEY = process.env.NVD_API_KEY;
const BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const TIMEOUT = 10000;

// Simple in-memory cache to avoid hammering NVD rate limits
const _cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get official CVE details from NVD
 * @param {string} cveId - e.g. "CVE-2021-44228"
 * @returns {object|null} enriched CVE object
 */
const getCVEDetails = async (cveId) => {
  if (!cveId || !cveId.startsWith("CVE-")) return null;

  // Return from cache if fresh
  const cached = _cache.get(cveId);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const headers = {};
    if (NVD_API_KEY) headers["apiKey"] = NVD_API_KEY;

    const res = await axios.get(BASE_URL, {
      params: { cveId },
      headers,
      timeout: TIMEOUT,
    });

    const vuln = res.data?.vulnerabilities?.[0]?.cve;
    if (!vuln) return null;

    const result = normalizeNVDCVE(vuln);
    _cache.set(cveId, { data: result, ts: Date.now() });
    return result;
  } catch (err) {
    console.warn(`[nvd] getCVEDetails(${cveId}) failed:`, err.message);
    return null;
  }
};

/**
 * Enrich a list of vulnerability findings with official NVD CVSS scores
 * NVD score always overrides catalog/source scores when available
 * @param {Array} vulnsList - array of findings (each may have cveId)
 * @returns {Array} findings with NVD-enriched CVSS scores
 */
const enrichWithNVD = async (vulnsList = []) => {
  if (!vulnsList.length) return vulnsList;

  // Only process findings that have a CVE ID
  const withCVE = vulnsList.filter((v) => v.cveId && v.cveId.startsWith("CVE-"));
  const withoutCVE = vulnsList.filter((v) => !v.cveId || !v.cveId.startsWith("CVE-"));

  // Batch NVD lookups with small delay to respect rate limits (50 req/30s with key)
  const enriched = await Promise.allSettled(
    withCVE.map(async (vuln, i) => {
      // Stagger requests slightly to avoid rate limit
      if (i > 0 && i % 5 === 0) await sleep(600);
      const nvdData = await getCVEDetails(vuln.cveId);
      if (!nvdData) return vuln;

      return {
        ...vuln,
        // NVD is authoritative — always override CVSS and severity
        cvss: nvdData.cvssScore ?? vuln.cvss,
        severity: nvdData.severity ?? vuln.severity,
        cvssVector: nvdData.cvssVector ?? vuln.cvssVector,
        nvdPublished: nvdData.published,
        nvdModified: nvdData.modified,
        cweIds: nvdData.cweIds ?? vuln.cweIds,
        description: nvdData.description || vuln.description,
        references: [...new Set([...(vuln.references || []), ...(nvdData.references || [])])],
        nvdEnriched: true,
      };
    })
  );

  const enrichedResults = enriched.map((r, i) =>
    r.status === "fulfilled" ? r.value : withCVE[i]
  );

  return [...withoutCVE, ...enrichedResults];
};

/**
 * Normalize raw NVD CVE object to our standard format
 */
const normalizeNVDCVE = (cve) => {
  // CVSS v3.1 preferred, fallback to v3.0, then v2
  const metrics = cve.metrics || {};
  const cvssV31 = metrics.cvssMetricV31?.[0]?.cvssData;
  const cvssV30 = metrics.cvssMetricV30?.[0]?.cvssData;
  const cvssV2 = metrics.cvssMetricV2?.[0]?.cvssData;

  const cvssData = cvssV31 || cvssV30 || cvssV2;
  const cvssScore = cvssData?.baseScore ?? null;
  const cvssVector = cvssData?.vectorString ?? null;
  const severity = cvssV31?.baseSeverity || cvssV30?.baseSeverity || null;

  const description =
    cve.descriptions?.find((d) => d.lang === "en")?.value || "";

  const cweIds =
    cve.weaknesses?.flatMap((w) =>
      w.description?.map((d) => d.value).filter((v) => v.startsWith("CWE-"))
    ) || [];

  const references = cve.references?.map((r) => r.url).filter(Boolean) || [];

  return {
    cveId: cve.id,
    description,
    cvssScore,
    cvssVector,
    severity: severity?.toLowerCase() ?? cvssToSeverity(cvssScore),
    published: cve.published,
    modified: cve.lastModified,
    cweIds,
    references,
  };
};

const cvssToSeverity = (score) => {
  if (!score) return "medium";
  const n = parseFloat(score);
  if (n >= 9.0) return "critical";
  if (n >= 7.0) return "high";
  if (n >= 4.0) return "medium";
  return "low";
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { getCVEDetails, enrichWithNVD };
