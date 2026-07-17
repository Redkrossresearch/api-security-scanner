const Scan = require("../scans/scan.model");

const predictScoreTrend = async (userId) => {
  const scans = await Scan.find({
    userId,
    status: "completed",
  })
    .sort({ createdAt: 1 })
    .select("securityScore createdAt")
    .lean();

  if (scans.length < 3) {
    return { trend: "insufficient_data", prediction: null };
  }

  const recent = scans.slice(-5);
  const scores = recent.map((s) => s.securityScore);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const last = scores[scores.length - 1];
  const first = scores[0];

  const slope = (last - first) / scores.length;
  const predictedNext = Math.min(100, Math.max(0, last + slope));

  let trend = "stable";
  if (slope > 2) trend = "improving";
  else if (slope < -2) trend = "declining";

  return {
    trend,
    currentAverage: Math.round(avg * 10) / 10,
    lastScore: last,
    predictedNextScore: Math.round(predictedNext * 10) / 10,
    dataPoints: scores.length,
  };
};

const getRiskForecast = async (userId) => {
  const scans = await Scan.find({
    userId,
    status: "completed",
  })
    .sort({ createdAt: 1 })
    .select("riskScore criticalCount highCount createdAt")
    .lean();

  if (scans.length < 2) {
    return { forecast: "insufficient_data", riskTrend: "unknown" };
  }

  const recent = scans.slice(-10);
  const criticalRates = recent.map((s) => s.criticalCount);
  const highRates = recent.map((s) => s.highCount);

  const avgCritical =
    criticalRates.reduce((a, b) => a + b, 0) / criticalRates.length;
  const avgHigh = highRates.reduce((a, b) => a + b, 0) / highRates.length;

  let riskTrend = "stable";
  if (avgCritical > 1 || avgHigh > 3) riskTrend = "increasing";
  else if (avgCritical === 0 && avgHigh === 0) riskTrend = "decreasing";

  return {
    forecast: "sufficient_data",
    riskTrend,
    avgCriticalPerScan: Math.round(avgCritical * 10) / 10,
    avgHighPerScan: Math.round(avgHigh * 10) / 10,
    totalScansAnalyzed: recent.length,
  };
};

module.exports = {
  predictScoreTrend,
  getRiskForecast,
};
