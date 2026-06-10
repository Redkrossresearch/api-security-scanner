const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../modules/auth/auth.model");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER =", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN =", token);

    const decoded = jwt.verify(
      token,
      env.jwtAccessSecret
    );

    console.log("DECODED:", decoded);

    const user = await User.findById(decoded.id)
      .select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.log("JWT ERROR FULL:", error);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = authenticate;