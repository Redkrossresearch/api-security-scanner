const express = require("express");

const router = express.Router();

const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/authorize.middleware");
const validate = require("../../middleware/validate.middleware");

const {
  register,
  login,
  googleLogin,
  refresh,
  logout,
  logoutAll,
} = require("./auth.controller");

const { registerValidation } = require("./auth.validation");

const { loginValidation } = require("./auth.login.validation");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post("/register", registerValidation, validate, register);

router.post("/login", loginValidation, validate, login);

router.post("/refresh", refresh);

router.post("/google-login", googleLogin);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get("/profile", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.post("/logout", authenticate, logout);

router.post("/logout-all", authenticate, logoutAll);

/*
|--------------------------------------------------------------------------
| Admin Only Route
|--------------------------------------------------------------------------
*/

router.get("/admin-test", authenticate, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
