const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    creaAnnuncio,
    listaAnnunci,
} = require("../controllers/annuncioController");
const router = express.Router();

router.post("/", requireAuth, creaAnnuncio);
router.get("/", listaAnnunci);

module.exports = router;