import { Box, Typography } from "@mui/material";

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
            <Typography variant="body2">
                © 2026 T&apos;ACCAT & T&apos;VENN
            </Typography>
        </Box>
    );
}

export default Footer;