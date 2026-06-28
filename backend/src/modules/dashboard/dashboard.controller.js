const dashboardService = require("./dashboard.service");

const getDashboardStats = async (req, res) => {
  const start = Date.now();

  try {
    // ✅ Pagination parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const stats = await dashboardService.getDashboardStats(page, limit);

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

module.exports = {
  getDashboardStats,
};