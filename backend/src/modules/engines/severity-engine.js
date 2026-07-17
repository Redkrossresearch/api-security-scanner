const calculateSeverity = (cvss) => {
  if (cvss >= 9) {
    return "critical";
  }

  if (cvss >= 7) {
    return "high";
  }

  if (cvss >= 4) {
    return "medium";
  }

  return "low";
};

module.exports = {
  calculateSeverity,
};
