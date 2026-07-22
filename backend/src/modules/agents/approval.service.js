/**
 * approval.service.js (Sprint 45 — Human-in-the-Loop Approval Checkpoints)
 * Intercepts risky autonomous security agent actions and requires explicit user confirmation.
 */
class ApprovalService {
  constructor() {
    this.pendingApprovals = new Map();
  }

  requestApproval(actionType, target, details = {}) {
    const id = `appr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      id,
      actionType,
      target,
      details,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    this.pendingApprovals.set(id, record);
    return record;
  }

  approve(id) {
    if (!this.pendingApprovals.has(id)) return null;
    const record = this.pendingApprovals.get(id);
    record.status = "APPROVED";
    record.approvedAt = new Date().toISOString();
    return record;
  }

  reject(id) {
    if (!this.pendingApprovals.has(id)) return null;
    const record = this.pendingApprovals.get(id);
    record.status = "REJECTED";
    record.rejectedAt = new Date().toISOString();
    return record;
  }

  getPending() {
    return Array.from(this.pendingApprovals.values()).filter((r) => r.status === "PENDING");
  }
}

module.exports = new ApprovalService();
