/**
 * annunci.js — chiamate API verso il backend per gli annunci.
 *
 * Endpoint disponibili (server/routes/annuncioRoutes.js):
 *   GET /api/annunci?tipo=...   → { message, count, annunci }
 *   GET /api/annunci/:id        → { message, annuncio }
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

// Dettaglio di un singolo annuncio per id.
export async function getAnnuncio(id) {
    const res = await fetch(`${API_URL}/api/annunci/${id}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Annuncio non trovato.");
    }
    return data.annuncio;
}
