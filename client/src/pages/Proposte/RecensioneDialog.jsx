/**
 * RecensioneDialog.jsx
 *
 * Dialog per lasciare una recensione (POST /api/recensioni) al termine
 * di una collaborazione. Aperto da PropostePage sulle proposte accettate
 * il cui annuncio è "concluso", da entrambe le parti:
 *   - tab Ricevute: l'autore dell'annuncio recensisce il proponente
 *   - tab Inviate:  il proponente recensisce l'autore dell'annuncio
 *
 * Gli errori del backend (annuncio non concluso, recensione già lasciata...)
 * vengono mostrati dentro il dialog, come in InviaPropostaDialog.
 *
 * Props:
 *   open          se il dialog è visibile
 *   onClose       chiusura senza invio
 *   onInviata     callback(recensione) — chiamata a invio riuscito
 *   annuncioId    id dell'annuncio concluso
 *   destinatario  utente da recensire ({ _id, nome, cognome })
 */

import { useState } from "react";
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Rating,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import { useAuth } from "../../hooks/useAuth";
import { creaRecensione } from "../../services/recensioni";

function RecensioneDialog({ open, onClose, onInviata, annuncioId, destinatario }) {
    const { accessToken } = useAuth();
    const [stelle, setStelle] = useState(0);
    const [commento, setCommento] = useState("");
    const [invioInCorso, setInvioInCorso] = useState(false);
    const [errore, setErrore] = useState("");

    const chiudi = () => {
        if (invioInCorso) return;
        setErrore("");
        onClose();
    };

    const invia = async () => {
        if (stelle < 1) {
            setErrore("Seleziona almeno una stella.");
            return;
        }
        setErrore("");
        setInvioInCorso(true);
        try {
            const recensione = await creaRecensione(
                {
                    annuncio: annuncioId,
                    destinatario: destinatario._id,
                    stelle,
                    commento: commento.trim(),
                },
                accessToken
            );
            setStelle(0);
            setCommento("");
            onInviata(recensione);
        } catch (err) {
            setErrore(err.message);
        } finally {
            setInvioInCorso(false);
        }
    };

    return (
        <Dialog open={open} onClose={chiudi} fullWidth maxWidth="sm">
            <DialogTitle>Lascia una recensione</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Com'è andata la collaborazione con{" "}
                    <strong>{destinatario?.nome} {destinatario?.cognome}</strong>?
                    La tua valutazione sarà visibile sul suo profilo.
                </DialogContentText>

                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Rating
                        value={stelle}
                        onChange={(_, valore) => setStelle(valore ?? 0)}
                        size="large"
                        disabled={invioInCorso}
                    />
                    {stelle > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {stelle} su 5
                        </Typography>
                    )}
                </Stack>

                <TextField
                    label="Commento (facoltativo)"
                    fullWidth
                    multiline
                    minRows={3}
                    value={commento}
                    onChange={(e) => setCommento(e.target.value)}
                    placeholder="Es. Persona seria e puntuale, esperienza positiva..."
                    disabled={invioInCorso}
                />

                {errore && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {errore}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={chiudi} disabled={invioInCorso}>
                    Annulla
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={invia}
                    disabled={invioInCorso}
                    endIcon={invioInCorso ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                >
                    {invioInCorso ? "Invio..." : "Invia recensione"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RecensioneDialog;
