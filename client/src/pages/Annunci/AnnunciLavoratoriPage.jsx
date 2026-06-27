/**
 * AnnunciLavoratoriPage.jsx  —  rotta: /annunci/cercasi
 *
 * Mostra i profili dei lavoratori disponibili
 * (tipo "disponibilita_lavoro" in mockAnnunci.js).
 *
 * Comportamento identico ad AnnunciLavoroPage ma per la sezione opposta:
 *   - Toggle Lista/Mappa: boolean vistaLista controlla cosa viene mostrato.
 *   - Senza filtri attivi in vista lista: max ANNUNCI_VISIBILI card;
 *     "Vedi altri" apre il RegistratiDialog.
 *   - Con filtri attivi: mostra tutti i risultati corrispondenti.
 *   - I filtri sono bloccati finché l'utente non è autenticato.
 *   - In vista mappa: tutti gli annunci filtrati compaiono come marker.
 */

import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "./RegistratiDialog";
import StatoVuoto from "./StatoVuoto";
import FiltriAnnunci, { FILTRI_INIZIALI } from "./FiltriAnnunci";
import MappaAnnunci from "./MappaAnnunci";
import { mockAnnunci } from "../../services/mockAnnunci";

// Numero massimo di card visibili senza filtri attivi
const ANNUNCI_VISIBILI = 2;

// cerca personale = lavoratori che si propongono, non richieste di datori
const annunci = mockAnnunci.filter((a) => a.tipo === "disponibilita_lavoro");

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

function AnnunciLavoratoriPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filtri, setFiltri] = useState(FILTRI_INIZIALI);
    // true = vista lista (default), false = vista mappa
    const [vistaLista, setVistaLista] = useState(true);

    const filtriAttivi = hasFiltriAttivi(filtri);
    const annunciFiltrati = applicaFiltri(annunci, filtri);

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
                        bgcolor: "primary.main",
                        color: "#FFFFFF",
                        px: 3,
                        py: 1,
                        borderRadius: 1,
                    }}
                >
                    Chi cerca lavoratori
                </Typography>

                {/* Toggle lista / mappa — ml:auto lo spinge all'estrema destra */}
                <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
                    <Button
                        variant={vistaLista ? "contained" : "outlined"}
                        color="primary"
                        size="large"
                        startIcon={<ViewListIcon />}
                        onClick={() => setVistaLista(true)}
                    >
                        Lista
                    </Button>
                    <Button
                        variant={!vistaLista ? "contained" : "outlined"}
                        color="primary"
                        size="large"
                        startIcon={<MapIcon />}
                        onClick={() => setVistaLista(false)}
                    >
                        Mappa
                    </Button>
                </Stack>
            </Stack>

            {/* Layout: sidebar filtri a sinistra + contenuto a destra */}
            <Box sx={{ display: "flex", gap: 4, alignItems: "stretch" }}>
                {/* isLoggedIn=false finché non è implementato il sistema auth */}
                <FiltriAnnunci
                    annunci={annunci}
                    filtri={filtri}
                    onFiltriChange={setFiltri}
                    color="primary"
                    isLoggedIn={false}
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
                                            color="primary"
                                        />
                                    ))}
                                </Box>

                                {/* Bottone "Vedi altri" solo senza filtri attivi */}
                                {!filtriAttivi && annunciFiltrati.length > ANNUNCI_VISIBILI && (
                                    <Box sx={{ textAlign: "center", mt: 4 }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
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
                        <MappaAnnunci annunci={annunciFiltrati} color="primary" />
                    )}
                </Box>
            </Box>

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default AnnunciLavoratoriPage;
