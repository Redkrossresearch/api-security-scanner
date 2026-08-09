const { analyzeWithAI } = require("./openrouter.service");

const { generatePdfReport } = require("../reports/pdfReport.service");

const analyze = async (req, res) => {
  try {
    const vulnerability = req.body;

    const result = await analyzeWithAI(vulnerability);

    const parsed = typeof result === "string" ? JSON.parse(result) : result;

    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("AI Analysis error:", error);

    res.status(500).json({
      success: false,
      message: "AI analysis failed",
    });
  }
};


const exportPdf = async (req, res) => {
  try {
    const { vulnerability, analysis } = req.body;
    await generatePdfReport(vulnerability, analysis, res);
  } catch (error) {
    console.error("PDF export error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "PDF export failed",
      });
    }
  }
};


module.exports = {
  analyze,
  exportPdf,
};
