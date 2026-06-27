import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "./RegistratiDialog";
import StatoVuoto from "./StatoVuoto";
import { mockAnnunci } from "../../services/mockAnnunci";

const ANNUNCI_VISIBILI = 2;
const annunci = mockAnnunci.filter((a) => a.tipo === "disponibilita_lavoro");

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
                                annuncio={annuncio}
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
