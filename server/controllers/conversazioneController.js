const Conversazione = require("../models/Conversazione");

async function listaConversazioni(req, res) {
    try {
        const conversazioni = await Conversazione.find({
            partecipanti: req.utente.id,
        })
            .populate(
                "partecipanti",
                "nome cognome immagineProfilo ruoli ratingMedio"
            )
            .populate(
                "annuncioRiferimento",
                "titolo tipo stato"
            )
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            message: "Conversazioni recuperate con successo.",
            count: conversazioni.length,
            conversazioni,
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero delle conversazioni:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}

module.exports = {
    listaConversazioni,
};
