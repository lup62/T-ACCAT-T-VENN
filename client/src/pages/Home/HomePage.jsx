import { Box, Typography, Stack, Button, Card, CardContent } from "@mui/material";
import sfondoHero from "../../assets/sfondoHero.png";

function HomePage() {
    return (
        <>
        <Box
            component="section"
            sx={{
                width: "100vw",
                position: "relative",
                left: "50%",
                marginLeft: "-50vw",
                minHeight: "calc(100vh - 72px)",
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
                >
                    Cerco lavoro
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                >
                    Cerco lavoratori
                </Button>
            </Stack>
        </Box>

        <Box
            component="section"
            sx={{
                mt: { xs: 6, md: 10 },
                px: { xs: 3, md: 10 },
            }}
        >
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
                    maxWidth: 850,
                    color: "text.secondary",
                    lineHeight: 1.8,
                }}
            >
                T&apos;accat &amp; T&apos;venn è la piattaforma che mette in contatto
                lavoratori agricoli e imprenditori del territorio. Chi cerca un&apos;opportunità
                può mostrare le proprie disponibilità e competenze; chi cerca manodopera
                può pubblicare richieste di lavoro in modo semplice e diretto.
            </Typography>

            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                sx={{ mt: 5 }}
            >
                <Card
                    sx={{
                        flex: 1,
                        borderRadius: 3,
                        boxShadow: 3,
                    }}
                >
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

                <Card
                    sx={{
                        flex: 1,
                        borderRadius: 3,
                        boxShadow: 3,
                    }}
                >
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
        </>
    );
}

export default HomePage;
