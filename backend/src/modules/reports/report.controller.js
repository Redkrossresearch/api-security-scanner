const Report = require("./report.model");
const Vulnerability = require("../vulnerabilities/vulnerability.model");
const Scan = require("../scans/scan.model");

const { generateJsonReport } = require("./report.service");
const { generatePdfReport } = require("./pdfReport.service");
const { generateOpenApiSpec } = require("./openapi.generator");

const checkReportOwnership = async (scanId, userId) => {
  const scan = await Scan.findOne({
    _id: scanId,
    userId: userId,
  });
  return !!scan;
};

const getReport = async (req, res) => {
  try {
    const isOwner = await checkReportOwnership(req.params.scanId, req.user._id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this report.",
      });
    }

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
    const isOwner = await checkReportOwnership(req.params.scanId, req.user._id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this report.",
      });
    }

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
  try {
    const isOwner = await checkReportOwnership(req.params.scanId, req.user._id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this report.",
      });
    }

    const report = await Report.findOne({
      scanId: req.params.scanId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const vulnerabilities = await Vulnerability.find({
      scanId: report.scanId,
    });

    const headers = [
      "Title",
      "Severity",
      "Category",
      "CWE",
      "OWASP",
      "CVSS",
      "Status",
      "Verified",
      "Endpoint",
      "Vulnerable Parameter",
      "Exploit Payload"
    ];

    const escapeCsv = (val) => {
      if (val === undefined || val === null) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [
      headers.join(","),
      ...vulnerabilities.map(v => [
        escapeCsv(v.title),
        escapeCsv(v.severity),
        escapeCsv(v.category),
        escapeCsv(v.cwe),
        escapeCsv(v.owasp),
        escapeCsv(v.cvss),
        escapeCsv(v.status),
        escapeCsv(v.verified ? "Yes" : "No"),
        escapeCsv(v.endpoint),
        escapeCsv(v.vulnerableParameter),
        escapeCsv(v.exploitPayload)
      ].join(","))
    ];

    const csvContent = rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=athx-report-${req.params.scanId}.csv`
    );

    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportPdfReport = async (req, res) => {
  try {
    const isOwner = await checkReportOwnership(req.params.scanId, req.user._id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this report.",
      });
    }

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

    await generatePdfReport(report, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportOpenApiReport = async (req, res) => {
  try {
    const isOwner = await checkReportOwnership(req.params.scanId, req.user._id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this report.",
      });
    }

    const scan = await Scan.findOne({
      _id: req.params.scanId,
      userId: req.user._id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    const vulnerabilities = await Vulnerability.find({ scanId: scan._id });

    const openApiSpec = generateOpenApiSpec(scan, vulnerabilities);

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=athx-openapi-${req.params.scanId}.json`
    );

    res.send(JSON.stringify(openApiSpec, null, 2));
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
  exportOpenApiReport,
};
