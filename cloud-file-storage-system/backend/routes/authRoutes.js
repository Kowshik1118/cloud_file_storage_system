const express = require("express");
const {
  register,
  login,
  profile,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, profile);

module.exports = router;
