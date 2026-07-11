/**
 * InviaPropostaDialog.jsx
 *
 * Dialog per inviare una proposta su un annuncio (POST /api/proposte).
 * Aperto dal bottone "Invia una proposta" in DettaglioAnnuncioPage,
 * solo per utenti autenticati che non sono l'autore dell'annuncio.
 *
 * Il messaggio di accompagnamento è facoltativo. Gli errori del backend
 * (proposta già inviata, annuncio non più aperto...) vengono mostrati
 * dentro il dialog, così l'utente può correggere o rinunciare.
 *
 * Props:
 *   open        se il dialog è visibile
 *   onClose     chiusura senza invio
 *   onInviata   callback(proposta) — chiamata a invio riuscito
 *   annuncioId  id dell'annuncio per cui ci si candida
 *   color       "primary" | "secondary" — colore tema della pagina
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
    TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import { useAuth } from "../../../hooks/useAuth";
import { creaProposta } from "../../../services/proposte";

function InviaPropostaDialog({ open, onClose, onInviata, annuncioId, color = "primary" }) {
    const { accessToken } = useAuth();
    const [messaggio, setMessaggio] = useState("");
    const [invioInCorso, setInvioInCorso] = useState(false);
    const [errore, setErrore] = useState("");

    const chiudi = () => {
        if (invioInCorso) return;
        setErrore("");
        onClose();
    };

    const invia = async () => {
        setErrore("");
        setInvioInCorso(true);
        try {
            const proposta = await creaProposta(annuncioId, messaggio.trim(), accessToken);
            setMessaggio("");
            onInviata(proposta);
        } catch (err) {
            setErrore(err.message);
        } finally {
            setInvioInCorso(false);
        }
    };

    return (
        <Dialog open={open} onClose={chiudi} fullWidth maxWidth="sm">
            <DialogTitle>Invia una proposta</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Puoi aggiungere un messaggio per presentarti: chi ha pubblicato
                    l&apos;annuncio lo vedrà insieme alla tua proposta.
                </DialogContentText>

                <TextField
                    label="Messaggio (facoltativo)"
                    fullWidth
                    multiline
                    minRows={4}
                    value={messaggio}
                    onChange={(e) => setMessaggio(e.target.value)}
                    placeholder="Es. Buongiorno, ho esperienza in questo tipo di lavoro e sono disponibile nel periodo indicato..."
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
                    color={color}
                    onClick={invia}
                    disabled={invioInCorso}
                    endIcon={invioInCorso ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                >
                    {invioInCorso ? "Invio..." : "Invia proposta"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default InviaPropostaDialog;
