const mongoose = require("mongoose");
const Preferito = require("../models/Preferito");
const Annuncio = require("../models/Annuncio");
const User = require("../models/User");

async function creaPreferito(req, res) {
    try {
        const { tipo, riferimento } = req.body || {};

        if (!tipo || !riferimento) {
            return res.status(400).json({
                message: "Tipo e riferimento sono obbligatori.",
            });
        }

        if (!["annuncio", "profilo"].includes(tipo)) {
            return res.status(400).json({
                message: "Tipo preferito non valido.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(riferimento)) {
            return res.status(400).json({
                message: "ID riferimento non valido.",
            });
        }

        if (tipo === "annuncio") {
            const annuncio = await Annuncio.findById(riferimento);

            if (!annuncio) {
                return res.status(404).json({
                    message: "Annuncio non trovato.",
                });
            }

            if (annuncio.autore.toString() === req.utente.id) {
                return res.status(400).json({
                    message: "Non puoi salvare tra i preferiti un tuo annuncio.",
                });
            }
        }

        if (tipo === "profilo") {
            const profilo = await User.findById(riferimento);

            if (!profilo) {
                return res.status(404).json({
                    message: "Profilo non trovato.",
                });
            }

            if (profilo._id.toString() === req.utente.id) {
                return res.status(400).json({
                    message: "Non puoi salvare il tuo profilo tra i preferiti.",
                });
            }
        }

        const preferito = await Preferito.create({
            utente: req.utente.id,
            tipo,
            riferimento,
        });

        const preferitoPopolato = await Preferito.findById(preferito._id)
            .populate(
                "riferimento",
                "titolo tipo tipoLavoro luogo periodo prezzo stato nome cognome ruoli immagineProfilo ratingMedio"
            );

        return res.status(201).json({
            message: "Preferito aggiunto con successo.",
            preferito: preferitoPopolato,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Hai già salvato questo elemento tra i preferiti.",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Dati preferito non validi.",
                errors: Object.values(error.errors).map((err) => err.message),
            });
        }

        console.error("Errore durante la creazione del preferito:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function listaPreferiti(req, res) {
    try {
        const { tipo } = req.query;

        const filtri = {
            utente: req.utente.id,
        };

        if (tipo) {
            if (!["annuncio", "profilo"].includes(tipo)) {
                return res.status(400).json({
                    message: "Tipo preferito non valido.",
                });
            }

            filtri.tipo = tipo;
        }

        const preferiti = await Preferito.find(filtri)
            .populate(
                "riferimento",
                "titolo tipo tipoLavoro luogo periodo prezzo stato nome cognome ruoli immagineProfilo ratingMedio"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Preferiti recuperati con successo.",
            count: preferiti.length,
            preferiti,
        });
    } catch (error) {
        console.error("Errore durante il recupero dei preferiti:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function rimuoviPreferito(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID preferito non valido.",
            });
        }

        const preferito = await Preferito.findOne({
            _id: id,
            utente: req.utente.id,
        });

        if (!preferito) {
            return res.status(404).json({
                message: "Preferito non trovato.",
            });
        }

        await Preferito.findByIdAndDelete(preferito._id);

        return res.status(200).json({
            message: "Preferito rimosso con successo.",
        });
    } catch (error) {
        console.error("Errore durante la rimozione del preferito:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    creaPreferito,
    listaPreferiti,
    rimuoviPreferito,
};