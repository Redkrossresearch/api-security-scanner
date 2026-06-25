const Report = require("./report.model");

const { generateReport } = require("./report.generator");

const { generateNarrativeReport } = require("./report-narrative-generator");

const createReport = async (scan, findings) => {
  await Report.deleteMany({
    scanId: scan._id,
  });

  const reportData = generateReport(scan, findings);

  const report = await Report.create(reportData);

  return report;
};

const generateJsonReport = (report) => {
  const narrativeReport = generateNarrativeReport(report);

  return JSON.stringify(narrativeReport, null, 2);
};

module.exports = {
  createReport,
  generateJsonReport,
};
