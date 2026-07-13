const User = require("../models/User");

function formattaUtente(utente) {
    return {
        id: utente._id,
        ruoli: utente.ruoli,
        nome: utente.nome,
        cognome: utente.cognome,
        dataNascita: utente.dataNascita,
        email: utente.email,
        telefono: utente.telefono,
        indirizzo: utente.indirizzo,
        immagineProfilo: utente.immagineProfilo,
        datiLavoratore: utente.datiLavoratore,
        datiImprenditore: utente.datiImprenditore,
        ratingMedio: utente.ratingMedio,
        createdAt: utente.createdAt,
        updatedAt: utente.updatedAt,
    };
}

function contieneCampiVietati(body) {
    const campiVietati = [
        "email",
        "password",
        "passwordHash",
        "ruoli",
        "ratingMedio",
        "oauth",
        "_id",
        "id",
    ];

    return campiVietati.some((campo) =>
        Object.prototype.hasOwnProperty.call(body, campo)
    );
}

async function aggiornaProfilo(req, res) {
    try {
        if (contieneCampiVietati(req.body)) {
            return res.status(400).json({
                message:
                    "Non puoi modificare email, password, ruoli, rating o dati interni da questa rotta.",
            });
        }

        const {
            nome,
            cognome,
            telefono,
            indirizzo,
            immagineProfilo,
            datiLavoratore,
            datiImprenditore,
        } = req.body;

        const nessunCampoModificabile =
            nome === undefined &&
            cognome === undefined &&
            telefono === undefined &&
            indirizzo === undefined &&
            immagineProfilo === undefined &&
            datiLavoratore === undefined &&
            datiImprenditore === undefined;

        if (nessunCampoModificabile) {
            return res.status(400).json({
                message: "Nessun campo modificabile ricevuto.",
            });
        }

        const utente = await User.findById(req.utente.id);

        if (!utente) {
            return res.status(404).json({
                message: "Utente non trovato.",
            });
        }

        if (nome !== undefined) {
            utente.nome = nome;
        }

        if (cognome !== undefined) {
            utente.cognome = cognome;
        }

        if (telefono !== undefined) {
            utente.telefono = telefono;
        }

        if (immagineProfilo !== undefined) {
            utente.immagineProfilo = immagineProfilo || "";
        }

        if (indirizzo !== undefined) {
            if (
                !indirizzo ||
                typeof indirizzo !== "object" ||
                Array.isArray(indirizzo)
            ) {
                return res.status(400).json({
                    message: "Indirizzo non valido.",
                });
            }

            if (indirizzo.testo !== undefined) {
                utente.indirizzo.testo = indirizzo.testo;
            }

            if (indirizzo.posizione !== undefined) {
                utente.indirizzo.posizione = indirizzo.posizione;
            }
        }

        if (datiLavoratore !== undefined) {
            if (!utente.ruoli.includes("lavoratore")) {
                return res.status(400).json({
                    message:
                        "Questo utente non ha il ruolo lavoratore.",
                });
            }

            if (
                !datiLavoratore ||
                typeof datiLavoratore !== "object" ||
                Array.isArray(datiLavoratore)
            ) {
                return res.status(400).json({
                    message: "Dati lavoratore non validi.",
                });
            }

            if (datiLavoratore.competenze !== undefined) {
                utente.datiLavoratore.competenze =
                    datiLavoratore.competenze;
            }

            if (datiLavoratore.cv !== undefined) {
                utente.datiLavoratore.cv = datiLavoratore.cv || "";
            }

            if (datiLavoratore.certificazioni !== undefined) {
                utente.datiLavoratore.certificazioni =
                    datiLavoratore.certificazioni;
            }
        }

        if (datiImprenditore !== undefined) {
            if (!utente.ruoli.includes("imprenditore")) {
                return res.status(400).json({
                    message:
                        "Questo utente non ha il ruolo imprenditore.",
                });
            }

            if (
                !datiImprenditore ||
                typeof datiImprenditore !== "object" ||
                Array.isArray(datiImprenditore)
            ) {
                return res.status(400).json({
                    message: "Dati imprenditore non validi.",
                });
            }

            if (datiImprenditore.pIva !== undefined) {
                utente.datiImprenditore.pIva =
                    datiImprenditore.pIva;
            }

            if (datiImprenditore.nomeAzienda !== undefined) {
                utente.datiImprenditore.nomeAzienda =
                    datiImprenditore.nomeAzienda;
            }

            if (datiImprenditore.sitoWeb !== undefined) {
                utente.datiImprenditore.sitoWeb =
                    datiImprenditore.sitoWeb;
            }

            if (datiImprenditore.social !== undefined) {
                utente.datiImprenditore.social =
                    datiImprenditore.social;
            }
        }

        await utente.save();

        return res.status(200).json({
            message: "Profilo aggiornato con successo.",
            utente: formattaUtente(utente),
        });
    } catch (error) {
        console.error("Errore durante l'aggiornamento del profilo:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Dati profilo non validi.",
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

module.exports = {
    aggiornaProfilo,
};