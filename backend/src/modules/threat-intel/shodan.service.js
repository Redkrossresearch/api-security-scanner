/**
 * Shodan API Service
 * Scan target hosts for open ports, exposed services, known vulnerabilities
 * Docs: https://developer.shodan.io/api
 */
const axios = require("axios");

const SHODAN_API_KEY = process.env.SHODAN_API_KEY;
const BASE_URL = "https://api.shodan.io";
const TIMEOUT = 8000;

/**
 * Lookup a host by IP — returns open ports, services, CVEs
 * @param {string} ip - IPv4 address
 * @returns {object} Shodan host info
 */
const scanHost = async (ip) => {
  if (!SHODAN_API_KEY) {
    console.warn("[shodan] No API key configured — skipping");
    return null;
  }

  try {
    const res = await axios.get(`${BASE_URL}/shodan/host/${ip}`, {
      params: { key: SHODAN_API_KEY },
      timeout: TIMEOUT,
    });

    return normalizeHostData(res.data);
  } catch (err) {
    if (err.response?.status === 404) {
      console.warn(`[shodan] Host ${ip} not found in Shodan index`);
    } else {
      console.warn(`[shodan] scanHost(${ip}) failed:`, err.message);
    }
    return null;
  }
};

/**
 * Resolve domain to IP then scan via Shodan
 * @param {string} domain - e.g. "example.com"
 * @returns {{ ip: string, findings: Array }}
 */
const scanDomain = async (domain) => {
  if (!SHODAN_API_KEY) return { ip: null, findings: [] };

  try {
    // DNS lookup via Shodan
    const dnsRes = await axios.get(`${BASE_URL}/dns/resolve`, {
      params: { hostnames: domain, key: SHODAN_API_KEY },
      timeout: TIMEOUT,
    });

    const ip = dnsRes.data?.[domain];
    if (!ip) {
      console.warn(`[shodan] Could not resolve domain: ${domain}`);
      return { ip: null, findings: [] };
    }

    const hostData = await scanHost(ip);
    return { ip, findings: hostData?.findings || [], raw: hostData?.raw };
  } catch (err) {
    console.warn(`[shodan] scanDomain(${domain}) failed:`, err.message);
    return { ip: null, findings: [] };
  }
};

/**
 * Normalize Shodan host response to standard findings array
 */
const normalizeHostData = (data) => {
  const findings = [];

  // Open ports as potential exposure
  const openPorts = data.ports || [];
  if (openPorts.length > 0) {
    const sensitivePortMap = {
      22: { title: "SSH Port Exposed", severity: "medium", cvss: 5.3 },
      23: { title: "Telnet Port Exposed (Plaintext)", severity: "high", cvss: 7.5 },
      3389: { title: "RDP Port Exposed", severity: "high", cvss: 8.1 },
      6379: { title: "Redis Port Exposed Without Auth", severity: "critical", cvss: 9.8 },
      27017: { title: "MongoDB Port Exposed", severity: "critical", cvss: 9.8 },
      5432: { title: "PostgreSQL Port Exposed", severity: "high", cvss: 7.8 },
      3306: { title: "MySQL Port Exposed", severity: "high", cvss: 7.8 },
      9200: { title: "Elasticsearch Port Exposed", severity: "critical", cvss: 9.1 },
      21: { title: "FTP Port Exposed", severity: "high", cvss: 7.5 },
      25: { title: "SMTP Port Exposed", severity: "medium", cvss: 5.0 },
    };

    openPorts.forEach((port) => {
      if (sensitivePortMap[port]) {
        const meta = sensitivePortMap[port];
        findings.push({
          source: "shodan",
          title: meta.title,
          severity: meta.severity,
          cvss: meta.cvss,
          description: `Shodan detected port ${port} open on this host. ${meta.title} can expose critical services to unauthorized access.`,
          recommendation: `Close or firewall port ${port} if not required externally. Use VPN or IP allowlisting for administrative access.`,
          category: "Network Exposure",
          owasp: "A05:2021 Security Misconfiguration",
          remediationSteps: [
            `Audit whether port ${port} needs to be publicly accessible.`,
            "Apply firewall rules to restrict access to trusted IPs only.",
            "Enable authentication and encryption on the exposed service.",
          ],
          references: ["https://www.shodan.io", "https://owasp.org"],
        });
      }
    });
  }

  // CVEs reported by Shodan for this host
  const cves = data.vulns || {};
  Object.entries(cves).forEach(([cveId, cveData]) => {
    findings.push({
      source: "shodan",
      cveId,
      title: `${cveId} — Vulnerability detected by Shodan`,
      severity: cvssToSeverity(cveData.cvss),
      cvss: cveData.cvss || null,
      description: cveData.summary || `Shodan detected ${cveId} on this host's services.`,
      recommendation: "Apply the vendor patch for this CVE immediately.",
      category: "Known CVE",
      owasp: "A06:2021 Vulnerable and Outdated Components",
      remediationSteps: [
        `Look up ${cveId} on https://nvd.nist.gov for the official patch.`,
        "Update the affected service to the patched version.",
        "Re-scan after patching to confirm resolution.",
      ],
      references: [`https://nvd.nist.gov/vuln/detail/${cveId}`, "https://www.shodan.io"],
    });
  });

  // Exposed services banner info
  const services = data.data || [];
  services.forEach((svc) => {
    if (svc.product && svc.version) {
      findings.push({
        source: "shodan",
        title: `Exposed Service: ${svc.product} ${svc.version} on port ${svc.port}`,
        severity: "info",
        cvss: 0,
        description: `Shodan identified ${svc.product} version ${svc.version} running on port ${svc.port}. Outdated versions may carry known CVEs.`,
        recommendation: "Verify this service version is patched and not EOL.",
        category: "Service Exposure",
        owasp: "A06:2021 Vulnerable and Outdated Components",
        remediationSteps: ["Check for CVEs for this version via NVD.", "Update to the latest stable release."],
        references: ["https://nvd.nist.gov"],
      });
    }
  });

  return {
    raw: {
      ip: data.ip_str,
      country: data.country_name,
      org: data.org,
      os: data.os,
      ports: data.ports,
      lastUpdate: data.last_update,
    },
    findings,
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

module.exports = { scanHost, scanDomain };
