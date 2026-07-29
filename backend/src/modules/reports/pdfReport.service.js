const puppeteer = require("puppeteer");
const reportTemplate = require("./reportTemplate");
const fullReportTemplate = require("./fullReportTemplate");
const PDFDocument = require("pdfkit");

const generatePdfReportFallback = async (report, vulnerabilities, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="athx-report-${report.scanId || "scan"}.pdf"`,
      );
      doc.pipe(res);

      // Header block
      doc.rect(0, 0, 612, 100).fill("#071126");
      doc
        .fillColor("#FFFFFF")
        .fontSize(20)
        .text("ATHX SECURITY COMPLIANCE REPORT", 50, 40);

      // Executive summary
      doc.fillColor("#000000").fontSize(14).text("Executive Summary", 50, 120);
      doc
        .fontSize(10)
        .fillColor("#475569")
        .text(report.executiveSummary || "No summary provided.", 50, 140, {
          width: 500,
        });

      // Posture Metrics
      doc
        .fontSize(14)
        .fillColor("#000000")
        .text("Security Posture HUD", 50, 240);
      doc
        .fontSize(11)
        .fillColor("#334155")
        .text(`Overall Score: ${report.securityScore || 0}/100`, 50, 260);
      doc.text(`Security Grade: ${report.grade || "A"}`, 50, 275);
      doc.text(`Risk Classification: ${report.riskLevel || "Low"}`, 50, 290);

      // Vulnerabilities list
      doc
        .fontSize(14)
        .fillColor("#000000")
        .text("Discovered Vulnerabilities", 50, 330);
      let y = 360;

      if (vulnerabilities && vulnerabilities.length > 0) {
        vulnerabilities.forEach((vuln, i) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          doc
            .fontSize(11)
            .fillColor("#EF4444")
            .text(
              `${i + 1}. ${vuln.title} [${vuln.severity?.toUpperCase()}]`,
              50,
              y,
            );
          doc
            .fontSize(9)
            .fillColor("#64748B")
            .text(
              `CWE: ${vuln.cwe || "N/A"} | OWASP: ${vuln.owasp || "N/A"} | CVSS: ${vuln.cvss || "N/A"}`,
              50,
              y + 15,
            );
          doc
            .fontSize(9)
            .fillColor("#334155")
            .text(vuln.description || "", 50, y + 28, { width: 500 });
          y += 65;
        });
      } else {
        doc
          .fontSize(10)
          .fillColor("#10B981")
          .text("Secure! No vulnerabilities discovered.", 50, y);
      }

      doc.end();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const generateSinglePdfReportFallback = async (
  vulnerability,
  analysis,
  res,
) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${vulnerability.title || "finding"}.pdf"`,
      );
      doc.pipe(res);

      // Header block
      doc.rect(0, 0, 612, 100).fill("#071126");
      doc
        .fillColor("#FFFFFF")
        .fontSize(20)
        .text("VULNERABILITY ANALYSIS REPORT", 50, 40);

      // Finding title
      doc.fillColor("#000000").fontSize(14).text("Threat Details", 50, 120);
      doc
        .fontSize(12)
        .fillColor("#EF4444")
        .text(vulnerability.title || "Vulnerability", 50, 145);

      // Details block
      doc
        .fontSize(10)
        .fillColor("#334155")
        .text(`Severity: ${vulnerability.severity?.toUpperCase()}`, 50, 170);
      doc.text(
        `CWE: ${vulnerability.cwe || "N/A"} | OWASP: ${vulnerability.owasp || "N/A"}`,
        50,
        185,
      );
      doc.text(`Endpoint: ${vulnerability.endpoint || "N/A"}`, 50, 200);

      doc.fontSize(12).fillColor("#000000").text("Description", 50, 230);
      doc
        .fontSize(10)
        .fillColor("#475569")
        .text(
          vulnerability.description || "No description provided.",
          50,
          250,
          { width: 500 },
        );

      doc
        .fontSize(12)
        .fillColor("#000000")
        .text("Remediation Strategy", 50, 350);
      doc
        .fontSize(10)
        .fillColor("#475569")
        .text(
          analysis.remediationPlan ||
            "Implement strict authorization headers and input sanitizations.",
          50,
          370,
          { width: 500 },
        );

      doc.end();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const generatePdfReport = async (vulnerability, analysis, res) => {
  let browser;
  let finalRes = res;
  let isFullScanReport = false;

  // Overload check: generatePdfReport(report, res)
  if (!res && analysis && typeof analysis.send === "function") {
    finalRes = analysis;
    isFullScanReport = true;
  }

  if (!finalRes) return;

  try {
    let html;
    let filename;
    let reportObj = vulnerability;
    let vulnerabilitiesList = [];

    if (isFullScanReport) {
      const Vulnerability = require("../vulnerabilities/vulnerability.model");
      vulnerabilitiesList = await Vulnerability.find({
        scanId: reportObj.scanId,
      });
      html = fullReportTemplate(reportObj, vulnerabilitiesList);
      filename = `athx-report-${reportObj.scanId || "scan"}.pdf`;
    } else {
      if (!vulnerability || !analysis) throw new Error("Missing data");
      html = reportTemplate(vulnerability, analysis);
      const safeTitle = (vulnerability?.title || "finding").replace(/[^a-zA-Z0-9_-]/g, "_");
      filename = `${safeTitle}.pdf`;
    }

    // Launch Headless Chromium via Puppeteer
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
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 8px; color: #64748B; padding: 0 16mm; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; color: #4F46E5; letter-spacing: 0.8px;">ATHX SECURITY INTELLIGENCE</span>
          <span style="font-weight: 700; color: #DC2626; letter-spacing: 0.5px;">CONFIDENTIAL REPORT</span>
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 8px; color: #94A3B8; padding: 0 16mm; display: flex; justify-content: space-between; align-items: center;">
          <span>ATHX Autonomous Penetration Testing Platform</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: { top: "14mm", bottom: "14mm", left: "0", right: "0" },
    });


    if (!finalRes.headersSent) {
      finalRes.setHeader("Content-Type", "application/pdf");
      finalRes.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
    }
    finalRes.send(pdfBuffer);

  } catch (error) {
    console.error(
      "PDF Puppeteer Error, falling back to PDFKit:",
      error.message,
    );
    try {
      if (isFullScanReport) {
        const Vulnerability = require("../vulnerabilities/vulnerability.model");
        const vulnerabilities = await Vulnerability.find({
          scanId: vulnerability.scanId,
        });
        await generatePdfReportFallback(
          vulnerability,
          vulnerabilities,
          finalRes,
        );
      } else {
        await generateSinglePdfReportFallback(
          vulnerability,
          analysis,
          finalRes,
        );
      }
    } catch (fallbackErr) {
      console.error("PDFKit fallback failed:", fallbackErr.message);
      if (finalRes && !finalRes.headersSent) {
        finalRes
          .status(500)
          .json({
            error: "PDF generation failed",
            message: fallbackErr.message,
          });
      }
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        // ignore
      }
    }
  }
};

