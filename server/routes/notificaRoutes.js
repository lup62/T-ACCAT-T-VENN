const express = require("express");
const requireAuth = require("../middlewares/requireAuth");

const {
    listaNotifiche,
    segnaNotificaComeLetta,
    segnaTutteComeLette,
    eliminaNotifica,
} = require("../controllers/notificaController");

const router = express.Router();

router.get("/", requireAuth, listaNotifiche);
router.patch(
    "/leggi-tutte",
    requireAuth,
    segnaTutteComeLette
);
router.patch(
    "/:id/letta",
    requireAuth,
    segnaNotificaComeLetta
);

router.delete(
    "/:id",
    requireAuth,
    eliminaNotifica
);

module.exports = router;