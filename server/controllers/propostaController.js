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
                "nome cognome email ruoli ratingMedio"
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
                "nome cognome email ruoli ratingMedio"
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
async function accettaProposta(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID proposta non valido.",
            });
        }

        const proposta = await Proposta.findById(id);

        if (!proposta) {
            return res.status(404).json({
                message: "Proposta non trovata.",
            });
        }

        if (proposta.destinatario.toString() !== req.utente.id) {
            return res.status(403).json({
                message: "Puoi accettare solo le proposte ricevute da te.",
            });
        }

        if (proposta.stato !== "in_attesa") {
            return res.status(400).json({
                message: "Puoi rispondere solo a proposte ancora in attesa.",
            });
        }

        const dataRisposta = new Date();

        const annuncioAggiornato = await Annuncio.findOneAndUpdate(
            {
                _id: proposta.annuncio,
                autore: req.utente.id,
                stato: "aperto",
            },
            {
                stato: "in_corso",
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!annuncioAggiornato) {
            const annuncioEsistente = await Annuncio.findById(proposta.annuncio);

            if (!annuncioEsistente) {
                return res.status(404).json({
                    message: "Annuncio collegato alla proposta non trovato.",
                });
            }

            return res.status(400).json({
                message: "Puoi accettare proposte solo su annunci ancora aperti.",
            });
        }

        const propostaAccettata = await Proposta.findOneAndUpdate(
            {
                _id: proposta._id,
                destinatario: req.utente.id,
                stato: "in_attesa",
            },
            {
                stato: "accettata",
                dataRisposta,
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate(
            "annuncio",
            "tipo titolo descrizione luogo periodo orarioLavorativo tipoLavoro competenze numeroLavoratoriRichiesti prezzo stato"
        );

        if (!propostaAccettata) {
            await Annuncio.findOneAndUpdate(
                {
                    _id: annuncioAggiornato._id,
                    stato: "in_corso",
                },
                {
                    stato: "aperto",
                },
                {
                    runValidators: true,
                }
            );

            return res.status(400).json({
                message: "La proposta non è più in attesa.",
            });
        }

        await Proposta.updateMany(
            {
                annuncio: annuncioAggiornato._id,
                _id: { $ne: propostaAccettata._id },
                stato: "in_attesa",
            },
            {
                stato: "rifiutata",
                dataRisposta,
            }
        );

        return res.status(200).json({
            message: "Proposta accettata con successo.",
            proposta: propostaAccettata,
        });
    } catch (error) {
        console.error("Errore durante l'accettazione della proposta:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function rifiutaProposta(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID proposta non valido.",
            });
        }

        const proposta = await Proposta.findById(id);

        if (!proposta) {
            return res.status(404).json({
                message: "Proposta non trovata.",
            });
        }

        if (proposta.destinatario.toString() !== req.utente.id) {
            return res.status(403).json({
                message: "Puoi rifiutare solo le proposte ricevute da te.",
            });
        }

        if (proposta.stato !== "in_attesa") {
            return res.status(400).json({
                message: "Puoi rispondere solo a proposte ancora in attesa.",
            });
        }

        proposta.stato = "rifiutata";
        proposta.dataRisposta = new Date();

        await proposta.save();

        return res.status(200).json({
            message: "Proposta rifiutata con successo.",
            proposta,
        });
    } catch (error) {
        console.error("Errore durante il rifiuto della proposta:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    creaProposta,
    listaProposteRicevute,
    listaProposteInviate,
    accettaProposta,
    rifiutaProposta
};
