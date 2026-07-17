const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const optionalAuth = require("../middlewares/optionalAuth");
const {
    creaAnnuncio,
    listaAnnunci,
    listaMieiAnnunci,
    dettaglioAnnuncio,
    modificaAnnuncio,
    chiudiAnnuncio,
    concludiAnnuncio,
} = require("../controllers/annuncioController");
const router = express.Router();


router.get("/", listaAnnunci);
router.get("/miei", requireAuth, listaMieiAnnunci);
router.get("/:id", optionalAuth, dettaglioAnnuncio);
router.post("/", requireAuth, creaAnnuncio);
router.patch("/:id/chiudi", requireAuth, chiudiAnnuncio);
router.patch("/:id/concludi", requireAuth, concludiAnnuncio);
router.patch("/:id", requireAuth, modificaAnnuncio);


module.exports = router;