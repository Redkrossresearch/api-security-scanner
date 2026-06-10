const Report = require("./report.model");

const {
  generateReport,
} = require("./report.generator");

const createReport = async (
  scan,
  findings
) => {

  await Report.deleteMany({
    scanId: scan._id,
  });

  const reportData =
    generateReport(
      scan,
      findings
    );

  const report =
    await Report.create(
      reportData
    );

  return report;
};

module.exports = {
  createReport,
};