/**
 * ricercheSalvate.js — chiamate API verso il backend per le ricerche salvate.
 *
 * Endpoint disponibili (server/routes/ricercaSalvataRoutes.js),
 * tutti protetti da Bearer token:
 *   GET    /api/ricerche-salvate      → { message, count, ricercheSalvate }
 *   POST   /api/ricerche-salvate      → { message, ricercaSalvata }
 *   PATCH  /api/ricerche-salvate/:id  → { message, ricercaSalvata }
 *   DELETE /api/ricerche-salvate/:id  → { message }
 *
 * Una ricerca salvata contiene il tipo di annuncio, l'eventuale testo
 * di ricerca, i filtri applicati e lo stato attiva/disattiva.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Recupera tutte le ricerche salvate dell'utente autenticato.
export async function getRicercheSalvate(accessToken) {
    const res = await fetch(`${API_URL}/api/ricerche-salvate`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            data.message ||
            "Errore nel recupero delle ricerche salvate."
        );
    }

    return data.ricercheSalvate;
}

// Crea una nuova ricerca salvata partendo dai filtri correnti.
export async function creaRicercaSalvata(payload, accessToken) {
    const res = await fetch(`${API_URL}/api/ricerche-salvate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        const dettagli = Array.isArray(data.errors)
            ? ` ${data.errors.join(" ")}`
            : "";

        throw new Error(
            (data.message ||
                "Errore nel salvataggio della ricerca.") +
            dettagli
        );
    }

    return data.ricercaSalvata;
}

// Modifica solo i campi indicati della ricerca salvata.
export async function modificaRicercaSalvata(
    id,
    modifiche,
    accessToken
) {
    const res = await fetch(
        `${API_URL}/api/ricerche-salvate/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(modifiche),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        const dettagli = Array.isArray(data.errors)
            ? ` ${data.errors.join(" ")}`
            : "";

        throw new Error(
            (data.message ||
                "Errore nella modifica della ricerca salvata.") +
            dettagli
        );
    }

    return data.ricercaSalvata;
}

// Elimina definitivamente una ricerca salvata.
export async function eliminaRicercaSalvata(id, accessToken) {
    const res = await fetch(
        `${API_URL}/api/ricerche-salvate/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            data.message ||
            "Errore nell'eliminazione della ricerca salvata."
        );
    }
}
