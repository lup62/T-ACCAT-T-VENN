const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

function generaAccessToken(user) {
    return jwt.sign(
        {
            userId: user._id.toString(),
            ruoli: user.ruoli,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m",
        }
    );
}
const DURATA_REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

function generaRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function calcolaScadenzaRefreshToken() {
    return new Date(Date.now() + DURATA_REFRESH_TOKEN_MS);
}

function opzioniCookieRefreshToken() {
    const produzione = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: produzione,
        sameSite: produzione ? "none" : "lax",
        maxAge: DURATA_REFRESH_TOKEN_MS,
    };
}
function opzioniClearCookieRefreshToken() {
    const produzione = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: produzione,
        sameSite: produzione ? "none" : "lax",
    };
}

async function creaRefreshToken(utente, res) {
    const refreshToken = generaRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await RefreshToken.create({
        utente: utente._id,
        tokenHash,
        scadenza: calcolaScadenzaRefreshToken(),
    });

    res.cookie(
        "refreshToken",
        refreshToken,
        opzioniCookieRefreshToken()
    );
}

async function registrati(req, res) {
    try {
        const {
            ruoli,
            nome,
            cognome,
            dataNascita,
            email,
            telefono,
            password,
            indirizzo,
            immagineProfilo,
            datiLavoratore,
            datiImprenditore,
        } = req.body;

        if (
            !ruoli ||
            !nome ||
            !cognome ||
            !dataNascita ||
            !email ||
            !telefono ||
            !password ||
            !indirizzo
        ) {
            return res.status(400).json({
                message: "Compila tutti i campi obbligatori.",
            });
        }

        const ruoliValidi = ["lavoratore", "imprenditore"];

        const ruoliNonValidi =
            !Array.isArray(ruoli) ||
            ruoli.length === 0 ||
            ruoli.length > 2 ||
            ruoli.some((ruolo) => !ruoliValidi.includes(ruolo)) ||
            new Set(ruoli).size !== ruoli.length;

        if (ruoliNonValidi) {
            return res.status(400).json({
                message:
                    "Seleziona almeno un ruolo valido, senza duplicati.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "La password deve contenere almeno 8 caratteri.",
            });
        }

        const emailNormalizzata = email.trim().toLowerCase();

        const utenteEsistente = await User.findOne({
            email: emailNormalizzata,
        });

        if (utenteEsistente) {
            return res.status(409).json({
                message: "Esiste già un utente registrato con questa email.",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const utente = await User.create({
            ruoli,
            nome,
            cognome,
            dataNascita,
            email: emailNormalizzata,
            telefono,
            passwordHash,
            indirizzo,
            immagineProfilo: immagineProfilo || "",
            datiLavoratore: ruoli.includes("lavoratore")
                ? datiLavoratore || {}
                : undefined,
            datiImprenditore: ruoli.includes("imprenditore")
                ? datiImprenditore || {}
                : undefined,
        });

        const accessToken = generaAccessToken(utente);
        await creaRefreshToken(utente, res);

        return res.status(201).json({
            message: "Registrazione completata con successo.",
            accessToken,
            utente: {
                id: utente._id,
                ruoli: utente.ruoli,
                nome: utente.nome,
                cognome: utente.cognome,
                email: utente.email,
                immagineProfilo: utente.immagineProfilo,
                ratingMedio: utente.ratingMedio,
            },
        });
    } catch (error) {
        console.error("Errore durante la registrazione:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Dati di registrazione non validi.",
                errors: Object.values(error.errors).map(
                    (errore) => errore.message
                ),
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Esiste già un utente registrato con questa email.",
            });
        }

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function accedi(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email e password sono obbligatorie.",
            });
        }

        const emailNormalizzata = email.trim().toLowerCase();

        const utente = await User.findOne({
            email: emailNormalizzata,
        }).select("+passwordHash");

        if (!utente || !utente.passwordHash) {
            return res.status(401).json({
                message: "Email o password non corretti.",
            });
        }

        const passwordCorretta = await bcrypt.compare(
            password,
            utente.passwordHash
        );

        if (!passwordCorretta) {
            return res.status(401).json({
                message: "Email o password non corretti.",
            });
        }

        const accessToken = generaAccessToken(utente);
        await creaRefreshToken(utente, res);

        return res.status(200).json({
            message: "Accesso effettuato con successo.",
            accessToken,
            utente: {
                id: utente._id,
                ruoli: utente.ruoli,
                nome: utente.nome,
                cognome: utente.cognome,
                email: utente.email,
                immagineProfilo: utente.immagineProfilo,
                ratingMedio: utente.ratingMedio,
            },
        });
    } catch (error) {
        console.error("Errore durante il login:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function rinnovaAccessToken(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token mancante.",
            });
        }

        const tokenHash = hashToken(refreshToken);

        const sessione = await RefreshToken.findOne({
            tokenHash,
        });

        if (!sessione) {
            return res.status(401).json({
                message: "Refresh token non valido.",
            });
        }

        if (sessione.revocatoIl) {
            return res.status(401).json({
                message: "Refresh token revocato.",
            });
        }

        if (sessione.scadenza < new Date()) {
            return res.status(401).json({
                message: "Refresh token scaduto.",
            });
        }

        const utente = await User.findById(sessione.utente);

        if (!utente) {
            return res.status(401).json({
                message: "Utente non trovato o non più valido.",
            });
        }

        const accessToken = generaAccessToken(utente);

        return res.status(200).json({
            message: "Access token rinnovato con successo.",
            accessToken,
        });
    } catch (error) {
        console.error("Errore durante il refresh del token:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);

            await RefreshToken.findOneAndUpdate(
                {
                    tokenHash,
                    revocatoIl: null,
                },
                {
                    revocatoIl: new Date(),
                }
            );
        }

        res.clearCookie(
            "refreshToken",
            opzioniClearCookieRefreshToken()
        );

        return res.status(200).json({
            message: "Logout effettuato con successo.",
        });
    } catch (error) {
        console.error("Errore durante il logout:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}
function utenteCorrente(req, res) {
    return res.status(200).json({
        message: "Utente autenticato correttamente.",
        utente: req.utente,
    });
}

module.exports = {
    registrati,
    accedi,
    rinnovaAccessToken,
    logout,
    utenteCorrente,
};