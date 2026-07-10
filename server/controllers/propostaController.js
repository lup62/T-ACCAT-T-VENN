const mongoose = require("mongoose");
const Proposta = require("../models/Proposta");
const Annuncio = require("../models/Annuncio");

async function creaProposta(req, res) {
    try {
        const { annuncio: annuncioId, messaggio } = req.body || {};

        if (!annuncioId) {
            return res.status(400).json({
                message: "ID annuncio obbligatorio.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(annuncioId)) {
            return res.status(400).json({
                message: "ID annuncio non valido.",
            });
        }

        const annuncio = await Annuncio.findById(annuncioId);

        if (!annuncio) {
            return res.status(404).json({
                message: "Annuncio non trovato.",
            });
        }

        if (annuncio.stato !== "aperto") {
            return res.status(400).json({
                message: "Puoi inviare proposte solo su annunci aperti.",
            });
        }

        if (annuncio.autore.toString() === req.utente.id) {
            return res.status(403).json({
                message: "Non puoi inviare una proposta al tuo stesso annuncio.",
            });
        }

        const proposta = await Proposta.create({
            annuncio: annuncio._id,
            proponente: req.utente.id,
            destinatario: annuncio.autore,
            messaggio: messaggio || "",
        });

        return res.status(201).json({
            message: "Proposta inviata con successo.",
            proposta,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Hai già inviato una proposta attiva per questo annuncio.",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Dati proposta non validi.",
                errors: Object.values(error.errors).map((err) => err.message),
            });
        }

        console.error("Errore durante la creazione della proposta:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    creaProposta,
};