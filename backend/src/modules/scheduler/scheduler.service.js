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
      const lastRunTime = setting.lastCronRun ? new Date(setting.lastCronRun).getTime() : 0;
      
      // Check if it's time to run
      if (now - lastRunTime >= threshold) {
        // Find user's last completed scan target URL
        let targetScan = await Scan.findOne({
          userId: setting.userId,
          status: "completed",
        }).sort({ createdAt: -1 });

        // Fallback to any latest scan if no completed scan found
        if (!targetScan) {
          targetScan = await Scan.findOne({
            userId: setting.userId,
          }).sort({ createdAt: -1 });
        }

        if (targetScan && targetScan.targetUrl) {
          console.log(
            `🚀 Scheduler: Triggering automated '${scheduleType}' scan for User: ${setting.userId} Target: ${targetScan.targetUrl}`
          );
          
          // Update setting lastCronRun timestamp to prevent double triggers
          setting.lastCronRun = new Date();
          await setting.save();

          // Spawn the scan in the background
          try {
            await createScan(setting.userId, targetScan.targetUrl);
          } catch (scanErr) {
            console.error(`❌ Scheduler: Scan creation failed for target ${targetScan.targetUrl}:`, scanErr.message);
          }
        } else {
          console.log(`ℹ️ Scheduler: No previous scan target found for User: ${setting.userId}. Skipping.`);
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
};
