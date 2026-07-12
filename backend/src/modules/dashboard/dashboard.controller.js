const dashboardService = require("./dashboard.service");

const getDashboardStats = async (req, res) => {
  const start = Date.now();

  try {
    // ✅ Pagination parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const range = req.query.range || "7D";
    const userId = req.user._id;

    const stats = await dashboardService.getDashboardStats(userId, page, limit, range);

    const duration = Date.now() - start;

    console.log(`📊 Dashboard generated in ${duration}ms`);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    const duration = Date.now() - start;

    console.error(`❌ Dashboard failed after ${duration}ms`);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getScanDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const scan = await dashboardService.getScanDetails(userId, id);

    res.json({
      success: true,
      scan,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getDashboardActivityLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const logs = await dashboardService.getDashboardActivityLogs(userId);
    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getScanDetails,
  getDashboardActivityLogs,
};