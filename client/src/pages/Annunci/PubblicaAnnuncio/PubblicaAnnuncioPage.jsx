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

// ─── Stato iniziale ───────────────────────────────────────────────────────────

const STATO_INIZIALE = {
    tipo: "",
    titolo: "",
    descrizione: "",
    tipoLavoro: "",
    luogoTesto: "",
    posizione: null,       // { lat, lng } — impostato via geocoding o click mappa
    dataInizio: "",
    dataFine: "",
    orarioLavorativo: "",
    competenze: [],
    prezzoMin: "",
    prezzoMax: "",
    unitaPrezzo: "",
    nLavoratoriRichiesti: "",
};

const ERRORI_INIZIALI = {
    tipo: "",
    titolo: "",
    descrizione: "",
    tipoLavoro: "",
    luogoTesto: "",
    dataInizio: "",
    dataFine: "",
    prezzoMin: "",
    prezzoMax: "",
    unitaPrezzo: "",
    nLavoratoriRichiesti: "",
};

// ─── Geocoding tramite Nominatim (OpenStreetMap) ─────────────────────────────

async function geocodificaLuogo(testo) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(testo)}&format=json&limit=1&countrycodes=it`;
    const res = await fetch(url, { headers: { "Accept-Language": "it" } });
    const dati = await res.json();
    if (dati.length === 0) return null;
    return { lat: parseFloat(dati[0].lat), lng: parseFloat(dati[0].lon) };
}

// ─── Validazione ─────────────────────────────────────────────────────────────

function valida(form) {
    const errori = { ...ERRORI_INIZIALI };
    let valido = true;

    const segna = (campo, messaggio) => {
        errori[campo] = messaggio;
        valido = false;
    };

    if (!form.tipo)
        segna("tipo", "Seleziona il tipo di annuncio");
    if (!form.titolo || form.titolo.length < 5)
        segna("titolo", "Il titolo deve avere almeno 5 caratteri");
    if (!form.descrizione || form.descrizione.length < 10)
        segna("descrizione", "La descrizione deve avere almeno 10 caratteri");
    if (!form.tipoLavoro)
        segna("tipoLavoro", "Inserisci il tipo di lavoro");
    if (!form.luogoTesto)
        segna("luogoTesto", "Inserisci il luogo (es. Bari (BA))");
    if (!form.dataInizio)
        segna("dataInizio", "Inserisci la data di inizio");
    if (!form.dataFine)
        segna("dataFine", "Inserisci la data di fine");
    if (form.dataInizio && form.dataFine && form.dataFine < form.dataInizio)
        segna("dataFine", "La data di fine non può essere precedente alla data di inizio");
    if (form.prezzoMin === "" || Number(form.prezzoMin) < 0)
        segna("prezzoMin", "Inserisci un prezzo minimo valido (≥ 0)");
    if (form.prezzoMax === "" || Number(form.prezzoMax) < 0)
        segna("prezzoMax", "Inserisci un prezzo massimo valido (≥ 0)");
    if (form.prezzoMin !== "" && form.prezzoMax !== "" && Number(form.prezzoMax) < Number(form.prezzoMin))
        segna("prezzoMax", "Il prezzo massimo non può essere minore del minimo");
    if (!form.unitaPrezzo)
        segna("unitaPrezzo", "Seleziona l'unità di prezzo");
    if (form.tipo === "richiesta_manodopera" && (!form.nLavoratoriRichiesti || Number(form.nLavoratoriRichiesti) < 1))
        segna("nLavoratoriRichiesti", "Inserisci il numero di lavoratori (almeno 1)");

    return { errori, valido };
}

// ─── Costruzione payload ─────────────────────────────────────────────────────

function costruisciPayload(form) {
    const luogo = { testo: form.luogoTesto.trim() };
    // Includi posizione solo se disponibile (geocoding o selezione manuale)
    if (form.posizione) {
        luogo.posizione = {
            type: "Point",
            coordinates: [form.posizione.lng, form.posizione.lat], // GeoJSON: [lng, lat]
        };
    }

    const payload = {
        tipo: form.tipo,
        titolo: form.titolo.trim(),
        descrizione: form.descrizione.trim(),
        luogo,
        periodo: {
            dataInizio: form.dataInizio,
            dataFine: form.dataFine,
        },
        orarioLavorativo: form.orarioLavorativo.trim(),
        tipoLavoro: form.tipoLavoro.trim(),
        competenze: form.competenze,
        prezzo: {
            min: Number(form.prezzoMin),
            max: Number(form.prezzoMax),
            unita: form.unitaPrezzo,
        },
        stato: "aperto",
    };

    if (form.tipo === "richiesta_manodopera") {
        payload.nLavoratoriRichiesti = Number(form.nLavoratoriRichiesti);
    }

    return payload;
}

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
    const [snackbarAperta, setSnackbarAperta] = useState(false);
    const [geocodingLoading, setGeocodingLoading] = useState(false);
    const [geocodingErrore, setGeocodingErrore] = useState("");

    // TODO: collegare all'auth reale (context o store)
    const isLoggedIn = false;

    const aggiorna = (campo) => (e) =>
        setForm((prev) => ({ ...prev, [campo]: e.target.value }));

    const aggiornaValore = (campo, valore) =>
        setForm((prev) => ({ ...prev, [campo]: valore }));

    // Chiamato quando l'utente lascia il campo luogo (onBlur)
    const handleLuogoBlur = async () => {
        const testo = form.luogoTesto.trim();
        if (!testo || testo.length < 3) return;

        setGeocodingLoading(true);
        setGeocodingErrore("");
        try {
            const pos = await geocodificaLuogo(testo);
            if (pos) {
                aggiornaValore("posizione", pos);
            } else {
                setGeocodingErrore("Luogo non trovato sulla mappa — puoi selezionarlo manualmente");
            }
        } catch {
            setGeocodingErrore("Errore nella ricerca del luogo — prova a selezionarlo manualmente");
        } finally {
            setGeocodingLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { errori: nuoviErrori, valido } = valida(form);
        setErrori(nuoviErrori);
        if (!valido) return;

        const payload = costruisciPayload(form);
        // TODO: sostituire con POST /api/annunci quando il backend sarà pronto
        console.log("Payload annuncio:", payload);
        setSnackbarAperta(true);
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
                                onBlur={handleLuogoBlur}
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
                                        setGeocodingErrore("");
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
                                    required
                                    fullWidth
                                    value={form.prezzoMin}
                                    onChange={aggiorna("prezzoMin")}
                                    error={!!errori.prezzoMin}
                                    helperText={errori.prezzoMin}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                />
                                <TextField
                                    label="Compenso massimo (€)"
                                    type="number"
                                    required
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
                                    Unità di prezzo <Typography component="span" color="error">*</Typography>
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
                                value={form.orarioLavorativo}
                                onChange={aggiorna("orarioLavorativo")}
                                placeholder="Es. 7:00 – 14:00, flessibile, turni..."
                                helperText="Facoltativo"
                            />

                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Competenze richieste / offerte
                                </Typography>
                                <InputCompetenze
                                    valore={form.competenze}
                                    onChange={(nuove) => aggiornaValore("competenze", nuove)}
                                />
                            </Box>

                            {form.tipo === "richiesta_manodopera" && (
                                <TextField
                                    label="Numero di lavoratori richiesti"
                                    type="number"
                                    required
                                    fullWidth
                                    value={form.nLavoratoriRichiesti}
                                    onChange={aggiorna("nLavoratoriRichiesti")}
                                    error={!!errori.nLavoratoriRichiesti}
                                    helperText={errori.nLavoratoriRichiesti || "Quante persone stai cercando?"}
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
                            sx={{ minWidth: 140 }}
                        >
                            Annulla
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            endIcon={<SendIcon />}
                            sx={{ minWidth: 200 }}
                        >
                            Pubblica annuncio
                        </Button>
                    </Stack>

                </Stack>
            </Paper>

            <Snackbar
                open={snackbarAperta}
                autoHideDuration={5000}
                onClose={() => setSnackbarAperta(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbarAperta(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    Annuncio pronto per la pubblicazione. Il collegamento al backend verrà aggiunto a breve.
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default PubblicaAnnuncioPage;
