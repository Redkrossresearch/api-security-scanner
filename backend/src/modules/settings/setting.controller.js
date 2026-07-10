const Setting = require("./setting.model");

const getSettings = async (req, res) => {
  try {
    const userId = req.user?._id; // Extracted by auth middleware
    let settings = await Setting.findOne({ userId });

    if (!settings) {
      // Create default settings if none exists
      settings = await Setting.create({
        userId,
        targetHeaders: [],
        authType: "none",
        authToken: "",
        cronSchedule: "disabled",
        slackWebhook: "",
        jiraWebhook: "",
        discordWebhook: "",
        customSystemPrompt: "",
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(550).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user?._id;
    const updateData = req.body;

    let settings = await Setting.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(550).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
