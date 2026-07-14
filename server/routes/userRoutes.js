const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    aggiornaProfilo,
    profiloPubblico,
} = require("../controllers/userController");

const router = express.Router();

router.patch("/me", requireAuth, aggiornaProfilo);
router.get("/:id", profiloPubblico);

module.exports = router;