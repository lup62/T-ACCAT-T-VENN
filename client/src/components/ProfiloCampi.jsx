/**
 * ProfiloCampi.jsx — righe di dettaglio riusate nelle pagine profilo
 * (ProfiloPage e ProfiloPubblicoPage).
 *
 * CampoProfilo   riga etichetta/valore, con "—" quando il valore manca
 * ChipsProfilo   elenco di chip (competenze, certificazioni, social...)
 */

import { Box, Chip, Stack, Typography } from "@mui/material";

export function CampoProfilo({ label, valore }) {
    return (
        <Box>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                {valore || "—"}
            </Typography>
        </Box>
    );
}

export function ChipsProfilo({ label, voci }) {
    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {label}
            </Typography>
            {voci?.length ? (
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                    {voci.map((voce) => (
                        <Chip key={voce} label={voce} size="small" variant="outlined" />
                    ))}
                </Stack>
            ) : (
                <Typography variant="body1">—</Typography>
            )}
        </Box>
    );
}
