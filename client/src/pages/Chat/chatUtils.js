/**
 * chatUtils.js — piccole utility condivise dai componenti della chat.
 * (File separato dai componenti per la regola react-refresh/only-export-components.)
 */

// L'altro partecipante della conversazione (quella 1:1 ne ha sempre due).
export function altroPartecipante(conversazione, mioId) {
    return conversazione.partecipanti?.find((p) => p._id !== mioId) ?? null;
}

// Iniziali per l'avatar, es. "Mario Rossi" → "MR".
export function iniziali(persona) {
    return (
        `${persona?.nome?.[0] ?? ""}${persona?.cognome?.[0] ?? ""}`.toUpperCase() || "?"
    );
}
