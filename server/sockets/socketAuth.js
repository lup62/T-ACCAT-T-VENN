const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function socketAuth(socket, next) {
    try {
        const accessToken = socket.handshake.auth?.token;

        if (!accessToken) {
            return next(
                new Error("Token di accesso mancante.")
            );
        }

        const payload = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_SECRET
        );

        const utente = await User.findById(payload.userId);

        if (!utente) {
            return next(
                new Error("Utente non trovato o non più valido.")
            );
        }

        socket.utente = {
            id: utente._id.toString(),
            email: utente.email,
            ruoli: utente.ruoli,
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(
                new Error("Token di accesso scaduto.")
            );
        }

        if (error.name === "JsonWebTokenError") {
            return next(
                new Error("Token di accesso non valido.")
            );
        }

        console.error(
            "Errore durante l'autenticazione Socket.IO:",
            error
        );

        return next(
            new Error(
                "Errore durante l'autenticazione della connessione."
            )
        );
    }
}

module.exports = socketAuth;