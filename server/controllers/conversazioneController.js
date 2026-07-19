const mongoose = require("mongoose");
const Conversazione = require("../models/Conversazione");
const User = require("../models/User");
const Annuncio = require("../models/Annuncio");
const Messaggio = require("../models/Messaggio");

async function listaConversazioni(req, res) {
    try {
        const conversazioni = await Conversazione.find({
            partecipanti: req.utente.id,
        })
            .populate(
                "partecipanti",
                "nome cognome ruoli ratingMedio"
            )
            .populate(
                "annuncioRiferimento",
                "titolo tipo stato"
            )
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            message: "Conversazioni recuperate con successo.",
            count: conversazioni.length,
            conversazioni,
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero delle conversazioni:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function creaORecuperaConversazione(req, res) {
    try {
        const { destinatarioId, annuncioRiferimento } = req.body || {};

        if (!destinatarioId) {
            return res.status(400).json({
                message: "ID destinatario obbligatorio.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(destinatarioId)) {
            return res.status(400).json({
                message: "ID destinatario non valido.",
            });
        }

        if (destinatarioId === req.utente.id) {
            return res.status(400).json({
                message: "Non puoi creare una conversazione con te stesso.",
            });
        }

        const destinatario = await User.findById(destinatarioId);

        if (!destinatario) {
            return res.status(404).json({
                message: "Utente destinatario non trovato.",
            });
        }

        let annuncio = null;

        if (annuncioRiferimento) {
            if (!mongoose.Types.ObjectId.isValid(annuncioRiferimento)) {
                return res.status(400).json({
                    message: "ID annuncio non valido.",
                });
            }

            annuncio = await Annuncio.findById(annuncioRiferimento);

            if (!annuncio) {
                return res.status(404).json({
                    message: "Annuncio non trovato.",
                });
            }

            const autoreAnnuncioId = annuncio.autore.toString();

            const annuncioCoinvolgePartecipanti =
                autoreAnnuncioId === req.utente.id ||
                autoreAnnuncioId === destinatarioId;

            if (!annuncioCoinvolgePartecipanti) {
                return res.status(403).json({
                    message:
                        "L'annuncio deve appartenere a uno dei partecipanti della conversazione.",
                });
            }
        }

        const filtroConversazione = {
            partecipanti: {
                $all: [req.utente.id, destinatarioId],
                $size: 2,
            },
        };

        if (annuncio) {
            filtroConversazione.annuncioRiferimento = annuncio._id;
        } else {
            filtroConversazione.$or = [
                { annuncioRiferimento: null },
                { annuncioRiferimento: { $exists: false } },
            ];
        }

        const conversazioneEsistente = await Conversazione.findOne(
            filtroConversazione
        )
            .populate(
                "partecipanti",
                "nome cognome ruoli ratingMedio"
            )
            .populate(
                "annuncioRiferimento",
                "titolo tipo stato"
            );

        if (conversazioneEsistente) {
            return res.status(200).json({
                message: "Conversazione già esistente recuperata con successo.",
                conversazione: conversazioneEsistente,
            });
        }

        const datiConversazione = {
            partecipanti: [req.utente.id, destinatarioId],
        };

        if (annuncio) {
            datiConversazione.annuncioRiferimento = annuncio._id;
        }

        const nuovaConversazione = await Conversazione.create(
            datiConversazione
        );

        await nuovaConversazione.populate(
            "partecipanti",
            "nome cognome ruoli ratingMedio"
        );

        await nuovaConversazione.populate(
            "annuncioRiferimento",
            "titolo tipo stato"
        );

        return res.status(201).json({
            message: "Conversazione creata con successo.",
            conversazione: nuovaConversazione,
        });
    } catch (error) {
        console.error(
            "Errore durante la creazione o il recupero della conversazione:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function listaMessaggiConversazione(req, res) {
    try {
        const { conversazioneId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(conversazioneId)) {
            return res.status(400).json({
                message: "ID conversazione non valido.",
            });
        }

        const conversazione = await Conversazione.findById(
            conversazioneId
        ).select("partecipanti");

        if (!conversazione) {
            return res.status(404).json({
                message: "Conversazione non trovata.",
            });
        }

        const utentePartecipa = conversazione.partecipanti.some(
            (partecipanteId) =>
                partecipanteId.toString() === req.utente.id
        );

        if (!utentePartecipa) {
            return res.status(403).json({
                message:
                    "Non sei autorizzato a visualizzare i messaggi di questa conversazione.",
            });
        }

        const messaggi = await Messaggio.find({
            conversazione: conversazioneId,
        })
            .populate(
                "mittente",
                "nome cognome ruoli"
            )
            .sort({ createdAt: 1 });

        return res.status(200).json({
            message: "Messaggi recuperati con successo.",
            count: messaggi.length,
            messaggi,
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero dei messaggi:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function segnaMessaggiComeLetti(req, res) {
    try {
        const { conversazioneId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(conversazioneId)) {
            return res.status(400).json({
                message: "ID conversazione non valido.",
            });
        }

        const conversazione = await Conversazione.findById(
            conversazioneId
        ).select("partecipanti");

        if (!conversazione) {
            return res.status(404).json({
                message: "Conversazione non trovata.",
            });
        }

        const utentePartecipa =
            conversazione.partecipanti.some(
                (partecipanteId) =>
                    partecipanteId.toString() ===
                    req.utente.id
            );

        if (!utentePartecipa) {
            return res.status(403).json({
                message:
                    "Non sei autorizzato ad aggiornare i messaggi di questa conversazione.",
            });
        }

        const risultato = await Messaggio.updateMany(
            {
                conversazione: conversazioneId,
                mittente: {
                    $ne: req.utente.id,
                },
                letto: false,
            },
            {
                $set: {
                    letto: true,
                },
            }
        );

        return res.status(200).json({
            message:
                "Messaggi segnati come letti con successo.",
            count: risultato.modifiedCount,
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento dei messaggi letti:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    listaConversazioni,
    creaORecuperaConversazione,
    listaMessaggiConversazione,
    segnaMessaggiComeLetti,
};
