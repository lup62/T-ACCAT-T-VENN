/**
 * ThreadMessaggi.jsx
 *
 * Colonna destra della chat: intestazione con l'altro partecipante,
 * messaggi in ordine cronologico (i propri a destra) e campo di invio.
 * Invio con Enter (Shift+Enter va a capo) o col bottone; il limite di
 * 2000 caratteri rispecchia la validazione del backend.
 *
 * Props:
 *   conversazione  la conversazione attiva (partecipanti e annuncio popolati)
 *   messaggi       storico + messaggi live; null = in caricamento
 *   errore         errore di caricamento o della stanza socket
 *   mioId          id dell'utente loggato
 *   connesso       stato del socket: se false l'invio è disabilitato
 *   onInvia        callback async(testo) — rigetta con message leggibile
 *   onIndietro     torna alla lista (visibile solo su mobile)
 */

import { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    CircularProgress,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";

import { altroPartecipante, iniziali } from "./chatUtils";

const MAX_CARATTERI = 2000;

function formatOraMessaggio(iso) {
    return new Date(iso).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Etichetta del giorno per i separatori tra messaggi.
function etichettaGiorno(iso) {
    const data = new Date(iso);
    const oggi = new Date();
    const ieri = new Date();
    ieri.setDate(oggi.getDate() - 1);
    if (data.toDateString() === oggi.toDateString()) return "Oggi";
    if (data.toDateString() === ieri.toDateString()) return "Ieri";
    return data.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function ThreadMessaggi({
    conversazione,
    messaggi,
    errore,
    mioId,
    connesso,
    onInvia,
    onIndietro,
}) {
    const [testo, setTesto] = useState("");
    const [invioInCorso, setInvioInCorso] = useState(false);
    const [erroreInvio, setErroreInvio] = useState("");
    const fondoRef = useRef(null);

    const altro = altroPartecipante(conversazione, mioId);
    const annuncio = conversazione.annuncioRiferimento;

    // Il thread resta ancorato in fondo all'arrivo di nuovi messaggi.
    useEffect(() => {
        fondoRef.current?.scrollIntoView({ block: "end" });
    }, [messaggi]);

    const invia = async () => {
        const pulito = testo.trim();
        if (!pulito || invioInCorso) return;
        setInvioInCorso(true);
        setErroreInvio("");
        try {
            await onInvia(pulito);
            setTesto("");
        } catch (err) {
            setErroreInvio(err.message);
        } finally {
            setInvioInCorso(false);
        }
    };

    const onKeyDown = (evento) => {
        if (evento.key === "Enter" && !evento.shiftKey) {
            evento.preventDefault();
            invia();
        }
    };

    return (
        <>
            {/* Intestazione */}
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}
            >
                <IconButton
                    aria-label="Torna alla lista"
                    onClick={onIndietro}
                    sx={{ display: { md: "none" } }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Avatar sx={{ bgcolor: "primary.main" }}>{iniziali(altro)}</Avatar>
                <Box sx={{ minWidth: 0 }}>
                    {altro ? (
                        <Typography
                            component={RouterLink}
                            to={`/utenti/${altro._id}`}
                            variant="subtitle1"
                            fontWeight={700}
                            noWrap
                            sx={{
                                display: "block",
                                color: "text.primary",
                                textDecoration: "none",
                                "&:hover": { color: "primary.main" },
                            }}
                        >
                            {altro.nome} {altro.cognome}
                        </Typography>
                    ) : (
                        <Typography variant="subtitle1" fontWeight={700}>
                            Utente non disponibile
                        </Typography>
                    )}
                    {annuncio && (
                        <Typography
                            component={RouterLink}
                            to={`/annunci/${annuncio._id}`}
                            variant="caption"
                            color="primary"
                            noWrap
                            sx={{
                                display: "block",
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            {annuncio.titolo}
                        </Typography>
                    )}
                </Box>
            </Stack>

            {/* Messaggi */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    px: 2,
                    py: 2,
                    bgcolor: "action.hover",
                }}
            >
                {errore && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errore}
                    </Alert>
                )}

                {messaggi === null ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : messaggi.length === 0 && !errore ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center", py: 6 }}
                    >
                        Nessun messaggio: scrivi tu il primo!
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {messaggi.map((messaggio, i) => {
                            const mio = messaggio.mittente?._id === mioId;
                            const giorno = etichettaGiorno(messaggio.createdAt);
                            const nuovoGiorno =
                                i === 0 ||
                                giorno !== etichettaGiorno(messaggi[i - 1].createdAt);

                            return (
                                <Box key={messaggio._id}>
                                    {nuovoGiorno && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display: "block",
                                                textAlign: "center",
                                                my: 1.5,
                                            }}
                                        >
                                            {giorno}
                                        </Typography>
                                    )}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: mio ? "flex-end" : "flex-start",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                maxWidth: { xs: "85%", sm: "70%" },
                                                px: 2,
                                                py: 1.25,
                                                // Valori in px espliciti: i numeri in sx verrebbero
                                                // moltiplicati per theme.shape.borderRadius (4px)
                                                borderRadius: "16px",
                                                // Angolo "appiattito" verso chi scrive, stile
                                                // app di messaggistica
                                                borderBottomRightRadius: mio ? "4px" : "16px",
                                                borderBottomLeftRadius: mio ? "16px" : "4px",
                                                bgcolor: mio ? "primary.main" : "background.paper",
                                                color: mio ? "primary.contrastText" : "text.primary",
                                                boxShadow: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                {messaggio.testo}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "block",
                                                    textAlign: "right",
                                                    mt: 0.75,
                                                    fontSize: "0.68rem",
                                                    opacity: 0.65,
                                                }}
                                            >
                                                {formatOraMessaggio(messaggio.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                        <Box ref={fondoRef} />
                    </Stack>
                )}
            </Box>

            {/* Invio */}
            <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
                {erroreInvio && (
                    <Alert
                        severity="error"
                        onClose={() => setErroreInvio("")}
                        sx={{ mb: 1 }}
                    >
                        {erroreInvio}
                    </Alert>
                )}
                {!connesso && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                        Connessione alla chat in corso…
                    </Typography>
                )}
                <Stack direction="row" spacing={1} alignItems="flex-end">
                    <TextField
                        value={testo}
                        onChange={(e) => setTesto(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Scrivi un messaggio…"
                        multiline
                        maxRows={4}
                        fullWidth
                        size="small"
                        slotProps={{ htmlInput: { maxLength: MAX_CARATTERI } }}
                    />
                    <IconButton
                        aria-label="Invia messaggio"
                        color="primary"
                        onClick={invia}
                        disabled={!connesso || invioInCorso || !testo.trim()}
                    >
                        {invioInCorso ? <CircularProgress size={22} /> : <SendIcon />}
                    </IconButton>
                </Stack>
            </Box>
        </>
    );
}

export default ThreadMessaggi;
