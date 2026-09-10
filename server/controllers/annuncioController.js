const Annuncio = require("../models/Annuncio");
const mongoose = require("mongoose");
const Proposta = require("../models/Proposta");
const {
    generaNotifichePerNuovoAnnuncio,
} = require("../services/notificaRicercaService");

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

        try {
            const notificheGenerate =
                await generaNotifichePerNuovoAnnuncio(annuncio);

            const io = req.app.get("io");

            if (io) {
                for (const notifica of notificheGenerate) {
                    io.to(
                        `utente:${notifica.destinatario.toString()}`
                    ).emit("notifica:nuova", {
                        notifica,
                    });
                }
            }
        } catch (erroreNotifiche) {
            console.error(
                "Errore durante la generazione delle notifiche:",
                erroreNotifiche
            );
        }

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
                "nome cognome ruoli ratingMedio"
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
async function listaMieiAnnunci(req, res) {
    try {
        const { stato, tipo, tipoLavoro } = req.query;

        const statiValidi = ["aperto", "in_corso", "concluso", "chiuso"];
        const tipiValidi = ["richiesta_manodopera", "disponibilita_lavoro"];

        const filtri = {
            autore: req.utente.id,
        };

        if (stato) {
            if (!statiValidi.includes(stato)) {
                return res.status(400).json({
                    message: "Stato annuncio non valido.",
                });
            }

            filtri.stato = stato;
        }

        if (tipo) {
            if (!tipiValidi.includes(tipo)) {
                return res.status(400).json({
                    message: "Tipo annuncio non valido.",
                });
            }

            filtri.tipo = tipo;
        }

        if (tipoLavoro) {
            filtri.tipoLavoro = tipoLavoro;
        }

        const annunci = await Annuncio.find(filtri)
            .populate(
                "autore",
                "nome cognome ruoli ratingMedio"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "I tuoi annunci sono stati recuperati con successo.",
            count: annunci.length,
            annunci,
        });
    } catch (error) {
        console.error("Errore durante il recupero dei miei annunci:", error);

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

        const annuncio = await Annuncio.findById(id).populate(
            "autore",
            "nome cognome ruoli ratingMedio"
        );

        if (!annuncio) {
            return res.status(404).json({
                message: "Annuncio non trovato.",
            });
        }

        if (annuncio.stato === "aperto") {
            return res.status(200).json({
                message: "Annuncio recuperato con successo.",
                annuncio,
            });
        }

        if (!req.utente) {
            return res.status(401).json({
                message: "Devi effettuare l'accesso per visualizzare questo annuncio.",
            });
        }

        const utenteId = req.utente.id;
        const autoreId = annuncio.autore._id.toString();

        if (utenteId === autoreId) {
            return res.status(200).json({
                message: "Annuncio recuperato con successo.",
                annuncio,
            });
        }

        const propostaAccettata = await Proposta.findOne({
            annuncio: annuncio._id,
            proponente: utenteId,
            stato: "accettata",
        });

        if (!propostaAccettata) {
            return res.status(403).json({
                message: "Non puoi visualizzare questo annuncio.",
            });
        }

        return res.status(200).json({
            message: "Annuncio recuperato con successo.",
            annuncio,
        });
    } catch (error) {
        console.error("Errore durante il recupero del dettaglio annuncio:", error);

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

        if (annuncio.stato !== "aperto") {
            return res.status(400).json({
                message: "Puoi chiudere solo annunci aperti.",
            });
        }

        annuncio.stato = "chiuso";

        await annuncio.save();

        const risultatoProposte = await Proposta.updateMany(
            {
                annuncio: annuncio._id,
                stato: "in_attesa",
            },
            {
                stato: "rifiutata",
                dataRisposta: new Date(),
            }
        );

        return res.status(200).json({
            message: "Annuncio chiuso con successo.",
            annuncio,
            proposteRifiutate: risultatoProposte.modifiedCount,
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

        // Il lavoro è finito: le candidature rimaste in attesa non hanno più
        // senso e vengono rifiutate in automatico (a differenza
        // dell'accettazione, dove è l'autore a decidere una per una).
        const risultatoProposte = await Proposta.updateMany(
            {
                annuncio: annuncio._id,
                stato: "in_attesa",
            },
            {
                stato: "rifiutata",
                dataRisposta: new Date(),
            }
        );

        return res.status(200).json({
            message: "Annuncio concluso con successo.",
            annuncio,
            proposteRifiutate: risultatoProposte.modifiedCount,
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
    listaMieiAnnunci,
    dettaglioAnnuncio,
    modificaAnnuncio,
    chiudiAnnuncio,
    concludiAnnuncio,
};