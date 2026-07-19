/**
 * conversazioni.js — chiamate API verso il backend per la chat 1:1.
 *
 * Endpoint disponibili (server/routes/conversazioneRoutes.js), tutti protetti
 * da requireAuth quindi ogni funzione richiede l'accessToken:
 *   GET   /api/conversazioni                          → { message, count, conversazioni }
 *   POST  /api/conversazioni                          → { message, conversazione } (200 se esisteva già, 201 se creata)
 *   GET   /api/conversazioni/:id/messaggi             → { message, count, messaggi }
 *   PATCH /api/conversazioni/:id/messaggi/letti       → { message, count }
 *
 * L'invio dei messaggi NON passa da qui: avviene via Socket.IO
 * (vedi hooks/useChatSocket.js), che li persiste e li rimanda in tempo
 * reale a entrambi i partecipanti.
 *
 * Stesso pattern di proposte.js: base URL da VITE_API_URL con fallback
 * su localhost per lo sviluppo.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function richiesta(percorso, accessToken, options = {}) {
    const res = await fetch(`${API_URL}/api/conversazioni${percorso}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nella gestione della conversazione.");
    }
    return data;
}

// Tutte le conversazioni dell'utente, ordinate dalla più recente.
// I partecipanti arrivano popolati (nome, cognome, ruoli, ratingMedio),
// l'eventuale annuncio di riferimento con titolo/tipo/stato.
export async function getConversazioni(accessToken) {
    const data = await richiesta("", accessToken);
    return data.conversazioni;
}

// Apre (o recupera, se esiste già) la conversazione con un altro utente.
// annuncioRiferimento è facoltativo: se presente deve appartenere a uno
// dei due partecipanti, altrimenti il backend risponde 403.
export async function creaORecuperaConversazione(destinatarioId, annuncioRiferimento, accessToken) {
    const data = await richiesta("", accessToken, {
        method: "POST",
        body: JSON.stringify({ destinatarioId, annuncioRiferimento }),
    });
    return data.conversazione;
}

// Storico messaggi di una conversazione, in ordine cronologico.
export async function getMessaggiConversazione(conversazioneId, accessToken) {
    const data = await richiesta(`/${conversazioneId}/messaggi`, accessToken);
    return data.messaggi;
}

// Segna come letti i messaggi ricevuti nella conversazione.
export async function segnaMessaggiLetti(conversazioneId, accessToken) {
    const data = await richiesta(`/${conversazioneId}/messaggi/letti`, accessToken, {
        method: "PATCH",
    });
    return data.count;
}
