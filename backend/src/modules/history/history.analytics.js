const Scan = require("../scans/scan.model");

const getFindingTrends = async (userId, months = 6) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const results = await Scan.aggregate([
    {
      $match: {
        userId: require("mongoose").Types.ObjectId.createFromHexString(userId),
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        critical: { $sum: "$criticalCount" },
        high: { $sum: "$highCount" },
        medium: { $sum: "$mediumCount" },
        low: { $sum: "$lowCount" },
        total: { $sum: "$totalFindings" },
        avgScore: { $avg: "$securityScore" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results;
};

const getAssetComparison = async (userId) => {
  const results = await Scan.aggregate([
    {
      $match: {
        userId: require("mongoose").Types.ObjectId.createFromHexString(userId),
        status: "completed",
      },
    },
    {
      $group: {
        _id: "$assetName",
        scanCount: { $sum: 1 },
        avgScore: { $avg: "$securityScore" },
        totalFindings: { $sum: "$totalFindings" },
        lastScan: { $max: "$createdAt" },
      },
    },
    { $sort: { avgScore: 1 } },
  ]);

  return results;
};

module.exports = {
  getFindingTrends,
  getAssetComparison,
};
