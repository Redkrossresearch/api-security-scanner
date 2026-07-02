const puppeteer = require("puppeteer");
const reportTemplate = require("./reportTemplate");
const fullReportTemplate = require("./fullReportTemplate");

const generatePdfReport = async (vulnerability, analysis, res) => {
  let browser;

  try {
    let finalRes = res;
    let isFullScanReport = false;

    // Overload check: generatePdfReport(report, res)
    if (!res && analysis && typeof analysis.send === "function") {
      finalRes = analysis;
      isFullScanReport = true;
    }

    if (!finalRes) throw new Error("Response object required");

    let html;
    let filename;

    if (isFullScanReport) {
      const report = vulnerability;
      html = fullReportTemplate(report);
      filename = `athx-report-${report.scanId || "scan"}.pdf`;
    } else {
      if (!vulnerability || !analysis) throw new Error("Missing data");
      html = reportTemplate(vulnerability, analysis);
      filename = `${vulnerability.title || "finding"}.pdf`;
    }

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
    
    await page.setContent(html, { waitUntil: "networkidle0" });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    finalRes.setHeader("Content-Type", "application/pdf");
    finalRes.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    finalRes.send(pdfBuffer);

  } catch (error) {
    console.error("PDF Error:", error);
    if (finalRes && !finalRes.headersSent) {
      finalRes.status(500).json({ error: "PDF generation failed", message: error.message });
    }
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { generatePdfReport };