import { Box, Typography } from "@mui/material";
import sfondoHero from "../../assets/sfondoHero.png";

function HomePage() {
    return (
        <Box
            component="section"
            sx={{
                width: "100vw",
                position: "relative",
                left: "50%",
                marginLeft: "-50vw",
                mt: { xs: -2, md: -5 },
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
                    fontWeight: 800,
                    mb: 2,
                    color: "#FFFFFF",
                    maxWidth: 650,
                }}
            >
                T&apos;ACCAT &amp; T&apos;VENN
            </Typography>

            <Typography
                variant="h5"
                component="p"
                sx={{
                    fontWeight: 500,
                    color: "#FFFFFF",
                    maxWidth: 620,
                }}
            >
                Coltiviamo nuove opportunità di lavoro
            </Typography>
        </Box>
    );
}

export default HomePage;