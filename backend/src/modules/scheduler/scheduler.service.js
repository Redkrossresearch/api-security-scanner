const Setting = require("../settings/setting.model");
const Scan = require("../scans/scan.model");
const { createScan } = require("../scans/scan.service");

// Millisecond constants for interval matching
const INTERVALS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

const checkAndRunScheduledScans = async () => {
  console.log("🔍 Checking for scheduled security scans...");
  try {
    const activeSettings = await Setting.find({
      cronSchedule: { $in: ["daily", "weekly", "monthly"] },
      userId: { $exists: true },
    });

    for (const setting of activeSettings) {
      const scheduleType = setting.cronSchedule;
      const threshold = INTERVALS[scheduleType];

      if (!threshold) continue;

      const now = Date.now();
      const lastRunTime = setting.lastCronRun
        ? new Date(setting.lastCronRun).getTime()
        : 0;

      // Check if it's time to run
      if (now - lastRunTime >= threshold) {
        // Parse URLs from scheduledUrls field
        let urlsToScan = [];
        if (setting.scheduledUrls && setting.scheduledUrls.trim()) {
          urlsToScan = setting.scheduledUrls
            .split(/[\n,]+/)
            .map((u) => u.trim())
            .filter((u) => u.length > 0);
        }

        // Fallback to last scan target if no explicit urls scheduled
        if (urlsToScan.length === 0) {
          let targetScan = await Scan.findOne({
            userId: setting.userId,
            status: "completed",
          }).sort({ createdAt: -1 });

          if (!targetScan) {
            targetScan = await Scan.findOne({
              userId: setting.userId,
            }).sort({ createdAt: -1 });
          }

          if (targetScan && targetScan.targetUrl) {
            urlsToScan.push(targetScan.targetUrl);
          }
        }

        if (urlsToScan.length > 0) {
          console.log(
            `🚀 Scheduler: Triggering automated '${scheduleType}' scans for ${setting.teamId ? "Team: " + setting.teamId : "User: " + setting.userId}`,
          );

          // Update setting lastCronRun timestamp
          setting.lastCronRun = new Date();
          await setting.save();

          for (const url of urlsToScan) {
            try {
              console.log(`🤖 Scheduled scan running for URL: ${url}`);
              await createScan(setting.userId, url, setting.teamId);
            } catch (scanErr) {
              console.error(
                `❌ Scheduler: Scan creation failed for target ${url}:`,
                scanErr.message,
              );
            }
          }
        } else {
          console.log(
            `ℹ️ Scheduler: No targets to scan for Setting ID ${setting._id}. Skipping.`,
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ Scheduler: Process failed:", error.message);
  }
};

const start = () => {
  // Run check immediately on server startup
  setTimeout(checkAndRunScheduledScans, 15000); // 15s delay to let DB connections settle

  // Set interval to check every 1 hour (3,600,000 milliseconds)
  setInterval(checkAndRunScheduledScans, 60 * 60 * 1000);
  console.log("⏰ Automated Background Scanner Service Initialized");
};

module.exports = {
  start,
  checkAndRunScheduledScans,
};
