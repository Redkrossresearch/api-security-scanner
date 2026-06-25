const {
  CATEGORY_WEIGHTS,
} = require(
  "./cvss-weights"
);

const calculateCVSS = (
  finding
) => {

  let score =
    finding.cvss || 5.0;

  const categoryWeight =
    CATEGORY_WEIGHTS[
      finding.category
    ] || 0;

  score +=
    categoryWeight;

  if (score > 10) {
    score = 10;
  }

  return Number(
    score.toFixed(1)
  );

};

module.exports = {
  calculateCVSS,
};