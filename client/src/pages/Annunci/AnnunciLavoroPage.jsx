import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "./RegistratiDialog";

const ANNUNCI_VISIBILI = 2;

const annunci = [
    {
        id: 1,
        titolo: "Disponibile per lavori agricoli generali",
        tipoLavoro: "Generico",
        luogo: "Taranto (TA)",
        periodo: "Tutto l'anno",
        prezzo: "Su accordo",
        profilo: { nome: "Marco Esposito", avatar: null },
    },
    {
        id: 2,
        titolo: "Esperto in potatura e innesto",
        tipoLavoro: "Frutticoltura",
        luogo: "Bari (BA)",
        periodo: "Mar – Mag 2026",
        prezzo: "90 €/giorno",
        profilo: { nome: "Salvatore Rizzo", avatar: null },
    },
    {
        id: 3,
        titolo: "Cura e irrigazione orto biologico",
        tipoLavoro: "Orticoltura",
        luogo: "Lecce (LE)",
        periodo: "Apr – Giu 2026",
        prezzo: "65 €/giorno",
        profilo: { nome: "Anna Convertino", avatar: null },
    },
];

function AnnunciLavoroPage() {
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
                        color="secondary"
                    />
                ))}
            </Box>

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

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default AnnunciLavoroPage;
