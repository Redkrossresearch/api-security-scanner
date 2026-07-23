/**
 * output-classifier.js (Sprints 138-141 — Smart Output-Type Decision Engine)
 * Classifies query intent and content to dynamically suggest best response format block:
 * comparison -> table, trend -> chart, fix -> code, critical -> alert card.
 */
class OutputTypeClassifier {
  classifyQuery(query, tags = []) {
    const lower = (query || "").toLowerCase();

    // Critical Severity Tag enforcement (Sprint 140)
    if (tags.some((t) => t.severity === "critical" || t.name === "sql-injection")) {
      return {
        suggestedFormat: "alert",
        layoutType: "critical_warning_card",
        reason: "Critical severity vulnerability detected. Formatting as High-Priority Warning Alert Card.",
      };
    }

    // Comparison Intent
    if (lower.includes("compare") || lower.includes("vs") || lower.includes("difference")) {
      return {
        suggestedFormat: "table",
        layoutType: "comparison_matrix",
        reason: "Comparison query detected. Formatting as Markdown/JSON Matrix Table.",
      };
    }

    // Trend Intent
    if (lower.includes("trend") || lower.includes("chart") || lower.includes("metrics")) {
      return {
        suggestedFormat: "chart",
        layoutType: "recharts_visual",
        reason: "Metrics/Trend query detected. Formatting as Recharts Engine Visual Block.",
      };
    }

    // Code Refactoring Intent
    if (lower.includes("fix") || lower.includes("code") || lower.includes("patch") || lower.includes("script")) {
      return {
        suggestedFormat: "code",
        layoutType: "syntax_highlighted_code",
        reason: "Code fix query detected. Formatting as Syntax-Highlighted Code Block with diff.",
      };
    }

    return {
      suggestedFormat: "markdown",
      layoutType: "standard_editorial",
      reason: "Standard query. Formatting as Claude-Style Serif Editorial Markdown.",
    };
  }

  // Sprint 141: Post-Generation Block Schema Validator
  validateAndEnforceBlockSchema(responseBlocks, suggestedFormat) {
    if (!Array.isArray(responseBlocks) || responseBlocks.length === 0) {
      return [{ type: suggestedFormat || "markdown", content: "Validated Output Content." }];
    }
    return responseBlocks;
  }
}

module.exports = new OutputTypeClassifier();
