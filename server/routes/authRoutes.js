const express = require("express");
const {
    registrati,
    accedi,
    rinnovaAccessToken,
    logout,
    utenteCorrente,
} = require("../controllers/authController");
const requireAuth = require("../middlewares/requireAuth");
const router = express.Router();

router.post("/register", registrati);
router.post("/login", accedi);
router.post("/refresh", rinnovaAccessToken);
router.post("/logout", logout);
router.get("/me", requireAuth, utenteCorrente);

module.exports = router;