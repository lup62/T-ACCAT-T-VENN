const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    creaProposta,
    listaProposteRicevute,
    listaProposteInviate,
    accettaProposta,
    rifiutaProposta,
} = require("../controllers/propostaController");

const router = express.Router();


router.get("/ricevute", requireAuth, listaProposteRicevute);
router.get("/inviate", requireAuth, listaProposteInviate);
router.patch("/:id/accetta", requireAuth, accettaProposta);
router.patch("/:id/rifiuta", requireAuth, rifiutaProposta);
router.post("/", requireAuth, creaProposta);

module.exports = router;