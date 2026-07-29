const fs = require("fs");
const path = require("path");

let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  nodemailer = null;
}

const LOG_FILE_PATH = path.join(__dirname, "../../../sent_emails.log");

const logEmailLocal = (recipient, subject, text, attachments = []) => {
  const logDir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const attachmentInfo = attachments.map(a => `${a.filename} (${a.content ? a.content.length : 0} bytes)`).join(", ");
  
  const emailLog = 
    `========================================================================\n` +
    `TIMESTAMP: ${timestamp}\n` +
    `TO: ${recipient}\n` +
    `SUBJECT: ${subject}\n` +
    `ATTACHMENTS: ${attachmentInfo || "None"}\n` +
    `------------------------------------------------------------------------\n` +
    `${text}\n` +
    `========================================================================\n\n`;

  fs.appendFileSync(LOG_FILE_PATH, emailLog, "utf8");
  console.log(`[Mailer Mock] Email logged locally to: ${LOG_FILE_PATH}`);
};

const getTransporter = () => {
  if (!nodemailer) return null;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  const from = process.env.SMTP_FROM || '"ATHX Security" <security@athx.io>';
  const transporter = getTransporter();

  if (!transporter) {
    // Fallback to local logging
    logEmailLocal(to, subject, text, attachments);
    return { success: true, loggedLocally: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log(`[Mailer] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Mailer] Failed to send email via SMTP, logging locally instead:`, error.message);
    logEmailLocal(to, subject, text, attachments);
    return { success: true, loggedLocally: true, error: error.message };
  }
};

const sendScanReportEmail = async (recipient, scan, pdfBuffer) => {
  const subject = `🛡️ Security Audit Report: ${scan.targetUrl} - Score: ${scan.securityScore}/100`;
  const text = 
    `Hello,\n\n` +
    `Your ATHX API Security Scan for ${scan.targetUrl} has completed.\n\n` +
    `Scan Details:\n` +
    `- Scan ID: ${scan.scanId}\n` +
    `- Security Score: ${scan.securityScore}/100 (Grade: ${scan.grade})\n` +
    `- Risk Level: ${scan.riskLevel}\n` +
    `- Total Vulnerabilities: ${scan.totalFindings} (Critical: ${scan.criticalCount}, High: ${scan.highCount}, Medium: ${scan.mediumCount}, Low: ${scan.lowCount})\n\n` +
    `Please find the detailed PDF security report attached.\n\n` +
    `Best regards,\n` +
    `ATHX Security Team`;

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({
      filename: `ATHX_Security_Report_${scan.scanId}.pdf`,
      content: pdfBuffer,
    });
  }

  return sendEmail({ to: recipient, subject, text, attachments });
};

const sendTeamInvitationEmail = async (recipient, teamName, inviteUrl) => {
  const subject = `👥 Team Invitation: Join ${teamName} on ATHX Security`;
  const text = 
    `Hello,\n\n` +
    `You have been invited to join the team "${teamName}" on ATHX API Security Scanner.\n\n` +
    `To accept this invitation and set up your account, please click the link below:\n` +
    `${inviteUrl}\n\n` +
    `If you already have an account, simply register or log in using this email address, and you will be automatically added to the team.\n\n` +
    `Best regards,\n` +
    `ATHX Security Team`;

  const html = 
    `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">` +
    `<h2>Join "${teamName}" on ATHX Security</h2>` +
    `<p>You have been invited to join the team <strong>${teamName}</strong> on the ATHX API Security Scanner platform.</p>` +
    `<div style="margin: 24px 0;">` +
    `<a href="${inviteUrl}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>` +
    `</div>` +
    `<p style="font-size: 12px; color: #64748B;">Or copy and paste this link in your browser: <br>${inviteUrl}</p>` +
    `</div>`;

  return sendEmail({ to: recipient, subject, text, html });
};

module.exports = {
  sendEmail,
  sendScanReportEmail,
  sendTeamInvitationEmail,
};
