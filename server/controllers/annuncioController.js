const Annuncio = require("../models/Annuncio");
const mongoose = require("mongoose");

function utentePuoCreareTipoAnnuncio(utente, tipoAnnuncio) {
    if (tipoAnnuncio === "richiesta_manodopera") {
        return utente.ruoli.includes("imprenditore");
    }

    if (tipoAnnuncio === "disponibilita_lavoro") {
        return utente.ruoli.includes("lavoratore");
    }

    return false;
}

async function creaAnnuncio(req, res) {
    try {
        const {
            tipo,
            titolo,
            descrizione,
            luogo,
            periodo,
            orario,
            tipoLavoro,
            competenzeRichieste,
            numeroLavoratoriRichiesti,
            prezzo,
        } = req.body;

        if (!utentePuoCreareTipoAnnuncio(req.utente, tipo)) {
            return res.status(403).json({
                message: "Non hai i permessi per creare questo tipo di annuncio.",
            });
        }

        const annuncio = await Annuncio.create({
            tipo,
            autore: req.utente.id,
            titolo,
            descrizione,
            luogo,
            periodo,
            orario,
            tipoLavoro,
            competenzeRichieste,
            numeroLavoratoriRichiesti,
            prezzo,
        });

        return res.status(201).json({
            message: "Annuncio creato con successo.",
            annuncio,
        });
    } catch (error) {
        console.error("Errore durante la creazione dell'annuncio:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Dati dell'annuncio non validi.",
                errors: Object.values(error.errors).map(
                    (errore) => errore.message
                ),
            });
        }

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function listaAnnunci(req, res) {
    try {
        const { tipo, tipoLavoro } = req.query;

        const filtri = {
            stato: "aperto",
        };

        if (tipo) {
            filtri.tipo = tipo;
        }

        if (tipoLavoro) {
            filtri.tipoLavoro = tipoLavoro;
        }

        const annunci = await Annuncio.find(filtri)
            .populate(
                "autore",
                "nome cognome ruoli immagineProfilo ratingMedio"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Annunci recuperati con successo.",
            count: annunci.length,
            annunci,
        });
    } catch (error) {
        console.error("Errore durante il recupero degli annunci:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function dettaglioAnnuncio(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID annuncio non valido.",
            });
        }

        const annuncio = await Annuncio.findOne({
            _id: id,
            stato: "aperto",
        }).populate(
            "autore",
            "nome cognome ruoli immagineProfilo ratingMedio"
        );

        if (!annuncio) {
            return res.status(404).json({
                message: "Annuncio non trovato.",
            });
        }

        return res.status(200).json({
            message: "Annuncio recuperato con successo.",
            annuncio,
        });
    } catch (error) {
        console.error("Errore durante il recupero dell'annuncio:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
module.exports = {
    creaAnnuncio,
    listaAnnunci,
    dettaglioAnnuncio,
};