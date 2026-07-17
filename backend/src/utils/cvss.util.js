const getSeverityFromCvss = (cvss = 0) => {
  if (cvss >= 9.0) {
    return "critical";
  }

  if (cvss >= 7.0) {
    return "high";
  }

  if (cvss >= 4.0) {
    return "medium";
  }

  if (cvss > 0) {
    return "low";
  }

  return "info";
};

module.exports = {
  getSeverityFromCvss,
};
