/**
 * PropostaCard.jsx
 *
 * Card di una singola proposta, usata in PropostePage per entrambe le tab.
 *
 * Props:
 *   proposta            la proposta (con annuncio e proponente/destinatario popolati)
 *   tipo                "ricevuta" | "inviata" — decide chi mostrare e se ci sono azioni
 *   onAccetta           callback(proposta) — solo per le ricevute in attesa
 *   onRifiuta           callback(proposta) — solo per le ricevute in attesa
 *   onConcludi          callback(proposta) — ricevute accettate con annuncio "in_corso"
 *   onRecensisci        callback(proposta) — proposte accettate con annuncio "concluso"
 *   onContatta          callback(proposta) — proposte accettate: apre la chat con l'altra persona
 *   recensioneLasciata  true se l'utente ha già recensito questa controparte
 *   azioneInCorso       true mentre un'azione è in volo (disabilita i bottoni)
 */

import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";

const LABEL_STATO = {
    in_attesa: "In attesa",
    accettata: "Accettata",
    rifiutata: "Rifiutata",
};

const COLOR_STATO = {
    in_attesa: "warning",
    accettata: "success",
    rifiutata: "error",
};

// Stato del lavoro mostrato accanto allo stato della proposta,
// solo quando la proposta è stata accettata (prima non è rilevante).
const LABEL_STATO_ANNUNCIO = {
    in_corso: "Lavoro in corso",
    concluso: "Lavoro concluso",
    chiuso: "Annuncio chiuso",
};

function formatData(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function PropostaCard({
    proposta,
    tipo,
    onAccetta,
    onRifiuta,
    onConcludi,
    onRecensisci,
    onContatta,
    recensioneLasciata = false,
    azioneInCorso = false,
}) {
    const isRicevuta = tipo === "ricevuta";
    // Per le ricevute mostriamo chi si è candidato, per le inviate il destinatario.
    const persona = isRicevuta ? proposta.proponente : proposta.destinatario;
    const inAttesa = proposta.stato === "in_attesa";
    const accettata = proposta.stato === "accettata";
    const statoAnnuncio = proposta.annuncio?.stato;

    // Solo l'autore dell'annuncio (tab Ricevute) può concludere il lavoro.
    const puoConcludere = isRicevuta && accettata && statoAnnuncio === "in_corso";
    // A lavoro concluso entrambe le parti possono recensire l'altra.
    const puoRecensire = accettata && statoAnnuncio === "concluso" && !recensioneLasciata;

    return (
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Stack spacing={1.5}>

                {/* Stato + date */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", rowGap: 1 }}>
                    <Chip
                        label={LABEL_STATO[proposta.stato] ?? proposta.stato}
                        color={COLOR_STATO[proposta.stato] ?? "default"}
                        size="small"
                        // Il verde success del tema ha contrastText scuro:
                        // sulla chip piena la scritta si legge meglio bianca.
                        sx={proposta.stato === "accettata" ? { color: "common.white" } : undefined}
                    />
                    {accettata && LABEL_STATO_ANNUNCIO[statoAnnuncio] && (
                        <Chip
                            label={LABEL_STATO_ANNUNCIO[statoAnnuncio]}
                            color={statoAnnuncio === "concluso" ? "primary" : "default"}
                            variant="outlined"
                            size="small"
                        />
                    )}
                    <Typography variant="caption" color="text.secondary">
                        {isRicevuta ? "Ricevuta" : "Inviata"} il {formatData(proposta.dataProposta ?? proposta.createdAt)}
                        {proposta.dataRisposta && ` — risposta il ${formatData(proposta.dataRisposta)}`}
                    </Typography>
                </Stack>

                {/* Annuncio di riferimento (può mancare se l'annuncio è stato rimosso) */}
                {proposta.annuncio ? (
                    <Box>
                        <Typography
                            component={RouterLink}
                            to={`/annunci/${proposta.annuncio._id}`}
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{
                                color: "primary.main",
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                                wordBreak: "break-word",
                            }}
                        >
                            {proposta.annuncio.titolo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {proposta.annuncio.tipoLavoro} — {proposta.annuncio.luogo?.testo}
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Annuncio non più disponibile
                    </Typography>
                )}

                {/* Chi c'è dall'altra parte */}
                <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="body2">
                        {isRicevuta ? "Da" : "A"}: <strong>{persona?.nome} {persona?.cognome}</strong>
                    </Typography>
                </Stack>

                {/* Messaggio di presentazione */}
                {proposta.messaggio && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontStyle: "italic",
                            borderLeft: 3,
                            borderColor: "divider",
                            pl: 1.5,
                            wordBreak: "break-word",
                        }}
                    >
                        “{proposta.messaggio}”
                    </Typography>
                )}

                {/* Azioni: solo il destinatario può rispondere, e solo se in attesa */}
                {isRicevuta && inAttesa && (
                    <>
                        <Divider />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={azioneInCorso ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                                disabled={azioneInCorso}
                                onClick={() => onAccetta(proposta)}
                                sx={{ color: "common.white" }}
                            >
                                Accetta
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CloseIcon />}
                                disabled={azioneInCorso}
                                onClick={() => onRifiuta(proposta)}
                            >
                                Rifiuta
                            </Button>
                        </Stack>
                    </>
                )}

                {/* A proposta accettata: chat con l'altra persona, concludi il
                    lavoro (autore annuncio), poi recensione reciproca ad
                    annuncio concluso */}
                {(accettata || puoConcludere || puoRecensire) && (
                    <>
                        <Divider />
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                            alignItems={{ sm: "center" }}
                        >
                            {accettata && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<ChatBubbleOutlinedIcon />}
                                    disabled={azioneInCorso}
                                    onClick={() => onContatta(proposta)}
                                >
                                    Invia un messaggio
                                </Button>
                            )}
                            {puoConcludere && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={azioneInCorso ? <CircularProgress size={16} color="inherit" /> : <TaskAltIcon />}
                                    disabled={azioneInCorso}
                                    onClick={() => onConcludi(proposta)}
                                >
                                    Concludi lavoro
                                </Button>
                            )}
                            {puoRecensire && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<StarBorderIcon />}
                                    disabled={azioneInCorso}
                                    onClick={() => onRecensisci(proposta)}
                                >
                                    Lascia una recensione
                                </Button>
                            )}
                        </Stack>
                    </>
                )}
            </Stack>
        </Paper>
    );
}

export default PropostaCard;
