const mongoose = require("mongoose");

const notificaSchema = new mongoose.Schema(
    {
        // Utente che deve ricevere la notifica.
        destinatario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Permette in futuro di aggiungere altri tipi di notifica.
        tipo: {
            type: String,
            enum: ["nuovo_annuncio_ricerca"],
            required: true,
            default: "nuovo_annuncio_ricerca",
        },

        // Annuncio che ha generato la notifica.
        annuncio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Annuncio",
            required: true,
        },

        // Una notifica può derivare da più ricerche salvate
        // dello stesso utente.
        ricercheSalvate: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "RicercaSalvata",
                },
            ],
            default: [],
        },

        titolo: {
            type: String,
            trim: true,
            required: true,
            maxlength: 120,
        },

        messaggio: {
            type: String,
            trim: true,
            required: true,
            maxlength: 500,
        },

        letta: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Recupero rapido delle notifiche di un utente,
// soprattutto quelle non ancora lette.
notificaSchema.index({
    destinatario: 1,
    letta: 1,
    createdAt: -1,
});

// Impedisce che lo stesso annuncio generi più notifiche
// dello stesso tipo per lo stesso utente.
notificaSchema.index(
    {
        destinatario: 1,
        tipo: 1,
        annuncio: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model(
    "Notifica",
    notificaSchema,
    "notifiche"
);