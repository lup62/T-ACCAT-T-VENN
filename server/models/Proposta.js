const mongoose = require("mongoose");

const propostaSchema = new mongoose.Schema(
    {
        // Annuncio a cui questa proposta si riferisce.
        annuncio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Annuncio",
            required: true,
        },

        // Utente che invia la proposta.
        proponente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Autore dell'annuncio, che può accettare o rifiutare.
        destinatario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Messaggio facoltativo di presentazione.
        messaggio: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        stato: {
            type: String,
            enum: ["in_attesa", "accettata", "rifiutata"],
            default: "in_attesa",
        },

        // Data automatica al momento della creazione.
        dataProposta: {
            type: Date,
            default: Date.now,
        },

        // Rimane null finché il destinatario non accetta o rifiuta.
        dataRisposta: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Evita che lo stesso utente invii due proposte attive
// sullo stesso annuncio nello stesso momento.
// Se una proposta viene rifiutata, potrà inviarne una nuova.
propostaSchema.index(
    { annuncio: 1, proponente: 1 },
    {
        unique: true,
        partialFilterExpression: {
            stato: { $in: ["in_attesa", "accettata"] },
        },
    }
);

// Un utente non può inviare una proposta al proprio annuncio.
propostaSchema.pre("validate", function (next) {
    if (
        this.proponente &&
        this.destinatario &&
        this.proponente.equals(this.destinatario)
    ) {
        this.invalidate(
            "destinatario",
            "Non puoi inviare una proposta al tuo stesso annuncio."
        );
    }

    next();
});

module.exports = mongoose.model("Proposta", propostaSchema, "proposte");