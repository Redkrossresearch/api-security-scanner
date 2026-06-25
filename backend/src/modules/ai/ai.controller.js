const { analyzeWithAI } = require("./openrouter.service");

const { generatePdfReport } = require("../reports/pdfReport.service");

const analyze = async (req, res) => {
  try {
    const vulnerability = req.body;

    const result = await analyzeWithAI(vulnerability);

    const parsed = JSON.parse(result);

    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "AI analysis failed",
    });
  }
};

const exportPdf = async (req, res) => {
  try {
    const { vulnerability, analysis } = req.body;

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${vulnerability.title}.pdf`,
    );

    await generatePdfReport(vulnerability, analysis, res);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "PDF export failed",
    });
  }
};

module.exports = {
  analyze,
  exportPdf,
};
