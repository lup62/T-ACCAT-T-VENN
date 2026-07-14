/**
 * ModificaProfiloForm.jsx
 *
 * Form di modifica del profilo (PATCH /api/users/me), mostrato da ProfiloPage
 * al posto della vista in sola lettura. Stessi campi e stessa validazione
 * della registrazione, limitati a ciò che il backend permette di cambiare:
 * nome, cognome, telefono, indirizzo, dati lavoratore e dati imprenditore
 * (email, password e ruoli sono bloccati lato server).
 *
 * Props:
 *   profilo    profilo completo da GET /api/auth/me (precompila i campi)
 *   onSalvato  callback(utenteAggiornato) dopo il salvataggio riuscito
 *   onAnnulla  callback per tornare alla vista senza salvare
 */

import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import { useAuth } from "../../hooks/useAuth";
import { useGeocodingLuogo } from "../../hooks/useGeocodingLuogo";
import { aggiornaProfilo } from "../../services/users";
import InputCompetenze from "../Annunci/PubblicaAnnuncio/InputCompetenze";

// Il backend salva la posizione in GeoJSON [lng, lat]; il form la tiene
// come { lat, lng } (stesso formato usato dal geocoding alla registrazione).
function posizioneDaProfilo(profilo) {
    const coords = profilo.indirizzo?.posizione?.coordinates;
    return Array.isArray(coords) && coords.length === 2
        ? { lng: coords[0], lat: coords[1] }
        : null;
}

function statoIniziale(profilo) {
    return {
        nome: profilo.nome || "",
        cognome: profilo.cognome || "",
        telefono: profilo.telefono || "",
        indirizzoTesto: profilo.indirizzo?.testo || "",
        posizione: posizioneDaProfilo(profilo),
        competenze: profilo.datiLavoratore?.competenze || [],
        certificazioni: profilo.datiLavoratore?.certificazioni || [],
        pIva: profilo.datiImprenditore?.pIva || "",
        nomeAzienda: profilo.datiImprenditore?.nomeAzienda || "",
        sitoWeb: profilo.datiImprenditore?.sitoWeb || "",
        social: profilo.datiImprenditore?.social || [],
    };
}

const ERRORI_INIZIALI = { nome: "", cognome: "", telefono: "", indirizzoTesto: "" };

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
    if (!form.telefono || form.telefono.trim().length < 6)
        segna("telefono", "Inserisci un numero di telefono valido");
    if (!form.indirizzoTesto || !form.posizione)
        segna("indirizzoTesto", "Inserisci un indirizzo valido (es. Bari (BA))");

    return { errori, valido };
}

function costruisciPayload(form, ruoli) {
    const payload = {
        nome: form.nome.trim(),
        cognome: form.cognome.trim(),
        telefono: form.telefono.trim(),
        indirizzo: {
            testo: form.indirizzoTesto.trim(),
            posizione: {
                type: "Point",
                coordinates: [form.posizione.lng, form.posizione.lat],
            },
        },
    };

    if (ruoli.includes("lavoratore")) {
        payload.datiLavoratore = {
            competenze: form.competenze,
            certificazioni: form.certificazioni,
        };
    }
    if (ruoli.includes("imprenditore")) {
        payload.datiImprenditore = {
            pIva: form.pIva.trim(),
            nomeAzienda: form.nomeAzienda.trim(),
            sitoWeb: form.sitoWeb.trim(),
            social: form.social,
        };
    }

    return payload;
}

function ModificaProfiloForm({ profilo, onSalvato, onAnnulla }) {
    const { accessToken } = useAuth();

    const [form, setForm] = useState(() => statoIniziale(profilo));
    const [errori, setErrori] = useState(ERRORI_INIZIALI);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitErrore, setSubmitErrore] = useState("");

    const aggiorna = (campo) => (e) =>
        setForm((prev) => ({ ...prev, [campo]: e.target.value }));

    const aggiornaValore = (campo, valore) =>
        setForm((prev) => ({ ...prev, [campo]: valore }));

    // Geocoding al blur sul campo indirizzo: se il testo cambia serve una
    // nuova posizione valida, altrimenti resta quella già salvata.
    const {
        loading: geocodingLoading,
        errore: geocodingErrore,
        geocodifica,
    } = useGeocodingLuogo({
        onTrovata: (pos) => aggiornaValore("posizione", pos),
        onNonTrovata: () => aggiornaValore("posizione", null),
        messaggi: {
            nonTrovato: "Indirizzo non trovato — controlla e riprova (es. \"Bari (BA)\")",
            errore: "Errore nella ricerca dell'indirizzo — riprova",
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitErrore("");

        const { errori: nuoviErrori, valido } = valida(form);
        setErrori(nuoviErrori);
        if (!valido) return;

        setSubmitLoading(true);
        try {
            const utenteAggiornato = await aggiornaProfilo(
                costruisciPayload(form, profilo.ruoli),
                accessToken
            );
            onSalvato(utenteAggiornato);
        } catch (error) {
            setSubmitErrore(error.message || "Aggiornamento fallito. Riprova.");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
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
                label="Telefono"
                value={form.telefono}
                onChange={aggiorna("telefono")}
                error={!!errori.telefono}
                helperText={errori.telefono}
                fullWidth
            />
            <TextField
                label="Indirizzo"
                value={form.indirizzoTesto}
                onChange={aggiorna("indirizzoTesto")}
                onBlur={() => geocodifica(form.indirizzoTesto)}
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

            {profilo.ruoli.includes("lavoratore") && (
                <>
                    <Divider />
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Competenze
                        </Typography>
                        <InputCompetenze
                            valore={form.competenze}
                            onChange={(nuove) => aggiornaValore("competenze", nuove)}
                        />
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Certificazioni
                        </Typography>
                        <InputCompetenze
                            valore={form.certificazioni}
                            onChange={(nuove) => aggiornaValore("certificazioni", nuove)}
                            placeholder="Es. Patentino fitosanitario, HACCP..."
                        />
                    </Box>
                </>
            )}

            {profilo.ruoli.includes("imprenditore") && (
                <>
                    <Divider />
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
                    <TextField
                        label="Sito web"
                        value={form.sitoWeb}
                        onChange={aggiorna("sitoWeb")}
                        placeholder="https://..."
                        fullWidth
                    />
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Social
                        </Typography>
                        <InputCompetenze
                            valore={form.social}
                            onChange={(nuove) => aggiornaValore("social", nuove)}
                            placeholder="Link a Facebook, Instagram, LinkedIn..."
                        />
                    </Box>
                </>
            )}

            {submitErrore && (
                <Alert severity="error" variant="outlined">
                    {submitErrore}
                </Alert>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button type="submit" variant="contained" disabled={submitLoading}>
                    {submitLoading ? <CircularProgress size={24} color="inherit" /> : "Salva modifiche"}
                </Button>
                <Button variant="outlined" color="inherit" onClick={onAnnulla} disabled={submitLoading}>
                    Annulla
                </Button>
            </Stack>
        </Box>
    );
}

export default ModificaProfiloForm;
