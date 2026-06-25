const puppeteer = require("puppeteer");

const reportTemplate = require("./reportTemplate");

const generatePdfReport = async (vulnerability, analysis, res) => {
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
};

module.exports = {
  generatePdfReport,
};
