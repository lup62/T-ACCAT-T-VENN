import { Box, Container, Typography } from "@mui/material";

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                textAlign: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                mt: "auto",
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                }}>
                <Typography variant="body2">
                    © 2026 T&apos;ACCAT & T&apos;VENN
                </Typography>

                <Typography variant="body2">
                    Fatto con amore ♡ da Oronzo, Pasquale e Giovanni
                </Typography>
            </Container>

        </Box>
    );
}

export default Footer;