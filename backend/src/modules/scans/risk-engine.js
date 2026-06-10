const calculateRisk = (
  finding
) => {

  const cvss =
    finding.cvss || 0;

  if (cvss >= 9) {
    return 10;
  }

  if (cvss >= 7) {
    return 8;
  }

  if (cvss >= 4) {
    return 5;
  }

  if (cvss > 0) {
    return 3;
  }

  return 1;

};

module.exports = {
  calculateRisk,
};