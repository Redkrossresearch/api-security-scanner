const mongoose = require("mongoose");
const Team = require("../modules/teams/team.model");

const authorizeTeam = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const teamId = req.headers["x-team-id"] || req.params.id;

      if (!teamId) {
        return res.status(400).json({
          success: false,
          message: "Team ID is required for this operation",
        });
      }


      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid team ID format",
        });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found",
        });
      }

      // Check if logged-in user is a member of the team
      const member = team.members.find(
        (m) => m.userId.toString() === req.user._id.toString(),
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this team workspace",
        });
      }

      // If specific roles are required, verify the user's role
      if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions in this team workspace",
        });
      }

      // Attach team and user's role in team to request
      req.team = team;
      req.teamRole = member.role;

      next();
    } catch (error) {
      console.error("[Team Middleware] Error authorizing team access:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during team verification",
      });
    }
  };
};

module.exports = { authorizeTeam };
