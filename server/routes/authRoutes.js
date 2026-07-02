const express = require("express");
const {
    registrati,
    accedi,
    utenteCorrente,
} = require("../controllers/authController");
const requireAuth = require("../middlewares/requireAuth");
const router = express.Router();

router.post("/register", registrati);
router.post("/login", accedi);
router.get("/me", requireAuth, utenteCorrente);

module.exports = router;