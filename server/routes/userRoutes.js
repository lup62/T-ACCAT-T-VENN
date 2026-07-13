const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const { aggiornaProfilo } = require("../controllers/userController");

const router = express.Router();

router.patch("/me", requireAuth, aggiornaProfilo);

module.exports = router;