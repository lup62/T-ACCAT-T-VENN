const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    listaConversazioni,
    creaORecuperaConversazione,
} = require("../controllers/conversazioneController");

const router = express.Router();

router.get("/", requireAuth, listaConversazioni);
router.post("/", requireAuth, creaORecuperaConversazione);

module.exports = router;
