function requireRole(...ruoliConsentiti) {
    return function (req, res, next) {
        if (!req.utente) {
            return res.status(401).json({
                message: "Utente non autenticato.",
            });
        }

        const haRuoloConsentito = ruoliConsentiti.some((ruolo) =>
            req.utente.ruoli.includes(ruolo)
        );

        if (!haRuoloConsentito) {
            return res.status(403).json({
                message: "Non hai i permessi per questa operazione.",
            });
        }

        next();
    };
}

module.exports = requireRole;