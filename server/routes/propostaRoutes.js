const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const { creaProposta } = require("../controllers/propostaController");

const router = express.Router();

router.post("/", requireAuth, creaProposta);

module.exports = router;