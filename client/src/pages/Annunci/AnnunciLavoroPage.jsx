/**
 * AnnunciLavoroPage.jsx  —  rotta: /annunci/offerte
 *
 * Mostra le offerte di lavoro pubblicate dai datori di lavoro
 * (tipo "richiesta_manodopera" in mockAnnunci.js).
 *
 * Comportamento:
 *   - Toggle Lista/Mappa: boolean vistaLista controlla cosa viene mostrato.
 *   - Senza filtri attivi in vista lista: max ANNUNCI_VISIBILI card;
 *     "Vedi altri" apre il RegistratiDialog (gating verso la registrazione).
 *   - Con filtri attivi: mostra tutti i risultati corrispondenti.
 *   - I filtri sono bloccati finché l'utente non è autenticato.
 *   - In vista mappa: tutti gli annunci filtrati compaiono come marker.
 */

import { useState } from "react";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "./RegistratiDialog";
import StatoVuoto from "./StatoVuoto";
import FiltriAnnunci, { FILTRI_INIZIALI } from "./FiltriAnnunci";
import MappaAnnunci from "./MappaAnnunci";
import { mockAnnunci } from "../../services/mockAnnunci";

// Numero massimo di card visibili senza filtri attivi
const ANNUNCI_VISIBILI = 3;

// offerte di lavoro = richieste dei datori, non disponibilità dei lavoratori
const annunci = mockAnnunci.filter((a) => a.tipo === "richiesta_manodopera");

// Restituisce true se almeno un filtro è diverso dal valore iniziale
function hasFiltriAttivi(filtri) {
    return (
        filtri.tipiLavoro.length > 0 ||
        filtri.province.length > 0 ||
        filtri.stati.length > 0 ||
        filtri.periodoInizio !== "" ||
        filtri.periodoFine !== "" ||
        filtri.prezzoRange[0] > 0 ||
        filtri.prezzoRange[1] < 200
    );
}

function applicaOrdinamento(lista, ordinamento) {
    const copia = [...lista];
    switch (ordinamento) {
        case "recenti":  return copia.sort((a, b) => b.periodo.dataInizio.localeCompare(a.periodo.dataInizio));
        case "vecchi":   return copia.sort((a, b) => a.periodo.dataInizio.localeCompare(b.periodo.dataInizio));
        case "prezzoAsc":  return copia.sort((a, b) => a.prezzo.min - b.prezzo.min);
        case "prezzoDesc": return copia.sort((a, b) => b.prezzo.max - a.prezzo.max);
        default: return copia;
    }
}

// Applica tutti i filtri attivi all'array degli annunci
function applicaFiltri(lista, filtri) {
    return lista.filter((a) => {
        if (filtri.tipiLavoro.length > 0 && !filtri.tipiLavoro.includes(a.tipoLavoro))
            return false;

        if (filtri.province.length > 0) {
            const match = a.luogo.testo.match(/\(([A-Z]+)\)/);
            const prov = match ? match[1] : "";
            if (!filtri.province.includes(prov)) return false;
        }

        // Include l'annuncio solo se la sua fascia di prezzo si sovrappone al range selezionato
        if (a.prezzo.max < filtri.prezzoRange[0] || a.prezzo.min > filtri.prezzoRange[1])
            return false;

        if (filtri.stati.length > 0 && !filtri.stati.includes(a.stato))
            return false;

        // Esclude gli annunci terminati prima dell'inizio del periodo cercato
        if (filtri.periodoInizio && a.periodo.dataFine < filtri.periodoInizio)
            return false;

        // Esclude gli annunci che iniziano dopo la fine del periodo cercato
        if (filtri.periodoFine && a.periodo.dataInizio > filtri.periodoFine)
            return false;

        return true;
    });
}

function AnnunciLavoroPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filtriDrawerOpen, setFiltriDrawerOpen] = useState(false);
    const [filtri, setFiltri] = useState(FILTRI_INIZIALI);
    const [ricerca, setRicerca] = useState("");
    const [ordinamento, setOrdinamento] = useState("recenti");
    // true = vista lista (default), false = vista mappa
    const [vistaLista, setVistaLista] = useState(true);

    const filtriAttivi = hasFiltriAttivi(filtri) || ricerca.trim() !== "";

    const annunciCercati = ricerca.trim() === ""
        ? annunci
        : annunci.filter((a) =>
            a.titolo.toLowerCase().includes(ricerca.toLowerCase()) ||
            a.descrizione.toLowerCase().includes(ricerca.toLowerCase())
        );

    const annunciFiltrati = applicaOrdinamento(applicaFiltri(annunciCercati, filtri), ordinamento);

    // Con filtri attivi mostra tutti i risultati; senza, applica il limite
    const annunciDaMostrare = filtriAttivi
        ? annunciFiltrati
        : annunciFiltrati.slice(0, ANNUNCI_VISIBILI);

    return (
        <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
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

                {/* Toggle lista / mappa — solo su desktop, su mobile è nella toolbar */}
                <Stack direction="row" spacing={1} sx={{ ml: "auto", display: { xs: "none", md: "flex" } }}>
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

            {/* Toolbar mobile: hamburger filtri a sinistra + toggle lista/mappa a destra */}
            <Stack direction="row" alignItems="center" sx={{ display: { xs: "flex", md: "none" }, mb: 2 }}>
                <IconButton
                    onClick={() => setFiltriDrawerOpen(true)}
                    sx={{ border: 1, borderColor: "secondary.main", borderRadius: 2, color: "secondary.main" }}
                >
                    <MenuIcon />
                </IconButton>
                <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
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
                {/* isLoggedIn=false finché non è implementato il sistema auth */}
                <FiltriAnnunci
                    annunci={annunci}
                    filtri={filtri}
                    onFiltriChange={setFiltri}
                    color="secondary"
                    isLoggedIn={false}
                    drawerOpen={filtriDrawerOpen}
                    onDrawerClose={() => setFiltriDrawerOpen(false)}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {vistaLista ? (
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
                                            key={annuncio.id}
                                            annuncio={annuncio}
                                            color="secondary"
                                        />
                                    ))}
                                </Box>

                                {/* Bottone "Vedi altri" solo senza filtri attivi */}
                                {!filtriAttivi && annunciFiltrati.length > ANNUNCI_VISIBILI && (
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
                        /* Vista mappa: mostra tutti gli annunci filtrati come marker */
                        <MappaAnnunci annunci={annunciFiltrati} color="secondary" />
                    )}
                </Box>
            </Box>

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default AnnunciLavoroPage;
