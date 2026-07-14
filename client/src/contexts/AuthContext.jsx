/**
 * AuthContext.jsx
 *
 * Stato di autenticazione globale (sessione utente + accessToken) esposto
 * tramite React Context. Va letto tramite l'hook useAuth(), non importato
 * direttamente nei componenti.
 *
 * Convenzione del progetto:
 *   - access token SOLO in memoria (scade dopo 15 minuti)
 *   - refresh token in cookie httpOnly, gestito interamente dal backend
 *   - in localStorage resta solo il profilo utente (dati non sensibili),
 *     per mostrare subito nome/avatar al reload della pagina
 *
 * Al reload la sessione viene ripristinata chiamando POST /api/auth/refresh:
 * se il cookie è ancora valido otteniamo un token nuovo, altrimenti si torna
 * sloggati. Il token viene poi rinnovato in automatico prima della scadenza.
 */

import { createContext, useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY_UTENTE = "utente";

// L'access token dura 15 minuti: lo rinnoviamo un po' prima della scadenza.
const INTERVALLO_RINNOVO_MS = 13 * 60 * 1000;

function leggiUtenteSalvato() {
    try {
        const salvato = localStorage.getItem(STORAGE_KEY_UTENTE);
        return salvato ? JSON.parse(salvato) : null;
    } catch {
        return null;
    }
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null);
    const [utente, setUtente] = useState(null);
    // true finché non abbiamo provato a ripristinare la sessione dal cookie:
    // le pagine protette possono usarlo per non mostrare il blocco "accedi"
    // durante il primissimo caricamento.
    const [inizializzazione, setInizializzazione] = useState(true);

    function avviaSessione(data) {
        localStorage.setItem(STORAGE_KEY_UTENTE, JSON.stringify(data.utente));
        setUtente(data.utente);
        setAccessToken(data.accessToken);
        return data.utente;
    }

    // Sostituisce il profilo in stato e cache locale: usato dopo
    // PATCH /api/users/me, che restituisce il profilo completo aggiornato.
    function aggiornaUtente(utenteAggiornato) {
        localStorage.setItem(STORAGE_KEY_UTENTE, JSON.stringify(utenteAggiornato));
        setUtente(utenteAggiornato);
    }

    function chiudiSessioneLocale() {
        localStorage.removeItem(STORAGE_KEY_UTENTE);
        setUtente(null);
        setAccessToken(null);
    }

    // Chiede un nuovo access token usando il cookie httpOnly di refresh.
    // Ritorna il token nuovo, o null se la sessione non è più valida.
    const rinnovaAccessToken = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) return null;
            const data = await res.json();
            setAccessToken(data.accessToken);
            return data.accessToken;
        } catch {
            return null;
        }
    }, []);

    // Ripristino della sessione all'avvio dell'app.
    useEffect(() => {
        // Pulizia della vecchia chiave che conteneva anche l'access token.
        localStorage.removeItem("auth");

        (async () => {
            const token = await rinnovaAccessToken();
            if (!token) {
                chiudiSessioneLocale();
                setInizializzazione(false);
                return;
            }

            // Profilo dalla cache locale; se manca (es. storage pulito)
            // recuperiamo almeno id/ruoli/email da GET /me.
            const salvato = leggiUtenteSalvato();
            if (salvato) {
                setUtente(salvato);
            } else {
                try {
                    const res = await fetch(`${API_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    if (res.ok) setUtente(data.utente);
                } catch {
                    // il token è valido: la sessione resta aperta anche senza profilo
                }
            }
            setInizializzazione(false);
        })();
    }, [rinnovaAccessToken]);

    // Rinnovo periodico del token prima che scada.
    useEffect(() => {
        if (!accessToken) return undefined;

        const timer = setTimeout(async () => {
            const token = await rinnovaAccessToken();
            if (!token) chiudiSessioneLocale();
        }, INTERVALLO_RINNOVO_MS);

        return () => clearTimeout(timer);
    }, [accessToken, rinnovaAccessToken]);

    // Registra l'utente e apre subito la sessione con i dati restituiti
    // dal backend (nessun login separato dopo la registrazione).
    async function registrati(datiRegistrazione) {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(datiRegistrazione),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registrazione fallita.");
        }

        return avviaSessione(data);
    }

    async function accedi(email, password) {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Accesso fallito.");
        }

        return avviaSessione(data);
    }

    // Revoca il refresh token sul server e chiude la sessione locale;
    // anche se il server non risponde, localmente si esce comunque.
    async function logout() {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // ignorato: la sessione locale viene chiusa in ogni caso
        }
        chiudiSessioneLocale();
    }

    const value = {
        isLoggedIn: Boolean(accessToken),
        utente,
        accessToken,
        inizializzazione,
        registrati,
        accedi,
        logout,
        rinnovaAccessToken,
        aggiornaUtente,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
