/**
 * AnnunciLavoratoriPage.jsx  —  rotta: /annunci/cercasi
 *
 * Mostra i profili dei lavoratori disponibili
 * (tipo "disponibilita_lavoro" in mockAnnunci.js).
 *
 * Comportamento identico ad AnnunciLavoroPage ma per la sezione opposta:
 *   - Senza filtri attivi: mostra max ANNUNCI_VISIBILI card; "Vedi altri"
 *     apre il RegistratiDialog.
 *   - Con filtri attivi: mostra tutti i risultati corrispondenti.
 *   - I filtri sono bloccati finché l'utente non è autenticato.
 */

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "./RegistratiDialog";
import StatoVuoto from "./StatoVuoto";
import FiltriAnnunci, { FILTRI_INIZIALI } from "./FiltriAnnunci";
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

    const filtriAttivi = hasFiltriAttivi(filtri);
    const annunciFiltrati = applicaFiltri(annunci, filtri);

    // Con filtri attivi mostra tutti i risultati; senza, applica il limite
    const annunciDaMostrare = filtriAttivi
        ? annunciFiltrati
        : annunciFiltrati.slice(0, ANNUNCI_VISIBILI);

    return (
        <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
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
                    mb: 4,
                }}
            >
                Chi cerca lavoratori
            </Typography>

            {/* Layout: sidebar filtri a sinistra + griglia a destra */}
            <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
                {/* isLoggedIn=false finché non è implementato il sistema auth */}
                <FiltriAnnunci
                    annunci={annunci}
                    filtri={filtri}
                    onFiltriChange={setFiltri}
                    color="primary"
                    isLoggedIn={false}
                />

                {/* Colonna principale con la griglia degli annunci */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {annunciFiltrati.length === 0 ? (
                        <StatoVuoto
                            titolo="Nessun annuncio trovato"
                            descrizione="Nessun annuncio corrisponde ai filtri selezionati. Prova a modificarli."
                        />
                    ) : (
                        <>
                            {/* Griglia responsive: 1 col mobile, 2 tablet, adatta su desktop con sidebar */}
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

                            {/* Bottone "Vedi altri" solo quando non ci sono filtri attivi */}
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
                    )}
                </Box>
            </Box>

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default AnnunciLavoratoriPage;
