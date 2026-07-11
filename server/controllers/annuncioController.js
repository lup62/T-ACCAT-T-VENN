const Annuncio = require("../models/Annuncio");
const mongoose = require("mongoose");

function normalizzaOrario(orario) {
    if (!orario) {
        return undefined;
    }

    if (typeof orario === "string") {
        return orario;
    }

    if (typeof orario === "object") {
        const { inizio, fine } = orario;

        if (inizio && fine) {
            return `${inizio} - ${fine}`;
        }

        if (inizio) {
            return `Dalle ${inizio}`;
        }

        if (fine) {
            return `Fino alle ${fine}`;
        }
    }

    return undefined;
}

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
        orarioLavorativo: normalizzaOrario(orario),
        tipoLavoro,
        competenze: competenzeRichieste,
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
async function modificaAnnuncio(req, res) {
    try {
        const { id } = req.params;
        const datiAggiornamento = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID annuncio non valido.",
            });
        }

        const annuncio = await Annuncio.findById(id);

        if (!annuncio) {
            return res.status(404).json({
                message: "Annuncio non trovato.",
            });
        }

        if (annuncio.autore.toString() !== req.utente.id) {
            return res.status(403).json({
                message: "Puoi modificare solo i tuoi annunci.",
            });
        }

        const campiAggiornabili = [
            "titolo",
            "descrizione",
            "luogo",
            "periodo",
            "orario",
            "tipoLavoro",
            "competenzeRichieste",
            "numeroLavoratoriRichiesti",
            "prezzo",
        ];

        const campiPresenti = campiAggiornabili.filter(
            (campo) => datiAggiornamento[campo] !== undefined
        );

        if (campiPresenti.length === 0) {
            return res.status(400).json({
                message: "Indica almeno un campo da aggiornare.",
            });
        }

        campiPresenti.forEach((campo) => {
            if (campo === "orario") {
                annuncio.orarioLavorativo = normalizzaOrario(datiAggiornamento.orario);
                return;
            }

            if (campo === "competenzeRichieste") {
                annuncio.competenze = datiAggiornamento.competenzeRichieste;
                return;
            }

            annuncio[campo] = datiAggiornamento[campo];
        });

        await annuncio.save();

        return res.status(200).json({
            message: "Annuncio aggiornato con successo.",
            annuncio,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Dati annuncio non validi.",
                errors: Object.values(error.errors).map((err) => err.message),
            });
        }

        console.error("Errore durante la modifica dell'annuncio:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function chiudiAnnuncio(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID annuncio non valido.",
            });
        }

        const annuncio = await Annuncio.findById(id);

        if (!annuncio) {
            return res.status(404).json({
                message: "Annuncio non trovato.",
            });
        }

        if (annuncio.autore.toString() !== req.utente.id) {
            return res.status(403).json({
                message: "Puoi chiudere solo i tuoi annunci.",
            });
        }

        if (annuncio.stato === "chiuso") {
            return res.status(400).json({
                message: "L'annuncio è già chiuso.",
            });
        }

        annuncio.stato = "chiuso";

        await annuncio.save();

        return res.status(200).json({
            message: "Annuncio chiuso con successo.",
            annuncio,
        });
    } catch (error) {
        console.error("Errore durante la chiusura dell'annuncio:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function concludiAnnuncio(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID annuncio non valido.",
            });
        }

        const annuncio = await Annuncio.findById(id);

        if (!annuncio) {
            return res.status(404).json({
                message: "Annuncio non trovato.",
            });
        }

        if (annuncio.autore.toString() !== req.utente.id) {
            return res.status(403).json({
                message: "Puoi concludere solo i tuoi annunci.",
            });
        }

        if (annuncio.stato !== "in_corso") {
            return res.status(400).json({
                message: "Puoi concludere solo annunci in corso.",
            });
        }

        annuncio.stato = "concluso";

        await annuncio.save();

        return res.status(200).json({
            message: "Annuncio concluso con successo.",
            annuncio,
        });
    } catch (error) {
        console.error("Errore durante la conclusione dell'annuncio:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
module.exports = {
    creaAnnuncio,
    listaAnnunci,
    dettaglioAnnuncio,
    modificaAnnuncio,
    chiudiAnnuncio,
    concludiAnnuncio,
};