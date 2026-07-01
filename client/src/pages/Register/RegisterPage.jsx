import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import { useAuth } from "../../hooks/useAuth";
import { geocodificaLuogo } from "../../services/geocoding";
import InputCompetenze from "../Annunci/PubblicaAnnuncio/InputCompetenze";

const STATO_INIZIALE = {
    nome: "",
    cognome: "",
    dataNascita: "",
    email: "",
    telefono: "",
    password: "",
    ruoli: [],
    indirizzoTesto: "",
    posizione: null, // { lat, lng } — impostata via geocoding al blur
    competenze: [],
    pIva: "",
    nomeAzienda: "",
};

const ERRORI_INIZIALI = {
    nome: "",
    cognome: "",
    dataNascita: "",
    email: "",
    telefono: "",
    password: "",
    ruoli: "",
    indirizzoTesto: "",
};

function valida(form) {
    const errori = { ...ERRORI_INIZIALI };
    let valido = true;

    const segna = (campo, messaggio) => {
        errori[campo] = messaggio;
        valido = false;
    };

    if (!form.nome || form.nome.trim().length < 2)
        segna("nome", "Il nome deve avere almeno 2 caratteri");
    if (!form.cognome || form.cognome.trim().length < 2)
        segna("cognome", "Il cognome deve avere almeno 2 caratteri");
    if (!form.dataNascita)
        segna("dataNascita", "Inserisci la data di nascita");
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
        segna("email", "Inserisci un'email valida");
    if (!form.telefono || form.telefono.trim().length < 6)
        segna("telefono", "Inserisci un numero di telefono valido");
    if (!form.password || form.password.length < 8)
        segna("password", "La password deve contenere almeno 8 caratteri");
    if (form.ruoli.length === 0)
        segna("ruoli", "Seleziona almeno un ruolo");
    if (!form.indirizzoTesto || !form.posizione)
        segna("indirizzoTesto", "Inserisci un indirizzo valido (es. Bari (BA))");

    return { errori, valido };
}

function costruisciPayload(form) {
    const payload = {
        ruoli: form.ruoli,
        nome: form.nome.trim(),
        cognome: form.cognome.trim(),
        dataNascita: form.dataNascita,
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
        indirizzo: {
            testo: form.indirizzoTesto.trim(),
            posizione: {
                type: "Point",
                coordinates: [form.posizione.lng, form.posizione.lat],
            },
        },
    };

    if (form.ruoli.includes("lavoratore")) {
        payload.datiLavoratore = { competenze: form.competenze };
    }
    if (form.ruoli.includes("imprenditore")) {
        payload.datiImprenditore = {
            pIva: form.pIva.trim(),
            nomeAzienda: form.nomeAzienda.trim(),
        };
    }

    return payload;
}

