const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    creaAnnuncio,
    listaAnnunci,
    dettaglioAnnuncio,
    modificaAnnuncio,
    chiudiAnnuncio,
    concludiAnnuncio,
} = require("../controllers/annuncioController");
const router = express.Router();


router.get("/", listaAnnunci);
router.get("/:id", dettaglioAnnuncio);
router.post("/", requireAuth, creaAnnuncio);
router.patch("/:id/chiudi", requireAuth, chiudiAnnuncio);
router.patch("/:id/concludi", requireAuth, concludiAnnuncio);
router.patch("/:id", requireAuth, modificaAnnuncio);


module.exports = router;