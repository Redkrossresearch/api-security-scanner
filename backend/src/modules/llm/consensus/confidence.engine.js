const mongoose = require("mongoose");

// Schema to track accuracy metrics (Sprint 53)
const ConfidenceLogSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      index: true,
    },
    goal: String,
    confidenceScore: Number,
    consensusStrength: Number,
    evidenceQuality: Number,
    sourceRecency: Number,
    actualCorrectness: {
      type: String,
      enum: ["correct", "incorrect", "neutral"],
      default: "neutral",
    },
    userFeedback: String,
  },
  { timestamps: true }
);

const ConfidenceLog = mongoose.model("ConfidenceLog", ConfidenceLogSchema);

class ConfidenceEngine {
  /**
   * Calculate v2 Confidence Score (0 to 100)
   */
  calculateConfidence(consensusStrength, evidenceQuality, sourceRecency) {
    // Weights: consensus (40%), evidence (35%), source recency (25%)
    const score = (consensusStrength * 0.40) + (evidenceQuality * 0.35) + (sourceRecency * 0.25);
    return Math.round(Math.min(Math.max(score, 0), 100));
  }

  /**
   * Log confidence calculations and wait for feedback corrections
   */
  async logConfidence(messageId, goal, metrics) {
    const score = this.calculateConfidence(
      metrics.consensusStrength || 0,
      metrics.evidenceQuality || 0,
      metrics.sourceRecency || 0
    );

    return ConfidenceLog.create({
      messageId,
      goal,
      confidenceScore: score,
      consensusStrength: metrics.consensusStrength || 0,
      evidenceQuality: metrics.evidenceQuality || 0,
      sourceRecency: metrics.sourceRecency || 0,
    });
  }

  /**
   * Record user accuracy feedback (Sprint 53 correlation tracking)
   */
  async recordFeedback(messageId, correctness, feedbackText = "") {
    console.log(`[confidence-engine] Recording feedback for message ${messageId}: ${correctness}`);
    return ConfidenceLog.findOneAndUpdate(
      { messageId },
      { actualCorrectness: correctness, userFeedback: feedbackText },
      { new: true }
    );
  }

  /**
   * Calculate correlation stats
   */
  async getCorrelationStats() {
    const logs = await ConfidenceLog.find({ actualCorrectness: { $ne: "neutral" } });
    if (logs.length === 0) {
      return { correlationCoefficient: 0, message: "No feedback logs available yet." };
    }

    // Simple correlation mapping: confidenceScore vs actual correctness (+1 for correct, -1 for incorrect)
    let scoreProductSum = 0;
    let scoreSum = 0;
    let correctnessSum = 0;
    let scoreSqSum = 0;
    let correctnessSqSum = 0;
    const n = logs.length;

    for (const log of logs) {
      const y = log.actualCorrectness === "correct" ? 1 : -1;
      const x = log.confidenceScore;

      scoreSum += x;
      correctnessSum += y;
      scoreProductSum += x * y;
      scoreSqSum += x * x;
      correctnessSqSum += y * y;
    }

    const numerator = n * scoreProductSum - scoreSum * correctnessSum;
    const denominator = Math.sqrt(
      (n * scoreSqSum - scoreSum * scoreSum) * (n * correctnessSqSum - correctnessSum * correctnessSum)
    );

    const r = denominator === 0 ? 0 : numerator / denominator;

    return {
      totalFeedbackLogs: n,
      correlationCoefficient: parseFloat(r.toFixed(4)),
      averageConfidence: parseFloat((scoreSum / n).toFixed(2)),
    };
  }
}

module.exports = {
  confidenceEngine: new ConfidenceEngine(),
  ConfidenceLog,
};
