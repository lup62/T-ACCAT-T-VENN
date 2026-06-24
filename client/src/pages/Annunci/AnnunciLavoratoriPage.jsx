import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "./RegistratiDialog";
import StatoVuoto from "./StatoVuoto";

const ANNUNCI_VISIBILI = 2;

const annunci = [
    {
        id: 1,
        titolo: "Raccolta olive — Masseria San Marco",
        tipoLavoro: "Olivicoltura",
        luogo: "Fasano (BR)",
        periodo: "Ott – Nov 2026",
        prezzo: "80 €/giorno",
        profilo: { nome: "Giovanni Greco", avatar: null },
    },
    {
        id: 2,
        titolo: "Potatura vigneto stagionale",
        tipoLavoro: "Viticoltura",
        luogo: "Locorotondo (BA)",
        periodo: "Feb – Mar 2026",
        prezzo: "75 €/giorno",
        profilo: { nome: "Azienda Vitivinicola Lama", avatar: null },
    },
    {
        id: 3,
        titolo: "Raccolta pomodori — Cooperativa Valle",
        tipoLavoro: "Orticoltura",
        luogo: "Castellaneta (TA)",
        periodo: "Lug – Set 2026",
        prezzo: "70 €/giorno",
        profilo: { nome: "Cooperativa Valle Verde", avatar: null },
    },
];

function AnnunciLavoratoriPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const annunciVisibili = annunci.slice(0, ANNUNCI_VISIBILI);

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

            {annunci.length === 0 ? (
                <StatoVuoto
                    titolo="Nessun annuncio disponibile"
                    descrizione="Al momento non ci sono aziende che cercano lavoratori. Torna a controllare presto."
                />
            ) : (
                <>
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
                                titolo={annuncio.titolo}
                                tipoLavoro={annuncio.tipoLavoro}
                                luogo={annuncio.luogo}
                                periodo={annuncio.periodo}
                                prezzo={annuncio.prezzo}
                                profilo={annuncio.profilo}
                                color="primary"
                            />
                        ))}
                    </Box>

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
                </>
            )}

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default AnnunciLavoratoriPage;
