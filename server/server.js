const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);

// Collega il backend al database MongoDB.
connectDB();

app.get("/", (req, res) => {
    res.send("Backend T'ACCAT attivo!");
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});