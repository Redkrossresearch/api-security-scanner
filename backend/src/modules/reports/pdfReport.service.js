const puppeteer = require("puppeteer");

const reportTemplate = require("./reportTemplate");

const generatePdfReport = async (vulnerability, analysis, res) => {
  let browser; // ✅ Browser leak fix: Declare outside try block

  try {
    // ✅ Validate res parameter
    if (!res) {
      throw new Error("Response object (res) is required");
    }

    // ✅ Sandbox args & executablePath added for Render/production
    browser = await puppeteer.launch({
      headless: true,
      executablePath: puppeteer.executablePath(), // 🔴 Improvement 1: Explicit Chromium path
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
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

    // ✅ Browser close removed from here - finally block handles it

    // 🔴 Improvement 2: Explicitly set Content-Type for PDF
    res.setHeader("Content-Type", "application/pdf");
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
  } finally {
    // ✅ Ensure browser closes even if error occurs
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  generatePdfReport,
};