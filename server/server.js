const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const annuncioRoutes = require("./routes/annuncioRoutes");
const propostaRoutes = require("./routes/propostaRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/annunci", annuncioRoutes);
app.use("/api/proposte", propostaRoutes);
// Collega il backend al database MongoDB.
connectDB();

app.get("/", (req, res) => {
    res.send("Backend T'ACCAT attivo!");
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});