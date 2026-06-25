const axios = require("axios");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const JWT_REGEX = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

const COMMON_JWT_HEADERS = ["authorization", "x-access-token", "x-auth-token"];

const decodeBase64Url = (value) => {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
  } catch {
    return null;
  }
};

const containsSensitiveClaims = (payload) => {
  const sensitiveKeys = [
    "password",
    "secret",
    "apikey",
    "api_key",
    "token",
    "access_token",
    "refresh_token",
    "ssn",
    "creditcard",
    "cardnumber",
  ];

  return Object.keys(payload).some((key) =>
    sensitiveKeys.includes(key.toLowerCase()),
  );
};

const analyzeJWT = (jwt, findings) => {
  const parts = jwt.split(".");

  if (parts.length !== 3) {
    return;
  }

  const header = decodeBase64Url(parts[0]);
  const payload = decodeBase64Url(parts[1]);

  if (!header || !payload) {
    return;
  }

  // JWT exposed
  const exposedFinding = createFinding("API_KEY_EXPOSED");

  if (exposedFinding) {
    findings.push(exposedFinding);
  }

  // alg none
  if (header.alg && header.alg.toLowerCase() === "none") {
    const finding = createFinding("JWT_NONE_ALGORITHM");

    if (finding) {
      findings.push(finding);
    }
  }

  // no expiration
  if (!payload.exp) {
    const finding = createFinding("JWT_NO_EXPIRATION");

    if (finding) {
      findings.push(finding);
    }
  }

  // long expiration
  if (payload.exp && payload.iat) {
    const lifetime = payload.exp - payload.iat;

    if (lifetime > 86400) {
      const finding = createFinding("JWT_LONG_EXPIRATION");

      if (finding) {
        findings.push(finding);
      }
    }
  }

  // sensitive claims
  if (containsSensitiveClaims(payload)) {
    const finding = createFinding("JWT_SENSITIVE_DATA");

    if (finding) {
      findings.push(finding);
    }
  }
};

const scanJWT = async (targetUrl) => {
  const findings = [];

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      validateStatus: () => true,
    });

    // headers

    for (const headerName of COMMON_JWT_HEADERS) {
      const token = response.headers[headerName];

      if (!token) {
        continue;
      }

      const matches = token.match(JWT_REGEX) || [];

      matches.forEach((jwt) => analyzeJWT(jwt, findings));
    }

    // response body

    const body = JSON.stringify(response.data);

    const bodyMatches = body.match(JWT_REGEX) || [];

    bodyMatches.forEach((jwt) => analyzeJWT(jwt, findings));
  } catch (error) {
    console.error("JWT Scanner Error:", error.message);
  }

  return findings;
};

module.exports = {
  scanJWT,
};
