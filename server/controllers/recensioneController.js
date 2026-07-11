const mongoose = require("mongoose");
const Recensione = require("../models/Recensione");
const Annuncio = require("../models/Annuncio");
const Proposta = require("../models/Proposta");
const User = require("../models/User");

function calcolaDirezione(annuncio, autoreId, propostaAccettata) {
    const autoreAnnuncioId = annuncio.autore.toString();
    const proponenteId = propostaAccettata.proponente.toString();

    if (annuncio.tipo === "richiesta_manodopera") {
        if (autoreId === autoreAnnuncioId) {
            return "imprenditore_a_lavoratore";
        }

        if (autoreId === proponenteId) {
            return "lavoratore_a_imprenditore";
        }
    }

    if (annuncio.tipo === "disponibilita_lavoro") {
        if (autoreId === autoreAnnuncioId) {
            return "lavoratore_a_imprenditore";
        }

        if (autoreId === proponenteId) {
            return "imprenditore_a_lavoratore";
        }
    }

    return null;
}

async function aggiornaRatingMedio(destinatarioId) {
    const risultato = await Recensione.aggregate([
        {
            $match: {
                destinatario: new mongoose.Types.ObjectId(destinatarioId),
            },
        },
        {
            $group: {
                _id: "$destinatario",
                media: { $avg: "$stelle" },
            },
        },
    ]);

    const ratingMedio = risultato.length > 0
        ? Math.round(risultato[0].media * 10) / 10
        : 0;

    await User.findByIdAndUpdate(destinatarioId, {
        ratingMedio,
    });
}

async function creaRecensione(req, res) {
    try {
        const {
            annuncio: annuncioId,
            destinatario: destinatarioId,
            stelle,
            commento,
        } = req.body || {};

        if (!annuncioId || !destinatarioId || stelle === undefined) {
            return res.status(400).json({
                message: "Annuncio, destinatario e stelle sono obbligatori.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(annuncioId)) {
            return res.status(400).json({
                message: "ID annuncio non valido.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(destinatarioId)) {
            return res.status(400).json({
                message: "ID destinatario non valido.",
            });
        }

        const numeroStelle = Number(stelle);

        if (!Number.isInteger(numeroStelle) || numeroStelle < 1 || numeroStelle > 5) {
            return res.status(400).json({
                message: "Le stelle devono essere un numero intero da 1 a 5.",
            });
        }

        const annuncio = await Annuncio.findById(annuncioId);

        if (!annuncio) {
            return res.status(404).json({
                message: "Annuncio non trovato.",
            });
        }

        if (annuncio.stato !== "concluso") {
            return res.status(400).json({
                message: "Puoi recensire solo annunci conclusi.",
            });
        }

        const propostaAccettata = await Proposta.findOne({
            annuncio: annuncio._id,
            stato: "accettata",
        });

        if (!propostaAccettata) {
            return res.status(400).json({
                message: "Non esiste una proposta accettata per questo annuncio.",
            });
        }

        const autoreId = req.utente.id;
        const autoreAnnuncioId = annuncio.autore.toString();
        const proponenteId = propostaAccettata.proponente.toString();

        const utenteCoinvolto =
            autoreId === autoreAnnuncioId || autoreId === proponenteId;

        if (!utenteCoinvolto) {
            return res.status(403).json({
                message: "Puoi recensire solo utenti collegati a una tua collaborazione.",
            });
        }

        if (autoreId === destinatarioId) {
            return res.status(400).json({
                message: "Non puoi lasciare una recensione a te stesso.",
            });
        }

        let destinatarioCorretto = null;

        if (autoreId === autoreAnnuncioId) {
            destinatarioCorretto = proponenteId;
        }

        if (autoreId === proponenteId) {
            destinatarioCorretto = autoreAnnuncioId;
        }

        if (destinatarioId !== destinatarioCorretto) {
            return res.status(403).json({
                message: "Il destinatario non è collegato a questa collaborazione.",
            });
        }

        const direzione = calcolaDirezione(annuncio, autoreId, propostaAccettata);

        if (!direzione) {
            return res.status(400).json({
                message: "Impossibile determinare la direzione della recensione.",
            });
        }

        const recensione = await Recensione.create({
            annuncio: annuncio._id,
            autore: autoreId,
            destinatario: destinatarioId,
            direzione,
            stelle: numeroStelle,
            commento: commento || "",
        });

        await aggiornaRatingMedio(destinatarioId);

        return res.status(201).json({
            message: "Recensione creata con successo.",
            recensione,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Hai già recensito questo utente per questo annuncio.",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Dati recensione non validi.",
                errors: Object.values(error.errors).map((err) => err.message),
            });
        }

        console.error("Errore durante la creazione della recensione:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function listaRecensioniUtente(req, res) {
    try {
        const { utenteId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(utenteId)) {
            return res.status(400).json({
                message: "ID utente non valido.",
            });
        }

        const recensioni = await Recensione.find({
            destinatario: utenteId,
        })
            .populate(
                "autore",
                "nome cognome ruoli immagineProfilo ratingMedio"
            )
            .populate(
                "destinatario",
                "nome cognome ruoli immagineProfilo ratingMedio"
            )
            .populate(
                "annuncio",
                "tipo titolo tipoLavoro luogo periodo stato"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Recensioni utente recuperate con successo.",
            count: recensioni.length,
            recensioni,
        });
    } catch (error) {
        console.error("Errore durante il recupero delle recensioni utente:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

async function listaRecensioniAnnuncio(req, res) {
    try {
        const { annuncioId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(annuncioId)) {
            return res.status(400).json({
                message: "ID annuncio non valido.",
            });
        }

        const recensioni = await Recensione.find({
            annuncio: annuncioId,
        })
            .populate(
                "autore",
                "nome cognome ruoli immagineProfilo ratingMedio"
            )
            .populate(
                "destinatario",
                "nome cognome ruoli immagineProfilo ratingMedio"
            )
            .populate(
                "annuncio",
                "tipo titolo tipoLavoro luogo periodo stato"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Recensioni annuncio recuperate con successo.",
            count: recensioni.length,
            recensioni,
        });
    } catch (error) {
        console.error("Errore durante il recupero delle recensioni annuncio:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    creaRecensione,
    listaRecensioniUtente,
    listaRecensioniAnnuncio,
};