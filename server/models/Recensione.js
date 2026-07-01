const mongoose = require("mongoose");

const recensioneSchema = new mongoose.Schema(
    {
        // Annuncio concluso a cui si riferisce la recensione.
        annuncio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Annuncio",
            required: true,
        },

        // Utente che scrive la recensione.
        autore: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Utente che riceve la recensione.
        destinatario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Indica il verso della recensione.
        direzione: {
            type: String,
            enum: [
                "imprenditore_a_lavoratore",
                "lavoratore_a_imprenditore",
            ],
            required: true,
        },

        stelle: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        commento: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Impedisce recensioni duplicate:
// stesso annuncio + stesso autore + stesso destinatario.
recensioneSchema.index(
    { annuncio: 1, autore: 1, destinatario: 1 },
    { unique: true }
);

// Nessuno può recensire sé stesso.
recensioneSchema.pre("validate", function () {
    if (
        this.autore &&
        this.destinatario &&
        this.autore.equals(this.destinatario)
    ) {
        this.invalidate(
            "destinatario",
            "Non puoi lasciare una recensione a te stesso."
        );
    };
});

module.exports = mongoose.model(
    "Recensione",
    recensioneSchema,
    "recensioni"
);