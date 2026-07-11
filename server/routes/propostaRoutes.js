const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    creaProposta,
    listaProposteRicevute,
    listaProposteInviate,
} = require("../controllers/propostaController");

const router = express.Router();


router.get("/ricevute", requireAuth, listaProposteRicevute);
router.get("/inviate", requireAuth, listaProposteInviate);
router.post("/", requireAuth, creaProposta);

module.exports = router;