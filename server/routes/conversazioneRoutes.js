const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    listaConversazioni,
    creaORecuperaConversazione,
    listaMessaggiConversazione,
    segnaMessaggiComeLetti,
} = require("../controllers/conversazioneController");

const router = express.Router();

router.get("/", requireAuth, listaConversazioni);
router.post("/", requireAuth, creaORecuperaConversazione);
router.get("/:conversazioneId/messaggi", requireAuth, listaMessaggiConversazione);
router.patch("/:conversazioneId/messaggi/letti", requireAuth, segnaMessaggiComeLetti);

module.exports = router;
