const express = require("express");
const protect = require("../middleware/auth");
const { submitSupportTicket } = require("../controllers/supportController");

const router = express.Router();

router.use(protect);
router.post("/ticket", submitSupportTicket);

module.exports = router;
