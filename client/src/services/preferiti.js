/**
 * preferiti.js — chiamate API verso il backend per i preferiti.
 *
 * Endpoint disponibili (server/routes/preferitoRoutes.js), tutti con Bearer token:
 *   GET    /api/preferiti?tipo=...   → { message, count, preferiti }
 *   POST   /api/preferiti            → { message, preferito }
 *   DELETE /api/preferiti/:id        → { message }
 *
 * Un preferito è { _id, tipo: "annuncio" | "profilo", riferimento } dove
 * riferimento è l'annuncio (o il profilo) popolato con i campi principali.
 * Attenzione: la DELETE vuole l'id del *preferito*, non del riferimento.
 *
 * Il backend rifiuta i preferiti sui propri annunci/profilo (400) e i
 * duplicati (409).
 *
 * Stesso pattern di annunci.js: base URL da VITE_API_URL con fallback
 * su localhost per lo sviluppo.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Lista dei preferiti dell'utente loggato, opzionalmente per tipo.
export async function getPreferiti(accessToken, tipo) {
    const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
    const res = await fetch(`${API_URL}/api/preferiti${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nel recupero dei preferiti.");
    }
    return data.preferiti;
}

// Salva un elemento nei preferiti: tipo "annuncio" | "profilo",
// riferimento = id dell'elemento. Ritorna il preferito creato.
export async function creaPreferito({ tipo, riferimento }, accessToken) {
    const res = await fetch(`${API_URL}/api/preferiti`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tipo, riferimento }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nel salvataggio del preferito.");
    }
    return data.preferito;
}

// Rimuove un preferito per id (l'id del preferito, non del riferimento).
export async function rimuoviPreferito(id, accessToken) {
    const res = await fetch(`${API_URL}/api/preferiti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nella rimozione del preferito.");
    }
}
