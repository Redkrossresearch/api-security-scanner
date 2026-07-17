const historyService = require("./history.service");

const list = async (req, res) => {
  try {
    const { page, limit, status, riskLevel, startDate, endDate } = req.query;
    const result = await historyService.getScanHistory(req.user._id, {
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 20, 100),
      status,
      riskLevel,
      startDate,
      endDate,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const timeline = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const scans = await historyService.getScanTimeline(req.user._id, days);
    return res.json({ success: true, scans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const vulnerabilityHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const vulnerabilities = await historyService.getVulnerabilityHistory(
      req.user._id,
      days,
    );
    return res.json({ success: true, vulnerabilities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const summary = async (req, res) => {
  try {
    const data = await historyService.getHistorySummary(req.user._id);
    return res.json({ success: true, summary: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  list,
  timeline,
  vulnerabilityHistory,
  summary,
};
