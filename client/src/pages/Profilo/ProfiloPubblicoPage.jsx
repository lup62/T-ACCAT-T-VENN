/**
 * ProfiloPubblicoPage.jsx  —  rotta: /utenti/:id
 *
 * Profilo pubblico di un utente: i dati visibili a tutti (GET /api/users/:id)
 * e le recensioni che ha ricevuto (GET /api/recensioni/utente/:id).
 * Ci si arriva cliccando il nome dell'autore in un annuncio.
 *
 * Le due chiamate viaggiano insieme ma sono indipendenti: se le recensioni
 * falliscono la pagina mostra comunque il profilo, con un avviso nella
 * sola sezione recensioni.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Link,
    Paper,
    Rating,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import { getProfiloPubblico } from "../../services/users";
import { getRecensioniUtente } from "../../services/recensioni";
import { CampoProfilo, ChipsProfilo } from "../../components/ProfiloCampi";
import RecensioneItem from "../../components/RecensioneItem";

const LABEL_RUOLO = {
    lavoratore: "Lavoratore",
    imprenditore: "Imprenditore",
};

function ProfiloPubblicoPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profilo, setProfilo] = useState(null); // null = in caricamento
    const [erroreProfilo, setErroreProfilo] = useState(null); // { status, message }
    const [recensioni, setRecensioni] = useState(null);
    const [erroreRecensioni, setErroreRecensioni] = useState("");

    // Nota: oggi non esistono link da un profilo pubblico a un altro, quindi
    // il componente viene sempre rismontato e non serve resettare gli stati
    // al cambio di id. Se in futuro si aggiungono link profilo→profilo,
    // usare una key sul componente per forzare il remount.
    useEffect(() => {
        getProfiloPubblico(id)
            .then(setProfilo)
            .catch((err) => setErroreProfilo({ status: err.status, message: err.message }));

        getRecensioniUtente(id)
            .then(setRecensioni)
            .catch((err) => {
                setErroreRecensioni(err.message);
                setRecensioni([]);
            });
    }, [id]);

    // ── Utente inesistente o errore ───────────────────────────────────────────
    if (erroreProfilo) {
        return (
            <Box
                sx={{
                    px: { xs: 2, md: 10 },
                    py: { xs: 6, md: 10 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 2,
                }}
            >
                <PersonSearchOutlinedIcon sx={{ fontSize: 56, color: "text.disabled" }} />
                <Typography variant="h5">
                    {erroreProfilo.status === 404 || erroreProfilo.status === 400
                        ? "Utente non trovato"
                        : "Impossibile caricare il profilo"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {erroreProfilo.message}
                </Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 1 }}>
                    Torna indietro
                </Button>
            </Box>
        );
    }

    // ── Caricamento ───────────────────────────────────────────────────────────
    if (!profilo) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Stack spacing={3} sx={{ maxWidth: 560, mx: "auto" }}>
                {/* Dati pubblici */}
                <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                            {profilo.nome} {profilo.cognome}
                        </Typography>
                        {profilo.indirizzo?.testo && (
                            <Typography variant="body2" color="text.secondary">
                                {profilo.indirizzo.testo}
                            </Typography>
                        )}
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

                    <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                            Valutazione media
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Rating value={profilo.ratingMedio ?? 0} precision={0.5} readOnly />
                            <Typography variant="body2" color="text.secondary">
                                {(profilo.ratingMedio ?? 0).toFixed(1)}
                                {recensioni?.length
                                    ? ` (${recensioni.length} ${recensioni.length === 1 ? "recensione" : "recensioni"})`
                                    : ""}
                            </Typography>
                        </Stack>
                    </Stack>

                    {profilo.ruoli?.includes("lavoratore") && (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Stack spacing={2}>
                                <ChipsProfilo label="Competenze" voci={profilo.datiLavoratore?.competenze} />
                                <ChipsProfilo label="Certificazioni" voci={profilo.datiLavoratore?.certificazioni} />
                            </Stack>
                        </>
                    )}

                    {profilo.ruoli?.includes("imprenditore") && (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Stack spacing={2}>
                                <CampoProfilo label="Nome azienda" valore={profilo.datiImprenditore?.nomeAzienda} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Sito web
                                    </Typography>
                                    {profilo.datiImprenditore?.sitoWeb ? (
                                        <Link
                                            href={profilo.datiImprenditore.sitoWeb}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ wordBreak: "break-word" }}
                                        >
                                            {profilo.datiImprenditore.sitoWeb}
                                        </Link>
                                    ) : (
                                        <Typography variant="body1">—</Typography>
                                    )}
                                </Box>
                            </Stack>
                        </>
                    )}
                </Paper>

                {/* Recensioni ricevute */}
                <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        Recensioni ricevute
                    </Typography>

                    {erroreRecensioni ? (
                        <Alert severity="warning" variant="outlined">
                            {erroreRecensioni}
                        </Alert>
                    ) : recensioni === null ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : recensioni.length === 0 ? (
                        <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                            <RateReviewOutlinedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                            <Typography variant="body2" color="text.secondary">
                                Nessuna recensione ricevuta finora.
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={2.5} divider={<Divider />}>
                            {recensioni.map((recensione) => (
                                <RecensioneItem key={recensione._id} recensione={recensione} mostraAnnuncio />
                            ))}
                        </Stack>
                    )}
                </Paper>
            </Stack>
        </Box>
    );
}

export default ProfiloPubblicoPage;
