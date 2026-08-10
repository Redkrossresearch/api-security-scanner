/**
 * VirusTotal API Service
 * Scan domains, URLs, IPs for malware, phishing, reputation scores
 * Docs: https://developers.virustotal.com/reference
 */
const axios = require("axios");

const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const BASE_URL = "https://www.virustotal.com/api/v3";
const TIMEOUT = 10000;

const vtHeaders = () => ({
  "x-apikey": VT_API_KEY,
  "Accept": "application/json",
});

/**
 * Scan a domain for malicious reputation
 * @param {string} domain - e.g. "example.com"
 * @returns {object|null}
 */
const scanDomain = async (domain) => {
  if (!VT_API_KEY) {
    console.warn("[virustotal] No API key configured — skipping");
    return null;
  }

  try {
    const res = await axios.get(`${BASE_URL}/domains/${domain}`, {
      headers: vtHeaders(),
      timeout: TIMEOUT,
    });

    return normalizeVTResult(res.data?.data, "domain", domain);
  } catch (err) {
    console.warn(`[virustotal] scanDomain(${domain}) failed:`, err.message);
    return null;
  }
};

/**
 * Scan a URL for malicious content
 * @param {string} url - full URL
 */
const scanUrl = async (url) => {
  if (!VT_API_KEY) return null;

  try {
    // VirusTotal requires base64url encoding for URL lookups
    const urlId = Buffer.from(url).toString("base64url").replace(/=+$/, "");

    const res = await axios.get(`${BASE_URL}/urls/${urlId}`, {
      headers: vtHeaders(),
      timeout: TIMEOUT,
    });

    return normalizeVTResult(res.data?.data, "url", url);
  } catch (err) {
    if (err.response?.status === 404) {
      // URL not in VT DB yet — submit for analysis
      try {
        await axios.post(
          `${BASE_URL}/urls`,
          new URLSearchParams({ url }),
          { headers: { ...vtHeaders(), "Content-Type": "application/x-www-form-urlencoded" }, timeout: TIMEOUT }
        );
        console.info(`[virustotal] URL submitted for analysis: ${url}`);
      } catch (_) {}
    }
    console.warn(`[virustotal] scanUrl failed:`, err.message);
    return null;
  }
};

/**
 * Scan an IP address
 * @param {string} ip - IPv4 address
 */
const scanIp = async (ip) => {
  if (!VT_API_KEY) return null;

  try {
    const res = await axios.get(`${BASE_URL}/ip_addresses/${ip}`, {
      headers: vtHeaders(),
      timeout: TIMEOUT,
    });

    return normalizeVTResult(res.data?.data, "ip", ip);
  } catch (err) {
    console.warn(`[virustotal] scanIp(${ip}) failed:`, err.message);
    return null;
  }
};

/**
 * Convert VT result into a finding if malicious/suspicious
 */
const normalizeVTResult = (data, type, target) => {
  if (!data) return null;

  const stats = data.attributes?.last_analysis_stats || {};
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const reputation = data.attributes?.reputation ?? 0;

  const result = {
    source: "virustotal",
    target,
    type,
    maliciousCount: malicious,
    suspiciousCount: suspicious,
    totalEngines: total,
    reputation,
    detectionRatio: total > 0 ? `${malicious + suspicious}/${total}` : "0/0",
    categories: data.attributes?.categories || {},
    lastAnalysisDate: data.attributes?.last_analysis_date
      ? new Date(data.attributes.last_analysis_date * 1000).toISOString()
      : null,
    findings: [],
  };

  // Generate findings only if malicious/suspicious detections found
  if (malicious > 0) {
    result.findings.push({
      source: "virustotal",
      title: `Malicious ${type} detected: ${target}`,
      severity: malicious >= 5 ? "critical" : "high",
      cvss: malicious >= 5 ? 9.0 : 7.5,
      description: `VirusTotal flagged this ${type} as malicious by ${malicious} out of ${total} security engines. This indicates active malware, phishing, or command-and-control activity.`,
      recommendation: `Immediately block or quarantine ${target}. Investigate for potential compromise.`,
      category: "Malware / Reputation",
      owasp: "A09:2021 Security Logging and Monitoring Failures",
      remediationSteps: [
        `Block ${target} at the firewall and DNS level.`,
        "Scan all systems that have communicated with this target.",
        "Report to your incident response team immediately.",
        `Check full report: https://www.virustotal.com/gui/${type}/${target}`,
      ],
      references: [
        `https://www.virustotal.com/gui/${type}/${target}`,
        "https://owasp.org",
      ],
    });
  } else if (suspicious > 0) {
    result.findings.push({
      source: "virustotal",
      title: `Suspicious ${type} flagged: ${target}`,
      severity: "medium",
      cvss: 5.0,
      description: `VirusTotal flagged this ${type} as suspicious by ${suspicious} out of ${total} security engines. May indicate phishing, adware, or potentially unwanted programs.`,
      recommendation: `Monitor traffic to/from ${target} closely. Consider blocking.`,
      category: "Suspicious Reputation",
      owasp: "A09:2021 Security Logging and Monitoring Failures",
      remediationSteps: [
        `Audit all traffic to/from ${target}.`,
        "Apply domain/IP reputation filtering.",
        `Check full report: https://www.virustotal.com/gui/${type}/${target}`,
      ],
      references: [`https://www.virustotal.com/gui/${type}/${target}`],
    });
  }

  return result;
};

module.exports = { scanDomain, scanUrl, scanIp };
