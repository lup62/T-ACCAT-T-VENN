const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    creaRicercaSalvata,
    listaRicercheSalvate,
    modificaRicercaSalvata,
    eliminaRicercaSalvata,
} = require("../controllers/ricercaSalvataController");

const router = express.Router();

router.get("/", requireAuth, listaRicercheSalvate);
router.post("/", requireAuth, creaRicercaSalvata);
router.patch("/:id", requireAuth, modificaRicercaSalvata);
router.delete("/:id", requireAuth, eliminaRicercaSalvata);

module.exports = router;
