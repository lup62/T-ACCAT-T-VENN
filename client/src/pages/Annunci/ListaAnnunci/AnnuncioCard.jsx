/**
 * AnnuncioCard.jsx
 *
 * Card riutilizzabile che mostra il riepilogo di un singolo annuncio
 * nella griglia delle pagine lista (/annunci/offerte e /annunci/cercasi).
 *
 * Props:
 *   annuncio           oggetto annuncio (autore facoltativo: nei preferiti
 *                      il backend non lo popola)
 *   color              "primary" | "secondary" — colore MUI usato per bordi e
 *                      bottone; viene passato dalla pagina padre in base
 *                      alla sezione (offerte = secondary, cercasi = primary)
 *   preferito          true se l'annuncio è nei preferiti (cuore pieno)
 *   onTogglePreferito  callback(annuncio) — se assente il cuoricino non appare
 *   toggleInCorso      true mentre il salvataggio/rimozione è in volo
 *   azioni             nodo opzionale reso sotto "Visualizza dettagli"
 *                      (usato da "I miei annunci" per Chiudi/Concludi)
 *
 * Al click di "Visualizza dettagli" naviga a /annunci/:id
 * senza ricaricare la pagina (React Router, niente window.location).
 */

import { useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EuroIcon from "@mui/icons-material/Euro";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

// Stato annuncio: stesse mappe della pagina di dettaglio. Nelle liste gli
// annunci sono sempre "aperto" (filtro backend), quindi il chip di stato
// compare solo nei preferiti, dove un annuncio salvato può essere cambiato.
const LABEL_STATO = { aperto: "Attivo", in_corso: "In corso", concluso: "Concluso", chiuso: "Chiuso" };
const COLOR_STATO = { aperto: "success", in_corso: "warning", concluso: "default", chiuso: "error" };

// Converte le date ISO in una stringa leggibile: "mar 2026 – mag 2026"
function formatPeriodo(periodo) {
    const fmt = (iso) =>
        new Date(iso).toLocaleDateString("it-IT", { month: "short", year: "numeric" });
    return `${fmt(periodo.dataInizio)} – ${fmt(periodo.dataFine)}`;
}

const LABEL_UNITA = { giornata: '€/giorno', lavoro_completo: '€/lavoro', da_concordare: 'Da concordare' };

function formatPrezzo(prezzo) {
    if (!prezzo || prezzo.unita === 'da_concordare' || prezzo.min == null) return 'Da concordare';
    const unita = LABEL_UNITA[prezzo.unita] ?? prezzo.unita;
    if (prezzo.min === prezzo.max) return `${prezzo.min} ${unita}`;
    return `${prezzo.min} – ${prezzo.max} ${unita}`;
}

function AnnuncioCard({ annuncio, color, preferito = false, onTogglePreferito, toggleInCorso = false, azioni = null }) {
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 7,
                },
            }}
        >
            {/* Cuoricino preferito in alto a destra (solo se la pagina
                passa il callback: nascosto per ospiti e annunci propri) */}
            {onTogglePreferito && (
                <IconButton
                    aria-label={preferito ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
                    disabled={toggleInCorso}
                    onClick={() => onTogglePreferito(annuncio)}
                    sx={{ position: "absolute", top: 12, right: 12, color: "error.main" }}
                >
                    {preferito ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
            )}

            <CardContent
                sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                }}
            >
                {/* Chip categoria agricola (es. "Olivicoltura") + stato se non più aperto */}
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", alignSelf: "flex-start" }}>
                    <Chip label={annuncio.tipoLavoro} variant="outlined" size="small" />
                    {annuncio.stato && annuncio.stato !== "aperto" && (
                        <Chip
                            label={LABEL_STATO[annuncio.stato] ?? annuncio.stato}
                            color={COLOR_STATO[annuncio.stato] ?? "default"}
                            variant="outlined"
                            size="small"
                        />
                    )}
                </Stack>

                <Typography variant="h5" component="h3" sx={{ mb: 3 }}>
                    {annuncio.titolo}
                </Typography>

                {/* Dati sintetici: luogo, periodo, compenso */}
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon sx={{ fontSize: 20, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">
                            {annuncio.luogo.testo}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarMonthIcon sx={{ fontSize: 20, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">
                            {formatPeriodo(annuncio.periodo)}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <EuroIcon sx={{ fontSize: 20, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">
                            {formatPrezzo(annuncio.prezzo)}
                        </Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* L'autore manca negli annunci arrivati dalla lista preferiti */}
                {annuncio.autore && (
                    <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight={600}>
                            {annuncio.autore.nome} {annuncio.autore.cognome}
                        </Typography>
                    </Stack>
                )}

                {/* Bottone che porta alla pagina di dettaglio dell'annuncio */}
                <Stack spacing={1.5} sx={{ mt: "auto" }}>
                    <Button
                        variant="outlined"
                        color={color}
                        fullWidth
                        onClick={() => navigate(`/annunci/${annuncio._id}`)}
                    >
                        Visualizza dettagli
                    </Button>
                    {azioni}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default AnnuncioCard;
