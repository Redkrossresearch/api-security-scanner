/**
 * feature-flags.js (Sprint 59 — Staged Feature Rollout & System Launch Flags)
 * Controls gradual rollout of autonomous agents, RAG reranking, and React Flow diagrams.
 */
const FeatureFlags = {
  // Sprint 51
  ENABLE_RAG_RERANKING: process.env.ENABLE_RAG_RERANKING !== "false",

  // Sprint 52 & 57
  ENABLE_REACT_FLOW_DIAGRAMS: process.env.ENABLE_REACT_FLOW_DIAGRAMS !== "false",

  // Sprint 53, 55, 56
  ENABLE_AUTONOMOUS_AGENTS: process.env.ENABLE_AUTONOMOUS_AGENTS !== "false",

  // Sprint 58
  ENABLE_WEB_RESEARCH_AGENT: process.env.ENABLE_WEB_RESEARCH_AGENT !== "false",

  // Sprint 60
  ENABLE_SELF_REFLECTION_LOOP: process.env.ENABLE_SELF_REFLECTION_LOOP !== "false",

  // Staged rollout threshold percentage
  ROLLOUT_PERCENTAGE: Number(process.env.ROLLOUT_PERCENTAGE) || 100,

  isFeatureEnabled(flagName) {
    if (this[flagName] === undefined) return false;
    return Boolean(this[flagName]);
  },
};

module.exports = FeatureFlags;
