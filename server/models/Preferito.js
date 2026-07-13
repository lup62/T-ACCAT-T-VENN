const mongoose = require("mongoose");

const preferitoSchema = new mongoose.Schema(
    {
        utente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        tipo: {
            type: String,
            enum: ["annuncio", "profilo"],
            required: true,
        },

        riferimento: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "modelloRiferimento",
        },

        modelloRiferimento: {
            type: String,
            enum: ["Annuncio", "User"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

preferitoSchema.index(
    { utente: 1, tipo: 1, riferimento: 1 },
    { unique: true }
);

preferitoSchema.pre("validate", function () {
    if (this.tipo === "annuncio") {
        this.modelloRiferimento = "Annuncio";
    }

    if (this.tipo === "profilo") {
        this.modelloRiferimento = "User";
    }
});

module.exports = mongoose.model("Preferito", preferitoSchema, "preferiti");