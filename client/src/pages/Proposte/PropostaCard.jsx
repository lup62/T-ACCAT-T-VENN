/**
 * PropostaCard.jsx
 *
 * Card di una singola proposta, usata in PropostePage per entrambe le tab.
 *
 * Props:
 *   proposta       la proposta (con annuncio e proponente/destinatario popolati)
 *   tipo           "ricevuta" | "inviata" — decide chi mostrare e se ci sono azioni
 *   onAccetta      callback(proposta) — solo per le ricevute in attesa
 *   onRifiuta      callback(proposta) — solo per le ricevute in attesa
 *   azioneInCorso  true mentre una accetta/rifiuta è in volo (disabilita i bottoni)
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

function formatData(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function PropostaCard({ proposta, tipo, onAccetta, onRifiuta, azioneInCorso = false }) {
    const isRicevuta = tipo === "ricevuta";
    // Per le ricevute mostriamo chi si è candidato, per le inviate il destinatario.
    const persona = isRicevuta ? proposta.proponente : proposta.destinatario;
    const inAttesa = proposta.stato === "in_attesa";

    return (
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Stack spacing={1.5}>

                {/* Stato + date */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", rowGap: 1 }}>
                    <Chip
                        label={LABEL_STATO[proposta.stato] ?? proposta.stato}
                        color={COLOR_STATO[proposta.stato] ?? "default"}
                        size="small"
                    />
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
            </Stack>
        </Paper>
    );
}

export default PropostaCard;
