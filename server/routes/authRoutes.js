const express = require("express");
const {
    registrati,
    accedi,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registrati);
router.post("/login", accedi);

module.exports = router;