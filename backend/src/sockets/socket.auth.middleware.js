const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../modules/auth/auth.model");

const socketAuthMiddleware = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    // Support Bearer prefix or query fallback
    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader;
      }
    }

    if (!token && socket.handshake.query?.token) {
      token = socket.handshake.query.token;
    }

    if (!token) {
      return next(new Error("Authentication failed: Token is missing"));
    }

    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findOne({
      _id: decoded.id,
      isDeleted: { $ne: true },
    })
      .select("-passwordHash")
      .lean();

    if (!user) {
      return next(new Error("Authentication failed: User not found"));
    }

    // Attach user information to socket context
    socket.user = user;
    next();
  } catch (err) {
    next(new Error(`Authentication failed: ${err.message}`));
  }
};

module.exports = socketAuthMiddleware;
