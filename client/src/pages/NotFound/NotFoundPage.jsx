// NotFoundPage.jsx — rotta: * (catch-all)
// Pagina 404 mostrata per qualsiasi URL che non corrisponde a nessuna rotta.
import { Box, Button, Typography } from "@mui/material";
import ExploreOffIcon from "@mui/icons-material/ExploreOff";
import { Link as RouterLink } from "react-router-dom";

function NotFoundPage() {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 12,
                textAlign: "center",
            }}
        >
            <ExploreOffIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
                404
            </Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>
                Pagina non trovata
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 4 }}>
                La pagina che cerchi non esiste o è stata spostata.
            </Typography>
            <Button variant="contained" component={RouterLink} to="/">
                Torna alla home
            </Button>
        </Box>
    );
}

export default NotFoundPage;
