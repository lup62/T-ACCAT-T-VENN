/**
 * ProfiloPage.jsx  —  rotta: /profilo
 *
 * Profilo dell'utente autenticato: carica i dati completi da
 * GET /api/auth/me (telefono, indirizzo, competenze, dati azienda...)
 * e permette di modificarli tramite ModificaProfiloForm (PATCH /api/users/me).
 * Dopo il salvataggio il profilo in AuthContext viene aggiornato, così
 * navbar e cache locale restano allineate.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Rating,
    Stack,
    Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";

import { useAuth } from "../../hooks/useAuth";
import { getProfilo } from "../../services/users";
import ModificaProfiloForm from "./ModificaProfiloForm";
import SnackbarAvviso from "../../components/SnackbarAvviso";

const LABEL_RUOLO = {
    lavoratore: "Lavoratore",
    imprenditore: "Imprenditore",
};

// Riga label/valore della vista in sola lettura.
function CampoProfilo({ label, valore }) {
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

// Elenco di chip (competenze, certificazioni, social) con fallback.
function ChipsProfilo({ label, voci }) {
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

function formatDataNascita(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function ProfiloPage() {
    const navigate = useNavigate();
    const { isLoggedIn, accessToken, inizializzazione, logout, aggiornaUtente } = useAuth();

    const [profilo, setProfilo] = useState(null); // null = in caricamento
    const [erroreCaricamento, setErroreCaricamento] = useState("");
    const [inModifica, setInModifica] = useState(false);
    const [notifica, setNotifica] = useState(""); // testo snackbar di successo

    useEffect(() => {
        if (!accessToken) return;
        (async () => {
            try {
                setProfilo(await getProfilo(accessToken));
                setErroreCaricamento("");
            } catch (err) {
                setErroreCaricamento(err.message);
            }
        })();
    }, [accessToken]);

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

    // Salvataggio riuscito: si aggiornano pagina e sessione (navbar + cache).
    const profiloSalvato = (utenteAggiornato) => {
        setProfilo(utenteAggiornato);
        aggiornaUtente(utenteAggiornato);
        setInModifica(false);
        setNotifica("Profilo aggiornato con successo.");
    };

    return (
        <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Paper
                elevation={2}
                sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, maxWidth: 560, mx: "auto" }}
            >
                {erroreCaricamento ? (
                    <Typography color="error">{erroreCaricamento}</Typography>
                ) : !profilo ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : inModifica ? (
                    <>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                            Modifica profilo
                        </Typography>
                        <ModificaProfiloForm
                            profilo={profilo}
                            onSalvato={profiloSalvato}
                            onAnnulla={() => setInModifica(false)}
                        />
                    </>
                ) : (
                    <>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                                {profilo.nome} {profilo.cognome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                                {profilo.email}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
                            {profilo.ruoli?.map((ruolo) => (
                                <Chip
                                    key={ruolo}
                                    label={LABEL_RUOLO[ruolo] ?? ruolo}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                />
                            ))}
                        </Stack>

                        <Stack spacing={0.5} sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Valutazione media
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Rating value={profilo.ratingMedio ?? 0} precision={0.5} readOnly />
                                <Typography variant="body2" color="text.secondary">
                                    {(profilo.ratingMedio ?? 0).toFixed(1)}
                                </Typography>
                            </Stack>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={2} sx={{ mb: 3 }}>
                            <CampoProfilo label="Telefono" valore={profilo.telefono} />
                            <CampoProfilo label="Data di nascita" valore={formatDataNascita(profilo.dataNascita)} />
                            <CampoProfilo label="Indirizzo" valore={profilo.indirizzo?.testo} />
                        </Stack>

                        {profilo.ruoli?.includes("lavoratore") && (
                            <>
                                <Divider sx={{ mb: 3 }} />
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    <ChipsProfilo label="Competenze" voci={profilo.datiLavoratore?.competenze} />
                                    <ChipsProfilo label="Certificazioni" voci={profilo.datiLavoratore?.certificazioni} />
                                </Stack>
                            </>
                        )}

                        {profilo.ruoli?.includes("imprenditore") && (
                            <>
                                <Divider sx={{ mb: 3 }} />
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    <CampoProfilo label="Nome azienda" valore={profilo.datiImprenditore?.nomeAzienda} />
                                    <CampoProfilo label="Partita IVA" valore={profilo.datiImprenditore?.pIva} />
                                    <CampoProfilo label="Sito web" valore={profilo.datiImprenditore?.sitoWeb} />
                                    <ChipsProfilo label="Social" voci={profilo.datiImprenditore?.social} />
                                </Stack>
                            </>
                        )}

                        <Divider sx={{ mb: 3 }} />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
                            <Button
                                variant="contained"
                                startIcon={<EditOutlinedIcon />}
                                onClick={() => setInModifica(true)}
                            >
                                Modifica profilo
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ListAltOutlinedIcon />}
                                onClick={() => navigate("/annunci/miei")}
                            >
                                I miei annunci
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                            >
                                Esci
                            </Button>
                        </Stack>
                    </>
                )}
            </Paper>

            <SnackbarAvviso
                testo={notifica}
                severity="success"
                onClose={() => setNotifica("")}
            />
        </Box>
    );
}

export default ProfiloPage;
