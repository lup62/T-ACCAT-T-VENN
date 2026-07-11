/**
 * HomePage.jsx  —  rotta: /
 *
 * Landing page pubblica: hero full-bleed, sezione "L'iniziativa" a due
 * colonne e sezione "Come funziona" (componente HowItWorks).
 */

import { Box, Typography, Stack, Button, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";


import sfondoHero from "../../assets/sfondoHero.png";
import fotoPasquale from "../../assets/fotoPasquale.jpeg"

import HowItWorks from "../../components/HowItWorks";

function HomePage() {
    const navigate = useNavigate();

    return (
        <>

        {/* ===== SEZIONE HERO =====
            Occupa tutta la larghezza dello schermo (full-bleed) anche se il layout
            principale ha un contenitore con larghezza limitata. Il trick funziona così:
            - width: 100vw → larghezza pari alla viewport
            - position: relative + left: 50% + marginLeft: -50vw → sposta l'elemento
              al bordo sinistro della schermata indipendentemente dal contenitore padre
            L'immagine di sfondo usa un gradient scuro a sinistra per rendere
            leggibile il testo bianco sovrapposto. */}
        <Box
            component="section"
            sx={{
                width: "100vw",
                position: "relative",
                left: "50%",
                marginLeft: "-50vw",
                minHeight: "calc(100vh - 72px)", // 72px = altezza navbar
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                pt: { xs: 12, md: 18 },
                px: { xs: 3, md: 10 },

                backgroundImage: `
                    linear-gradient(
                        90deg,
                        rgba(0, 0, 0, 0.62) 0%,
                        rgba(0, 0, 0, 0.42) 42%,
                        rgba(0, 0, 0, 0.12) 100%
                    ),
                    url(${sfondoHero})
                `,
                backgroundSize: "cover",
                backgroundPosition: "center right",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* variant="h2" definisce la dimensione visiva, component="h1" definisce
                il tag HTML reale — importante per SEO e accessibilità */}
            <Typography
                variant="h2"
                component="h1"
                sx={{
                    mb: 2,
                    color: "#FFFFFF",
                    maxWidth: 650,
                }}
            >
                T&apos;accat &amp; T&apos;venn
            </Typography>

            <Typography
                variant="h5"
                component="p"
                sx={{
                    color: "#FFFFFF",
                    maxWidth: 620,
                }}
            >
                Coltiviamo nuove opportunità di lavoro
            </Typography>

            {/* Stack gestisce il layout dei bottoni: affiancati da sm in su,
                in colonna su mobile con larghezza piena (stretch) */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                    mt: 4,
                    alignItems: { xs: "stretch", sm: "flex-start" },
                }}
            >
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate("/annunci/offerte")}
                >
                    Cerco lavoro
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate("/annunci/cercasi")}
                >
                    Cerco lavoratori
                </Button>
            </Stack>
        </Box>

        {/* ===== SEZIONE L'INIZIATIVA =====
            Layout a due colonne su desktop: testo + card a sinistra, immagine a destra.
            Su mobile le colonne si impilano verticalmente (flexDirection: column).
            gap gestisce lo spazio tra le due colonne. */}
        <Box
            component="section"
            sx={{
                mt: { xs: 6, md: 10 },
                mb: { xs: 6, md: 10 },
                px: { xs: 3, md: 10 },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 6, md: 8 },
                alignItems: { md: "center" },
            }}
        >
            {/* Colonna sinistra: flex:1 la fa crescere per occupare lo spazio disponibile.
                minWidth:0 evita che il contenuto interno forzi la colonna a espandersi
                oltre il suo limite (problema comune con flex e testo lungo). */}
            <Box sx={{ flex: 1, minWidth: 0 }}>

                {/* Titolo sezione con stile "badge": inline-block + sfondo colorato */}
                <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                        display: "inline-block",
                        bgcolor: "primary.main",
                        color: "#FFFFFF",
                        px: 3,
                        py: 1,
                        borderRadius: 1,
                    }}
                >
                    L'iniziativa
                </Typography>

                <Typography
                    variant="h6"
                    component="p"
                    sx={{
                        mt: 3,
                        color: "text.secondary",
                        lineHeight: 1.8,
                    }}
                >
                    T&apos;accat &amp; T&apos;venn è la piattaforma che mette in contatto
                    lavoratori agricoli e imprenditori del territorio. Chi cerca un&apos;opportunità
                    può mostrare le proprie disponibilità e competenze; chi cerca manodopera
                    può pubblicare richieste di lavoro in modo semplice e diretto.
                </Typography>

                {/* Card affiancate da sm in su, in colonna su mobile.
                    flex:1 su ogni card le rende della stessa larghezza. */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                    <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h4"
                                component="h3"
                                color="secondary"
                                sx={{ mb: 2 }}
                            >
                                Per chi cerca lavoro
                            </Typography>

                            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                                Pubblica la tua disponibilità, indica le tue competenze e trova
                                aziende agricole che cercano lavoratori nella tua zona.
                            </Typography>

                            <Button variant="outlined" color="secondary">
                                Scopri le opportunità
                            </Button>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h4"
                                component="h3"
                                color="primary"
                                sx={{ mb: 2 }}
                            >
                                Per chi cerca lavoratori
                            </Typography>

                            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                                Pubblica una richiesta di manodopera, trova profili adatti alle
                                tue esigenze e organizza il lavoro in modo più rapido.
                            </Typography>

                            <Button variant="outlined" color="primary">
                                Pubblica una richiesta
                            </Button>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            {/* Colonna destra: immagine fissa al 40% della larghezza.
                objectFit:cover ritaglia l'immagine per riempire lo spazio senza deformarla.
                Nascosta su mobile per non appesantire il layout verticale. */}
            <Box
                component="img"
                src={fotoPasquale}
                alt="L'iniziativa"
                sx={{
                    flex: "0 0 40%",
                    width: { xs: "100%", md: "40%" },
                    maxHeight: 500,
                    objectFit: "cover",
                    borderRadius: 4,
                    boxShadow: 4,
                    display: { xs: "none", md: "block" },
                }}
            />
        </Box>

        {/* ===== SEZIONE COME FUNZIONA =====
            Componente separato in HowItWorks.jsx.
            Usa anch'esso il trick full-bleed per occupare tutta la larghezza. */}
        <HowItWorks />
        </>
    );
}

export default HomePage;
