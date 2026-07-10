/**
 * AnnunciLavoroPage.jsx  —  rotta: /annunci/offerte
 *
 * Mostra le offerte di lavoro pubblicate dai datori di lavoro
 * (tipo "richiesta_manodopera", da GET /api/annunci).
 *
 * Comportamento:
 *   - Toggle Lista/Mappa: boolean vistaLista controlla cosa viene mostrato.
 *   - Senza filtri attivi in vista lista: max ANNUNCI_VISIBILI card;
 *     "Vedi altri" apre il RegistratiDialog (gating verso la registrazione).
 *   - Con filtri attivi: mostra tutti i risultati corrispondenti.
 *   - I filtri sono bloccati finché l'utente non è autenticato.
 *   - In vista mappa: tutti gli annunci filtrati compaiono come marker.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "./RegistratiDialog";
import StatoVuoto from "./StatoVuoto";
import FiltriAnnunci from "./FiltriAnnunci";
import MappaAnnunci from "./MappaAnnunci";
import { getAnnunci } from "../../services/annunci";
import { useAnnunciFiltrati } from "../../hooks/useAnnunciFiltrati";

function AnnunciLavoroPage() {
    const navigate = useNavigate();

    // offerte di lavoro = richieste dei datori, non disponibilità dei lavoratori
    const [annunci, setAnnunci] = useState([]);
    const [caricamento, setCaricamento] = useState(true);
    const [errore, setErrore] = useState(null);

    useEffect(() => {
        getAnnunci("richiesta_manodopera")
            .then(setAnnunci)
            .catch((err) => setErrore(err.message))
            .finally(() => setCaricamento(false));
    }, []);
    const {
        filtri, setFiltri,
        ricerca, setRicerca,
        ordinamento, setOrdinamento,
        vistaLista, setVistaLista,
        filtriDrawerOpen, setFiltriDrawerOpen,
        dialogOpen, setDialogOpen,
        isLoggedIn,
        annunciFiltrati,
        annunciDaMostrare,
        hasMore,
    } = useAnnunciFiltrati(annunci);

    return (
        <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 4, flexWrap: "wrap" }}>
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        display: "inline-block",
                        bgcolor: "secondary.main",
                        color: "#FFFFFF",
                        px: 3,
                        py: 1,
                        borderRadius: 1,
                        width: { xs: "100%", sm: "auto" },
                    }}
                >
                    Offerte di lavoro
                </Typography>

                {/* Toggle lista / mappa + pulsante pubblica — solo su desktop */}
                <Stack direction="row" spacing={1} sx={{ ml: "auto", display: { xs: "none", md: "flex" } }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/annunci/nuovo")}
                    >
                        Pubblica annuncio
                    </Button>
                    <Button
                        variant={vistaLista ? "contained" : "outlined"}
                        color="secondary"
                        onClick={() => setVistaLista(true)}
                        sx={{ minWidth: { xs: 44, sm: "auto" }, px: { xs: 1, sm: 2.5 } }}
                    >
                        <ViewListIcon fontSize="small" sx={{ mr: { xs: 0, sm: 1 } }} />
                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Lista</Box>
                    </Button>
                    <Button
                        variant={!vistaLista ? "contained" : "outlined"}
                        color="secondary"
                        onClick={() => setVistaLista(false)}
                        sx={{ minWidth: { xs: 44, sm: "auto" }, px: { xs: 1, sm: 2.5 } }}
                    >
                        <MapIcon fontSize="small" sx={{ mr: { xs: 0, sm: 1 } }} />
                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Mappa</Box>
                    </Button>
                </Stack>
            </Stack>

            {/* Barra di ricerca + ordinamento */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="Cerca per titolo o descrizione..."
                    value={ricerca}
                    onChange={(e) => setRicerca(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Ordina per</InputLabel>
                    <Select
                        value={ordinamento}
                        label="Ordina per"
                        onChange={(e) => setOrdinamento(e.target.value)}
                    >
                        <MenuItem value="recenti">Più recenti</MenuItem>
                        <MenuItem value="vecchi">Più vecchi</MenuItem>
                        <MenuItem value="prezzoAsc">Prezzo crescente</MenuItem>
                        <MenuItem value="prezzoDesc">Prezzo decrescente</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {/* Toolbar mobile: hamburger filtri a sinistra + toggle lista/mappa + pubblica a destra */}
            <Stack direction="row" alignItems="center" sx={{ display: { xs: "flex", md: "none" }, mb: 2 }}>
                <IconButton
                    onClick={() => setFiltriDrawerOpen(true)}
                    sx={{ border: 1, borderColor: "secondary.main", borderRadius: 2, color: "secondary.main" }}
                >
                    <MenuIcon />
                </IconButton>
                <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
                    <Button variant="contained" color="secondary" onClick={() => navigate("/annunci/nuovo")} sx={{ minWidth: 44, px: 1 }}>
                        <AddIcon fontSize="small" />
                    </Button>
                    <Button variant={vistaLista ? "contained" : "outlined"} color="secondary" onClick={() => setVistaLista(true)} sx={{ minWidth: 44, px: 1 }}>
                        <ViewListIcon fontSize="small" />
                    </Button>
                    <Button variant={!vistaLista ? "contained" : "outlined"} color="secondary" onClick={() => setVistaLista(false)} sx={{ minWidth: 44, px: 1 }}>
                        <MapIcon fontSize="small" />
                    </Button>
                </Stack>
            </Stack>

            {/* Layout: sidebar filtri a sinistra + contenuto a destra */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, alignItems: { md: "stretch" } }}>
                {/* isLoggedIn viene da useAuth (via useAnnunciFiltrati) */}
                <FiltriAnnunci
                    annunci={annunci}
                    filtri={filtri}
                    onFiltriChange={setFiltri}
                    color="secondary"
                    isLoggedIn={isLoggedIn}
                    drawerOpen={filtriDrawerOpen}
                    onDrawerClose={() => setFiltriDrawerOpen(false)}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {caricamento ? (
                        /* Caricamento dal backend in corso */
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress color="secondary" />
                        </Box>
                    ) : errore ? (
                        <StatoVuoto
                            titolo="Impossibile caricare gli annunci"
                            descrizione={errore}
                        />
                    ) : vistaLista ? (
                        /* Vista lista: griglia di card */
                        annunciFiltrati.length === 0 ? (
                            <StatoVuoto
                                titolo="Nessun annuncio trovato"
                                descrizione="Nessun annuncio corrisponde ai filtri selezionati. Prova a modificarli."
                            />
                        ) : (
                            <>
                                {/* Griglia responsive: 1 col mobile, 2 tablet, 3 desktop con sidebar */}
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            sm: "repeat(2, 1fr)",
                                            lg: "repeat(3, 1fr)",
                                        },
                                        gap: 3,
                                    }}
                                >
                                    {annunciDaMostrare.map((annuncio) => (
                                        <AnnuncioCard
                                            key={annuncio._id}
                                            annuncio={annuncio}
                                            color="secondary"
                                        />
                                    ))}
                                </Box>

                                {/* Bottone "Vedi altri" per utenti non autenticati */}
                                {hasMore && (
                                    <Box sx={{ textAlign: "center", mt: 4 }}>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            size="large"
                                            onClick={() => setDialogOpen(true)}
                                        >
                                            Vedi altri annunci
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )
                    ) : (
                        /* Vista mappa: rispetta lo stesso limite della lista */
                        <MappaAnnunci annunci={annunciDaMostrare} color="secondary" />
                    )}
                </Box>
            </Box>

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default AnnunciLavoroPage;
