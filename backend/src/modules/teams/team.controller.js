const Team = require("./team.model");
const AuditLog = require("./audit.model");
const User = require("../auth/auth.model");
const { sendTeamInvitationEmail } = require("../../utils/mailer");

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

    const emailLower = email.toLowerCase().trim();

    // Check if already in the members list
    const isAlreadyAdded = team.members.some(
      (m) => m.email.toLowerCase().trim() === emailLower
    );
    if (isAlreadyAdded) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User is already a member (or invited to) this team",
        });
    }

    // Resolve user by email
    const userToAdd = await User.findOne({
      email: emailLower,
      isDeleted: { $ne: true },
    });

    let newMemberObj = {
      email: emailLower,
      role: targetRole,
    };

    if (userToAdd) {
      newMemberObj.userId = userToAdd._id;
      newMemberObj.status = "active";
    } else {
      newMemberObj.status = "pending";
    }

    team.members.push(newMemberObj);
    await team.save();

    // Send invitation email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteUrl = `${frontendUrl}/register?inviteEmail=${encodeURIComponent(emailLower)}`;
    
    // Fire and forget email send to avoid blocking the API response
    sendTeamInvitationEmail(emailLower, team.name, inviteUrl).catch((err) => {
      console.error("[Mailer] Team invitation email failed:", err.message);
    });

    await writeLog(
      team._id,
      req.user._id,
      "member_added",
      { invitedUser: emailLower, role: targetRole, status: newMemberObj.status },
      req.ip || "",
    );

    return res.json({
      success: true,
      message: userToAdd ? "Member added successfully" : "Invitation email sent successfully",
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
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  addMember,
  removeMember,
  getAuditLogs,
};
