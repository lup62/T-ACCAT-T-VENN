const mongoose = require("mongoose");
const RicercaSalvata = require("../models/RicercaSalvata");

async function creaRicercaSalvata(req, res) {
    try {
        const {
            nome,
            tipoAnnuncio,
            ricerca,
            filtri,
        } = req.body || {};

        if (!tipoAnnuncio) {
            return res.status(400).json({
                message: "Il tipo di annuncio è obbligatorio.",
            });
        }

        const nuovaRicerca = await RicercaSalvata.create({
            utente: req.utente.id,
            nome,
            tipoAnnuncio,
            ricerca,
            filtri,
        });

        return res.status(201).json({
            message: "Ricerca salvata con successo.",
            ricercaSalvata: nuovaRicerca,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Dati della ricerca salvata non validi.",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                ),
            });
        }

        console.error(
            "Errore durante la creazione della ricerca salvata:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function listaRicercheSalvate(req, res) {
    try {
        const ricerche = await RicercaSalvata.find({
            utente: req.utente.id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Ricerche salvate recuperate con successo.",
            count: ricerche.length,
            ricercheSalvate: ricerche,
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero delle ricerche salvate:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function modificaRicercaSalvata(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID ricerca salvata non valido.",
            });
        }

        const ricercaSalvata = await RicercaSalvata.findOne({
            _id: id,
            utente: req.utente.id,
        });

        if (!ricercaSalvata) {
            return res.status(404).json({
                message: "Ricerca salvata non trovata.",
            });
        }

        const campiAggiornabili = [
            "nome",
            "tipoAnnuncio",
            "ricerca",
            "filtri",
            "attiva",
        ];

        const campiPresenti = campiAggiornabili.filter(
            (campo) => req.body?.[campo] !== undefined
        );

        if (campiPresenti.length === 0) {
            return res.status(400).json({
                message:
                    "Indica almeno un campo da aggiornare.",
            });
        }

        campiPresenti.forEach((campo) => {
            if (campo === "filtri") {
                const filtriRicevuti = req.body.filtri || {};
                const filtriCorrenti = ricercaSalvata.filtri;

                ricercaSalvata.filtri = {
                    tipiLavoro:
                        filtriRicevuti.tipiLavoro !== undefined
                            ? filtriRicevuti.tipiLavoro
                            : filtriCorrenti.tipiLavoro,

                    province:
                        filtriRicevuti.province !== undefined
                            ? filtriRicevuti.province
                            : filtriCorrenti.province,

                    prezzoRange:
                        filtriRicevuti.prezzoRange !== undefined
                            ? filtriRicevuti.prezzoRange
                            : filtriCorrenti.prezzoRange,

                    periodoInizio:
                        filtriRicevuti.periodoInizio !== undefined
                            ? filtriRicevuti.periodoInizio
                            : filtriCorrenti.periodoInizio,

                    periodoFine:
                        filtriRicevuti.periodoFine !== undefined
                            ? filtriRicevuti.periodoFine
                            : filtriCorrenti.periodoFine,
                };

                return;
            }

            ricercaSalvata[campo] = req.body[campo];
        });

        await ricercaSalvata.save();

        return res.status(200).json({
            message: "Ricerca salvata aggiornata con successo.",
            ricercaSalvata,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message:
                    "Dati della ricerca salvata non validi.",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                ),
            });
        }

        console.error(
            "Errore durante la modifica della ricerca salvata:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function eliminaRicercaSalvata(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID ricerca salvata non valido.",
            });
        }

        const ricercaSalvata = await RicercaSalvata.findOne({
            _id: id,
            utente: req.utente.id,
        });

        if (!ricercaSalvata) {
            return res.status(404).json({
                message: "Ricerca salvata non trovata.",
            });
        }

        await RicercaSalvata.findByIdAndDelete(
            ricercaSalvata._id
        );

        return res.status(200).json({
            message: "Ricerca salvata eliminata con successo.",
        });
    } catch (error) {
        console.error(
            "Errore durante l'eliminazione della ricerca salvata:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    creaRicercaSalvata,
    listaRicercheSalvate,
    modificaRicercaSalvata,
    eliminaRicercaSalvata,
};