function RegisterPage() {
    const navigate = useNavigate();
    const { registrati } = useAuth();

    const [form, setForm] = useState(STATO_INIZIALE);
    const [errori, setErrori] = useState(ERRORI_INIZIALI);
    const [geocodingLoading, setGeocodingLoading] = useState(false);
    const [geocodingErrore, setGeocodingErrore] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitErrore, setSubmitErrore] = useState("");

    const aggiorna = (campo) => (e) =>
        setForm((prev) => ({ ...prev, [campo]: e.target.value }));

    const aggiornaValore = (campo, valore) =>
        setForm((prev) => ({ ...prev, [campo]: valore }));

    // I ruoli sono un array (l'utente può selezionarne uno o entrambi):
    // clic su una checkbox già selezionata la toglie, altrimenti la aggiunge.
    const toggleRuolo = (ruolo) => () =>
        setForm((prev) => ({
            ...prev,
            ruoli: prev.ruoli.includes(ruolo)
                ? prev.ruoli.filter((r) => r !== ruolo)
                : [...prev.ruoli, ruolo],
        }));

    // Chiamato quando l'utente lascia il campo indirizzo (onBlur):
    // trasforma il testo in coordinate GPS, richieste dal backend.
    const handleIndirizzoBlur = async () => {
        const testo = form.indirizzoTesto.trim();
        if (!testo || testo.length < 3) return;

        setGeocodingLoading(true);
        setGeocodingErrore("");
        try {
            const pos = await geocodificaLuogo(testo);
            if (pos) {
                aggiornaValore("posizione", pos);
            } else {
                aggiornaValore("posizione", null);
                setGeocodingErrore("Indirizzo non trovato — controlla e riprova (es. \"Bari (BA)\")");
            }
        } catch {
            aggiornaValore("posizione", null);
            setGeocodingErrore("Errore nella ricerca dell'indirizzo — riprova");
        } finally {
            setGeocodingLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitErrore("");

        const { errori: nuoviErrori, valido } = valida(form);
        setErrori(nuoviErrori);
        if (!valido) return;

        setSubmitLoading(true);
        try {
            await registrati(costruisciPayload(form));
            navigate("/");
        } catch (error) {
            setSubmitErrore(error.message || "Registrazione fallita. Riprova.");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Paper
                elevation={2}
                sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, maxWidth: 480, mx: "auto" }}
            >
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                    Registrati
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <TextField
                        label="Nome"
                        value={form.nome}
                        onChange={aggiorna("nome")}
                        error={!!errori.nome}
                        helperText={errori.nome}
                        fullWidth
                    />
                    <TextField
                        label="Cognome"
                        value={form.cognome}
                        onChange={aggiorna("cognome")}
                        error={!!errori.cognome}
                        helperText={errori.cognome}
                        fullWidth
                    />
                    <TextField
                        label="Data di nascita"
                        type="date"
                        value={form.dataNascita}
                        onChange={aggiorna("dataNascita")}
                        error={!!errori.dataNascita}
                        helperText={errori.dataNascita}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={aggiorna("email")}
                        error={!!errori.email}
                        helperText={errori.email}
                        fullWidth
                    />
                    <TextField
                        label="Telefono"
                        value={form.telefono}
                        onChange={aggiorna("telefono")}
                        error={!!errori.telefono}
                        helperText={errori.telefono}
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={aggiorna("password")}
                        error={!!errori.password}
                        helperText={errori.password || "Minimo 8 caratteri"}
                        fullWidth
                    />

                    <Divider />

                    <Typography variant="subtitle2">Sei...</Typography>
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={form.ruoli.includes("lavoratore")}
                                    onChange={toggleRuolo("lavoratore")}
                                />
                            }
                            label="Lavoratore"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={form.ruoli.includes("imprenditore")}
                                    onChange={toggleRuolo("imprenditore")}
                                />
                            }
                            label="Imprenditore"
                        />
                    </FormGroup>
                    {errori.ruoli && (
                        <FormHelperText error sx={{ mt: -1.5 }}>
                            {errori.ruoli}
                        </FormHelperText>
                    )}

                    {form.ruoli.includes("lavoratore") && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Competenze
                            </Typography>
                            <InputCompetenze
                                valore={form.competenze}
                                onChange={(nuove) => aggiornaValore("competenze", nuove)}
                            />
                        </Box>
                    )}

                    {form.ruoli.includes("imprenditore") && (
                        <>
                            <TextField
                                label="Nome azienda"
                                value={form.nomeAzienda}
                                onChange={aggiorna("nomeAzienda")}
                                fullWidth
                            />
                            <TextField
                                label="Partita IVA"
                                value={form.pIva}
                                onChange={aggiorna("pIva")}
                                fullWidth
                            />
                        </>
                    )}

                    <Divider />

                    <TextField
                        label="Indirizzo"
                        value={form.indirizzoTesto}
                        onChange={aggiorna("indirizzoTesto")}
                        onBlur={handleIndirizzoBlur}
                        error={!!errori.indirizzoTesto}
                        helperText={errori.indirizzoTesto || "Es. Bari (BA) — usato per calcolare la posizione"}
                        placeholder="Città (Provincia)"
                        fullWidth
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

                    {submitErrore && (
                        <Alert severity="error" variant="outlined">
                            {submitErrore}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitLoading}
                        sx={{ mt: 1 }}
                    >
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : "Registrati"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default RegisterPage;
