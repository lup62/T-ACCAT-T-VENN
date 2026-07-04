/**
 * useAuth.js
 *
 * Hook per leggere lo stato di autenticazione (isLoggedIn, utente,
 * accessToken) e le azioni (registrati, logout) da AuthContext.
 * Deve essere usato all'interno di <AuthProvider>.
 */

import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve essere usato dentro <AuthProvider>.");
    }

    return context;
}
