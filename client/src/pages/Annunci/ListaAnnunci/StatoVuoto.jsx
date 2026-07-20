// StatoVuoto.jsx — empty state riutilizzabile per liste annunci senza risultati.
import { Box, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";

function StatoVuoto({ titolo, descrizione }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 10,
                textAlign: "center",
            }}
        >
            <SearchOffIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>
                {titolo}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                {descrizione}
            </Typography>
        </Box>

    );
}

export default StatoVuoto;
