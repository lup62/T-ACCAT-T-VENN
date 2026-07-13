/**
 * usePreferitiAnnunci.js
 *
 * Hook per gestire i preferiti di tipo "annuncio" dell'utente loggato.
 * Carica la lista una volta e mantiene una mappa annuncioId → preferitoId,
 * che serve sia per colorare il cuoricino sia per la DELETE (il backend
 * rimuove per id del preferito, non dell'annuncio).
 *
 * Ritorna:
 *   isPreferito(annuncioId)   → true se l'annuncio è nei preferiti
 *   togglePreferito(annuncio) → salva/rimuove; lancia Error se il backend rifiuta
 *   toggleInCorsoId           → id dell'annuncio con toggle in volo (per lo spinner)
 *
 * Se l'utente non è loggato la mappa resta vuota e togglePreferito è un no-op:
 * sta al chiamante nascondere il cuoricino ai non autenticati.
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { creaPreferito, getPreferiti, rimuoviPreferito } from "../services/preferiti";

export function usePreferitiAnnunci() {
    const { accessToken } = useAuth();
    // Mappa annuncioId → preferitoId ({} = nessun preferito caricato).
    const [mappa, setMappa] = useState({});
    const [toggleInCorsoId, setToggleInCorsoId] = useState(null);

    // Svuota la mappa quando il token cambia (login, logout, refresh):
    // setState durante il render invece che nell'effect, come da
    // react.dev/learn/you-might-not-need-an-effect (adjusting state).
    const [tokenPrecedente, setTokenPrecedente] = useState(accessToken);
    if (tokenPrecedente !== accessToken) {
        setTokenPrecedente(accessToken);
        setMappa({});
    }

    useEffect(() => {
        if (!accessToken) return;
        let attivo = true; // evita setState dopo lo smontaggio
        getPreferiti(accessToken, "annuncio")
            .then((preferiti) => {
                if (!attivo) return;
                const nuova = {};
                for (const p of preferiti) {
                    // riferimento può essere null se l'annuncio è stato eliminato
                    if (p.riferimento?._id) nuova[p.riferimento._id] = p._id;
                }
                setMappa(nuova);
            })
            .catch(() => {
                // Errore non bloccante: i cuoricini partono spenti,
                // al primo toggle il backend risponde comunque (es. 409).
            });
        return () => {
            attivo = false;
        };
    }, [accessToken]);

    const isPreferito = useCallback((annuncioId) => Boolean(mappa[annuncioId]), [mappa]);

    const togglePreferito = useCallback(
        async (annuncio) => {
            if (!accessToken || toggleInCorsoId) return;
            setToggleInCorsoId(annuncio._id);
            try {
                const preferitoId = mappa[annuncio._id];
                if (preferitoId) {
                    await rimuoviPreferito(preferitoId, accessToken);
                    setMappa((prev) => {
                        const resto = { ...prev };
                        delete resto[annuncio._id];
                        return resto;
                    });
                } else {
                    const preferito = await creaPreferito(
                        { tipo: "annuncio", riferimento: annuncio._id },
                        accessToken
                    );
                    setMappa((prev) => ({ ...prev, [annuncio._id]: preferito._id }));
                }
            } finally {
                setToggleInCorsoId(null);
            }
        },
        [accessToken, mappa, toggleInCorsoId]
    );

    return { isPreferito, togglePreferito, toggleInCorsoId };
}
