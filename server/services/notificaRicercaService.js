const RicercaSalvata = require("../models/RicercaSalvata");
const Notifica = require("../models/Notifica");

const {
    annuncioCorrispondeARicerca,
} = require("../utils/ricercaSalvataMatcher");

async function generaNotifichePerNuovoAnnuncio(annuncio) {
    const ricercheAttive = await RicercaSalvata.find({
        attiva: true,
        tipoAnnuncio: annuncio.tipo,
    });

    const autoreAnnuncioId =
        annuncio.autore?.toString();

    const matchPerUtente = new Map();

    for (const ricercaSalvata of ricercheAttive) {
        const utenteId =
            ricercaSalvata.utente.toString();

        // L'autore dell'annuncio non deve ricevere
        // una notifica per il proprio annuncio.
        if (utenteId === autoreAnnuncioId) {
            continue;
        }

        if (
            !annuncioCorrispondeARicerca(
                annuncio,
                ricercaSalvata
            )
        ) {
            continue;
        }

        if (!matchPerUtente.has(utenteId)) {
            matchPerUtente.set(utenteId, []);
        }

        matchPerUtente
            .get(utenteId)
            .push(ricercaSalvata._id);
    }

    const notifiche = [];

    for (const [
        destinatario,
        ricercheSalvate,
    ] of matchPerUtente.entries()) {
        const notifica = await Notifica.findOneAndUpdate(
            {
                destinatario,
                tipo: "nuovo_annuncio_ricerca",
                annuncio: annuncio._id,
            },
            {
                $setOnInsert: {
                    titolo: "Nuovo annuncio compatibile",
                    messaggio:
                        `Il nuovo annuncio "${annuncio.titolo}" ` +
                        "corrisponde a una delle tue ricerche salvate.",
                    letta: false,
                },

                $addToSet: {
                    ricercheSalvate: {
                        $each: ricercheSalvate,
                    },
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        notifiche.push(notifica);
    }

    return notifiche;
}

module.exports = {
    generaNotifichePerNuovoAnnuncio,
};