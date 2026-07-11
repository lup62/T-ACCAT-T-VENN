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
async function listaProposteRicevute(req, res) {
    try {
        const proposte = await Proposta.find({
            destinatario: req.utente.id,
        })
            .populate(
                "annuncio",
                "tipo titolo descrizione luogo periodo orarioLavorativo tipoLavoro competenze numeroLavoratoriRichiesti prezzo stato"
            )
            .populate(
                "proponente",
                "nome cognome email ruoli immagineProfilo ratingMedio"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Proposte ricevute recuperate con successo.",
            count: proposte.length,
            proposte,
        });
    } catch (error) {
        console.error("Errore durante il recupero delle proposte ricevute:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function listaProposteInviate(req, res) {
    try {
        const proposte = await Proposta.find({
            proponente: req.utente.id,
        })
            .populate(
                "annuncio",
                "tipo titolo descrizione luogo periodo orarioLavorativo tipoLavoro competenze numeroLavoratoriRichiesti prezzo stato"
            )
            .populate(
                "destinatario",
                "nome cognome email ruoli immagineProfilo ratingMedio"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Proposte inviate recuperate con successo.",
            count: proposte.length,
            proposte,
        });
    } catch (error) {
        console.error("Errore durante il recupero delle proposte inviate:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    creaProposta,
    listaProposteRicevute,
    listaProposteInviate
};