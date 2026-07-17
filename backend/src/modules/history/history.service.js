const Scan = require("../scans/scan.model");
const Vulnerability = require("../vulnerabilities/vulnerability.model");

const getScanHistory = async (userId, query = {}) => {
  const { page = 1, limit = 20, status, riskLevel, startDate, endDate } = query;

  const filter = { userId };
  if (status) filter.status = status;
  if (riskLevel) filter.riskLevel = riskLevel;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const total = await Scan.countDocuments(filter);
  const scans = await Scan.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(
      "scanId targetUrl assetName status securityScore grade riskLevel riskScore criticalCount highCount mediumCount lowCount totalFindings startedAt completedAt duration createdAt",
    );

  return {
    scans,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

const getScanTimeline = async (userId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const scans = await Scan.find({
    userId,
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .lean();

  return scans;
};

const getVulnerabilityHistory = async (userId, days = 90) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const userScanIds = await Scan.find({ userId }).distinct("_id");

  const vulnerabilities = await Vulnerability.find({
    scanId: { $in: userScanIds },
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .lean();

  return vulnerabilities;
};

const getHistorySummary = async (userId) => {
  const totalScans = await Scan.countDocuments({ userId });
  const completedScans = await Scan.countDocuments({
    userId,
    status: "completed",
  });
  const failedScans = await Scan.countDocuments({ userId, status: "failed" });
  const runningScans = await Scan.countDocuments({ userId, status: "running" });

  const latestScan = await Scan.findOne({ userId })
    .sort({ createdAt: -1 })
    .lean();

  const avgScore = await Scan.aggregate([
    {
      $match: {
        userId: require("mongoose").Types.ObjectId.createFromHexString(userId),
        status: "completed",
      },
    },
    { $group: { _id: null, avg: { $avg: "$securityScore" } } },
  ]);

  return {
    totalScans,
    completedScans,
    failedScans,
    runningScans,
    averageScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg * 10) / 10 : 0,
    latestScan: latestScan || null,
  };
};

module.exports = {
  getScanHistory,
  getScanTimeline,
  getVulnerabilityHistory,
  getHistorySummary,
};
