import { createContext, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY = "auth";

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
