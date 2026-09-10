const mongoose = require("mongoose");
const Notifica = require("../models/Notifica");

async function listaNotifiche(req, res) {
    try {
        const filtro = {
            destinatario: req.utente.id,
        };

        if (req.query.soloNonLette === "true") {
            filtro.letta = false;
        }

        const [notifiche, nonLette] = await Promise.all([
            Notifica.find(filtro)
                .populate(
                    "annuncio",
                    "titolo tipo"
                )
                .populate(
                    "ricercheSalvate",
                    "nome"
                )
                .sort({ createdAt: -1 }),

            Notifica.countDocuments({
                destinatario: req.utente.id,
                letta: false,
            }),
        ]);

        return res.status(200).json({
            message: "Notifiche recuperate con successo.",
            count: notifiche.length,
            nonLette,
            notifiche,
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero delle notifiche:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function segnaNotificaComeLetta(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID notifica non valido.",
            });
        }

        const notifica = await Notifica.findOneAndUpdate(
            {
                _id: id,
                destinatario: req.utente.id,
            },
            {
                $set: {
                    letta: true,
                },
            },
            {
                new: true,
            }
        )
            .populate(
                "annuncio",
                "titolo tipo"
            )
            .populate(
                "ricercheSalvate",
                "nome"
            );

        if (!notifica) {
            return res.status(404).json({
                message: "Notifica non trovata.",
            });
        }

        return res.status(200).json({
            message: "Notifica segnata come letta.",
            notifica,
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento della notifica:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function segnaTutteComeLette(req, res) {
    try {
        const risultato = await Notifica.updateMany(
            {
                destinatario: req.utente.id,
                letta: false,
            },
            {
                $set: {
                    letta: true,
                },
            }
        );

        return res.status(200).json({
            message: "Tutte le notifiche sono state segnate come lette.",
            aggiornate: risultato.modifiedCount,
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento delle notifiche:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    listaNotifiche,
    segnaNotificaComeLetta,
    segnaTutteComeLette,
};