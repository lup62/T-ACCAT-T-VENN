/**
 * useChatSocket.js — connessione Socket.IO per la chat 1:1.
 *
 * Il backend (server/sockets/) autentica la connessione con l'access token
 * JWT passato nel handshake e poi espone due eventi con ack:
 *   - "conversazione:entra"  { conversazioneId }        → ingresso nella stanza
 *   - "messaggio:invia"      { conversazioneId, testo } → persiste e fa broadcast
 * I messaggi nuovi (anche i propri) arrivano a tutta la stanza con
 * "messaggio:nuovo" { messaggio }.
 *
 * Il socket vive quanto l'accessToken: quando il token viene rinnovato
 * (ogni ~13 minuti, vedi AuthContext) la connessione viene ricreata con il
 * token nuovo e le stanze si perdono. Chi usa l'hook deve quindi rientrare
 * nella conversazione quando `connesso` torna true, non solo alla selezione.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Oltre questo tempo senza ack consideriamo la richiesta persa.
const TIMEOUT_ACK_MS = 10000;

export function useChatSocket(accessToken, onMessaggioNuovo) {
    const socketRef = useRef(null);
    const [connesso, setConnesso] = useState(false);
    const [erroreConnessione, setErroreConnessione] = useState("");

    // Il callback è tenuto in una ref così il socket non va ricreato
    // a ogni render del componente che lo passa (aggiornata in un effect
    // per la regola react-hooks/refs).
    const onMessaggioNuovoRef = useRef(onMessaggioNuovo);
    useEffect(() => {
        onMessaggioNuovoRef.current = onMessaggioNuovo;
    });

    useEffect(() => {
        if (!accessToken) return undefined;

        const socket = io(API_URL, { auth: { token: accessToken } });
        socketRef.current = socket;

        socket.on("connect", () => {
            setConnesso(true);
            setErroreConnessione("");
        });
        socket.on("disconnect", () => setConnesso(false));
        // Errore in fase di handshake (es. token scaduto): socket.io
        // ritenta da solo, qui mostriamo solo lo stato.
        socket.on("connect_error", (err) =>
            setErroreConnessione(err.message || "Connessione alla chat non riuscita.")
        );
        socket.on("messaggio:nuovo", (dati) => {
            if (dati?.messaggio) onMessaggioNuovoRef.current?.(dati.messaggio);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setConnesso(false);
        };
    }, [accessToken]);

    // Emit con ack trasformato in promise; rifiuta su risposta negativa
    // del server, timeout o socket non connesso.
    const emetti = useCallback(
        (evento, dati) =>
            new Promise((resolve, reject) => {
                const socket = socketRef.current;
                if (!socket?.connected) {
                    reject(new Error("Connessione alla chat non attiva."));
                    return;
                }
                socket.timeout(TIMEOUT_ACK_MS).emit(evento, dati, (err, risposta) => {
                    if (err) {
                        reject(new Error("Il server della chat non risponde."));
                    } else if (!risposta?.ok) {
                        reject(new Error(risposta?.message || "Errore nella chat."));
                    } else {
                        resolve(risposta);
                    }
                });
            }),
        []
    );

    // Ingresso nella stanza della conversazione: obbligatorio prima di
    // poter inviare messaggi e per ricevere quelli nuovi in tempo reale.
    const entraConversazione = useCallback(
        (conversazioneId) => emetti("conversazione:entra", { conversazioneId }),
        [emetti]
    );

    // Invia un messaggio (max 2000 caratteri, validato anche dal server)
    // e risolve con il messaggio salvato, mittente popolato.
    const inviaMessaggio = useCallback(
        async (conversazioneId, testo) => {
            const risposta = await emetti("messaggio:invia", { conversazioneId, testo });
            return risposta.messaggio;
        },
        [emetti]
    );

    return { connesso, erroreConnessione, entraConversazione, inviaMessaggio };
}
