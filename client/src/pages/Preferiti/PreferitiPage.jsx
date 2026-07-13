/**
 * PreferitiPage.jsx  —  rotta: /preferiti
 *
 * Gli annunci salvati nei preferiti dall'utente loggato, in griglia con le
 * stesse card delle liste annunci. Il cuoricino (pieno) rimuove il preferito
 * e toglie subito la card dalla griglia.
 *
 * Il colore della card segue la convenzione delle liste: richiesta_manodopera
 * (offerte di lavoro) = secondary, disponibilita_lavoro = primary.
 *
 * Accessibile solo agli utenti autenticati (stesso guard di PropostePage).
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useAuth } from "../../hooks/useAuth";
import { getPreferiti, rimuoviPreferito } from "../../services/preferiti";
import AnnuncioCard from "../Annunci/ListaAnnunci/AnnuncioCard";
import SnackbarAvviso from "../../components/SnackbarAvviso";

function PreferitiPage() {
    const navigate = useNavigate();
    const { isLoggedIn, accessToken, inizializzazione } = useAuth();

    const [preferiti, setPreferiti] = useState(null);   // null = in caricamento
    const [erroreCaricamento, setErroreCaricamento] = useState("");
    const [rimozioneInCorsoId, setRimozioneInCorsoId] = useState(null);
    const [notifica, setNotifica] = useState(null);     // { severity, testo }

    useEffect(() => {
        if (!accessToken) return;
        getPreferiti(accessToken, "annuncio")
            .then((lista) => {
                // Scarta i preferiti il cui annuncio è stato eliminato
                setPreferiti(lista.filter((p) => p.riferimento?._id));
                setErroreCaricamento("");
            })
            .catch((err) => {
                setErroreCaricamento(err.message);
                setPreferiti([]);
            });
    }, [accessToken]);

    const rimuovi = async (preferito) => {
        setRimozioneInCorsoId(preferito.riferimento._id);
        try {
            await rimuoviPreferito(preferito._id, accessToken);
            setPreferiti((prev) => prev.filter((p) => p._id !== preferito._id));
            setNotifica({ severity: "success", testo: "Annuncio rimosso dai preferiti." });
        } catch (err) {
            setNotifica({ severity: "error", testo: err.message });
        } finally {
            setRimozioneInCorsoId(null);
        }
    };

    // ── Guard: ripristino sessione in corso ───────────────────────────────────
    if (inizializzazione) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    // ── Guard: utente non autenticato ─────────────────────────────────────────
    if (!isLoggedIn) {
        return (
            <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
                <Paper
                    elevation={2}
                    sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, maxWidth: 600, mx: "auto", textAlign: "center" }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 56, color: "primary.main", mb: 2 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                        Devi essere registrato
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Per salvare e rivedere i tuoi annunci preferiti devi avere un account e aver effettuato l'accesso.
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                        <Button variant="contained" color="primary" size="large" onClick={() => navigate("/login")}>
                            Accedi
                        </Button>
                        <Button variant="outlined" color="primary" size="large" onClick={() => navigate("/register")}>
                            Registrati
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
                I miei preferiti
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Gli annunci che hai salvato per ritrovarli al volo.
            </Typography>

            {erroreCaricamento && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {erroreCaricamento}
                </Alert>
            )}

            {preferiti === null ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : preferiti.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <FavoriteBorderIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                        Non hai ancora salvato nessun annuncio: tocca il cuoricino
                        su un annuncio per ritrovarlo qui.
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            lg: "repeat(3, 1fr)",
                        },
                        gap: 3,
                    }}
                >
                    {preferiti.map((preferito) => (
                        <AnnuncioCard
                            key={preferito._id}
                            annuncio={preferito.riferimento}
                            color={preferito.riferimento.tipo === "richiesta_manodopera" ? "secondary" : "primary"}
                            preferito
                            onTogglePreferito={() => rimuovi(preferito)}
                            toggleInCorso={rimozioneInCorsoId === preferito.riferimento._id}
                        />
                    ))}
                </Box>
            )}

            <SnackbarAvviso
                testo={notifica?.testo ?? ""}
                severity={notifica?.severity ?? "error"}
                onClose={() => setNotifica(null)}
            />
        </Box>
    );
}

export default PreferitiPage;
