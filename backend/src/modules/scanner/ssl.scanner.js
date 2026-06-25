const https = require("https");

const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanSSL = async (targetUrl) => {
  const findings = [];

  try {
    const url = new URL(targetUrl);

    if (url.protocol !== "https:") {
      const finding = createFinding("HTTPS_NOT_ENABLED");

      if (finding) {
        findings.push(finding);
      }

      return findings;
    }

    await new Promise((resolve) => {
      const req = https.get(targetUrl, (res) => {
        const cert = res.socket.getPeerCertificate();

        if (cert && cert.valid_to) {
          const expiryDate = new Date(cert.valid_to);

          const daysRemaining = Math.floor(
            (expiryDate - new Date()) / (1000 * 60 * 60 * 24),
          );

          if (daysRemaining < 30) {
            const finding = createFinding("SSL_CERTIFICATE_EXPIRING_SOON");

            if (finding) {
              finding.description = `Certificate expires in ${daysRemaining} days`;

              findings.push(finding);
            }
          }
        }

        if (
          cert &&
          cert.issuer &&
          cert.subject &&
          JSON.stringify(cert.issuer) === JSON.stringify(cert.subject)
        ) {
          const finding = createFinding("SELF_SIGNED_CERTIFICATE");

          if (finding) {
            findings.push(finding);
          }
        }

        if (!cert || Object.keys(cert).length === 0) {
          const finding = createFinding("SSL_CERTIFICATE_MISSING");

          if (finding) {
            findings.push(finding);
          }
        }

        resolve();
      });

      req.on("error", (error) => {
        const finding = createFinding("SSL_CERTIFICATE_INVALID");

        if (finding) {
          finding.description = error.message;

          findings.push(finding);
        }

        resolve(); // reject nahi karna
      });

      req.setTimeout(10000, () => {
        const finding = createFinding("SSL_CONNECTION_TIMEOUT");

        if (finding) {
          findings.push(finding);
        }

        req.destroy();
        resolve();
      });
    });
  } catch (error) {
    const finding = createFinding("SSL_SCAN_FAILED");

    if (finding) {
      finding.description = error.message;

      findings.push(finding);
    }
  }

  return findings;
};

module.exports = {
  scanSSL,
};
