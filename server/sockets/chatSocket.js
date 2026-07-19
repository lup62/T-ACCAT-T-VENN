const mongoose = require("mongoose");
const Conversazione = require("../models/Conversazione");

function configuraChatSocket(io) {
    io.on("connection", (socket) => {
        console.log(
            `Socket connesso: ${socket.id} — utente ${socket.utente.id}`
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

        socket.on("disconnect", (motivo) => {
            console.log(
                `Socket disconnesso: ${socket.id} — motivo: ${motivo}`
            );
        });
    });
}

module.exports = configuraChatSocket;
