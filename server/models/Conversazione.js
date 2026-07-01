const mongoose = require("mongoose");

// Rappresenta l'anteprima dell'ultimo messaggio,
// utile per mostrare velocemente la lista delle chat.
const ultimoMessaggioSchema = new mongoose.Schema(
    {
        testo: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        mittente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

const conversazioneSchema = new mongoose.Schema(
    {
        // Una chat privata deve avere esattamente due partecipanti.
        partecipanti: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            required: true,
            validate: {
                validator: function (value) {
                    return (
                        Array.isArray(value) &&
                        value.length === 2 &&
                        !value[0].equals(value[1])
                    );
                },
                message:
                    "Una conversazione deve avere esattamente due partecipanti diversi.",
            },
        },

        // Può essere null se la chat non nasce da un annuncio specifico.
        annuncioRiferimento: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Annuncio",
            default: null,
        },

        // Non contiene tutta la chat: solo l'ultimo messaggio,
        // per rendere più veloce la lista conversazioni.
        ultimoMessaggio: {
            type: ultimoMessaggioSchema,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Utile per recuperare velocemente le conversazioni di un utente.
conversazioneSchema.index({ partecipanti: 1, updatedAt: -1 });

module.exports = mongoose.model(
    "Conversazione",
    conversazioneSchema,
    "conversazioni"
);