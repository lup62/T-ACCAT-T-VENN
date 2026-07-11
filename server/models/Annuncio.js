const mongoose = require("mongoose");

// Punto geografico GeoJSON.
// MongoDB usa sempre: [longitudine, latitudine].
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

const annuncioSchema = new mongoose.Schema(
    {
        tipo: {
            type: String,
            enum: ["richiesta_manodopera", "disponibilita_lavoro"],
            required: true,
        },

        autore: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        titolo: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 120,
        },

        descrizione: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 2000,
        },

        luogo: {
            testo: {
                type: String,
                required: true,
                trim: true,
            },

            posizione: {
    type: posizioneSchema,
},

            // Utile soprattutto per l'annuncio di disponibilità:
            // il lavoratore può indicare una zona raggiungibile.
            raggioKm: {
                type: Number,
                default: 0,
                min: 0,
                max: 200,
            },
        },

        periodo: {
            dataInizio: {
                type: Date,
                required: true,
            },

            dataFine: {
                type: Date,
                required: true,
            },
        },

        orarioLavorativo: {
            type: String,
            trim: true,
            default: "",
        },

        tipoLavoro: {
            type: String,
            required: true,
            trim: true,
        },

        competenze: {
            type: [String],
            default: [],
        },

        // Obbligatorio solo se l'annuncio è una richiesta di manodopera.
        numeroLavoratoriRichiesti: {
            type: Number,
            min: 1,
        },

        prezzo: {
    min: {
        type: Number,
        min: 0,
        default: null,
    },

    max: {
        type: Number,
        min: 0,
        default: null,
    },

    unita: {
        type: String,
        enum: ["giornata", "lavoro_completo", "da_concordare"],
        required: true,
        default: "da_concordare",
    },
},

        stato: {
            type: String,
            enum: ["aperto", "in_corso", "concluso", "chiuso"],
            default: "aperto",
        },
    },
    {
        timestamps: true,
    }
);

// Necessario per ricerca geografica con $near e $geoNear.
annuncioSchema.index({ "luogo.posizione": "2dsphere" });

// Controlli che coinvolgono più campi.
annuncioSchema.pre("validate", function () {
    // La data di fine non può essere prima della data di inizio.
    if (
        this.periodo?.dataInizio &&
        this.periodo?.dataFine &&
        this.periodo.dataFine < this.periodo.dataInizio
    ) {
        this.invalidate(
            "periodo.dataFine",
            "La data di fine non può essere precedente alla data di inizio."
        );
    }

    const prezzoDaConcordare =
    this.prezzo?.unita === "da_concordare";

if (prezzoDaConcordare) {
    if (
        this.prezzo.min !== null ||
        this.prezzo.max !== null
    ) {
        this.invalidate(
            "prezzo",
            "Se il prezzo è da concordare, minimo e massimo devono essere null."
        );
    }
} else {
    if (
        this.prezzo?.min === null ||
        this.prezzo?.min === undefined ||
        this.prezzo?.max === null ||
        this.prezzo?.max === undefined
    ) {
        this.invalidate(
            "prezzo",
            "Per un prezzo definito devi indicare minimo e massimo."
        );
    }

    if (this.prezzo?.min > this.prezzo?.max) {
        this.invalidate(
            "prezzo.max",
            "Il prezzo massimo non può essere minore del prezzo minimo."
        );
    }
}

    // Solo un imprenditore che pubblica una richiesta deve indicare quanti lavoratori cerca.
    if (
        this.tipo === "richiesta_manodopera" &&
        !this.numeroLavoratoriRichiesti
    ) {
        this.invalidate(
            "numeroLavoratoriRichiesti",
            "Per una richiesta di manodopera devi indicare il numero di lavoratori richiesti."
        );
    };
});

module.exports = mongoose.model("Annuncio", annuncioSchema, "annunci");