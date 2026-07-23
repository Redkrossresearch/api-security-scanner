/**
 * handoff.protocol.js (Sprint 88 — Agent-to-Agent Handoff Protocol)
 * Standardized protocol: { fromAgent, toAgent, context, artifacts } for lossless multi-agent chaining.
 */
class HandoffProtocol {
  createHandoff({ fromAgent, toAgent, context = {}, artifacts = [] }) {
    const handoffPayload = {
      handoffId: `handoff_${Date.now()}`,
      fromAgent,
      toAgent,
      timestamp: new Date(),
      context,
      artifacts,
      status: "transferred",
    };

    console.log(`[HandoffProtocol] Transferred context from ${fromAgent} -> ${toAgent} | Artifacts: ${artifacts.length}`);
    return handoffPayload;
  }
}

module.exports = new HandoffProtocol();