const generatePdfReportBuffer = async (report) => {
  let browser;
  try {
    const Vulnerability = require("../vulnerabilities/vulnerability.model");
    const vulnerabilitiesList = await Vulnerability.find({
      scanId: report.scanId,
    });
    const html = fullReportTemplate(report, vulnerabilitiesList);
    
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
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 8px; color: #64748B; padding: 0 16mm; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; color: #4F46E5; letter-spacing: 0.8px;">ATHX SECURITY INTELLIGENCE</span>
          <span style="font-weight: 700; color: #DC2626; letter-spacing: 0.5px;">CONFIDENTIAL REPORT</span>
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 8px; color: #94A3B8; padding: 0 16mm; display: flex; justify-content: space-between; align-items: center;">
          <span>ATHX Autonomous Penetration Testing Platform</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: { top: "14mm", bottom: "14mm", left: "0", right: "0" },
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error("PDF Puppeteer Error, falling back to PDFKit buffer:", error.message);
    return new Promise(async (resolve, reject) => {
      try {
        const Vulnerability = require("../vulnerabilities/vulnerability.model");
        const vulnerabilities = await Vulnerability.find({
          scanId: report.scanId,
        });
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          resolve(Buffer.concat(buffers));
        });
        
        doc.rect(0, 0, 612, 100).fill("#071126");
        doc.fillColor("#FFFFFF").fontSize(20).text("ATHX SECURITY COMPLIANCE REPORT", 50, 40);
        doc.fillColor("#000000").fontSize(14).text("Executive Summary", 50, 120);
        doc.fontSize(10).fillColor("#475569").text(report.executiveSummary || "No summary provided.", 50, 140, { width: 500 });
        doc.fontSize(14).fillColor("#000000").text("Security Posture HUD", 50, 240);
        doc.fontSize(11).fillColor("#334155").text(`Overall Score: ${report.securityScore || 0}/100`, 50, 260);
        doc.text(`Security Grade: ${report.grade || "A"}`, 50, 275);
        doc.text(`Risk Classification: ${report.riskLevel || "Low"}`, 50, 290);
        doc.fontSize(14).fillColor("#000000").text("Discovered Vulnerabilities", 50, 330);
        
        let y = 360;
        vulnerabilities.forEach((v) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          doc.fontSize(11).fillColor("#020617").text(`${v.title} (${(v.severity || "medium").toUpperCase()})`, 50, y);
          doc.fontSize(9).fillColor("#475569").text(`CVSS: ${v.cvss || 5.0} | Category: ${v.category || "General"} | Endpoint: ${v.endpoint || "N/A"}`, 50, y + 15);
          y += 45;
        });
        
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {}
    }
  }
};

module.exports = { generatePdfReport, generatePdfReportBuffer };
