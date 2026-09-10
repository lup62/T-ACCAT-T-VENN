const express = require("express");
const requireAuth = require("../middlewares/requireAuth");

const {
    listaNotifiche,
    segnaNotificaComeLetta,
    segnaTutteComeLette,
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

module.exports = router;