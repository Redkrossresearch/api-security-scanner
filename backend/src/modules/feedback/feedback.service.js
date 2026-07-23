/**
 * feedback.service.js (Sprint 73 — User Feedback Loop Service)
 * Captures thumbs-up/down feedback and reason text to dynamically calibrate routing rules and prompts.
 */
class FeedbackService {
  constructor() {
    this.feedbacks = [];
  }

  async recordFeedback({ userId, messageId, rating, reason = "", category = "accuracy" }) {
    const feedbackItem = {
      id: `fb_${Date.now()}`,
      userId,
      messageId,
      rating, // "thumbs_up" | "thumbs_down"
      reason,
      category,
      createdAt: new Date(),
    };

    this.feedbacks.push(feedbackItem);
    console.log(`[FeedbackService] Recorded user feedback: ${rating} | Reason: "${reason}"`);

    // Auto-calibration trigger on negative feedback pattern
    if (rating === "thumbs_down") {
      this.triggerPromptCalibration(reason);
    }

    return feedbackItem;
  }

  triggerPromptCalibration(reason) {
    console.warn(`[FeedbackService] Triggered dynamic prompt calibration based on user feedback: "${reason}"`);
  }

  getFeedbackMetrics() {
    const total = this.feedbacks.length;
    const thumbsUp = this.feedbacks.filter((f) => f.rating === "thumbs_up").length;
    const thumbsDown = this.feedbacks.filter((f) => f.rating === "thumbs_down").length;
    const satisfactionRate = total > 0 ? Math.round((thumbsUp / total) * 100) : 100;

    return {
      totalFeedbackCount: total,
      thumbsUpCount: thumbsUp,
      thumbsDownCount: thumbsDown,
      satisfactionRatePercent: `${satisfactionRate}%`,
    };
  }
}

module.exports = new FeedbackService();
