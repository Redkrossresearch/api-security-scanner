const axios = require("axios");
const Setting = require("./setting.model");

const dispatchScanNotification = async (scan) => {
  try {
    const query = scan.teamId
      ? { teamId: scan.teamId }
      : { userId: scan.userId };
    const settings = await Setting.findOne(query);

    if (!settings) return;

    const { slackWebhook, discordWebhook, jiraWebhook } = settings;

    const summaryText =
      `🚨 *ATHX Security Audit finished*\n` +
      `*Target URL:* ${scan.targetUrl}\n` +
      `*Scan ID:* \`${scan.scanId}\`\n` +
      `*Status:* ${scan.status === "completed" ? "✅ COMPLETED" : "❌ FAILED"}\n` +
      `*Security Score:* ${scan.securityScore}/100 (Grade: *${scan.grade}*)\n` +
      `*Risk Level:* ${scan.riskLevel}\n` +
      `*Findings Summary:* \n` +
      `• Critical: ${scan.criticalCount}\n` +
      `• High: ${scan.highCount}\n` +
      `• Medium: ${scan.mediumCount}\n` +
      `• Low: ${scan.lowCount}\n` +
      `• Total Findings: ${scan.totalFindings}`;

    // 1. Dispatch to Slack Webhook
    if (slackWebhook && slackWebhook.trim()) {
      console.log(`📤 Dispatching Slack alert for scan: ${scan.scanId}`);
      try {
        await axios.post(slackWebhook, {
          text: summaryText,
        });
        console.log("✅ Slack notification dispatched successfully.");
      } catch (slackErr) {
        console.error(
          "❌ Failed to dispatch Slack notification:",
          slackErr.message,
        );
      }
    }

    // 2. Dispatch to Discord Webhook
    if (discordWebhook && discordWebhook.trim()) {
      console.log(`📤 Dispatching Discord alert for scan: ${scan.scanId}`);
      try {
        await axios.post(discordWebhook, {
          embeds: [
            {
              title: "🛡️ ATHX API Security Scan Report",
              color: scan.status === "completed" ? 3066993 : 15158332, // green or red
              description: summaryText.replace(/\*/g, "**"), // convert slack markdown to discord
              timestamp: new Date().toISOString(),
            },
          ],
        });
        console.log("✅ Discord notification dispatched successfully.");
      } catch (discordErr) {
        console.error(
          "❌ Failed to dispatch Discord notification:",
          discordErr.message,
        );
      }
    }

    // 3. Dispatch to Jira Ticket endpoint (mock create)
    if (jiraWebhook && jiraWebhook.trim()) {
      console.log(`📤 Creating Jira tickeets mapping for scan: ${scan.scanId}`);
      try {
        await axios.post(jiraWebhook, {
          fields: {
            project: { key: "SEC" },
            summary: `[ATHX Scan] Vulnerabilities detected on ${scan.targetUrl}`,
            description: summaryText,
            issuetype: { name: "Bug" },
          },
        });
        console.log("✅ Jira ticket dispatched successfully.");
      } catch (jiraErr) {
        console.error(
          "❌ Failed to dispatch Jira ticket mapping:",
          jiraErr.message,
        );
      }
    }
  } catch (err) {
    console.error("❌ Notification dispatch engine error:", err.message);
  }
};

module.exports = { dispatchScanNotification };
