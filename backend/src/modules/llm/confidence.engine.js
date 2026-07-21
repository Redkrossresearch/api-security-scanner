/**
 * Confidence Engine (Sprint 16)
 * Calculates response confidence score (0-100) based on consensus agreement,
 * evidence count, and source provider diversity.
 */
class ConfidenceEngine {
  calculateConfidence({ consensusAgreement = 1.0, evidenceCount = 1, sourceDiversity = 1, providerCount = 1 }) {
    // Weights: Agreement (50%), Evidence (30%), Diversity (20%)
    const agreementScore = Math.min(Math.max(consensusAgreement, 0), 1) * 50;
    const evidenceScore = Math.min(evidenceCount / 5, 1) * 30;
    const diversityScore = Math.min(sourceDiversity / 3, 1) * 20;

    const totalScore = Math.round(agreementScore + evidenceScore + diversityScore);

    let level = "High";
    let warningLabel = null;

    if (totalScore < 50) {
      level = "Low";
      warningLabel = "⚠️ Low Confidence Verdict: Disagreement or limited evidence detected across models.";
    } else if (totalScore < 75) {
      level = "Medium";
      warningLabel = "ℹ️ Moderate Confidence: Partial consensus reached across available providers.";
    }

    return {
      score: totalScore,
      level,
      warningLabel,
      factors: {
        consensusAgreement: Math.round(consensusAgreement * 100),
        evidenceCount,
        sourceDiversity,
        providerCount,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new ConfidenceEngine();
