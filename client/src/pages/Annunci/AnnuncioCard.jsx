/**
 * AnnuncioCard.jsx
 *
 * Card riutilizzabile che mostra il riepilogo di un singolo annuncio
 * nella griglia delle pagine lista (/annunci/offerte e /annunci/cercasi).
 *
 * Props:
 *   annuncio  oggetto completo proveniente da mockAnnunci.js
 *   color     "primary" | "secondary" — colore MUI usato per bordi,
 *             avatar e bottone; viene passato dalla pagina padre in base
 *             alla sezione (offerte = secondary, cercasi = primary)
 *
 * Al click di "Visualizza dettagli" naviga a /annunci/:id
 * senza ricaricare la pagina (React Router, niente window.location).
 */

import { useNavigate } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EuroIcon from "@mui/icons-material/Euro";

// Converte le date ISO in una stringa leggibile: "mar 2026 – mag 2026"
function formatPeriodo(periodo) {
    const fmt = (iso) =>
        new Date(iso).toLocaleDateString("it-IT", { month: "short", year: "numeric" });
    return `${fmt(periodo.dataInizio)} – ${fmt(periodo.dataFine)}`;
}

// Formatta la fascia di prezzo: "70 – 80 €/giorno" oppure "80 €/giorno" se min === max
function formatPrezzo(prezzo) {
    if (prezzo.min === prezzo.max) return `${prezzo.min} ${prezzo.unita}`;
    return `${prezzo.min} – ${prezzo.max} ${prezzo.unita}`;
}

function AnnuncioCard({ annuncio, color }) {
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 7,
                },
            }}
        >
            <CardContent
                sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                }}
            >
                {/* Chip categoria agricola (es. "Olivicoltura") */}
                <Chip
                    label={annuncio.tipoLavoro}
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: "flex-start", mb: 2 }}
                />

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

                {/* Avatar con iniziale del nome dell'autore */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar
                        src={annuncio.autore.avatar}
                        alt={annuncio.autore.nome}
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: `${color}.main`,
                            fontSize: "0.85rem",
                        }}
                    >
                        {annuncio.autore.nome.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                        {annuncio.autore.nome}
                    </Typography>
                </Stack>

                {/* Bottone che porta alla pagina di dettaglio dell'annuncio */}
                <Box sx={{ mt: "auto" }}>
                    <Button
                        variant="outlined"
                        color={color}
                        fullWidth
                        onClick={() => navigate(`/annunci/${annuncio.id}`)}
                    >
                        Visualizza dettagli
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

export default AnnuncioCard;
