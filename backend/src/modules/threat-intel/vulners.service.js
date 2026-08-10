/**
 * Vulners API Service
 * Finds known CVEs for detected tech stack (PHP, Apache, Nginx, etc.)
 * Docs: https://vulners.com/docs
 */
const axios = require("axios");

const VULNERS_API_KEY = process.env.VULNERS_API_KEY;
const BASE_URL = "https://vulners.com/api/v3";
const TIMEOUT = 8000;

/**
 * Search CVEs for a specific software + version via Vulners
 * @param {string} software - e.g. "Apache", "PHP", "Nginx"
 * @param {string} version  - e.g. "2.4.51" (optional)
 * @returns {Array} normalized vulnerability objects
 */
const searchBySoftware = async (software, version = "") => {
  if (!VULNERS_API_KEY) {
    console.warn("[vulners] No API key configured — skipping");
    return [];
  }

  try {
    const query = version
      ? `${software} ${version} type:cve`
      : `${software} type:cve`;

    const res = await axios.post(
      `${BASE_URL}/search/lucene/`,
      {
        query,
        fields: ["id", "title", "cvss", "description", "published", "references"],
        skip: 0,
        size: 10,
        apiKey: VULNERS_API_KEY,
      },
      { timeout: TIMEOUT }
    );

    const items = res.data?.data?.search || [];
    return items.map((item) => normalizeVulnersResult(item, software));
  } catch (err) {
    console.warn(`[vulners] searchBySoftware(${software}) failed:`, err.message);
    return [];
  }
};

/**
 * Search CVEs using a CPE string
 * @param {string} cpe - e.g. "cpe:/a:apache:http_server:2.4.51"
 */
const searchByCPE = async (cpe) => {
  if (!VULNERS_API_KEY) return [];

  try {
    const res = await axios.post(
      `${BASE_URL}/burp/software/`,
      { software: cpe, type: "cpe", maxVulnerabilities: 10, apiKey: VULNERS_API_KEY },
      { timeout: TIMEOUT }
    );

    const items = res.data?.data?.search || [];
    return items.map((item) => normalizeVulnersResult(item, cpe));
  } catch (err) {
    console.warn(`[vulners] searchByCPE(${cpe}) failed:`, err.message);
    return [];
  }
};

/**
 * Search CVEs for all detected technologies
 * @param {string[]} techList - e.g. ["Apache", "PHP", "Nginx"]
 */
const searchByTechStack = async (techList = []) => {
  if (!techList.length) return [];

  const results = await Promise.allSettled(
    techList.map((tech) => searchBySoftware(tech))
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);
};

/** Normalize Vulners result to standard finding format */
const normalizeVulnersResult = (item, source) => ({
  source: "vulners",
  cveId: item._id || item.id || null,
  title: item._source?.title || item.title || `Vulnerability in ${source}`,
  description: item._source?.description || item.description || "",
  cvss: item._source?.cvss?.score || item.cvss?.score || null,
  severity: cvssToSeverity(item._source?.cvss?.score || item.cvss?.score),
  published: item._source?.published || item.published || null,
  references: item._source?.references || item.references || [],
  category: "Known Vulnerability",
  owasp: "A06:2021 Vulnerable and Outdated Components",
  recommendation: "Update the affected software to the latest patched version.",
  remediationSteps: [
    "Identify the exact version of the affected component.",
    "Apply the vendor-provided patch or upgrade to a non-vulnerable version.",
    "Monitor vendor advisories for future CVEs.",
  ],
});

const cvssToSeverity = (score) => {
  if (!score) return "medium";
  const n = parseFloat(score);
  if (n >= 9.0) return "critical";
  if (n >= 7.0) return "high";
  if (n >= 4.0) return "medium";
  return "low";
};

module.exports = { searchBySoftware, searchByCPE, searchByTechStack };
