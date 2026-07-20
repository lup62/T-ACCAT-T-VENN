const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const utente = await User.findById(decoded.userId).select(
            "_id email ruoli"
        );

        if (utente) {
            req.utente = {
                id: utente._id.toString(),
                email: utente.email,
                ruoli: utente.ruoli,
            };
        }

        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Token non valido o scaduto.",
        });
    }
}

module.exports = optionalAuth;