/**
 * DettaglioAnnuncioPage.jsx  —  rotta: /annunci/:id
 *
 * Pagina di dettaglio di un singolo annuncio.
 * Viene raggiunta cliccando "Visualizza dettagli" in una AnnuncioCard.
 *
 * Flusso:
 *   1. Legge il parametro :id dall'URL (es. /annunci/4 → id = 4)
 *   2. Richiede l'annuncio al backend con GET /api/annunci/:id
 *   3. Se non trovato → mostra stato di errore con bottone per tornare indietro
 *   4. Se trovato → mostra il dettaglio completo
 *
 * Layout (due colonne su desktop, una su mobile):
 *   Sinistra  descrizione estesa + chip competenze + bottone proposta + mappa
 *   Destra    card riassuntiva con luogo, periodo, compenso, autore
 *
 * Il bottone "Accedi per inviare una proposta" apre RegistratiDialog
 * (lo stesso dialog usato nelle pagine lista) invece di navigare a /login,
 * per coerenza con il resto dell'esperienza non autenticata.
 *
 * Note CSS:
 *   - minWidth:0 sui figli della grid previene l'overflow senza overflow:hidden
 *   - overflow:hidden solo sul wrapper della mappa (per border-radius)
 *   - flexWrap e gap vanno in sx, non come prop dirette (MUI v9 li ignora)
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
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

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EuroIcon from "@mui/icons-material/Euro";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import GroupIcon from "@mui/icons-material/Group";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getAnnuncio } from "../../../services/annunci";
import RegistratiDialog from "../RegistratiDialog";

const COLORI_TEMA = { primary: "#387347", secondary: "#69A62D" };

function creaMarkerIcon(hexColor) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="${hexColor}" stroke="white" stroke-width="3"/></svg>`;
    const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return L.divIcon({
        className: "",
        html: `<img src="${uri}" width="20" height="20" />`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -14],
    });
}

function formatPeriodo(periodo) {
    const fmt = (iso) =>
        new Date(iso).toLocaleDateString("it-IT", { month: "short", year: "numeric" });
    return `${fmt(periodo.dataInizio)} – ${fmt(periodo.dataFine)}`;
}

const LABEL_UNITA = { giornata: "€/giorno", lavoro_completo: "€/lavoro" };
const LABEL_STATO = { aperto: "Attivo", in_corso: "In corso", concluso: "Concluso", chiuso: "Chiuso" };
const COLOR_STATO = { aperto: "success", in_corso: "warning", concluso: "default", chiuso: "error" };
const LABEL_RUOLO = { lavoratore: "Lavoratore", imprenditore: "Imprenditore" };

function formatPrezzo(prezzo) {
    if (!prezzo || prezzo.unita === "da_concordare" || prezzo.min == null) return "Da concordare";
    const unita = LABEL_UNITA[prezzo.unita] ?? prezzo.unita;
    if (prezzo.min === prezzo.max) return `${prezzo.min} ${unita}`;
    return `${prezzo.min} – ${prezzo.max} ${unita}`;
}

function RigaInfo({ Icon, label, valore }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Icon sx={{ color: "primary.main", mt: 0.3, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {valore}
                </Typography>
            </Box>
        </Stack>
    );
}

function DettaglioAnnuncioPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);

    const [annuncio, setAnnuncio] = useState(null);
    const [caricamento, setCaricamento] = useState(true);

    useEffect(() => {
        getAnnuncio(id)
            .then(setAnnuncio)
            .catch(() => setAnnuncio(null))
            .finally(() => setCaricamento(false));
    }, [id]);

    if (caricamento) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!annuncio) {
        return (
            <Box sx={{ px: { xs: 2, sm: 3, md: 10 }, py: { xs: 4, md: 6 }, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 3 }}>
                <Typography variant="h5">Annuncio non trovato</Typography>
                <Typography variant="body1" color="text.secondary">
                    L&apos;annuncio che stai cercando non esiste o è stato rimosso.
                </Typography>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Torna agli annunci
                </Button>
            </Box>
        );
    }

    const isRichiesta = annuncio.tipo === "richiesta_manodopera";
    const tipoLabel = isRichiesta ? "Ricerca manodopera" : "Offerta di lavoro";
    const tipoColor = isRichiesta ? "secondary" : "primary";
    const backPath = isRichiesta ? "/annunci/offerte" : "/annunci/cercasi";

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: 10 }, py: { xs: 4, md: 6 } }}>

            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(backPath)} sx={{ mb: 3 }}>
                Torna agli annunci
            </Button>

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                <Chip label={tipoLabel} color={tipoColor} size="small" />
                <Chip
                    label={LABEL_STATO[annuncio.stato] ?? annuncio.stato}
                    color={COLOR_STATO[annuncio.stato] ?? "default"}
                    variant="outlined"
                    size="small"
                />
            </Stack>

            <Typography
                component="h1"
                sx={{
                    mb: 4,
                    fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.125rem" },
                    fontWeight: 700,
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                }}
            >
                {annuncio.titolo}
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                    gap: { xs: 3, md: 4 },
                    alignItems: "start",
                }}
            >
                {/* Colonna principale */}
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ mb: 1.5 }}>Descrizione</Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 4, lineHeight: 1.8, wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                        {annuncio.descrizione}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 1.5 }}>Competenze</Typography>
                    <Stack direction="row" sx={{ mb: 5, flexWrap: "wrap", gap: 1.5 }}>
                        {annuncio.competenze.map((c) => (
                            <Chip key={c} label={c} variant="outlined" size="small" />
                        ))}
                    </Stack>

                    <Button
                        variant="contained"
                        color={tipoColor}
                        size="large"
                        fullWidth
                        onClick={() => !isLoggedIn && setDialogOpen(true)}
                    >
                        {isLoggedIn ? "Invia una proposta" : "Accedi per inviare una proposta"}
                    </Button>

                    {/* la posizione non è obbligatoria nel modello backend */}
                    {annuncio.luogo?.posizione && (
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Posizione</Typography>
                        <Box sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2, height: { xs: 220, sm: 300 } }}>
                            <MapContainer
                                center={[
                                    annuncio.luogo.posizione.coordinates[1],
                                    annuncio.luogo.posizione.coordinates[0],
                                ]}
                                zoom={12}
                                style={{ width: "100%", height: "100%" }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                />
                                <Marker
                                    position={[
                                        annuncio.luogo.posizione.coordinates[1],
                                        annuncio.luogo.posizione.coordinates[0],
                                    ]}
                                    icon={creaMarkerIcon(COLORI_TEMA[tipoColor])}
                                >
                                    <Popup>{annuncio.luogo.testo}</Popup>
                                </Marker>
                            </MapContainer>
                        </Box>
                    </Box>
                    )}
                </Box>

                {/* Sidebar */}
                <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, minWidth: 0 }}>
                    <Stack spacing={2.5}>
                        <RigaInfo Icon={LocationOnIcon} label="Luogo" valore={annuncio.luogo.testo} />
                        <RigaInfo Icon={CalendarMonthIcon} label="Periodo" valore={formatPeriodo(annuncio.periodo)} />
                        <RigaInfo Icon={EuroIcon} label="Compenso" valore={formatPrezzo(annuncio.prezzo)} />
                        <RigaInfo Icon={AgricultureIcon} label="Tipo di lavoro" valore={annuncio.tipoLavoro} />

                        {/* il backend chiama il campo numeroLavoratoriRichiesti */}
                        {annuncio.numeroLavoratoriRichiesti && (
                            <RigaInfo
                                Icon={GroupIcon}
                                label="Lavoratori richiesti"
                                valore={annuncio.numeroLavoratoriRichiesti}
                            />
                        )}

                        <Divider />

                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>
                                    {annuncio.autore.nome} {annuncio.autore.cognome}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {LABEL_RUOLO[annuncio.autore.ruoli?.[0]] ?? annuncio.autore.ruoli?.[0]}
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>
            </Box>

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default DettaglioAnnuncioPage;
