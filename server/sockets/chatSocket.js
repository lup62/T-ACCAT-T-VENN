const mongoose = require("mongoose");
const Conversazione = require("../models/Conversazione");
const Messaggio = require("../models/Messaggio");

function configuraChatSocket(io) {
    io.on("connection", (socket) => {
        console.log(
            `Socket connesso: ${socket.id} - utente ${socket.utente.id}`
        );

        socket.on(
            "conversazione:entra",
            async (dati, callback) => {
                const rispondi =
                    typeof callback === "function"
                        ? callback
                        : () => {};

                try {
                    const conversazioneId =
                        dati?.conversazioneId;

                    if (
                        !mongoose.Types.ObjectId.isValid(
                            conversazioneId
                        )
                    ) {
                        return rispondi({
                            ok: false,
                            message:
                                "ID conversazione non valido.",
                        });
                    }

                    const conversazione =
                        await Conversazione.findById(
                            conversazioneId
                        ).select("partecipanti");

                    if (!conversazione) {
                        return rispondi({
                            ok: false,
                            message:
                                "Conversazione non trovata.",
                        });
                    }

                    const utentePartecipa =
                        conversazione.partecipanti.some(
                            (partecipanteId) =>
                                partecipanteId.toString() ===
                                socket.utente.id
                        );

                    if (!utentePartecipa) {
                        return rispondi({
                            ok: false,
                            message:
                                "Non sei autorizzato ad accedere a questa conversazione.",
                        });
                    }

                    const nomeStanza =
                        `conversazione:${conversazioneId}`;

                    await socket.join(nomeStanza);

                    return rispondi({
                        ok: true,
                        message:
                            "Ingresso nella conversazione riuscito.",
                        conversazioneId,
                    });
                } catch (error) {
                    console.error(
                        "Errore durante l'ingresso nella conversazione:",
                        error
                    );

                    return rispondi({
                        ok: false,
                        message:
                            "Errore interno del server.",
                    });
                }
            }
        );

        socket.on(
            "messaggio:invia",
            async (dati, callback) => {
                const rispondi =
                    typeof callback === "function"
                        ? callback
                        : () => {};

                try {
                    const conversazioneId =
                        dati?.conversazioneId;

                    if (
                        !mongoose.Types.ObjectId.isValid(
                            conversazioneId
                        )
                    ) {
                        return rispondi({
                            ok: false,
                            message:
                                "ID conversazione non valido.",
                        });
                    }

                    if (typeof dati?.testo !== "string") {
                        return rispondi({
                            ok: false,
                            message:
                                "Il testo del messaggio è obbligatorio.",
                        });
                    }

                    const testo = dati.testo.trim();

                    if (!testo) {
                        return rispondi({
                            ok: false,
                            message:
                                "Il testo del messaggio è obbligatorio.",
                        });
                    }

                    if (testo.length > 2000) {
                        return rispondi({
                            ok: false,
                            message:
                                "Il messaggio non può superare 2000 caratteri.",
                        });
                    }

                    const conversazione =
                        await Conversazione.findById(
                            conversazioneId
                        ).select("partecipanti");

                    if (!conversazione) {
                        return rispondi({
                            ok: false,
                            message:
                                "Conversazione non trovata.",
                        });
                    }

                    const utentePartecipa =
                        conversazione.partecipanti.some(
                            (partecipanteId) =>
                                partecipanteId.toString() ===
                                socket.utente.id
                        );

                    if (!utentePartecipa) {
                        return rispondi({
                            ok: false,
                            message:
                                "Non sei autorizzato a inviare messaggi in questa conversazione.",
                        });
                    }

                    const nomeStanza =
                        `conversazione:${conversazioneId}`;

                    if (!socket.rooms.has(nomeStanza)) {
                        return rispondi({
                            ok: false,
                            message:
                                "Devi entrare nella conversazione prima di inviare un messaggio.",
                        });
                    }

                    const messaggio =
                        await Messaggio.create({
                            conversazione:
                            conversazioneId,
                            mittente:
                            socket.utente.id,
                            testo,
                        });

                    await Conversazione.findByIdAndUpdate(
                        conversazioneId,
                        {
                            ultimoMessaggio: {
                                testo,
                                mittente:
                                socket.utente.id,
                                timestamp:
                                messaggio.createdAt,
                            },
                        }
                    );

                    await messaggio.populate(
                        "mittente",
                        "nome cognome ruoli"
                    );

                    io.to(nomeStanza).emit(
                        "messaggio:nuovo",
                        {
                            messaggio,
                        }
                    );

                    return rispondi({
                        ok: true,
                        message:
                            "Messaggio inviato con successo.",
                        messaggio,
                    });
                } catch (error) {
                    console.error(
                        "Errore durante l'invio del messaggio:",
                        error
                    );

                    return rispondi({
                        ok: false,
                        message:
                            "Errore interno del server.",
                    });
                }
            }
        );

        socket.on("disconnect", (motivo) => {
            console.log(
                `Socket disconnesso: ${socket.id} - motivo: ${motivo}`
            );
        });
    });
}

module.exports = configuraChatSocket;
