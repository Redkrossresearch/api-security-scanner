/**
 * Threat Intelligence Controller
 * Exposes endpoints for direct API queries (Shodan, VT, NVD, Vulners)
 */
const { queryAllSources, buildCatalogFindings } = require("./threat-intel.service");
const { getCVEDetails } = require("./nvd.service");
const { scanDomain: shodanScan, scanHost } = require("./shodan.service");
const { scanDomain: vtScan, scanUrl, scanIp } = require("./virustotal.service");
const { searchBySoftware } = require("./vulners.service");

/**
 * POST /api/threat-intel/scan
 * Full threat intel scan — all sources + catalog + NVD enrichment
 */
const runFullScan = async (req, res) => {
  try {
    const { targetUrl, domain, ip, techStack = [], catalogKeys = [] } = req.body;

    if (!targetUrl && !domain) {
      return res.status(400).json({ success: false, message: "targetUrl or domain is required" });
    }

    const findings = await queryAllSources({ targetUrl, domain, ip, techStack, catalogKeys });

    return res.json({
      success: true,
      target: domain || targetUrl,
      totalFindings: findings.length,
      sourceCounts: {
        vulners: findings.filter((f) => f.source === "vulners").length,
        shodan: findings.filter((f) => f.source === "shodan").length,
        virustotal: findings.filter((f) => f.source === "virustotal").length,
        catalog: findings.filter((f) => f.source === "catalog").length,
      },
      findings,
    });
  } catch (err) {
    console.error("[threat-intel] runFullScan error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/threat-intel/cve/:cveId
 * Official NVD CVE detail lookup
 */
const getCVE = async (req, res) => {
  try {
    const { cveId } = req.params;
    const data = await getCVEDetails(cveId);

    if (!data) {
      return res.status(404).json({ success: false, message: `CVE ${cveId} not found in NVD` });
    }

    return res.json({ success: true, cve: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/threat-intel/shodan/:host
 * Shodan host or domain scan
 */
const getShodanHost = async (req, res) => {
  try {
    const { host } = req.params;

    // Check if it's an IP or domain
    const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    let result;

    if (isIP) {
      const raw = await scanHost(host);
      result = raw;
    } else {
      const { scanDomain } = require("./shodan.service");
      result = await scanDomain(host);
    }

    return res.json({ success: true, host, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/threat-intel/virustotal/:target
 * VirusTotal scan — auto-detects domain, IP, or URL
 */
const getVirusTotalScan = async (req, res) => {
  try {
    const { target } = req.params;
    let result;

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(target)) {
      result = await scanIp(target);
    } else if (target.startsWith("http://") || target.startsWith("https://")) {
      result = await scanUrl(target);
    } else {
      result = await vtScan(target);
    }

    return res.json({ success: true, target, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/threat-intel/vulners/:software
 * Vulners CVE search for a specific software
 */
const getVulnersSoftware = async (req, res) => {
  try {
    const { software } = req.params;
    const { version } = req.query;
    const findings = await searchBySoftware(software, version);
    return res.json({ success: true, software, version, count: findings.length, findings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { runFullScan, getCVE, getShodanHost, getVirusTotalScan, getVulnersSoftware };
