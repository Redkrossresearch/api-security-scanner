const PENALTIES = {
  critical: 30,
  high: 15,
  medium: 5,
  low: 2,
  info: 0,
};

const calculateSecurityScore = (
  findings = []
) => {
  let score = 100;

  findings.forEach((finding) => {
    score -=
      PENALTIES[
        finding.severity
      ] || 0;
  });

  if (score < 0) {
    score = 0;
  }

  let riskLevel = "Low";
  let grade = "A";

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