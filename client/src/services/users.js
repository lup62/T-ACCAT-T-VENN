/**
 * users.js — chiamate API verso il backend per il profilo utente.
 *
 * Endpoint disponibili (server/routes/userRoutes.js + authRoutes.js):
 *   GET   /api/auth/me    → { message, utente }   (profilo completo, richiede Bearer token)
 *   PATCH /api/users/me   → { message, utente }   (modifica profilo, richiede Bearer token)
 *   GET   /api/users/:id  → { message, utente }   (profilo pubblico, senza auth)
 *
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Profilo completo dell'utente autenticato: rispetto ai dati salvati al
// login include anche telefono, indirizzo, datiLavoratore e datiImprenditore.
export async function getProfilo(accessToken) {
    const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Errore nel recupero del profilo.");
    }
    return data.utente;
}

// Profilo pubblico di un utente: solo i campi visibili a tutti
// (niente email, telefono o posizione precisa).
export async function getProfiloPubblico(id) {
    const res = await fetch(`${API_URL}/api/users/${id}`);
    const data = await res.json();
    if (!res.ok) {
        // Lo status permette alla pagina di distinguere il 404/400
        // (utente inesistente) da un errore del server.
        const errore = new Error(data.message || "Utente non trovato.");
        errore.status = res.status;
        throw errore;
    }
    return data.utente;
}

// Aggiorna il profilo. Il backend accetta solo i campi modificabili
// (nome, cognome, telefono, indirizzo, datiLavoratore, datiImprenditore)
// e restituisce il profilo completo aggiornato.
export async function aggiornaProfilo(payload, accessToken) {
    const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
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
        throw new Error((data.message || "Errore nell'aggiornamento del profilo.") + dettagli);
    }
    return data.utente;
}
