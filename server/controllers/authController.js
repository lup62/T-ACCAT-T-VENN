const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
function utenteCorrente(req, res) {
    return res.status(200).json({
        message: "Utente autenticato correttamente.",
        utente: req.utente,
    });
}

module.exports = { registrati, accedi, utenteCorrente };