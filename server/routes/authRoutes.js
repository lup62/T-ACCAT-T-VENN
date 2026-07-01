const express = require("express");
const { registrati } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register
router.post("/register", registrati);

module.exports = router;