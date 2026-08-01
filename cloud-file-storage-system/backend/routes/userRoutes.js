const express = require("express");
const protect = require("../middleware/auth");
const {
  getMembership,
  updateMembership,
  updateSettings,
  updateProfile,
  changePassword
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/membership", getMembership);
router.post("/membership", updateMembership);
router.put("/settings", updateSettings);
router.put("/profile", updateProfile);
router.put("/password", changePassword);

module.exports = router;
