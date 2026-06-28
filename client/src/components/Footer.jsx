import { Box, Container, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

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
                }}
            >
                <Typography variant="body2">
                    © 2026 T&apos;ACCAT &amp; T&apos;VENN
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <Link
                        component={RouterLink}
                        to="/privacy"
                        variant="body2"
                        color="inherit"
                        underline="hover"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        component={RouterLink}
                        to="/termini"
                        variant="body2"
                        color="inherit"
                        underline="hover"
                    >
                        Termini e Condizioni
                    </Link>
                </Box>

                <Typography variant="body2">
                    Fatto con amore ♡ da Oronzo, Pasquale e Giovanni
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;