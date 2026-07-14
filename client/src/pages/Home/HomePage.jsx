/**
 * HomePage.jsx  —  rotta: /
 *
 * Landing page pubblica: hero full-bleed, sezione "L'iniziativa" a due
 * colonne e sezione "Come funziona" (componente HowItWorks).
 */

import { useEffect } from "react";
import { Box, Typography, Stack, Button, Card, CardContent } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";


import sfondoHero from "../../assets/sfondoHero.webp";
import scrittaTaccat from "../../assets/scrittaTaccat.svg";
import fotoPasquale from "../../assets/fotoPasquale.jpeg"

import HowItWorks from "../../components/HowItWorks";

function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Arrivando con l'hash (link "Come funziona" da un'altra pagina) React
    // Router non scorre da solo all'ancora: lo facciamo qui, quando la
    // sezione è ormai renderizzata.
    useEffect(() => {
        if (!location.hash) return;
        document
            .getElementById(location.hash.slice(1))
            ?.scrollIntoView({ behavior: "smooth" });
    }, [location.hash]);

    return (
        <>

        {/* ===== SEZIONE HERO =====
            width: 100% basta per il full-bleed: MainLayout non limita la larghezza
            del main.
            Su mobile il hero è più basso: c'è solo la scritta, un'intera schermata
            di foto allontanerebbe troppo i contenuti; svh tiene conto della barra
            degli indirizzi dei browser mobile. */}
        <Box
            component="section"
            sx={{
                width: "100%",
                minHeight: { xs: "55svh", md: "calc(100vh - 72px)" }, // 72px = altezza navbar
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                pt: { xs: 8, md: 18 },
                px: { xs: 3, md: 10 },

                backgroundImage: `
                    url(${sfondoHero})
                `,
                backgroundSize: "cover",
                backgroundPosition: "83%",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Scritta + payoff (stessa della Navbar) al posto del titolo testuale,
                component="h1" sull'elemento wrapper mantiene la
                semantica per SEO; l'alt dell'immagine fa da testo per screen reader
                e motori di ricerca. Il drop-shadow chiaro stacca il verde scuro
                della scritta dalla foto. */}
            <Typography component="h1" sx={{ m: 0 }}>
                <Box
                    component="img"
                    src={scrittaTaccat}
                    alt="T'accat & T'venn — Coltiviamo nuove opportunità di lavoro"
                    sx={{
                        width: { xs: "100%", sm: 480, md: 620 },
                        maxWidth: 620,
                        // Solo su mobile: alone crema dietro la scritta, perché senza
                        // gradient il verde si perde sul cielo/alberi della foto.
                        filter: {
                            xs: "drop-shadow(0 0 18px rgba(250, 247, 239, 0.9)) drop-shadow(0 0 6px rgba(250, 247, 239, 0.95))",
                            md: "none",
                        },
                    }}
                />
            </Typography>

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

                {/* Titolo sezione con stile "badge": inline-block + sfondo colorato.
                    Il fontSize di h3 (3rem) è troppo grande su mobile e manda il
                    badge su due righe: si scala sotto md. */}
                <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                        display: "inline-block",
                        bgcolor: "primary.main",
                        color: "#FFFFFF",
                        px: { xs: 2, md: 3 },
                        py: 1,
                        borderRadius: 1,
                        fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
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
                        fontSize: { xs: "1rem", md: "1.25rem" },
                    }}
                >
                    T&apos;accat &amp; T&apos;venn è la piattaforma che mette in contatto
                    lavoratori agricoli e imprenditori del territorio. Chi cerca un&apos;opportunità
                    può mostrare le proprie disponibilità e competenze; chi cerca manodopera
                    può pubblicare richieste di lavoro in modo semplice e diretto.
                </Typography>

                {/* Card affiancate da sm in su, in colonna su mobile.
                    flex:1 su ogni card le rende della stessa larghezza.
                    Card e CardContent sono colonne flex e il bottone ha
                    mt:"auto": lo Stack stira già le card alla stessa altezza,
                    così i due bottoni restano allineati in fondo. */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                    <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3, display: "flex", flexDirection: "column" }}>
                        <CardContent sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                            <Typography
                                variant="h4"
                                component="h3"
                                color="secondary"
                                sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2.125rem" } }}
                            >
                                Per chi cerca lavoro
                            </Typography>

                            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                                Pubblica la tua disponibilità, indica le tue competenze e trova
                                aziende agricole che cercano lavoratori nella tua zona.
                            </Typography>

                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                onClick={() => navigate("/annunci/offerte")}
                                sx={{ width: { xs: "100%", sm: "auto" }, mt: "auto", alignSelf: { sm: "flex-start" } }}
                            >
                                Cerco lavoro
                            </Button>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3, display: "flex", flexDirection: "column" }}>
                        <CardContent sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                            <Typography
                                variant="h4"
                                component="h3"
                                color="primary"
                                sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2.125rem" } }}
                            >
                                Per chi cerca lavoratori
                            </Typography>

                            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                                Pubblica una richiesta di manodopera, trova profili adatti alle
                                tue esigenze e organizza il lavoro in modo più rapido.
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => navigate("/annunci/cercasi")}
                                sx={{ width: { xs: "100%", sm: "auto" }, mt: "auto", alignSelf: { sm: "flex-start" } }}
                            >
                                Cerco lavoratori
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
