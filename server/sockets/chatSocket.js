function configuraChatSocket(io) {
    io.on("connection", (socket) => {
        console.log(
            `Socket connesso: ${socket.id} — utente ${socket.utente.id}`
        );

        socket.on("disconnect", (motivo) => {
            console.log(
                `Socket disconnesso: ${socket.id} — motivo: ${motivo}`
            );
        });
    });
}

module.exports = configuraChatSocket;
