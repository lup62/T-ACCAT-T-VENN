const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    listaConversazioni,
} = require("../controllers/conversazioneController");

const router = express.Router();

router.get("/", requireAuth, listaConversazioni);

module.exports = router;
