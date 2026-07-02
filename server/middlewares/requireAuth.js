const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (
            !authorizationHeader ||
            !authorizationHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                message: "Token di accesso mancante o in formato non valido.",
            });
        }

        const accessToken = authorizationHeader.substring("Bearer ".length);

        const payload = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_SECRET
        );

        const utente = await User.findById(payload.userId);

        if (!utente) {
            return res.status(401).json({
                message: "Utente non trovato o non più valido.",
            });
        }

        req.utente = {
            id: utente._id.toString(),
            ruoli: utente.ruoli,
            email: utente.email,
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Il token di accesso è scaduto.",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Token di accesso non valido.",
            });
        }

        console.error("Errore nel middleware requireAuth:", error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = requireAuth;