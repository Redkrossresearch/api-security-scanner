const mongoose = require("mongoose");
const { createScan, getUserScans } = require("./scan.service");

const Scan = require("./scan.model");

// ==================== CORE APIs ====================

const create = async (req, res) => {
  try {
    const { targetUrl } = req.body;

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        message: "Target URL is required",
      });
    }

    try {
      new URL(targetUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format",
      });
    }

    console.log("REQ USER:", req.user);
    console.log("TARGET URL:", targetUrl);

    const scan = await createScan(req.user._id, targetUrl);

    return res.status(201).json({
      success: true,
      scan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const scans = await getUserScans(req.user._id);

    return res.status(200).json({
      success: true,
      scans,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE 2 & 3: Page & Limit safety added
const getScanHistory = async (req, res) => {
  try {
    console.log("REQ USER =", req.user);

    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: "req.user missing",
      });
    }

    // 🔧 UPDATE 2: Prevent negative pages
    const page = Math.max(Number(req.query.page || 1), 1);

    // 🔧 UPDATE 3: Prevent limit=0 or negative
    const limit = Math.max(Math.min(Number(req.query.limit || 10), 100), 1);

    const { search, status, riskLevel, profile, startDate, endDate } =
      req.query;

    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { scanId: { $regex: search, $options: "i" } },
        { assetName: { $regex: search, $options: "i" } },
        { targetUrl: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    if (profile) query.profile = profile;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Scan.countDocuments(query);

    const scans = await Scan.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      scans,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getScanById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan id",
      });
    }

    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    return res.json({
      success: true,
      scan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteScan = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan id",
      });
    }

    const scan = await Scan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    return res.json({
      success: true,
      message: "Scan deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== DASHBOARD APIs ====================

// ✅ FIX 1 + UPDATE 1: Optional chaining + decimal averageScore
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?._id; // 🔧 FIX 1

    const totalScans = await Scan.countDocuments({ userId });
    const completedScans = await Scan.countDocuments({
      userId,
      status: "completed",
    });
    const failedScans = await Scan.countDocuments({ userId, status: "failed" });

    const avgResult = await Scan.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "completed",
        },
      },
      { $group: { _id: null, avg: { $avg: "$securityScore" } } },
    ]);
    const averageScore = avgResult[0]?.avg || 0;

    const criticalResult = await Scan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$criticalCount" } } },
    ]);
    const criticalFindings = criticalResult[0]?.total || 0;

    const vulnStats = await Scan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$vulnerabilities" },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$vulnerabilities.status", "resolved"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const remediatedRate =
      vulnStats[0]?.total > 0
        ? Math.round((vulnStats[0].resolved / vulnStats[0].total) * 100)
        : 0;

    return res.json({
      success: true,
      summary: {
        totalScans,
        completedScans,
        failedScans,
        // 🔧 UPDATE 1: Decimal precision
        averageScore: Number(averageScore.toFixed(1)),
        criticalFindings,
        remediatedRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ FIX 2: Optional chaining
const getRiskDistribution = async (req, res) => {
  try {
    const userId = req.user?._id; // 🔧 FIX 2

    const result = await Scan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          critical: { $sum: "$criticalCount" },
          high: { $sum: "$highCount" },
          medium: { $sum: "$mediumCount" },
          low: { $sum: "$lowCount" },
        },
      },
    ]);

    const distribution = result[0] || {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    return res.json({
      success: true,
      distribution,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ FIX 3: Optional chaining
const getScanActivity = async (req, res) => {
  try {
    const userId = req.user?._id; // 🔧 FIX 3
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Scan.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          scans: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const activity = result.map((item) => {
      const date = new Date(item._id);
      return {
        day: days[date.getDay()],
        date: item._id,
        scans: item.scans,
      };
    });

    return res.json({
      success: true,
      activity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ FIX 4: Optional chaining
const getVulnerabilityTrends = async (req, res) => {
  try {
    const userId = req.user?._id; // 🔧 FIX 4
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await Scan.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          critical: { $sum: "$criticalCount" },
          high: { $sum: "$highCount" },
          medium: { $sum: "$mediumCount" },
          low: { $sum: "$lowCount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const trends = result.map((item) => {
      const [year, month] = item._id.split("-");
      return {
        month: months[parseInt(month) - 1],
        year: parseInt(year),
        critical: item.critical,
        high: item.high,
        medium: item.medium,
        low: item.low,
      };
    });

    return res.json({
      success: true,
      trends,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ FIX 5: Optional chaining + userId variable reuse
const getAssetLeaderboard = async (req, res) => {
  try {
    const userId = req.user?._id; // 🔧 FIX 5
    console.log("USER:", req.user);
    console.log("USER ID:", userId);

    const result = await Scan.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "completed",
          assetName: { $exists: true, $nin: ["", null] },
        },
      },
      {
        $group: {
          _id: "$assetName",
          avgScore: { $avg: "$securityScore" },
          totalFindings: { $sum: "$totalFindings" },
          scanCount: { $sum: 1 },
        },
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
    ]);

    const leaderboard = await Promise.all(
      result.map(async (asset) => {
        const recentScans = await Scan.find({
          userId: userId, // 🔧 FIX 5: Reuse userId variable
          assetName: asset._id,
          status: "completed",
        })
          .sort({ createdAt: -1 })
          .limit(2);

        let trend = "stable";
        if (recentScans.length === 2) {
          if (recentScans[0].securityScore > recentScans[1].securityScore) {
            trend = "up";
          } else if (
            recentScans[0].securityScore < recentScans[1].securityScore
          ) {
            trend = "down";
          }
        }

        return {
          assetName: asset._id,
          score: Math.max(0, Math.min(100, Math.round(asset.avgScore))),
          findings: asset.totalFindings,
          scanCount: asset.scanCount,
          trend,
        };
      }),
    );

    return res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ FIX 6: Optional chaining
const getHeatmap = async (req, res) => {
  try {
    const userId = req.user?._id; // 🔧 FIX 6

    const result = await Scan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$vulnerabilities" },
      {
        $group: {
          _id: {
            category: "$vulnerabilities.category",
            month: {
              $dateToString: {
                format: "%Y-%m",
                date: "$vulnerabilities.detectedAt",
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.category": 1, "_id.month": 1 } },
    ]);

    const heatmapMap = {};

    result.forEach((item) => {
      const vuln = item._id.category || "Unknown";
      const month = item._id.month;

      if (!heatmapMap[vuln]) {
        heatmapMap[vuln] = { vuln };
      }
      heatmapMap[vuln][month] = item.count;
    });

    const heatmap = Object.values(heatmapMap);

    return res.json({
      success: true,
      heatmap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ FIX 7: Optional chaining
const getAIInsights = async (req, res) => {
  try {
    const userId = req.user?._id; // 🔧 FIX 7

    const mttrResult = await Scan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$vulnerabilities" },
      {
        $match: {
          "vulnerabilities.status": "resolved",
          "vulnerabilities.resolvedAt": { $exists: true },
        },
      },
      {
        $project: {
          daysToResolve: {
            $divide: [
              {
                $subtract: [
                  "$vulnerabilities.resolvedAt",
                  "$vulnerabilities.detectedAt",
                ],
              },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: "$daysToResolve" },
        },
      },
    ]);

    const mttr = mttrResult[0]?.avgDays
      ? `${mttrResult[0].avgDays.toFixed(1)} Days`
      : "N/A";

    const firstScan = await Scan.findOne({ userId, status: "completed" }).sort({
      createdAt: 1,
    });
    const latestScan = await Scan.findOne({ userId, status: "completed" }).sort(
      {
        createdAt: -1,
      },
    );

    let riskReduction = "N/A";
    if (
      firstScan &&
      latestScan &&
      firstScan._id.toString() !== latestScan._id.toString() &&
      firstScan.riskScore > 0
    ) {
      const reduction =
        ((firstScan.riskScore - latestScan.riskScore) / firstScan.riskScore) *
        100;
      riskReduction = `${Math.round(reduction)}%`;
    }

    const commonResult = await Scan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$vulnerabilities" },
      {
        $group: {
          _id: "$vulnerabilities.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const commonIssue = commonResult[0]?._id || "N/A";

    const remediationResult = await Scan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$vulnerabilities" },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$vulnerabilities.status", "resolved"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const remediationRate =
      remediationResult[0]?.total > 0
        ? `${Math.round(
            (remediationResult[0].resolved / remediationResult[0].total) * 100,
          )}%`
        : "N/A";

    return res.json({
      success: true,
      insights: {
        mttr,
        riskReduction,
        commonIssue,
        remediationRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  create,
  getAll,
  getScanHistory,
  getScanById,
  deleteScan,
  getDashboardSummary,
  getRiskDistribution,
  getScanActivity,
  getVulnerabilityTrends,
  getAssetLeaderboard,
  getHeatmap,
  getAIInsights,
};