const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const { creaAnnuncio } = require("../controllers/annuncioController");

const router = express.Router();

router.post("/", requireAuth, creaAnnuncio);

module.exports = router;