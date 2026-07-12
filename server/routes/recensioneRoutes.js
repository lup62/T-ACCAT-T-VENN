const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const { creaRecensione } = require("../controllers/recensioneController");

const router = express.Router();

router.post("/", requireAuth, creaRecensione);

module.exports = router;