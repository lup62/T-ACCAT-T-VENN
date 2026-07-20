const mongoose = require("mongoose");

const messaggioSchema = new mongoose.Schema(
    {
        // Conversazione a cui appartiene il messaggio.
        conversazione: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversazione",
            required: true,
            index: true,
        },

        // Utente che ha inviato il messaggio.
        mittente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Testo del messaggio.
        testo: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        // Indica se il messaggio è stato letto dal destinatario.
        letto: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Recupero rapido dei messaggi di una conversazione in ordine cronologico.
messaggioSchema.index({ conversazione: 1, createdAt: 1 });

module.exports = mongoose.model("Messaggio", messaggioSchema, "messaggi");