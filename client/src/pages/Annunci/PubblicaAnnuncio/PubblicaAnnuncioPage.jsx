/**
 * PubblicaAnnuncioPage.jsx  —  rotta: /annunci/nuovo
 *
 * Form per la pubblicazione di un nuovo annuncio.
 * Accessibile solo agli utenti autenticati: se non loggati viene mostrato
 * un blocco con i link ad Accedi e Registrati.
 *
 * Flusso:
 *   1. L'utente sceglie il tipo (richiesta_manodopera / disponibilita_lavoro)
 *   2. Compila le 4 sezioni: info principali, luogo, periodo/compenso, dettagli
 *   3. Al blur sul campo "Luogo" parte una chiamata Nominatim per il geocoding
 *      automatico: se il luogo è trovato il marker viene posizionato sulla mappa
 *   4. L'utente può affinare la posizione cliccando direttamente sulla mappa
 *   5. Al submit il form viene validato; se valido il payload viene inviato
 *      con POST /api/annunci e l'utente è portato al dettaglio del nuovo annuncio
 *
 * Campi condizionali:
 *   - numeroLavoratoriRichiesti: visibile solo per tipo "richiesta_manodopera"
 *   - posizione: facoltativa, auto-impostata dal geocoding
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormHelperText,
    InputAdornment,
    Paper,
    Snackbar,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SendIcon from "@mui/icons-material/Send";

import SelettoreTipoAnnuncio from "./SelettoreTipoAnnuncio";
import InputCompetenze from "./InputCompetenze";
import SelettorePosizioneMappa from "./SelettorePosizioneMappa";
import { useAuth } from "../../../hooks/useAuth";
import { useGeocodingLuogo } from "../../../hooks/useGeocodingLuogo";
import { creaAnnuncio } from "../../../services/annunci";
import { STATO_INIZIALE, ERRORI_INIZIALI, valida, costruisciPayload } from "./pubblicaAnnuncioForm";

// ─── Componente helper: intestazione di sezione ───────────────────────────────

function Sezione({ titolo, children }) {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5, color: "primary.main" }}>
                {titolo}
            </Typography>
            {children}
        </Box>
    );
}

// ─── Pagina principale ────────────────────────────────────────────────────────

function PubblicaAnnuncioPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState(STATO_INIZIALE);
    const [errori, setErrori] = useState(ERRORI_INIZIALI);
    const [invioInCorso, setInvioInCorso] = useState(false);
    const [erroreInvio, setErroreInvio] = useState("");

    const { isLoggedIn, accessToken } = useAuth();

    const aggiorna = (campo) => (e) =>
        setForm((prev) => ({ ...prev, [campo]: e.target.value }));

    const aggiornaValore = (campo, valore) =>
        setForm((prev) => ({ ...prev, [campo]: valore }));

    // Geocoding al blur sul campo luogo. In caso di fallimento la posizione
    // già presente viene mantenuta: l'utente può affinarla sulla mappa.
    const {
        loading: geocodingLoading,
        errore: geocodingErrore,
        azzeraErrore: azzeraErroreGeocoding,
        geocodifica,
    } = useGeocodingLuogo({
        onTrovata: (pos) => aggiornaValore("posizione", pos),
        messaggi: {
            nonTrovato: "Luogo non trovato sulla mappa — puoi selezionarlo manualmente",
            errore: "Errore nella ricerca del luogo — prova a selezionarlo manualmente",
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { errori: nuoviErrori, valido } = valida(form);
        setErrori(nuoviErrori);
        if (!valido) return;

        setErroreInvio("");
        setInvioInCorso(true);
        try {
            const annuncio = await creaAnnuncio(costruisciPayload(form), accessToken);
            navigate(`/annunci/${annuncio._id}`);
        } catch (err) {
            setErroreInvio(err.message);
            setInvioInCorso(false);
        }
    };

    // ── Guard: utente non autenticato ─────────────────────────────────────────
    if (!isLoggedIn) {
        return (
            <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 3 }}
                >
                    Torna agli annunci
                </Button>

                <Paper
                    elevation={2}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 3,
                        maxWidth: 600,
                        mx: "auto",
                        textAlign: "center",
                    }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 56, color: "primary.main", mb: 2 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                        Devi essere registrato
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Per pubblicare un annuncio devi avere un account e aver effettuato l'accesso.
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate("/login")}
                        >
                            Accedi
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={() => navigate("/register")}
                        >
                            Registrati
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    // ── Form principale (solo per utenti loggati) ─────────────────────────────
    return (
        <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>

            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                Torna agli annunci
            </Button>

            <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
                Pubblica un annuncio
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                I campi del form cambiano in base al tipo di annuncio che scegli.
            </Typography>

            <Paper
                elevation={2}
                sx={{
                    p: { xs: 2.5, md: 5 },
                    borderRadius: 3,
                    maxWidth: 900,
                    mx: "auto",
                }}
                component="form"
                onSubmit={handleSubmit}
                noValidate
            >
                <Stack spacing={4}>

                    {/* ── 0. Tipo annuncio ── */}
                    <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5, color: "primary.main" }}>
                            Che tipo di annuncio vuoi pubblicare?
                        </Typography>
                        <SelettoreTipoAnnuncio
                            valore={form.tipo}
                            onChange={(val) => aggiornaValore("tipo", val)}
                        />
                        {errori.tipo && (
                            <FormHelperText error sx={{ mt: 1 }}>
                                {errori.tipo}
                            </FormHelperText>
                        )}
                    </Box>

                    <Divider />

                    {/* ── 1. Informazioni principali ── */}
                    <Sezione titolo="1. Informazioni principali">
                        <Stack spacing={3}>
                            <TextField
                                label="Titolo"
                                required
                                fullWidth
                                value={form.titolo}
                                onChange={aggiorna("titolo")}
                                error={!!errori.titolo}
                                helperText={errori.titolo || "Minimo 5 caratteri"}
                                placeholder="Es. Raccolta olive — Masseria San Marco"
                            />

                            <TextField
                                label="Descrizione"
                                required
                                fullWidth
                                multiline
                                minRows={4}
                                value={form.descrizione}
                                onChange={aggiorna("descrizione")}
                                error={!!errori.descrizione}
                                helperText={errori.descrizione || "Minimo 10 caratteri. Descrivi l'annuncio nel dettaglio."}
                                placeholder="Descrivi le attività, i requisiti, le condizioni di lavoro..."
                            />

                            {/* Campo libero: il tipo di lavoro non è a lista fissa */}
                            <TextField
                                label="Tipo di lavoro"
                                required
                                fullWidth
                                value={form.tipoLavoro}
                                onChange={aggiorna("tipoLavoro")}
                                error={!!errori.tipoLavoro}
                                helperText={errori.tipoLavoro || "Es. Olivicoltura, Viticoltura, Raccolta frutta, Zootecnia..."}
                                placeholder="Scrivi il tipo di lavoro"
                            />
                        </Stack>
                    </Sezione>

                    <Divider />

                    {/* ── 2. Luogo e posizione ── */}
                    <Sezione titolo="2. Luogo e posizione">
                        <Stack spacing={3}>
                            <TextField
                                label="Luogo"
                                required
                                fullWidth
                                value={form.luogoTesto}
                                onChange={aggiorna("luogoTesto")}
                                onBlur={() => geocodifica(form.luogoTesto)}
                                error={!!errori.luogoTesto}
                                helperText={errori.luogoTesto || "Es. Fasano (BR), Bari (BA) — il marker viene posizionato automaticamente"}
                                placeholder="Città (Provincia)"
                                slotProps={{
                                    input: {
                                        endAdornment: geocodingLoading
                                            ? <InputAdornment position="end"><CircularProgress size={18} /></InputAdornment>
                                            : form.posizione
                                            ? <InputAdornment position="end"><MyLocationIcon color="primary" fontSize="small" /></InputAdornment>
                                            : null,
                                    },
                                }}
                            />

                            {form.tipo === "disponibilita_lavoro" && (
                                <TextField
                                    label="Raggio di disponibilità (km)"
                                    type="number"
                                    fullWidth
                                    value={form.raggioKm}
                                    onChange={aggiorna("raggioKm")}
                                    helperText="Facoltativo — distanza massima che sei disposto a percorrere (0–200 km)"
                                    slotProps={{ htmlInput: { min: 0, max: 200 } }}
                                />
                            )}

                            {geocodingErrore && (
                                <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
                                    {geocodingErrore}
                                </Alert>
                            )}

                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Posizione sulla mappa{" "}
                                    <Typography component="span" variant="caption" color="text.disabled">
                                        (opzionale — puoi cliccare per affinare)
                                    </Typography>
                                </Typography>
                                <SelettorePosizioneMappa
                                    posizione={form.posizione}
                                    onPosizioneCambiata={(lat, lng) => {
                                        azzeraErroreGeocoding();
                                        aggiornaValore("posizione", { lat, lng });
                                    }}
                                    error=""
                                />
                            </Box>
                        </Stack>
                    </Sezione>

                    <Divider />

                    {/* ── 3. Periodo e compenso ── */}
                    <Sezione titolo="3. Periodo e compenso">
                        <Stack spacing={3}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    label="Data inizio"
                                    type="date"
                                    required
                                    fullWidth
                                    value={form.dataInizio}
                                    onChange={aggiorna("dataInizio")}
                                    error={!!errori.dataInizio}
                                    helperText={errori.dataInizio}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                                <TextField
                                    label="Data fine"
                                    type="date"
                                    required
                                    fullWidth
                                    value={form.dataFine}
                                    onChange={aggiorna("dataFine")}
                                    error={!!errori.dataFine}
                                    helperText={errori.dataFine}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Stack>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    label="Compenso minimo (€)"
                                    type="number"
                                    fullWidth
                                    value={form.prezzoMin}
                                    onChange={aggiorna("prezzoMin")}
                                    error={!!errori.prezzoMin}
                                    helperText={errori.prezzoMin || "Facoltativo — lascia vuoto per \"da concordare\""}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                />
                                <TextField
                                    label="Compenso massimo (€)"
                                    type="number"
                                    fullWidth
                                    value={form.prezzoMax}
                                    onChange={aggiorna("prezzoMax")}
                                    error={!!errori.prezzoMax}
                                    helperText={errori.prezzoMax}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                />
                            </Stack>

                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Unità di prezzo
                                </Typography>
                                <ToggleButtonGroup
                                    exclusive
                                    value={form.unitaPrezzo}
                                    onChange={(_, val) => { if (val) aggiornaValore("unitaPrezzo", val); }}
                                    sx={{ flexWrap: "wrap" }}
                                >
                                    <ToggleButton value="giornata" sx={{ borderRadius: 2 }}>
                                        Al giorno
                                    </ToggleButton>
                                    <ToggleButton value="lavoro_completo" sx={{ borderRadius: 2 }}>
                                        Per lavoro completo
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                {errori.unitaPrezzo && (
                                    <FormHelperText error sx={{ mt: 0.5 }}>
                                        {errori.unitaPrezzo}
                                    </FormHelperText>
                                )}
                            </Box>
                        </Stack>
                    </Sezione>

                    <Divider />

                    {/* ── 4. Dettagli aggiuntivi ── */}
                    <Sezione titolo="4. Dettagli aggiuntivi">
                        <Stack spacing={3}>
                            <TextField
                                label="Orario lavorativo"
                                fullWidth
                                value={form.orario}
                                onChange={aggiorna("orario")}
                                placeholder="Es. 7:00 – 14:00, flessibile, turni..."
                                helperText="Facoltativo"
                            />

                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Competenze richieste / offerte
                                </Typography>
                                <InputCompetenze
                                    valore={form.competenzeRichieste}
                                    onChange={(nuove) => aggiornaValore("competenzeRichieste", nuove)}
                                />
                            </Box>

                            {form.tipo === "richiesta_manodopera" && (
                                <TextField
                                    label="Numero di lavoratori richiesti"
                                    type="number"
                                    required
                                    fullWidth
                                    value={form.numeroLavoratoriRichiesti}
                                    onChange={aggiorna("numeroLavoratoriRichiesti")}
                                    error={!!errori.numeroLavoratoriRichiesti}
                                    helperText={errori.numeroLavoratoriRichiesti || "Quante persone stai cercando?"}
                                    slotProps={{ htmlInput: { min: 1 } }}
                                />
                            )}
                        </Stack>
                    </Sezione>

                    <Divider />

                    {/* ── Pulsanti finali ── */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="flex-end"
                    >
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate(-1)}
                            disabled={invioInCorso}
                            sx={{ minWidth: 140 }}
                        >
                            Annulla
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={invioInCorso}
                            endIcon={invioInCorso ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                            sx={{ minWidth: 200 }}
                        >
                            {invioInCorso ? "Pubblicazione..." : "Pubblica annuncio"}
                        </Button>
                    </Stack>

                </Stack>
            </Paper>

            {/* Errore restituito dal backend (validazione, permessi, rete...) */}
            <Snackbar
                open={!!erroreInvio}
                autoHideDuration={6000}
                onClose={() => setErroreInvio("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setErroreInvio("")}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {erroreInvio}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default PubblicaAnnuncioPage;
