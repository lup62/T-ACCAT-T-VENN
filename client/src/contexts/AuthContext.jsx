/**
 * AuthContext.jsx
 *
 * Stato di autenticazione globale (sessione utente + accessToken) esposto
 * tramite React Context. Va letto tramite l'hook useAuth(), non importato
 * direttamente nei componenti.
 *
 * NOTA: l'access token qui è persistito in localStorage per sopravvivere
 * al refresh della pagina in fase di sviluppo. La convenzione ufficiale del
 * progetto prevede access token solo in memoria e refresh token in cookie
 * httpOnly — questa persistenza va rimossa quando si collega il flusso
 * /api/auth/refresh.
 */

import { createContext, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY = "auth";

// Ripristina la sessione salvata all'avvio dell'app (se presente e valida).
function leggiSessioneSalvata() {
    try {
        const salvata = localStorage.getItem(STORAGE_KEY);
        return salvata ? JSON.parse(salvata) : null;
    } catch {
        return null;
    }
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [sessione, setSessione] = useState(leggiSessioneSalvata);

    // Registra l'utente e apre subito la sessione con i dati restituiti
    // dal backend (nessun login separato dopo la registrazione).
    async function registrati(datiRegistrazione) {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datiRegistrazione),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registrazione fallita.");
        }

        const nuovaSessione = { accessToken: data.accessToken, utente: data.utente };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuovaSessione));
        setSessione(nuovaSessione);

        return data.utente;
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY);
        setSessione(null);
    }

    const value = {
        isLoggedIn: Boolean(sessione),
        utente: sessione?.utente ?? null,
        accessToken: sessione?.accessToken ?? null,
        registrati,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
