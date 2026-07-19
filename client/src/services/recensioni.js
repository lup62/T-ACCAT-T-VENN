/**
 * recensioni.js — chiamate API verso il backend per le recensioni.
 *
 * Endpoint disponibili (server/routes/recensioneRoutes.js):
 *   POST /api/recensioni                        → { message, recensione }          (richiede Bearer token)
 *   GET  /api/recensioni/annuncio/:annuncioId   → { message, count, recensioni }   (pubblico)
 *   GET  /api/recensioni/utente/:utenteId       → { message, count, recensioni }   (pubblico)
 *
 * Il backend accetta la recensione solo se l'annuncio è "concluso",
 * esiste una proposta accettata e autore/destinatario sono le due parti
 * della collaborazione. Duplicati → 409 con messaggio dedicato.
 *
 * Stesso pattern di annunci.js: base URL da VITE_API_URL con fallback
 * su localhost per lo sviluppo.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Crea una recensione: stelle intere 1–5, commento facoltativo.
export async function creaRecensione({ annuncio, destinatario, stelle, commento }, accessToken) {
    const res = await fetch(`${API_URL}/api/recensioni`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ annuncio, destinatario, stelle, commento }),
    });
    const data = await res.json();
    if (!res.ok) {
        const dettagli = Array.isArray(data.errors) ? ` ${data.errors.join(" ")}` : "";
        throw new Error((data.message || "Errore nell'invio della recensione.") + dettagli);
    }
    return data.recensione;
}

// Recensioni collegate a un annuncio, con autore/destinatario popolati.
// Usata per capire quali controparti l'utente loggato ha già recensito.
export async function getRecensioniAnnuncio(annuncioId) {
    const res = await fetch(`${API_URL}/api/recensioni/annuncio/${annuncioId}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nel recupero delle recensioni.");
    }
    return data.recensioni;
}

// Recensioni ricevute da un utente, dalla più recente.
export async function getRecensioniUtente(utenteId) {
    const res = await fetch(`${API_URL}/api/recensioni/utente/${utenteId}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nel recupero delle recensioni.");
    }
    return data.recensioni;
}
