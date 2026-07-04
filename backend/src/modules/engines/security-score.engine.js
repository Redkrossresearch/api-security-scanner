const calculateSecurityScore = (findings = []) => {
  if (findings.length === 0) {
    return {
      score: 100,
      grade: "A",
      riskLevel: "Low",
    };
  }

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const f of findings) {
    const sev = (f.severity || "medium").toLowerCase();
    if (sev === "critical") {
      criticalCount++;
    } else if (sev === "high") {
      highCount++;
    } else if (sev === "medium") {
      mediumCount++;
    } else if (sev === "low" || sev === "info") {
      lowCount++;
    }
  }

  // Deduct based on counts with caps per severity
  const criticalDeduction = Math.min(40, criticalCount * 15);
  const highDeduction = Math.min(30, highCount * 8);
  const mediumDeduction = Math.min(20, mediumCount * 3);
  const lowDeduction = Math.min(10, lowCount * 1);

  let score = 100 - (criticalDeduction + highDeduction + mediumDeduction + lowDeduction);

  // Apply maximum score caps based on severity presence to match industry standards
  if (criticalCount > 0) {
    // If critical exists, max score is capped at 59 (cannot be A/B/C)
    score = Math.min(score, 59);
  } else if (highCount > 0) {
    // If high exists, max score is capped at 79 (cannot be A/B)
    score = Math.min(score, 79);
  } else if (mediumCount > 0) {
    // If medium exists, max score is capped at 89 (cannot be A)
    score = Math.min(score, 89);
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
