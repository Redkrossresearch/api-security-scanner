const puppeteer = require("puppeteer");
const reportTemplate = require("./reportTemplate");

const generatePdfReport = async (vulnerability, analysis, res) => {
  let browser;

  try {
    if (!res) throw new Error("Response object required");
    if (!vulnerability || !analysis) throw new Error("Missing data");

    // ✅ Production Launch - No executablePath, puppeteer khud manage karega
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    const html = reportTemplate(vulnerability, analysis);
    
    await page.setContent(html, { waitUntil: "networkidle0" });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${vulnerability.title}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF Error:", error);
    if (res && !res.headersSent) {
      res.status(500).json({ error: "PDF generation failed", message: error.message });
    }
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { generatePdfReport };