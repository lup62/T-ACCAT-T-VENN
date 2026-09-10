/**
 * useChatSocket.js
 *
 * Espone alla ChatPage le operazioni Socket.IO specifiche
 * della chat, utilizzando la connessione globale gestita
 * dal RealtimeProvider.
 */

import {
    useCallback,
    useEffect,
    useRef,
} from "react";

import { useRealtime } from "./useRealtime";

export function useChatSocket(
    accessToken,
    onMessaggioNuovo
) {
    const {
        socket,
        connesso,
        erroreConnessione,
        emetti,
    } = useRealtime();

    const onMessaggioNuovoRef =
        useRef(onMessaggioNuovo);

    useEffect(() => {
        onMessaggioNuovoRef.current =
            onMessaggioNuovo;
    }, [onMessaggioNuovo]);

    useEffect(() => {
        if (!socket || !accessToken) {
            return undefined;
        }

        const gestisciMessaggioNuovo = (dati) => {
            if (dati?.messaggio) {
                onMessaggioNuovoRef.current?.(
                    dati.messaggio
                );
            }
        };

        socket.on(
            "messaggio:nuovo",
            gestisciMessaggioNuovo
        );

        return () => {
            socket.off(
                "messaggio:nuovo",
                gestisciMessaggioNuovo
            );
        };
    }, [socket, accessToken]);

    const entraConversazione = useCallback(
        (conversazioneId) =>
            emetti("conversazione:entra", {
                conversazioneId,
            }),
        [emetti]
    );

    const inviaMessaggio = useCallback(
        async (conversazioneId, testo) => {
            const risposta = await emetti(
                "messaggio:invia",
                {
                    conversazioneId,
                    testo,
                }
            );

            return risposta.messaggio;
        },
        [emetti]
    );

    return {
        connesso,
        erroreConnessione,
        entraConversazione,
        inviaMessaggio,
    };
}