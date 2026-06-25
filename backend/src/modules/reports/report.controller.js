const Report = require("./report.model");

const { generateJsonReport } = require("./report.service");

const { generatePdfReport } = require("./pdfReport.service");

const getReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      scanId: req.params.scanId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportJsonReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      scanId: req.params.scanId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const json = generateJsonReport(report);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=athx-report-${req.params.scanId}.json`,
    );

    res.setHeader("Content-Type", "application/json");

    res.send(json);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportCsvReport = async (req, res) => {
  res.json({
    success: true,
    message: "CSV export working",
    scanId: req.params.scanId,
  });
};

const exportPdfReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      scanId: req.params.scanId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=athx-report-${req.params.scanId}.pdf`,
    );

    generatePdfReport(report, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getReport,
  exportJsonReport,
  exportCsvReport,
  exportPdfReport,
};
