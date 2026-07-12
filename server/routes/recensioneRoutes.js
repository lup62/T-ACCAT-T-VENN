const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    creaRecensione,
    listaRecensioniUtente,
    listaRecensioniAnnuncio,
} = require("../controllers/recensioneController");

const router = express.Router();

router.get("/utente/:utenteId", listaRecensioniUtente);
router.get("/annuncio/:annuncioId", listaRecensioniAnnuncio);
router.post("/", requireAuth, creaRecensione);

module.exports = router;