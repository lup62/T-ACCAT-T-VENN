const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// In futuro servirà per leggere i dati inviati dal frontend in formato JSON.
app.use(express.json());

// Collega il backend al database MongoDB.
connectDB();

app.get("/", (req, res) => {
    res.send("Backend T'ACCAT attivo!");
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});