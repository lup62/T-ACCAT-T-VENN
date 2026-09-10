const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const annuncioRoutes = require("./routes/annuncioRoutes");
const propostaRoutes = require("./routes/propostaRoutes");
const recensioneRoutes = require("./routes/recensioneRoutes");
const preferitoRoutes = require("./routes/preferitoRoutes");
const ricercaSalvataRoutes = require("./routes/ricercaSalvataRoutes");
const notificaRoutes = require("./routes/notificaRoutes");
const userRoutes = require("./routes/userRoutes");
const conversazioneRoutes = require("./routes/conversazioneRoutes");
const socketAuth = require("./sockets/socketAuth");
const configuraChatSocket = require("./sockets/chatSocket");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swaggerSpec");

dotenv.config();

const app = express();
const server = http.createServer(app);
const clientOrigin =
    process.env.CLIENT_ORIGIN ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:5173";

const io = new Server(server, {
    cors: {
        origin: clientOrigin,
        credentials: true,
    },
});

app.set("io", io);

io.use(socketAuth);
configuraChatSocket(io);

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/annunci", annuncioRoutes);
app.use("/api/proposte", propostaRoutes);
app.use("/api/ricerche-salvate", ricercaSalvataRoutes);
app.use("/api/notifiche", notificaRoutes);
app.use("/api/recensioni", recensioneRoutes);
app.use("/api/preferiti", preferitoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversazioni", conversazioneRoutes);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

if (process.env.NODE_ENV === "production") {
    const clientDistPath = path.join(__dirname, "..", "client", "dist");

    app.use(express.static(clientDistPath));

    app.use((req, res, next) => {
        const isApiRequest =
            req.path.startsWith("/api") || req.path.startsWith("/socket.io");

        if (req.method !== "GET" || isApiRequest) {
            return next();
        }

        return res.sendFile(path.join(clientDistPath, "index.html"));
    });
} else {
    app.get("/", (_req, res) => {
        res.send("Backend T'ACCAT attivo!");
    });
}

async function avviaServer() {
    // Il server accetta traffico soltanto dopo la connessione a MongoDB.
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server avviato sulla porta ${PORT}`);
    });
}

avviaServer();
