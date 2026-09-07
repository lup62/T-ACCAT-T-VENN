const mongoose = require("mongoose");

const TIPI_LAVORO_CONSENTITI = [
    "Olivicoltura",
    "Viticoltura",
    "Frutticoltura",
    "Orticoltura",
    "Cerealicoltura",
    "Apicoltura",
    "Zootecnia",
    "Altro",
];

const PROVINCE_CONSENTITE = [
    "BA",
    "BT",
    "BR",
    "FG",
    "LE",
    "TA",
];

const ricercaSalvataSchema = new mongoose.Schema(
    {
        utente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        nome: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "Ricerca salvata",
        },

        tipoAnnuncio: {
            type: String,
            enum: [
                "richiesta_manodopera",
                "disponibilita_lavoro",
            ],
            required: true,
        },

        ricerca: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "",
        },

        filtri: {
            tipiLavoro: {
                type: [
                    {
                        type: String,
                        enum: TIPI_LAVORO_CONSENTITI,
                    },
                ],
                default: [],
            },

            province: {
                type: [
                    {
                        type: String,
                        enum: PROVINCE_CONSENTITE,
                    },
                ],
                default: [],
            },

            prezzoRange: {
                type: [Number],
                default: [0, 200],
                validate: {
                    validator(value) {
                        return (
                            Array.isArray(value) &&
                            value.length === 2 &&
                            Number.isFinite(value[0]) &&
                            Number.isFinite(value[1]) &&
                            value[0] >= 0 &&
                            value[1] <= 200 &&
                            value[0] <= value[1]
                        );
                    },
                    message:
                        "Il range di prezzo deve contenere minimo e massimo validi tra 0 e 200.",
                },
            },

            periodoInizio: {
                type: Date,
                default: null,
            },

            periodoFine: {
                type: Date,
                default: null,
            },
        },

        attiva: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

ricercaSalvataSchema.index({
    utente: 1,
    createdAt: -1,
});

ricercaSalvataSchema.index({
    tipoAnnuncio: 1,
    attiva: 1,
});

ricercaSalvataSchema.pre("validate", function () {
    const dataInizio = this.filtri?.periodoInizio;
    const dataFine = this.filtri?.periodoFine;

    if (
        dataInizio &&
        dataFine &&
        dataFine < dataInizio
    ) {
        this.invalidate(
            "filtri.periodoFine",
            "La data finale della ricerca non può precedere quella iniziale."
        );
    }
});

module.exports = mongoose.model(
    "RicercaSalvata",
    ricercaSalvataSchema,
    "ricerche_salvate"
);
