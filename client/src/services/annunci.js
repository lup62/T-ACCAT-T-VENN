/**
 * annunci.js — chiamate API verso il backend per gli annunci.
 *
 * Endpoint disponibili (server/routes/annuncioRoutes.js):
 *   GET   /api/annunci?tipo=...        → { message, count, annunci }
 *   GET   /api/annunci/miei?stato=...  → { message, count, annunci }  (richiede Bearer token)
 *   GET   /api/annunci/:id             → { message, annuncio }   (Bearer token facoltativo)
 *   POST  /api/annunci                 → { message, annuncio }   (richiede Bearer token)
 *   PATCH /api/annunci/:id/chiudi      → { message, annuncio }   (richiede Bearer token)
 *   PATCH /api/annunci/:id/concludi    → { message, annuncio }   (richiede Bearer token)
 *
 * Stesso pattern di AuthContext: base URL da VITE_API_URL
 * con fallback su localhost per lo sviluppo.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Lista annunci, opzionalmente filtrata per tipo
// ("richiesta_manodopera" | "disponibilita_lavoro").
export async function getAnnunci(tipo) {
    const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
    const res = await fetch(`${API_URL}/api/annunci${query}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nel recupero degli annunci.");
    }
    return data.annunci;
}

// Annunci creati dall'utente autenticato, in qualunque stato
// (aperto, in_corso, concluso, chiuso), dal più recente.
export async function getAnnunciMiei(accessToken) {
    const res = await fetch(`${API_URL}/api/annunci/miei`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nel recupero dei tuoi annunci.");
    }
    return data.annunci;
}

// Crea un nuovo annuncio. Il payload arriva già pronto da
// costruisciPayload (pubblicaAnnuncioForm.js); serve l'accessToken
// perché la rotta è protetta da requireAuth.
export async function creaAnnuncio(payload, accessToken) {
    const res = await fetch(`${API_URL}/api/annunci`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        // In caso di ValidationError il backend allega anche l'elenco
        // dei singoli errori: li mostriamo tutti, non solo il messaggio.
        const dettagli = Array.isArray(data.errors) ? ` ${data.errors.join(" ")}` : "";
        throw new Error((data.message || "Errore nella pubblicazione dell'annuncio.") + dettagli);
    }
    return data.annuncio;
}

// Chiude un annuncio ancora aperto. Solo l'autore può farlo; il backend
// rifiuta in automatico le proposte ancora in attesa.
export async function chiudiAnnuncio(id, accessToken) {
    const res = await fetch(`${API_URL}/api/annunci/${id}/chiudi`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nella chiusura dell'annuncio.");
    }
    return data.annuncio;
}

// Segna un annuncio come concluso. Solo l'autore può farlo e solo
// se l'annuncio è "in_corso" (cioè dopo aver accettato una proposta).
export async function concludiAnnuncio(id, accessToken) {
    const res = await fetch(`${API_URL}/api/annunci/${id}/concludi`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nella conclusione dell'annuncio.");
    }
    return data.annuncio;
}

// Dettaglio di un singolo annuncio per id. Il token è facoltativo (optionalAuth):
// senza, si vedono solo gli annunci aperti; con il token, autore e proponente
// accettato vedono anche i propri annunci in corso o conclusi.
export async function getAnnuncio(id, accessToken) {
    const res = await fetch(`${API_URL}/api/annunci/${id}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    const data = await res.json();
    if (!res.ok) {
        // Lo status permette alla pagina di distinguere il 404 (non esiste)
        // dal 401/403 (esiste ma non è visibile a questo utente).
        const errore = new Error(data.message || "Annuncio non trovato.");
        errore.status = res.status;
        throw errore;
    }
    return data.annuncio;
}
