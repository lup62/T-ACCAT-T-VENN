/**
 * PropostePage.jsx  —  rotta: /proposte
 *
 * "Le mie proposte": due tab per gestire le candidature.
 *   - Ricevute: proposte arrivate sui propri annunci, con Accetta/Rifiuta.
 *     Accettando, il backend mette l'annuncio "in corso" ma le altre
 *     proposte restano in attesa: è l'autore a decidere una per una (può
 *     anche accettarne più di una, es. quando servono più lavoratori).
 *     Sulla proposta accettata compare poi "Concludi lavoro"
 *     (PATCH /api/annunci/:id/concludi, solo autore dell'annuncio): è la
 *     conclusione a rifiutare in automatico le proposte rimaste in attesa.
 *     Dopo ogni azione la lista viene ricaricata invece di aggiornare la
 *     singola card, perché cambia anche lo stato dell'annuncio collegato.
 *   - Inviate: le proprie candidature, con lo stato della risposta.
 *
 * Ad annuncio concluso entrambe le tab mostrano "Lascia una recensione"
 * (RecensioneDialog). Per sapere se è già stata lasciata si leggono le
 * recensioni degli annunci conclusi (GET /api/recensioni/annuncio/:id)
 * e si controlla se tra gli autori c'è l'utente loggato. Se la lettura
 * fallisce il bottone resta visibile: un eventuale doppio invio viene
 * comunque bloccato dal backend con un 409.
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
import { concludiAnnuncio } from "../../services/annunci";
import { getRecensioniAnnuncio } from "../../services/recensioni";
import { creaORecuperaConversazione } from "../../services/conversazioni";
import PropostaCard from "./PropostaCard";
import RecensioneDialog from "./RecensioneDialog";

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
    const { isLoggedIn, accessToken, inizializzazione, utente } = useAuth();

    const [tab, setTab] = useState(0);
    const [ricevute, setRicevute] = useState(null);   // null = in caricamento
    const [inviate, setInviate] = useState(null);
    const [erroreCaricamento, setErroreCaricamento] = useState("");
    const [azioneInCorsoId, setAzioneInCorsoId] = useState(null);
    const [notifica, setNotifica] = useState(null);    // { severity, testo }
    // Recensione in corso: { proposta, persona } — null = dialog chiuso.
    const [recensione, setRecensione] = useState(null);
    // Id degli annunci conclusi che l'utente ha già recensito (vedi commento in testa).
    const [annunciRecensiti, setAnnunciRecensiti] = useState(() => new Set());

    const carica = useCallback(async () => {
        try {
            const [ric, inv] = await Promise.all([
                getProposteRicevute(accessToken),
                getProposteInviate(accessToken),
            ]);

            // Per le collaborazioni concluse si controlla se abbiamo già
            // recensito. Se la lettura fallisce si lascia il set vuoto:
            // meglio un bottone di troppo (il backend blocca i doppi invii)
            // che nascondere le proposte per un errore secondario.
            let recensiti = new Set();
            try {
                const idAnnunciConclusi = [
                    ...new Set(
                        [...ric, ...inv]
                            .filter((p) => p.stato === "accettata" && p.annuncio?.stato === "concluso")
                            .map((p) => p.annuncio._id)
                    ),
                ];
                const recensioniPerAnnuncio = await Promise.all(
                    idAnnunciConclusi.map(getRecensioniAnnuncio)
                );
                recensiti = new Set(
                    idAnnunciConclusi.filter((idAnnuncio, i) =>
                        recensioniPerAnnuncio[i].some((r) => r.autore?._id === utente?.id)
                    )
                );
            } catch {
                // ignorato: vedi commento sopra
            }

            setRicevute(ric);
            setInviate(inv);
            setAnnunciRecensiti(recensiti);
            setErroreCaricamento("");
        } catch (err) {
            setErroreCaricamento(err.message);
            setRicevute([]);
            setInviate([]);
        }
    }, [accessToken, utente?.id]);

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

    // Conclude il lavoro dell'annuncio collegato alla proposta accettata.
    // Ricarica le liste così il chip passa a "Lavoro concluso" e compare
    // il bottone per la recensione.
    const concludi = async (proposta) => {
        setAzioneInCorsoId(proposta._id);
        try {
            await concludiAnnuncio(proposta.annuncio._id, accessToken);
            setNotifica({
                severity: "success",
                testo: "Lavoro concluso! Ora puoi lasciare una recensione.",
            });
            await carica();
        } catch (err) {
            setNotifica({ severity: "error", testo: err.message });
        } finally {
            setAzioneInCorsoId(null);
        }
    };

    // Apre (o recupera) la chat con l'altra persona della proposta accettata
    // e naviga alla pagina messaggi con il thread già selezionato.
    const contatta = async (proposta) => {
        const persona = tab === 0 ? proposta.proponente : proposta.destinatario;
        setAzioneInCorsoId(proposta._id);
        try {
            const conversazione = await creaORecuperaConversazione(
                persona._id,
                proposta.annuncio?._id,
                accessToken
            );
            // La conversazione viaggia in state: se è appena stata creata
            // la pagina chat la mostra senza aspettare il refetch della lista.
            navigate(`/chat?c=${conversazione._id}`, { state: { conversazione } });
        } catch (err) {
            setNotifica({ severity: "error", testo: err.message });
            setAzioneInCorsoId(null);
        }
    };

    // Chi va recensito: nelle ricevute il proponente, nelle inviate
    // il destinatario (cioè l'autore dell'annuncio).
    const apriRecensione = (proposta) =>
        setRecensione({
            proposta,
            persona: tab === 0 ? proposta.proponente : proposta.destinatario,
        });

    const recensioneInviata = () => {
        setAnnunciRecensiti((prev) => new Set(prev).add(recensione.proposta.annuncio._id));
        setRecensione(null);
        setNotifica({ severity: "success", testo: "Recensione inviata, grazie!" });
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
                            onConcludi={concludi}
                            onRecensisci={apriRecensione}
                            onContatta={contatta}
                            recensioneLasciata={annunciRecensiti.has(proposta.annuncio?._id)}
                            azioneInCorso={azioneInCorsoId === proposta._id}
                        />
                    ))}
                </Stack>
            )}

            {recensione && (
                <RecensioneDialog
                    open
                    onClose={() => setRecensione(null)}
                    onInviata={recensioneInviata}
                    annuncioId={recensione.proposta.annuncio._id}
                    destinatario={recensione.persona}
                />
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
