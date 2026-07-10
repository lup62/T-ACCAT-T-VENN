const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    creaAnnuncio,
    listaAnnunci,
    dettaglioAnnuncio,
} = require("../controllers/annuncioController");
const router = express.Router();

router.post("/", requireAuth, creaAnnuncio);
router.get("/", listaAnnunci);
router.get("/:id", dettaglioAnnuncio);

module.exports = router;