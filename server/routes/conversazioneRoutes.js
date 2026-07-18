const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    listaConversazioni,
    creaORecuperaConversazione,
    listaMessaggiConversazione,
} = require("../controllers/conversazioneController");

const router = express.Router();

router.get("/", requireAuth, listaConversazioni);
router.post("/", requireAuth, creaORecuperaConversazione);
router.get("/:conversazioneId/messaggi", requireAuth, listaMessaggiConversazione);

module.exports = router;
