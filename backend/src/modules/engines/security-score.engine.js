const calculateSecurityScore = (findings = []) => {
  let score = 100;

  for (const finding of findings) {
    const rawCvss = Number(finding.cvss);

    const cvss = Number.isFinite(rawCvss)
      ? Math.min(10, Math.max(0, rawCvss))
      : 0;

    score -= cvss;

    if (finding.severity === "critical") {
      score -= 10;
    }

    if (finding.severity === "high") {
      score -= 5;
    }
  }

  score = Math.max(0, Math.round(score));

  let grade = "A";
  let riskLevel = "Low";

  if (score < 90) {
    grade = "B";
  }

  if (score < 75) {
    grade = "C";
    riskLevel = "Medium";
  }

  if (score < 50) {
    grade = "D";
    riskLevel = "High";
  }

  if (score < 25) {
    grade = "F";
    riskLevel = "Critical";
  }

  return {
    score,
    grade,
    riskLevel,
  };
};

module.exports = {
  calculateSecurityScore,
};
