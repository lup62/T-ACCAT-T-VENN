const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
    {
        utente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },
        scadenza: {
            type: Date,
            required: true,
            index: true,
        },
        revocatoIl: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "RefreshToken",
    refreshTokenSchema,
    "refreshTokens"
);