/**
 * useAuth.js
 *
 * Hook centralizzato per lo stato di autenticazione.
 * Tutti i componenti che devono sapere se l'utente è loggato
 * lo leggono da qui — così quando il backend sarà pronto
 * basterà aggiornare questo file solo.
 *
 * TODO: sostituire i valori hardcoded con la lettura reale
 *       da context/store/token JWT quando il backend sarà pronto.
 */

export function useAuth() {
    return {
        isLoggedIn: false,
        utente: null,
    };
}
