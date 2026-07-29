const { CATEGORY_WEIGHTS } = require("./cvss-weights");

/**
 * CVSS v3.1 official roundUp function
 */
const roundUp = (x) => Math.ceil(x * 10) / 10;

const calculateCVSS = (finding) => {
  // 1. If a full CVSS v3.1 vector string is supplied, parse and compute the
  //    official base score using the published CVSS v3.1 specification.
  if (finding.cvssVector) {
    const metricMap = {
      AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
      AC: { L: 0.77, H: 0.44 },
      PR: { N: 0.85, L: 0.62, H: 0.27 },
      UI: { N: 0.85, R: 0.62 },
      S: { U: 0, C: 1 }, // scope flag (0 = unchanged, 1 = changed)
      C: { H: 0.56, L: 0.22, N: 0.0 },
      I: { H: 0.56, L: 0.22, N: 0.0 },
      A: { H: 0.56, L: 0.22, N: 0.0 },
    };

    const vals = {};
    for (const part of finding.cvssVector.split("/")) {
      const [k, v] = part.split(":");
      vals[k] = v;
    }

    const scopeChanged = vals.S === "C";

    // Privilege Required is scope-adjusted per spec
    const prMap = scopeChanged
      ? { N: 0.85, L: 0.68, H: 0.5 }
      : { N: 0.85, L: 0.62, H: 0.27 };

    const AV = metricMap.AV[vals.AV] ?? 0.85;
    const AC = metricMap.AC[vals.AC] ?? 0.77;
    const PR = prMap[vals.PR] ?? 0.85;
    const UI = metricMap.UI[vals.UI] ?? 0.85;
    const C = metricMap.C[vals.C] ?? 0.0;
    const I = metricMap.I[vals.I] ?? 0.0;
    const A = metricMap.A[vals.A] ?? 0.0;

    const ISS = 1 - (1 - C) * (1 - I) * (1 - A);

    if (ISS === 0) return 0.0;

    const ISC = scopeChanged
      ? 7.52 * (ISS - 0.029) - 3.25 * Math.pow(ISS - 0.02, 15)
      : 6.42 * ISS;

    const exploitability = 8.22 * AV * AC * PR * UI;

    let baseScore;
    if (scopeChanged) {
      baseScore = roundUp(Math.min(1.08 * (ISC + exploitability), 10));
    } else {
      baseScore = roundUp(Math.min(ISC + exploitability, 10));
    }

    return Number(baseScore.toFixed(1));
  }

  // 2. If the catalog entry already carries a numeric cvss score, trust it directly
  //    (these values are sourced from NVD/FIRST.org standards and are authoritative).
  if (typeof finding.cvss === "number" && finding.cvss > 0) {
    return Number(finding.cvss.toFixed(1));
  }

  // 3. Last-resort fallback: derive a score from the severity label matching FIRST.org CVSS 3.1 standards.
  const severityDefaults = {
    critical: 9.5,
    high: 7.5,
    medium: 5.3,
    low: 2.4,
    info: 0.0,
  };
  const sev = (finding.severity || "medium").toLowerCase();
  const score = severityDefaults[sev] ?? 5.0;
  return Number(Math.min(10, score).toFixed(1));
};

module.exports = {
  calculateCVSS,
};
