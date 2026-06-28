import { Box, Paper, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

const OPZIONI = [
    {
        valore: "richiesta_manodopera",
        etichetta: "Cerco lavoratori",
        descrizione: "Sei un'azienda o imprenditore e cerchi manodopera agricola",
        Icon: BusinessCenterIcon,
        color: "secondary",
    },
    {
        valore: "disponibilita_lavoro",
        etichetta: "Offro la mia disponibilità",
        descrizione: "Sei un lavoratore e vuoi farti trovare dalle aziende",
        Icon: PersonSearchIcon,
        color: "primary",
    },
];

function SelettoreTipoAnnuncio({ valore, onChange }) {
    return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {OPZIONI.map(({ valore: val, etichetta, descrizione, Icon, color }) => {
                const selezionato = valore === val;
                return (
                    <Paper
                        key={val}
                        onClick={() => onChange(val)}
                        elevation={selezionato ? 4 : 1}
                        sx={{
                            flex: 1,
                            p: 3,
                            cursor: "pointer",
                            borderRadius: 3,
                            border: "2px solid",
                            borderColor: selezionato ? `${color}.main` : "transparent",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                borderColor: `${color}.main`,
                                transform: "translateY(-2px)",
                                boxShadow: 4,
                            },
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Icon sx={{ color: `${color}.main`, fontSize: 36 }} />
                            {selezionato && (
                                <CheckCircleIcon sx={{ color: `${color}.main` }} />
                            )}
                        </Stack>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                            {etichetta}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {descrizione}
                        </Typography>
                    </Paper>
                );
            })}
        </Stack>
    );
}

export default SelettoreTipoAnnuncio;
