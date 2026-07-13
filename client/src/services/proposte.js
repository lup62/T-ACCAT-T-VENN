/**
 * proposte.js — chiamate API verso il backend per le proposte.
 *
 * Endpoint disponibili (server/routes/propostaRoutes.js), tutti protetti
 * da requireAuth quindi ogni funzione richiede l'accessToken:
 *   POST  /api/proposte              → { message, proposta }
 *   GET   /api/proposte/ricevute     → { message, count, proposte }
 *   GET   /api/proposte/inviate      → { message, count, proposte }
 *   PATCH /api/proposte/:id/accetta  → { message, proposta }
 *   PATCH /api/proposte/:id/rifiuta  → { message, proposta }
 *
 * Stesso pattern di annunci.js: base URL da VITE_API_URL con fallback
 * su localhost per lo sviluppo.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function richiesta(percorso, accessToken, options = {}) {
    const res = await fetch(`${API_URL}/api/proposte${percorso}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nella gestione della proposta.");
    }
    return data;
}

// Invia una proposta per un annuncio; il messaggio è facoltativo.
// Il backend rifiuta: annunci non aperti, proposte duplicate (409)
// e proposte al proprio stesso annuncio (403).
export async function creaProposta(annuncioId, messaggio, accessToken) {
    const data = await richiesta("", accessToken, {
        method: "POST",
        body: JSON.stringify({ annuncio: annuncioId, messaggio }),
    });
    return data.proposta;
}

// Proposte ricevute sui propri annunci (per il destinatario).
export async function getProposteRicevute(accessToken) {
    const data = await richiesta("/ricevute", accessToken);
    return data.proposte;
}

// Proposte inviate dall'utente corrente (per il proponente).
export async function getProposteInviate(accessToken) {
    const data = await richiesta("/inviate", accessToken);
    return data.proposte;
}

// Accetta una proposta ricevuta: il backend mette l'annuncio "in_corso"
// e rifiuta automaticamente le altre proposte in attesa.
export async function accettaProposta(propostaId, accessToken) {
    const data = await richiesta(`/${propostaId}/accetta`, accessToken, {
        method: "PATCH",
    });
    return data.proposta;
}

// Rifiuta una proposta ricevuta.
export async function rifiutaProposta(propostaId, accessToken) {
    const data = await richiesta(`/${propostaId}/rifiuta`, accessToken, {
        method: "PATCH",
    });
    return data.proposta;
}
