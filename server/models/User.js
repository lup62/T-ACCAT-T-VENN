const mongoose = require("mongoose");

// Rappresenta un punto geografico in formato GeoJSON.
// L'ordine corretto è sempre: [longitudine, latitudine].
const posizioneSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (value) {
                    return (
                        Array.isArray(value) &&
                        value.length === 2 &&
                        value[0] >= -180 &&
                        value[0] <= 180 &&
                        value[1] >= -90 &&
                        value[1] <= 90
                    );
                },
                message:
                    "Le coordinate devono essere nel formato [longitudine, latitudine].",
            },
        },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        ruolo: {
            type: String,
            enum: ["lavoratore", "imprenditore"],
            required: true,
        },

        nome: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },

        cognome: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },

        dataNascita: {
            type: Date,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        telefono: {
            type: String,
            required: true,
            trim: true,
        },

        // Non verrà restituita normalmente nelle query.
        // Ci servirà nel login con .select("+passwordHash").
        passwordHash: {
            type: String,
            select: false,
        },

        oauth: {
            provider: {
                type: String,
                enum: ["google"],
            },
            providerId: {
                type: String,
            },
        },

        immagineProfilo: {
            type: String,
            default: "",
        },

        indirizzo: {
            testo: {
                type: String,
                required: true,
                trim: true,
            },
            posizione: {
                type: posizioneSchema,
                required: true,
            },
        },

        datiImprenditore: {
            pIva: {
                type: String,
                trim: true,
            },
            nomeAzienda: {
                type: String,
                trim: true,
            },
            sitoWeb: {
                type: String,
                trim: true,
            },
            social: {
                type: [String],
                default: [],
            },
        },

        datiLavoratore: {
            competenze: {
                type: [String],
                default: [],
            },
            cv: {
                type: String,
                default: "",
            },
            certificazioni: {
                type: [String],
                default: [],
            },
        },

        ratingMedio: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
    },
    {
        timestamps: true,
    }
);

// Indice geografico necessario per ricerca per distanza e mappa Leaflet.
userSchema.index({ "indirizzo.posizione": "2dsphere" });

// Un utente deve avere password oppure credenziali OAuth Google.
userSchema.pre("validate", function (next) {
    const haPassword = Boolean(this.passwordHash);
    const haOAuth = Boolean(this.oauth?.provider && this.oauth?.providerId);

    if (!haPassword && !haOAuth) {
        this.invalidate(
            "passwordHash",
            "L'utente deve avere una password oppure credenziali OAuth."
        );
    }

    next();
});

module.exports = mongoose.model("User", userSchema);