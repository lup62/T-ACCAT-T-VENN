const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const {
    creaPreferito,
    listaPreferiti,
    rimuoviPreferito,
} = require("../controllers/preferitoController");

const router = express.Router();

router.get("/", requireAuth, listaPreferiti);
router.post("/", requireAuth, creaPreferito);
router.delete("/:id", requireAuth, rimuoviPreferito);

module.exports = router;