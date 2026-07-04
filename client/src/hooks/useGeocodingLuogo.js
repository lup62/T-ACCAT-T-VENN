/**
 * useGeocodingLuogo.js
 *
 * Hook condiviso tra i form che geocodificano un campo di testo libero
 * (es. "Bari (BA)") al blur, tramite geocodificaLuogo().
 * Centralizza gli stati di caricamento/errore e la chiamata a Nominatim,
 * lasciando al chiamante la decisione su cosa fare con la posizione
 * trovata (o mancata): RegisterPage la azzera se il geocoding fallisce,
 * PubblicaAnnuncioPage la mantiene perché affinabile sulla mappa.
 *
 * Parametri:
 *   onTrovata(pos) — chiamata con { lat, lng } quando il geocoding riesce
 *   onNonTrovata() — opzionale, chiamata quando il luogo non viene trovato
 *                    o la richiesta fallisce (es. per azzerare la posizione)
 *   messaggi       — { nonTrovato, errore } testi mostrati all'utente
 *
 * Ritorna:
 *   { loading, errore, azzeraErrore, geocodifica }
 */

import { useState } from "react";
import { geocodificaLuogo } from "../services/geocoding";

export function useGeocodingLuogo({ onTrovata, onNonTrovata, messaggi }) {
    const [loading, setLoading] = useState(false);
    const [errore, setErrore] = useState("");

    const azzeraErrore = () => setErrore("");

    // Da collegare all'onBlur del campo: ignora testi troppo corti per
    // evitare chiamate inutili mentre l'utente sta ancora scrivendo.
    const geocodifica = async (testo) => {
        const pulito = testo.trim();
        if (!pulito || pulito.length < 3) return;

        setLoading(true);
        setErrore("");
        try {
            const pos = await geocodificaLuogo(pulito);
            if (pos) {
                onTrovata(pos);
            } else {
                onNonTrovata?.();
                setErrore(messaggi.nonTrovato);
            }
        } catch {
            onNonTrovata?.();
            setErrore(messaggi.errore);
        } finally {
            setLoading(false);
        }
    };

    return { loading, errore, azzeraErrore, geocodifica };
}
