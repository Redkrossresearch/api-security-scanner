/**
 * Response Merger Engine (Sprint 23)
 * Combines complementary sections from multiple provider responses when scores are close,
 * producing a single comprehensive response.
 */
class ResponseMerger {
  mergeResponses(primaryResponse, secondaryResponse) {
    if (!primaryResponse) return secondaryResponse;
    if (!secondaryResponse) return primaryResponse;

    const pText = primaryResponse.content || primaryResponse.output || "";
    const sText = secondaryResponse.content || secondaryResponse.output || "";

    // If secondary has code/remediation steps missing in primary, append it
    let mergedText = pText;

    if (sText.includes("```") && !pText.includes("```")) {
      const codeMatch = sText.match(/```[\s\S]*?```/g);
      if (codeMatch) {
        mergedText += `\n\n### 🔧 Additional Remediation Code:\n${codeMatch.join("\n\n")}`;
      }
    }

    return {
      content: mergedText,
      provider: `${primaryResponse.provider || "primary"}+${secondaryResponse.provider || "secondary"} (merged)`,
      isMerged: true,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new ResponseMerger();
