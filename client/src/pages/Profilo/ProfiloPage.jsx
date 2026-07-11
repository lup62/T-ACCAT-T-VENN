/**
 * ProfiloPage.jsx  —  rotta: /profilo
 *
 * Mostra i dati dell'utente autenticato letti da useAuth().
 *
 * NOTA: la risposta di POST /api/auth/register restituisce solo un
 * sottoinsieme del profilo (nome, cognome, email, ruoli, ratingMedio).
 * Campi come telefono, indirizzo o competenze non sono ancora disponibili
 * lato client: andranno aggiunti quando sarà pronto un endpoint
 * GET /api/users/me.
 */

import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Rating,
    Stack,
    Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../../hooks/useAuth";

const LABEL_RUOLO = {
    lavoratore: "Lavoratore",
    imprenditore: "Imprenditore",
};

function ProfiloPage() {
    const navigate = useNavigate();
    const { isLoggedIn, utente, logout } = useAuth();

    // ── Guard: utente non autenticato ─────────────────────────────────────────
    if (!isLoggedIn) {
        return (
            <Box
                sx={{
                    px: { xs: 2, md: 10 },
                    py: { xs: 4, md: 6 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 3,
                }}
            >
                <LockOutlinedIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                <Typography variant="h5">Accedi per vedere il tuo profilo</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
                    Effettua l&apos;accesso o registrati per gestire i tuoi dati.
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={() => navigate("/login")}>
                        Accedi
                    </Button>
                    <Button variant="contained" onClick={() => navigate("/register")}>
                        Registrati
                    </Button>
                </Stack>
            </Box>
        );
    }

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Paper
                elevation={2}
                sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, maxWidth: 560, mx: "auto" }}
            >
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                        {utente.nome} {utente.cognome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                        {utente.email}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
                    {utente.ruoli?.map((ruolo) => (
                        <Chip
                            key={ruolo}
                            label={LABEL_RUOLO[ruolo] ?? ruolo}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    ))}
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={0.5} sx={{ mb: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        Valutazione media
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={utente.ratingMedio ?? 0} precision={0.5} readOnly />
                        <Typography variant="body2" color="text.secondary">
                            {(utente.ratingMedio ?? 0).toFixed(1)}
                        </Typography>
                    </Stack>
                </Stack>

                <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
                    Esci
                </Button>
            </Paper>
        </Box>
    );
}

export default ProfiloPage;
