const Team = require("./team.model");
const AuditLog = require("./audit.model");
const User = require("../auth/auth.model");

// Create dynamic helper to log actions
const writeLog = async (teamId, userId, action, details = {}, ip = "") => {
  try {
    await AuditLog.create({
      teamId,
      userId,
      action,
      details,
      ipAddress: ip,
    });
  } catch (err) {
    console.error("[Audit Log] Failed to write log:", err);
  }
};

// POST /api/teams
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Team name is required" });
    }

    const team = await Team.create({
      name,
      ownerId: req.user._id,
      members: [
        {
          userId: req.user._id,
          role: "owner",
        },
      ],
    });

    await writeLog(
      team._id,
      req.user._id,
      "team_created",
      { teamName: name },
      req.ip || "",
    );

    return res.status(201).json({ success: true, team });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/teams
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      "members.userId": req.user._id,
    })
      .populate("ownerId", "name email")
      .populate("members.userId", "name email")
      .lean();

    return res.json({ success: true, teams });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/teams/:id/members
const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const team = req.team; // Attached by authorizeTeam middleware

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const targetRole = role || "member";
    if (!["admin", "member"].includes(targetRole)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid role. Must be admin or member.",
        });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Resolve user by email, or auto-provision pending invited user
    let userToAdd = await User.findOne({
      email: normalizedEmail,
      isDeleted: { $ne: true },
    });

    if (!userToAdd) {
      userToAdd = await User.create({
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: `InvitePass_${Date.now()}`,
        role: "user",
      });
    }


    // Check if user is already a member
    const isMember = team.members.some(
      (m) => m.userId.toString() === userToAdd._id.toString(),
    );
    if (isMember) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User is already a member of this team",
        });
    }

    // Push member
    team.members.push({
      userId: userToAdd._id,
      role: targetRole,
    });
    await team.save();

    await writeLog(
      team._id,
      req.user._id,
      "member_added",
      { invitedUser: userToAdd.email, role: targetRole },
      req.ip || "",
    );

    return res.json({
      success: true,
      message: "Member added successfully",
      team,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/teams/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const team = req.team; // Attached by authorizeTeam middleware

    // Validate membership
    const memberIndex = team.members.findIndex(
      (m) => m.userId.toString() === userId,
    );

    if (memberIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found in team" });
    }

    const memberToRemove = team.members[memberIndex];

    // Cannot remove owner
    if (memberToRemove.role === "owner" || team.ownerId.toString() === userId) {
      return res
        .status(400)
        .json({ success: false, message: "Workspace owner cannot be removed" });
    }

    // Remove member
    team.members.splice(memberIndex, 1);
    await team.save();

    const removedUser = await User.findById(userId).select("email");

    await writeLog(
      team._id,
      req.user._id,
      "member_removed",
      { removedUser: removedUser?.email || userId },
      req.ip || "",
    );

    return res.json({
      success: true,
      message: "Member removed successfully",
      team,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/teams/:id/audit
const getAuditLogs = async (req, res) => {
  try {
    const team = req.team;

    const logs = await AuditLog.find({ teamId: team._id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ success: true, logs });
  } catch (err) {
// DELETE /api/teams/:id
const deleteTeam = async (req, res) => {
  try {
    const team = req.team;
    const isOwner = team.owner.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Only workspace owner can delete workspace" });
    }

    await Team.findByIdAndDelete(team._id);
    await AuditLog.deleteMany({ teamId: team._id });

    return res.json({ success: true, message: "Workspace deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  addMember,
  removeMember,
  getAuditLogs,
  deleteTeam,
};

