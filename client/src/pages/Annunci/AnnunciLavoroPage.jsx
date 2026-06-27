/**
 * AnnunciLavoroPage.jsx  —  rotta: /annunci/offerte
 *
 * Mostra le offerte di lavoro pubblicate dai datori di lavoro
 * (tipo "richiesta_manodopera" in mockAnnunci.js).
 *
 * Comportamento:
 *   - Vengono mostrati al massimo ANNUNCI_VISIBILI annunci senza autenticazione.
 *   - Il bottone "Vedi altri annunci" apre un dialog che invita l'utente
 *     a registrarsi, invece di caricare altri contenuti.
 *   - Se non ci sono annunci viene mostrato il componente StatoVuoto.
 */

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "./RegistratiDialog";
import StatoVuoto from "./StatoVuoto";
import { mockAnnunci } from "../../services/mockAnnunci";

// Numero massimo di card visibili prima del prompt di registrazione
const ANNUNCI_VISIBILI = 3;

// offerte di lavoro = richieste dei datori, non disponibilità dei lavoratori
const annunci = mockAnnunci.filter((a) => a.tipo === "richiesta_manodopera");

function AnnunciLavoroPage() {
    // controlla apertura/chiusura del dialog di registrazione
    const [dialogOpen, setDialogOpen] = useState(false);
    const annunciVisibili = annunci.slice(0, ANNUNCI_VISIBILI);

    return (
        <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
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
                    mb: 4,
                }}
            >
                Chi cerca lavoro
            </Typography>

            {/* Se non ci sono annunci mostra un messaggio illustrato */}
            {annunci.length === 0 ? (
                <StatoVuoto
                    titolo="Nessun annuncio disponibile"
                    descrizione="Al momento non ci sono lavoratori che cercano lavoro in questa categoria. Torna a controllare presto."
                />
            ) : (
                <>
                    {/* Griglia responsive: 1 col mobile, 2 tablet, 3 desktop */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                            },
                            gap: 3,
                        }}
                    >
                        {annunciVisibili.map((annuncio) => (
                            <AnnuncioCard
                                key={annuncio.id}
                                annuncio={annuncio}
                                color="secondary"
                            />
                        ))}
                    </Box>

                    {/* Invece di paginare, si chiede la registrazione */}
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
                </>
            )}

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default AnnunciLavoroPage;
