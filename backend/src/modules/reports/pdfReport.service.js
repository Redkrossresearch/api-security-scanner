const puppeteer = require("puppeteer");

const reportTemplate = require("./reportTemplate");

const generatePdfReport = async (vulnerability, analysis, res) => {
  try {
    // ✅ Validate res parameter
    if (!res) {
      throw new Error("Response object (res) is required");
    }

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    const html = reportTemplate(vulnerability, analysis);

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    
    // ✅ Send error response if res is available
    if (res && !res.headersSent) {
      res.status(500).json({ 
        error: "Failed to generate PDF",
        message: error.message 
      });
    }
  }
};

module.exports = {
  generatePdfReport,
};