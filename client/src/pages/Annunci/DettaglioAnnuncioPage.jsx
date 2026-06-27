import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Chip,
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

import { mockAnnunci } from "../../services/mockAnnunci";
import RegistratiDialog from "./RegistratiDialog";

function formatPeriodo(periodo) {
    const fmt = (iso) =>
        new Date(iso).toLocaleDateString("it-IT", { month: "short", year: "numeric" });
    return `${fmt(periodo.dataInizio)} – ${fmt(periodo.dataFine)}`;
}

function formatPrezzo(prezzo) {
    if (prezzo.min === prezzo.max) return `${prezzo.min} ${prezzo.unita}`;
    return `${prezzo.min} – ${prezzo.max} ${prezzo.unita}`;
}

function DettaglioAnnuncioPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);

    const annuncio = mockAnnunci.find((a) => a.id === Number(id));

    if (!annuncio) {
        return (
            <Box
                sx={{
                    px: { xs: 3, md: 10 },
                    py: { xs: 4, md: 6 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 3,
                }}
            >
                <Typography variant="h5">Annuncio non trovato</Typography>
                <Typography variant="body1" color="text.secondary">
                    L&apos;annuncio che stai cercando non esiste o è stato rimosso.
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                >
                    Torna agli annunci
                </Button>
            </Box>
        );
    }

    const isRichiesta = annuncio.tipo === "richiesta_manodopera";
    const tipoLabel = isRichiesta ? "Ricerca manodopera" : "Offerta di lavoro";
    const tipoColor = isRichiesta ? "secondary" : "primary"
    const backPath = isRichiesta ? "/annunci/lavoro" : "/annunci/lavoratori";

    return (
        <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(backPath)}
                sx={{ mb: 3 }}
            >
                Torna agli annunci
            </Button>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label={tipoLabel} color={tipoColor} size="small" />
                <Chip
                    label={annuncio.stato === "attivo" ? "Attivo" : "Chiuso"}
                    color="success"
                    variant="outlined"
                    size="small"
                />
            </Stack>

            <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                {annuncio.titolo}
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                    gap: 4,
                    alignItems: "start",
                }}
            >
                {/* Colonna principale */}
                <Box>
                    <Typography variant="h6" sx={{ mb: 1.5 }}>
                        Descrizione
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                        {annuncio.descrizione}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 1.5 }}>
                        Competenze
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 5 }}>
                        {annuncio.competenze.map((c) => (
                            <Chip key={c} label={c} variant="outlined" size="small" />
                        ))}
                    </Stack>

                    <Button
                        variant="contained"
                        color={tipoColor}
                        size="large"
                        fullWidth
                        onClick={() => setDialogOpen(true)}
                    >
                        Accedi per inviare una proposta
                    </Button>
                </Box>

                {/* Sidebar */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Stack spacing={2.5}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <LocationOnIcon sx={{ color: "primary.main", mt: 0.3 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Luogo
                                </Typography>
                                <Typography variant="body2">{annuncio.luogo.testo}</Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <CalendarMonthIcon sx={{ color: "primary.main", mt: 0.3 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Periodo
                                </Typography>
                                <Typography variant="body2">{formatPeriodo(annuncio.periodo)}</Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <EuroIcon sx={{ color: "primary.main", mt: 0.3 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Compenso
                                </Typography>
                                <Typography variant="body2">{formatPrezzo(annuncio.prezzo)}</Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <AgricultureIcon sx={{ color: "primary.main", mt: 0.3 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Tipo di lavoro
                                </Typography>
                                <Typography variant="body2">{annuncio.tipoLavoro}</Typography>
                            </Box>
                        </Stack>

                        {annuncio.numeroLavoratoriRichiesti && (
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <GroupIcon sx={{ color: "primary.main", mt: 0.3 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Lavoratori richiesti
                                    </Typography>
                                    <Typography variant="body2">
                                        {annuncio.numeroLavoratoriRichiesti}
                                    </Typography>
                                </Box>
                            </Stack>
                        )}

                        <Divider />

                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                                sx={{
                                    bgcolor: `${tipoColor}.main`,
                                    width: 40,
                                    height: 40,
                                    fontSize: "1rem",
                                }}
                            >
                                {annuncio.autore.nome.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {annuncio.autore.nome}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {annuncio.autore.ruolo}
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
