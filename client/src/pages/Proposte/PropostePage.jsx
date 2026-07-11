/**
 * PropostePage.jsx  —  rotta: /proposte
 *
 * "Le mie proposte": due tab per gestire le candidature.
 *   - Ricevute: proposte arrivate sui propri annunci, con Accetta/Rifiuta.
 *     Accettando, il backend mette l'annuncio "in corso" e rifiuta in
 *     automatico le altre proposte in attesa: per questo dopo ogni azione
 *     la lista viene ricaricata invece di aggiornare la singola card.
 *   - Inviate: le proprie candidature, con lo stato della risposta.
 *
 * Accessibile solo agli utenti autenticati (stesso guard di PubblicaAnnuncio).
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";

import { useAuth } from "../../hooks/useAuth";
import {
    getProposteRicevute,
    getProposteInviate,
    accettaProposta,
    rifiutaProposta,
} from "../../services/proposte";
import PropostaCard from "./PropostaCard";

// Stato vuoto minimale per le due tab.
function NessunaProposta({ testo }) {
    return (
        <Box sx={{ textAlign: "center", py: 8 }}>
            <MailOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
                {testo}
            </Typography>
        </Box>
    );
}

function PropostePage() {
    const navigate = useNavigate();
    const { isLoggedIn, accessToken, inizializzazione } = useAuth();

    const [tab, setTab] = useState(0);
    const [ricevute, setRicevute] = useState(null);   // null = in caricamento
    const [inviate, setInviate] = useState(null);
    const [erroreCaricamento, setErroreCaricamento] = useState("");
    const [azioneInCorsoId, setAzioneInCorsoId] = useState(null);
    const [notifica, setNotifica] = useState(null);    // { severity, testo }

    const carica = useCallback(
        () =>
            Promise.all([
                getProposteRicevute(accessToken),
                getProposteInviate(accessToken),
            ])
                .then(([ric, inv]) => {
                    setRicevute(ric);
                    setInviate(inv);
                    setErroreCaricamento("");
                })
                .catch((err) => {
                    setErroreCaricamento(err.message);
                    setRicevute([]);
                    setInviate([]);
                }),
        [accessToken]
    );

    useEffect(() => {
        if (accessToken) carica();
    }, [accessToken, carica]);

    const rispondi = async (proposta, azione) => {
        setAzioneInCorsoId(proposta._id);
        try {
            await (azione === "accetta"
                ? accettaProposta(proposta._id, accessToken)
                : rifiutaProposta(proposta._id, accessToken));
            setNotifica({
                severity: "success",
                testo: azione === "accetta" ? "Proposta accettata!" : "Proposta rifiutata.",
            });
            // Ricarica: accettando cambiano anche le altre proposte dello stesso annuncio
            await carica();
        } catch (err) {
            setNotifica({ severity: "error", testo: err.message });
        } finally {
            setAzioneInCorsoId(null);
        }
    };

    // ── Guard: ripristino sessione in corso ───────────────────────────────────
    if (inizializzazione) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    // ── Guard: utente non autenticato ─────────────────────────────────────────
    if (!isLoggedIn) {
        return (
            <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
                <Paper
                    elevation={2}
                    sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, maxWidth: 600, mx: "auto", textAlign: "center" }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 56, color: "primary.main", mb: 2 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                        Devi essere registrato
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Per vedere e gestire le tue proposte devi avere un account e aver effettuato l'accesso.
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                        <Button variant="contained" color="primary" size="large" onClick={() => navigate("/login")}>
                            Accedi
                        </Button>
                        <Button variant="outlined" color="primary" size="large" onClick={() => navigate("/register")}>
                            Registrati
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    const caricamento = ricevute === null || inviate === null;
    const listaAttiva = tab === 0 ? ricevute : inviate;

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
                Le mie proposte
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Le candidature ricevute sui tuoi annunci e quelle che hai inviato.
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label={`Ricevute${ricevute ? ` (${ricevute.length})` : ""}`} />
                <Tab label={`Inviate${inviate ? ` (${inviate.length})` : ""}`} />
            </Tabs>

            {erroreCaricamento && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {erroreCaricamento}
                </Alert>
            )}

            {caricamento ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : listaAttiva.length === 0 ? (
                <NessunaProposta
                    testo={
                        tab === 0
                            ? "Non hai ancora ricevuto proposte sui tuoi annunci."
                            : "Non hai ancora inviato nessuna proposta."
                    }
                />
            ) : (
                <Stack spacing={2.5} sx={{ maxWidth: 800 }}>
                    {listaAttiva.map((proposta) => (
                        <PropostaCard
                            key={proposta._id}
                            proposta={proposta}
                            tipo={tab === 0 ? "ricevuta" : "inviata"}
                            onAccetta={(p) => rispondi(p, "accetta")}
                            onRifiuta={(p) => rispondi(p, "rifiuta")}
                            azioneInCorso={azioneInCorsoId === proposta._id}
                        />
                    ))}
                </Stack>
            )}

            <Snackbar
                open={!!notifica}
                autoHideDuration={5000}
                onClose={() => setNotifica(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                {notifica && (
                    <Alert
                        onClose={() => setNotifica(null)}
                        severity={notifica.severity}
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {notifica.testo}
                    </Alert>
                )}
            </Snackbar>
        </Box>
    );
}

export default PropostePage;
